// src/features/idScanner/services/idScannerService.js

export async function savePatientRecord(payload) {
  console.log("Mock patient saved:", payload);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Patient record saved locally in frontend mock state.",
      });
    }, 700);
  });
}