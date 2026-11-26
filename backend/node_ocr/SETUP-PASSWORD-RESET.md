# Forgot Password (email code) — one-time setup

The backend needs two things to reset passwords:
1. a **Firebase service key** (lets the server change a doctor's password), and
2. a **Gmail app password** (lets the server email the 6-digit code).

## 1. Install the two new packages

```
cd D:\smart-clinic\backend\node_ocr
npm install
```

## 2. Firebase service key

1. Open https://console.firebase.google.com → project **smart-clinic-b5b6d**.
2. ⚙ **Project settings** → **Service accounts** tab → **Generate new private key** → **Generate key**.
3. A `.json` file downloads. Rename it to **`serviceAccountKey.json`**.
4. Move it into **`D:\smart-clinic\backend\node_ocr\`** (next to `server.js`).

⚠ This file is a master key to your Firebase project. Never share it, never upload it
to GitHub (it is already in `.gitignore`), never put it in the `src` folder.

## 3. Gmail app password (for sending the code)

1. Use the Gmail account the codes should come from.
2. Turn on **2-Step Verification**: https://myaccount.google.com/security
3. Create an **App password**: https://myaccount.google.com/apppasswords
   (name it "MediScan") → Google shows a 16-letter password.
4. Open `D:\smart-clinic\backend\node_ocr\.env` and add these lines
   (keep your GEMINI lines as they are):

```
SMTP_USER=your.gmail@gmail.com
SMTP_PASS=abcdefghijklmnop
```

(the 16 letters, no spaces)

## 4. Restart the backend

```
npm start
```

You should see:
```
Password reset: Firebase Admin ready.
Password reset: emails will be sent from your.gmail@gmail.com.
```

## Testing before Gmail is set up

If `SMTP_USER` / `SMTP_PASS` are missing, the code is **printed in the backend terminal**
instead of emailed, so you can still test the whole flow.
The Firebase service key is always needed.

## How it's protected

- 6-digit code, valid 10 minutes, stored only as a hash
- 5 wrong tries → code cancelled
- new code only every 60 seconds, max 5 per hour per email
- the screen never reveals whether an email has an account
- after the password changes, the doctor is signed out on other devices
