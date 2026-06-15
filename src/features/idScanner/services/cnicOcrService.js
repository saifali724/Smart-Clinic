// src/features/idScanner/services/cnicOcrService.js

export async function extractCnicDataFromImage(imageDataUrl, onProgress) {
  if (onProgress) onProgress(5);

  // Convert captured camera image DataURL into Blob
  const imageBlob = await fetch(imageDataUrl).then((response) =>
    response.blob(),
  );

  if (onProgress) onProgress(15);

  const formData = new FormData();
  formData.append("image", imageBlob, "cnic-capture.png");

  // Send image to Python OCR Flask service
  const response = await fetch("http://localhost:5001/api/scan-cnic", {
    method: "POST",
    body: formData,
  });

  if (onProgress) onProgress(80);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Python OCR service failed");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || "CNIC OCR failed");
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