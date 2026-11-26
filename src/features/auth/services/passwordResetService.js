// src/features/auth/services/passwordResetService.js
// Talks to the backend (backend/node_ocr → passwordReset.js) for the
// forgot-password flow: send code → check code → set new password.

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

async function post(path, body) {
  let response;
  try {
    response = await fetch(`${API_BASE}/api/auth${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    const err = new Error(
      "Can't reach the server. Make sure the backend is running: cd backend/node_ocr && npm start"
    );
    err.network = true;
    throw err;
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    /* keep empty */
  }

  if (!response.ok || !data.success) {
    const err = new Error(data.error || "Something went wrong. Please try again.");
    Object.assign(err, data, { status: response.status });
    throw err;
  }
  return data;
}

/** Step 1 — email a 6-digit code. */
export function requestResetCode(email) {
  return post("/forgot-password", { email });
}

/** Step 2 — check the code; returns { resetToken }. */
export function verifyResetCode(email, otp) {
  return post("/verify-otp", { email, otp });
}

/** Step 3 — save the new password. */
export function setNewPassword(email, resetToken, newPassword) {
  return post("/reset-password", { email, resetToken, newPassword });
}
