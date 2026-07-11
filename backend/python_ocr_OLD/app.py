# backend/python_ocr/app.py
# Excellent local CNIC OCR service
# Primary: PaddleOCR
# Optional fallback: Tesseract
# API route remains same for React frontend: POST /api/scan-cnic

from flask import Flask, jsonify, request
from flask_cors import CORS

import cv2
import numpy as np
import os
import re
import json
import shutil
from pathlib import Path
from datetime import datetime

# -----------------------------
# Optional Tesseract fallback
# -----------------------------
try:
    import pytesseract
    TESSERACT_AVAILABLE = True
    DEFAULT_TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    if os.path.exists(DEFAULT_TESSERACT_PATH):
        pytesseract.pytesseract.tesseract_cmd = DEFAULT_TESSERACT_PATH
except Exception:
    pytesseract = None
    TESSERACT_AVAILABLE = False

# -----------------------------
# PaddleOCR primary engine
# -----------------------------
from paddleocr import PaddleOCR


app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
DEBUG_DIR = BASE_DIR / "debug"

UPLOAD_DIR.mkdir(exist_ok=True)
DEBUG_DIR.mkdir(exist_ok=True)

print("\n========== LOADING PADDLE OCR ==========")
ocr_engine = PaddleOCR(use_angle_cls=True, lang="en")
print("========== PADDLE OCR READY ==========\n")


# ============================================================
# Basic helpers
# ============================================================

def now_stamp():
    return datetime.now().strftime("%Y%m%d_%H%M%S")


def clean_line(value):
    return re.sub(r"\s+", " ", str(value or "")).strip()


def remove_extra_symbols(value):
    value = str(value or "")
    value = value.replace("|", " ")
    value = value.replace("—", "-").replace("–", "-")
    value = re.sub(r"[^\w\s./:\-]", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def fix_common_digit_ocr(value):
    """
    Use only for fields that are supposed to be numeric.
    Do NOT run this on names.
    """
    if not value:
        return ""
    table = str.maketrans({
        "O": "0",
        "o": "0",
        "Q": "0",
        "D": "0",
        "I": "1",
        "l": "1",
        "|": "1",
        "S": "5",
        "s": "5",
        "B": "8",
        "G": "6",
        "Z": "2",
        "z": "2",
    })
    return str(value).translate(table)


def normalize_cnic(value):
    if not value:
        return ""

    fixed = fix_common_digit_ocr(value)
    digits = re.sub(r"\D", "", fixed)

    # CNIC must be exactly 13 digits
    match = re.search(r"\d{13}", digits)
    if not match:
        return ""

    digits = match.group(0)
    return f"{digits[:5]}-{digits[5:12]}-{digits[12]}"


def normalize_date(value):
    if not value:
        return ""

    fixed = fix_common_digit_ocr(value)
    fixed = fixed.replace(".", "-").replace("/", "-").replace(" ", "-")
    fixed = re.sub(r"-+", "-", fixed)

    # dd-mm-yyyy
    matches = re.findall(r"\b(\d{1,2})-(\d{1,2})-(\d{4})\b", fixed)

    # yyyy-mm-dd
    ymd_matches = re.findall(r"\b(\d{4})-(\d{1,2})-(\d{1,2})\b", fixed)
    for y, m, d in ymd_matches:
        matches.append((d, m, y))

    today = datetime.today()

    for d, m, y in matches:
        try:
            day = int(d)
            month = int(m)
            year = int(y)

            if year < 1900 or year > today.year:
                continue

            date_obj = datetime(year, month, day)

            if date_obj > today:
                continue

            return date_obj.strftime("%d-%m-%Y")
        except Exception:
            continue

    return ""


def calculate_age(dob):
    if not dob:
        return ""

    normalized = normalize_date(dob)
    if not normalized:
        return ""

    try:
        d, m, y = normalized.split("-")
        birth_date = datetime(int(y), int(m), int(d))
        today = datetime.today()

        age = today.year - birth_date.year
        if (today.month, today.day) < (birth_date.month, birth_date.day):
            age -= 1

        if age < 0 or age > 120:
            return ""

        return str(age)
    except Exception:
        return ""


# ============================================================
# Image quality and preprocessing
# ============================================================

def read_image(path):
    img = cv2.imread(str(path))
    if img is None:
        raise ValueError("Image could not be read")
    return img


def quality_report(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    brightness = float(np.mean(gray))
    contrast = float(np.std(gray))

    h, w = img.shape[:2]
    too_small = w < 650 or h < 350

    # Keep thresholds practical, not over-strict.
    report = {
        "blurScore": round(blur_score, 2),
        "brightness": round(brightness, 2),
        "contrast": round(contrast, 2),
        "width": int(w),
        "height": int(h),
        "tooSmall": bool(too_small),
        "tooBlurry": bool(blur_score < 20),
        "tooDark": bool(brightness < 35),
        "tooBright": bool(brightness > 235),
        "lowContrast": bool(contrast < 18),
    }

    report["qualityOk"] = not (
        report["tooSmall"]
        or report["tooBlurry"]
        or report["tooDark"]
        or report["tooBright"]
        or report["lowContrast"]
    )

    return report


def rotate_if_portrait(img):
    h, w = img.shape[:2]
    if h > w:
        return cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
    return img


def resize_min_width(img, min_width=1300):
    h, w = img.shape[:2]
    if w >= min_width:
        return img

    scale = min_width / float(w)
    new_w = int(w * scale)
    new_h = int(h * scale)
    return cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_CUBIC)


def crop_center_cnic(img, margin=0.92):
    """
    CNIC aspect ratio is close to 1.58.
    This crop assumes the user placed CNIC in center frame.
    """
    h, w = img.shape[:2]
    target_ratio = 1.58

    crop_w = int(w * margin)
    crop_h = int(crop_w / target_ratio)

    if crop_h > int(h * 0.90):
        crop_h = int(h * 0.90)
        crop_w = int(crop_h * target_ratio)

    x1 = max((w - crop_w) // 2, 0)
    y1 = max((h - crop_h) // 2, 0)
    x2 = min(x1 + crop_w, w)
    y2 = min(y1 + crop_h, h)

    return img[y1:y2, x1:x2]


def enhance_for_ocr(img):
    """
    Good general preprocessor for OCR.
    Returns grayscale sharpened image.
    """
    img = resize_min_width(img, 1300)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # reduce noise while keeping edges
    denoised = cv2.bilateralFilter(gray, 7, 55, 55)

    # local contrast
    clahe = cv2.createCLAHE(clipLimit=2.3, tileGridSize=(8, 8))
    enhanced = clahe.apply(denoised)

    # sharpen
    kernel = np.array([[0, -1, 0], [-1, 5.2, -1], [0, -1, 0]])
    sharp = cv2.filter2D(enhanced, -1, kernel)

    return sharp


def make_variants(original):
    """
    We run PaddleOCR on several high-quality variants.
    Best OCR is usually from original/crop/enhanced, not threshold only.
    """
    variants = {}

    img = rotate_if_portrait(original)
    img = resize_min_width(img, 1200)

    crop_92 = crop_center_cnic(img, 0.92)
    crop_84 = crop_center_cnic(img, 0.84)

    variants["full_color"] = img
    variants["crop_92_color"] = crop_92
    variants["crop_84_color"] = crop_84

    variants["full_enhanced"] = enhance_for_ocr(img)
    variants["crop_92_enhanced"] = enhance_for_ocr(crop_92)
    variants["crop_84_enhanced"] = enhance_for_ocr(crop_84)

    # Some ID cards work better with adaptive threshold, but keep as extra.
    for name, base in [
        ("full", variants["full_enhanced"]),
        ("crop92", variants["crop_92_enhanced"]),
    ]:
        try:
            adaptive = cv2.adaptiveThreshold(
                base,
                255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY,
                31,
                9,
            )
            variants[f"{name}_adaptive"] = adaptive
        except Exception:
            pass

    return variants


# ============================================================
# Paddle result handling
# ============================================================

def box_center(box):
    try:
        xs = [float(p[0]) for p in box]
        ys = [float(p[1]) for p in box]
        return sum(xs) / len(xs), sum(ys) / len(ys)
    except Exception:
        return 0.0, 0.0


def box_height(box):
    try:
        ys = [float(p[1]) for p in box]
        return max(ys) - min(ys)
    except Exception:
        return 0.0


def parse_paddle_result(result, variant_name):
    """
    Handles common PaddleOCR output:
    [
      [
        [box, (text, score)],
        ...
      ]
    ]
    """
    lines = []

    if not result:
        return lines

    for page in result:
        if not page:
            continue

        for item in page:
            try:
                box = item[0]
                text = clean_line(item[1][0])
                score = float(item[1][1])
                cx, cy = box_center(box)

                if text and score >= 0.30:
                    lines.append({
                        "text": text,
                        "score": round(score, 4),
                        "box": box,
                        "cx": round(cx, 2),
                        "cy": round(cy, 2),
                        "height": round(box_height(box), 2),
                        "variant": variant_name,
                    })
            except Exception:
                continue

    return lines


def run_paddle_on_variant(img, variant_name):
    temp_path = DEBUG_DIR / f"{variant_name}.jpg"
    cv2.imwrite(str(temp_path), img)

    try:
        result = ocr_engine.ocr(str(temp_path), cls=True)
        return parse_paddle_result(result, variant_name)
    except Exception as error:
        print(f"PaddleOCR error on {variant_name}:", str(error))
        return []


def merge_unique_lines(all_lines):
    """
    Merge similar lines from multiple OCR variants.
    """
    cleaned = []

    for item in all_lines:
        text = clean_line(item.get("text", ""))
        if not text:
            continue

        # skip tiny garbage
        if len(text) <= 1:
            continue

        normalized_key = re.sub(r"[^a-zA-Z0-9]+", "", text).lower()
        if not normalized_key:
            continue

        duplicate_index = None
        for idx, existing in enumerate(cleaned):
            existing_key = existing["key"]
            if normalized_key == existing_key:
                duplicate_index = idx
                break

        if duplicate_index is not None:
            # keep higher score
            if item.get("score", 0) > cleaned[duplicate_index]["score"]:
                cleaned[duplicate_index]["item"] = item
                cleaned[duplicate_index]["score"] = item.get("score", 0)
        else:
            cleaned.append({
                "key": normalized_key,
                "score": item.get("score", 0),
                "item": item,
            })

    merged = [x["item"] for x in cleaned]
    merged = sorted(merged, key=lambda x: (x.get("cy", 0), x.get("cx", 0)))
    return merged


def run_best_local_ocr(image_path):
    img = read_image(image_path)
    q = quality_report(img)

    variants = make_variants(img)

    all_lines = []
    for name, variant in variants.items():
        cv2.imwrite(str(DEBUG_DIR / f"debug_{name}.jpg"), variant)
        lines = run_paddle_on_variant(variant, name)
        all_lines.extend(lines)

    merged_lines = merge_unique_lines(all_lines)

    raw_text = "\n".join([line["text"] for line in merged_lines])

    with open(DEBUG_DIR / "latest_raw_text.txt", "w", encoding="utf-8") as f:
        f.write(raw_text)

    with open(DEBUG_DIR / "latest_ocr_lines.json", "w", encoding="utf-8") as f:
        json.dump(merged_lines, f, ensure_ascii=False, indent=2)

    print("\n========== PADDLE OCR TEXT ==========")
    print(raw_text)
    print("========== PADDLE OCR TEXT END ==========\n")

    return raw_text, merged_lines, q


# ============================================================
# Optional fallback Tesseract
# ============================================================

def run_tesseract_fallback(image_path):
    if not TESSERACT_AVAILABLE:
        return ""

    try:
        img = read_image(image_path)
        img = rotate_if_portrait(img)
        img = crop_center_cnic(img, 0.92)
        processed = enhance_for_ocr(img)

        configs = [
            "--oem 3 --psm 6",
            "--oem 3 --psm 4",
            "--oem 3 --psm 11",
        ]

        texts = []
        for config in configs:
            try:
                text = pytesseract.image_to_string(processed, lang="eng", config=config)
                if text and text.strip():
                    texts.append(text.strip())
            except Exception:
                pass

        text = "\n".join(texts)

        if text:
            with open(DEBUG_DIR / "latest_tesseract_text.txt", "w", encoding="utf-8") as f:
                f.write(text)

        return text
    except Exception as error:
        print("Tesseract fallback error:", str(error))
        return ""


# ============================================================
# Field parser
# ============================================================

BAD_NAME_WORDS = [
    "pakistan",
    "national",
    "identity",
    "identity card",
    "card",
    "islamic",
    "republic",
    "signature",
    "holder",
    "country",
    "stay",
    "issue",
    "expiry",
    "birth",
    "date",
    "gender",
    "male",
    "female",
    "number",
    "cnic",
    "identity number",
    "father",
    "name",
    "tracking",
    "address",
    "province",
    "district",
]


def is_bad_name_candidate(value):
    value = clean_line(value)
    if not value:
        return True

    low = value.lower()

    if len(value) < 3 or len(value) > 45:
        return True

    if any(word in low for word in BAD_NAME_WORDS):
        return True

    if re.search(r"\d{3,}", value):
        return True

    # require mostly alphabetic characters
    letters = len(re.findall(r"[A-Za-z]", value))
    if letters < 3:
        return True

    # avoid lines that are mostly symbols/numbers
    if letters / max(len(value), 1) < 0.45:
        return True

    return False


def clean_name(value):
    value = remove_extra_symbols(value)
    value = re.sub(r"\b(Name|Father|Full|Citizen|Husband|Guardian|F Name)\b", " ", value, flags=re.I)
    value = re.sub(r"[:\-_/]+", " ", value)
    value = re.sub(r"\s+", " ", value).strip()

    # keep English name-style chars
    value = re.sub(r"[^A-Za-z\s.'-]", " ", value)
    value = re.sub(r"\s+", " ", value).strip()

    if is_bad_name_candidate(value):
        return ""

    return value.title()


def get_texts(lines):
    return [clean_line(line.get("text", "")) for line in lines if clean_line(line.get("text", ""))]


def find_cnic(text):
    candidates = []

    # Standard with or without hyphens/spaces
    for match in re.findall(r"\d{5}[-\s]?\d{7}[-\s]?\d", fix_common_digit_ocr(text)):
        cnic = normalize_cnic(match)
        if cnic:
            candidates.append(cnic)

    # Compact 13 digit
    fixed = fix_common_digit_ocr(text)
    compact = re.sub(r"\D", "", fixed)
    for match in re.findall(r"\d{13}", compact):
        cnic = normalize_cnic(match)
        if cnic:
            candidates.append(cnic)

    # unique
    unique = []
    for item in candidates:
        if item not in unique:
            unique.append(item)

    return unique[0] if unique else ""


def find_gender(text):
    low = text.lower()

    # Female first because "female" contains "male"
    if re.search(r"\bfemale\b", low) or re.search(r"\bsex\s*[:\-]?\s*f\b", low) or re.search(r"\bgender\s*[:\-]?\s*f\b", low):
        return "Female"

    if re.search(r"\bmale\b", low) or re.search(r"\bsex\s*[:\-]?\s*m\b", low) or re.search(r"\bgender\s*[:\-]?\s*m\b", low):
        return "Male"

    return ""


def find_dates(text):
    fixed = fix_common_digit_ocr(text)
    fixed = fixed.replace(" ", "-")

    patterns = [
        r"\b\d{1,2}[-/.]\d{1,2}[-/.]\d{4}\b",
        r"\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b",
    ]

    found = []
    for pattern in patterns:
        for item in re.findall(pattern, fixed):
            normalized = normalize_date(item)
            if normalized and normalized not in found:
                found.append(normalized)

    return found


def find_dob(text, lines):
    texts = get_texts(lines)

    # Prefer date near birth/DOB label
    for i, line in enumerate(texts):
        low = line.lower()
        if "birth" in low or "dob" in low:
            joined = " ".join(texts[i:i+4])
            dates = find_dates(joined)
            if dates:
                return dates[0]

    # Else choose the date that produces realistic adult/child age,
    # and avoid future/expiry dates already filtered.
    dates = find_dates(text)
    if not dates:
        return ""

    # CNIC often has DOB, issue, expiry. DOB is usually oldest date.
    valid = []
    for d in dates:
        age = calculate_age(d)
        if age:
            valid.append((d, int(age)))

    if not valid:
        return ""

    # Oldest age is usually date of birth
    valid = sorted(valid, key=lambda x: x[1], reverse=True)
    return valid[0][0]


def label_like_name(line):
    low = line.lower()
    return bool(re.search(r"\b(full\s*)?name\b", low)) and "father" not in low and "husband" not in low


def label_like_father(line):
    low = line.lower()
    return bool(
        "father" in low
        or "husband" in low
        or re.search(r"\bf\s*name\b", low)
        or "guardian" in low
    )


def extract_value_after_label(texts, index):
    """
    First try same line after colon/label.
    Then next few lines.
    """
    line = texts[index]

    same = re.sub(r"(full\s*)?name|father\s*name|father|husband\s*name|husband|guardian|f\s*name", " ", line, flags=re.I)
    same = same.strip(" :.-")
    same = clean_name(same)
    if same:
        return same

    for offset in range(1, 5):
        j = index + offset
        if j >= len(texts):
            break

        candidate = clean_name(texts[j])
        if candidate:
            return candidate

    return ""


def guess_names(text, lines):
    texts = get_texts(lines)

    full_name = ""
    father_name = ""

    # Label-based
    for i, line in enumerate(texts):
        if not full_name and label_like_name(line):
            full_name = extract_value_after_label(texts, i)

        if not father_name and label_like_father(line):
            father_name = extract_value_after_label(texts, i)

    # Fallback: choose first two clean name-like lines after ignoring bad lines
    name_candidates = []
    for line in texts:
        candidate = clean_name(line)
        if candidate and candidate not in name_candidates:
            name_candidates.append(candidate)   

    if not full_name and len(name_candidates) >= 1:
        full_name = name_candidates[0]

    if not father_name and len(name_candidates) >= 2:
        # avoid duplicate
        for candidate in name_candidates[1:]:
            if candidate != full_name:
                father_name = candidate
                break

    return full_name, father_name


def score_fields(fields):
    score = 0
    if fields.get("cnic"):
        score += 35
    if fields.get("fullName"):
        score += 20
    if fields.get("fatherName"):
        score += 20
    if fields.get("gender"):
        score += 10
    if fields.get("dateOfBirth"):
        score += 15
    return score


def parse_fields(raw_text, lines):
    full_name, father_name = guess_names(raw_text, lines)
    dob = find_dob(raw_text, lines)
    age = calculate_age(dob)

    fields = {
        "fullName": full_name,
        "fatherName": father_name,
        "gender": find_gender(raw_text),
        "cnic": find_cnic(raw_text),
        "dateOfBirth": dob,
        "age": age,
        "rawText": raw_text,
    }

    fields["filledCount"] = sum(
        1 for key in ["fullName", "fatherName", "gender", "cnic", "dateOfBirth"]
        if fields.get(key)
    )
    fields["confidenceScore"] = score_fields(fields)

    return fields


# ============================================================
# API routes
# ============================================================

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "message": "Excellent local CNIC OCR service running",
        "port": 5001,
        "primaryEngine": "PaddleOCR",
        "tesseractFallback": TESSERACT_AVAILABLE,
    })


@app.route("/api/scan-cnic", methods=["POST"])
def scan_cnic():
    try:
        if "image" not in request.files:
            return jsonify({"success": False, "error": "No image uploaded"}), 400

        image_file = request.files["image"]
        timestamp = now_stamp()

        image_path = UPLOAD_DIR / f"cnic_{timestamp}.jpg"
        latest_input = DEBUG_DIR / "latest_input.jpg"

        image_file.save(str(image_path))
        shutil.copy(str(image_path), str(latest_input))

        print("\n========== NEW CNIC SCAN ==========")
        print("Saved:", image_path)

        raw_text, lines, q = run_best_local_ocr(image_path)
        fields = parse_fields(raw_text, lines)

        # If Paddle result is weak, merge Tesseract fallback text.
        if fields["confidenceScore"] < 45:
            print("Paddle result weak. Trying Tesseract fallback...")
            tess_text = run_tesseract_fallback(image_path)

            if tess_text:
                combined_text = raw_text + "\n" + tess_text
                combined_lines = lines + [{"text": clean_line(x), "score": 0.20, "variant": "tesseract"} for x in tess_text.splitlines() if clean_line(x)]
                fields = parse_fields(combined_text, combined_lines)
                fields["rawText"] = combined_text

        # Professional quality gate:
        # If almost nothing found, ask retake instead of returning fake data.
        retake_required = False
        retake_reason = ""

        if q.get("tooBlurry") and fields["filledCount"] < 3:
            retake_required = True
            retake_reason = "Image is blurry. Please retake a clearer CNIC photo."

        if fields["filledCount"] < 2:
            retake_required = True
            retake_reason = "CNIC text was not readable. Please retake photo with better lighting and focus."

        response = {
            "success": not retake_required,
            "retakeRequired": retake_required,
            "error": retake_reason if retake_required else "",
            "source": "PaddleOCR_Local_Excellent",
            "quality": q,
            **fields,
            "debugFiles": {
                "latestInput": str(latest_input),
                "rawText": str(DEBUG_DIR / "latest_raw_text.txt"),
                "ocrLines": str(DEBUG_DIR / "latest_ocr_lines.json"),
            }
        }

        with open(DEBUG_DIR / "latest_response.json", "w", encoding="utf-8") as f:
            json.dump(response, f, ensure_ascii=False, indent=2)

        print("Response:", json.dumps({
            "success": response["success"],
            "filledCount": response["filledCount"],
            "confidenceScore": response["confidenceScore"],
            "cnic": response.get("cnic"),
            "dob": response.get("dateOfBirth"),
            "quality": response["quality"],
        }, ensure_ascii=False, indent=2))
        print("========== SCAN END ==========\n")

        status_code = 200 if response["success"] else 422
        return jsonify(response), status_code

    except Exception as error:
        print("OCR service error:", str(error))
        return jsonify({
            "success": False,
            "error": str(error),
        }), 500


if __name__ == "__main__":
    print("Excellent local CNIC OCR service running at http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)
