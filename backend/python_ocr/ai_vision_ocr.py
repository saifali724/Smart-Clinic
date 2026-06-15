# backend/python_ocr/ai_vision_ocr.py

import base64
import json
import os
import re
from datetime import datetime

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

VISION_MODEL = os.getenv("OPENAI_VISION_MODEL", "gpt-5.4-mini")


def calculate_age(date_of_birth):
    if not date_of_birth:
        return ""

    try:
        parts = re.split(r"[.\-/]", date_of_birth)

        if len(parts) != 3:
            return ""

        day = int(parts[0])
        month = int(parts[1])
        year = int(parts[2])

        today = datetime.today()

        if year < 1900 or year > today.year:
            return ""

        birth_date = datetime(year, month, day)

        if birth_date > today:
            return ""

        age = today.year - birth_date.year

        if (today.month, today.day) < (birth_date.month, birth_date.day):
            age -= 1

        if age < 0 or age > 120:
            return ""

        return str(age)

    except Exception:
        return ""


def normalize_cnic(value):
    if not value:
        return ""

    fixed = (
        str(value)
        .replace("O", "0")
        .replace("o", "0")
        .replace("I", "1")
        .replace("l", "1")
        .replace("|", "1")
        .replace("S", "5")
        .replace("B", "8")
    )

    digits = re.sub(r"\D", "", fixed)

    match = re.search(r"\d{13}", digits)

    if not match:
        return ""

    cnic = match.group()

    return f"{cnic[:5]}-{cnic[5:12]}-{cnic[12]}"


def normalize_date(value):
    if not value:
        return ""

    fixed = (
        str(value)
        .replace("O", "0")
        .replace("o", "0")
        .replace("I", "1")
        .replace("l", "1")
        .replace("|", "1")
    )

    match = re.search(r"(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})", fixed)

    if not match:
        return ""

    day = int(match.group(1))
    month = int(match.group(2))
    year = int(match.group(3))

    today = datetime.today()

    if year < 1900 or year > today.year:
        return ""

    try:
        date_obj = datetime(year, month, day)

        if date_obj > today:
            return ""

    except Exception:
        return ""

    return f"{str(day).zfill(2)}-{str(month).zfill(2)}-{year}"


def safe_json_parse(text):
    if not text:
        return {}

    cleaned = text.strip()

    cleaned = cleaned.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(cleaned)
    except Exception:
        pass

    match = re.search(r"\{.*\}", cleaned, re.DOTALL)

    if match:
        try:
            return json.loads(match.group())
        except Exception:
            return {}

    return {}


def image_to_base64_data_url(image_path):
    with open(image_path, "rb") as image_file:
        encoded = base64.b64encode(image_file.read()).decode("utf-8")

    return f"data:image/jpeg;base64,{encoded}"


def extract_cnic_with_ai_vision(image_path):
    """
    Returns:
    {
      success: True/False,
      fullName: "",
      fatherName: "",
      gender: "",
      cnic: "",
      dateOfBirth: "",
      age: "",
      rawText: "",
      confidence: {...},
      source: "ai_vision"
    }
    """

    if not os.getenv("OPENAI_API_KEY"):
        return {
            "success": False,
            "error": "OPENAI_API_KEY missing in backend/python_ocr/.env",
            "source": "ai_vision",
        }

    image_data_url = image_to_base64_data_url(image_path)

    prompt = """
You are an expert OCR and document-understanding system for Pakistani CNIC cards.

Task:
Extract ONLY visible information from the CNIC image.

Return JSON only with this exact shape:
{
  "fullName": "",
  "fatherName": "",
  "gender": "",
  "cnic": "",
  "dateOfBirth": "",
  "rawText": "",
  "confidence": {
    "fullName": 0,
    "fatherName": 0,
    "gender": 0,
    "cnic": 0,
    "dateOfBirth": 0
  }
}

Rules:
1. Do not guess missing data.
2. If a field is not clearly readable, return empty string for that field.
3. Normalize CNIC as #####-#######-#.
4. Normalize dateOfBirth as DD-MM-YYYY.
5. Gender must be Male or Female only.
6. rawText should contain the important readable text from the card.
7. confidence values must be from 0 to 1.
8. Return JSON only, no explanation.
"""

    response = client.responses.create(
        model=VISION_MODEL,
        input=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": prompt,
                    },
                    {
                        "type": "input_image",
                        "image_url": image_data_url,
                    },
                ],
            }
        ],
    )

    output_text = response.output_text

    parsed = safe_json_parse(output_text)

    full_name = str(parsed.get("fullName", "") or "").strip()
    father_name = str(parsed.get("fatherName", "") or "").strip()

    gender = str(parsed.get("gender", "") or "").strip()

    if gender.lower() in ["m", "male"]:
        gender = "Male"
    elif gender.lower() in ["f", "female"]:
        gender = "Female"
    else:
        gender = ""

    cnic = normalize_cnic(parsed.get("cnic", ""))

    date_of_birth = normalize_date(parsed.get("dateOfBirth", ""))
    age = calculate_age(date_of_birth)

    confidence = parsed.get("confidence", {})

    return {
        "success": True,
        "fullName": full_name,
        "fatherName": father_name,
        "gender": gender,
        "cnic": cnic,
        "dateOfBirth": date_of_birth,
        "age": age,
        "rawText": parsed.get("rawText", "") or "",
        "confidence": {
            "fullName": float(confidence.get("fullName", 0) or 0),
            "fatherName": float(confidence.get("fatherName", 0) or 0),
            "gender": float(confidence.get("gender", 0) or 0),
            "cnic": float(confidence.get("cnic", 0) or 0),
            "dateOfBirth": float(confidence.get("dateOfBirth", 0) or 0),
        },
        "source": "ai_vision",
    }