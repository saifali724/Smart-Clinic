// src/features/idScanner/services/cnicOcrService.js
// Calls the CNIC OCR backend (now Node + Gemini Vision, previously Python/PaddleOCR).

const OCR_ENDPOINT = "http://localhost:5001/api/scan-cnic";

export async function extractCnicDataFromImage(imageDataUrl, onProgress) {
  if (onProgress) onProgress(5);

  const imageBlob = await fetch(imageDataUrl).then((response) => response.blob());

  if (onProgress) onProgress(15);

  const formData = new FormData();
  formData.append("image", imageBlob, "cnic-capture.png");

  let response;
  try {
    response = await fetch(OCR_ENDPOINT, { method: "POST", body: formData });
  } catch {
    throw new Error(
      "Cannot reach the OCR service. Make sure it is running: cd backend/node_ocr && npm start"
    );
  }

  if (onProgress) onProgress(80);

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("OCR service returned an invalid response.");
  }

  if (!response.ok || !result.success) {
    throw new Error(result?.error || "CNIC OCR failed");
  }

  if (onProgress) onProgress(100);

  return {
    fullName: result.fullName || "",
    fatherName: result.fatherName || "",
    gender: result.gender || "",
    cnic: result.cnic || "",
    dateOfBirth: result.dateOfBirth || "",
    age: result.age || "",
    rawText: result.rawText || "",
  };
}