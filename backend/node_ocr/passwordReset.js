// backend/node_ocr/passwordReset.js
//
// FORGOT PASSWORD with a 6-digit email code (OTP)
// ───────────────────────────────────────────────
//   1. POST /api/auth/forgot-password  { email }
//        → emails a 6-digit code (valid 10 minutes)
//   2. POST /api/auth/verify-otp       { email, otp }
//        → if the code is right, returns a one-time resetToken (valid 10 minutes)
//   3. POST /api/auth/reset-password   { email, resetToken, newPassword }
//        → changes the doctor's Firebase password
//
// Safety rules
//   • codes are stored hashed, never as plain text
//   • 5 wrong tries → the code is cancelled, a new one must be requested
//   • a new code can be sent only once every 60 seconds
//   • the reply never says whether an email is registered (stops people
//     from checking which emails have accounts)

const crypto = require("crypto");
const express = require("express");

const OTP_TTL_MS = 10 * 60 * 1000; // code valid for 10 minutes
const RESET_TTL_MS = 10 * 60 * 1000; // new-password step valid for 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // wait 60 s before another code
const MAX_ATTEMPTS = 5;
const MAX_SENDS_PER_HOUR = 5;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sha256 = (text) => crypto.createHash("sha256").update(text).digest("hex");
const normEmail = (email) => String(email || "").trim().toLowerCase();

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function passwordProblem(pw) {
  if (typeof pw !== "string" || pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(pw)) return "Password must contain a letter.";
  if (!/\d/.test(pw)) return "Password must contain a number.";
  if (pw.length > 128) return "Password is too long.";
  return "";
}

function otpEmailHtml(code) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;background:#070B15;padding:32px 16px">
    <div style="max-width:440px;margin:0 auto;background:#121827;border:1px solid #26354F;border-radius:18px;padding:32px 28px">
      <p style="margin:0;font-size:20px;font-weight:900;color:#15D5E8">MediScan<span style="color:#3DF5A0">AI</span></p>
      <h1 style="margin:22px 0 8px;font-size:22px;color:#EEF4FC">Your password reset code</h1>
      <p style="margin:0 0 22px;font-size:14px;line-height:21px;color:#8B96AA">
        Use this code to reset your MediScan AI password. It expires in 10 minutes.
      </p>
      <p style="margin:0;padding:16px 0;text-align:center;font-size:34px;font-weight:800;letter-spacing:10px;color:#00D4E9;background:#151B2B;border:1px solid #263552;border-radius:12px">${code}</p>
      <p style="margin:22px 0 0;font-size:12px;line-height:18px;color:#637088">
        If you didn't ask to reset your password, you can ignore this email — your password won't change.
        Never share this code with anyone.
      </p>
    </div>
  </div>`;
}

/**
 * @param deps.getUserByEmail(email) → { uid } or null
 * @param deps.updatePassword(uid, newPassword)
 * @param deps.sendOtpEmail(email, code, html)
 */
function createPasswordResetRouter(deps) {
  const router = express.Router();
  router.use(express.json({ limit: "10kb" }));

  // email → { otpHash, otpExpires, attempts, lastSentAt, sends: [times], uid,
  //           resetHash, resetExpires }
  const store = new Map();

  // tidy up old entries every 10 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [email, e] of store) {
      const alive = (e.otpExpires || 0) > now || (e.resetExpires || 0) > now || now - (e.lastSentAt || 0) < 3600_000;
      if (!alive) store.delete(email);
    }
  }, 10 * 60 * 1000).unref();

  // 1 ─ send code
  router.post("/forgot-password", async (req, res) => {
    const email = normEmail(req.body?.email);
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ success: false, error: "Please enter a valid email address." });
    }

    const now = Date.now();
    const entry = store.get(email) || { sends: [] };
    entry.sends = (entry.sends || []).filter((t) => now - t < 3600_000);

    if (entry.lastSentAt && now - entry.lastSentAt < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - (now - entry.lastSentAt)) / 1000);
      return res.status(429).json({ success: false, error: `Please wait ${wait}s before requesting a new code.`, retryAfter: wait });
    }
    if (entry.sends.length >= MAX_SENDS_PER_HOUR) {
      return res.status(429).json({ success: false, error: "Too many codes requested. Please try again in an hour." });
    }

    const generic = {
      success: true,
      message: "If an account exists for this email, a 6-digit code has been sent.",
      cooldown: RESEND_COOLDOWN_MS / 1000,
    };

    try {
      const user = await deps.getUserByEmail(email);
      entry.lastSentAt = now;
      entry.sends.push(now);

      if (!user) {
        // same answer as a real account — but nothing is sent
        entry.otpHash = null;
        store.set(email, entry);
        return res.json(generic);
      }

      const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
      entry.uid = user.uid;
      entry.otpHash = sha256(`${email}:${code}`);
      entry.otpExpires = now + OTP_TTL_MS;
      entry.attempts = 0;
      entry.resetHash = null;
      entry.resetExpires = 0;
      store.set(email, entry);

      await deps.sendOtpEmail(email, code, otpEmailHtml(code));
      return res.json(generic);
    } catch (err) {
      console.error("forgot-password error:", err.message);
      // let them try again straight away if sending failed
      entry.lastSentAt = 0;
      entry.sends.pop();
      store.set(email, entry);
      const status = err.status || 500;
      return res.status(status).json({
        success: false,
        error: err.publicMessage || "Couldn't send the code right now. Please try again.",
      });
    }
  });

  // 2 ─ check code
  router.post("/verify-otp", (req, res) => {
    const email = normEmail(req.body?.email);
    const otp = String(req.body?.otp || "").replace(/\D/g, "");
    const entry = store.get(email);

    if (otp.length !== 6) {
      return res.status(400).json({ success: false, error: "Enter the 6-digit code." });
    }
    if (!entry || !entry.otpHash) {
      return res.status(400).json({ success: false, error: "That code is incorrect. Please check the email and try again." });
    }
    if (Date.now() > entry.otpExpires) {
      entry.otpHash = null;
      return res.status(400).json({ success: false, error: "This code has expired. Please request a new one.", expired: true });
    }

    if (!safeEqual(sha256(`${email}:${otp}`), entry.otpHash)) {
      entry.attempts = (entry.attempts || 0) + 1;
      const left = MAX_ATTEMPTS - entry.attempts;
      if (left <= 0) {
        entry.otpHash = null;
        return res.status(400).json({ success: false, error: "Too many wrong tries. Please request a new code.", expired: true });
      }
      return res.status(400).json({
        success: false,
        error: `That code is incorrect. ${left} ${left === 1 ? "try" : "tries"} left.`,
        attemptsLeft: left,
      });
    }

    // correct — one-time token for the new-password step
    const resetToken = crypto.randomBytes(32).toString("hex");
    entry.otpHash = null;
    entry.resetHash = sha256(resetToken);
    entry.resetExpires = Date.now() + RESET_TTL_MS;
    return res.json({ success: true, resetToken });
  });

  // 3 ─ set new password
  router.post("/reset-password", async (req, res) => {
    const email = normEmail(req.body?.email);
    const { resetToken, newPassword } = req.body || {};
    const entry = store.get(email);

    if (!entry || !entry.resetHash || !resetToken || !safeEqual(sha256(String(resetToken)), entry.resetHash)) {
      return res.status(400).json({ success: false, error: "This reset session is not valid. Please start again.", restart: true });
    }
    if (Date.now() > entry.resetExpires) {
      entry.resetHash = null;
      return res.status(400).json({ success: false, error: "This reset session has expired. Please start again.", restart: true });
    }
    const problem = passwordProblem(newPassword);
    if (problem) return res.status(400).json({ success: false, error: problem });

    try {
      await deps.updatePassword(entry.uid, newPassword);
      store.delete(email);
      return res.json({ success: true, message: "Your password has been updated." });
    } catch (err) {
      console.error("reset-password error:", err.message);
      return res.status(500).json({ success: false, error: "Couldn't update the password. Please try again." });
    }
  });

  return router;
}

// ── real connections: Firebase Admin + Gmail (or any SMTP) ─────────────────
function createRealDeps() {
  const path = require("path");
  const fs = require("fs");

  let admin = null;
  const keyPath = path.resolve(__dirname, process.env.FIREBASE_SERVICE_ACCOUNT || "serviceAccountKey.json");
  if (fs.existsSync(keyPath)) {
    admin = require("firebase-admin");
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(require(keyPath)) });
    }
    console.log("Password reset: Firebase Admin ready.");
  } else {
    console.warn(`Password reset: ${path.basename(keyPath)} not found — forgot-password won't work until you add it (see SETUP-PASSWORD-RESET.md).`);
  }

  let transporter = null;
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const nodemailer = require("nodemailer");
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    console.log(`Password reset: emails will be sent from ${process.env.SMTP_USER}.`);
  } else {
    console.warn("Password reset: SMTP_USER / SMTP_PASS not set — codes will be printed in this terminal instead of emailed (testing only).");
  }

  const notReady = (what) => {
    const err = new Error(`${what} not configured`);
    err.status = 503;
    err.publicMessage = "Password reset isn't set up on the server yet. Please contact the administrator.";
    return err;
  };

  return {
    async getUserByEmail(email) {
      if (!admin) throw notReady("Firebase Admin");
      try {
        const u = await admin.auth().getUserByEmail(email);
        return { uid: u.uid };
      } catch (err) {
        if (err.code === "auth/user-not-found") return null;
        throw err;
      }
    },
    async updatePassword(uid, newPassword) {
      if (!admin) throw notReady("Firebase Admin");
      await admin.auth().updateUser(uid, { password: newPassword });
      await admin.auth().revokeRefreshTokens(uid); // signs out old sessions
    },
    async sendOtpEmail(email, code, html) {
      if (!transporter) {
        console.log(`\n[PASSWORD RESET] code for ${email}: ${code}  (set SMTP_USER/SMTP_PASS to email it)\n`);
        return;
      }
      await transporter.sendMail({
        from: `"MediScan AI" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: `${code} is your MediScan AI password reset code`,
        text: `Your MediScan AI password reset code is ${code}. It expires in 10 minutes. If you didn't ask for this, ignore this email.`,
        html,
      });
    },
  };
}

module.exports = { createPasswordResetRouter, createRealDeps, passwordProblem };
