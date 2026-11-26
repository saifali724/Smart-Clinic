// src/features/patientRecord/utils/format.js
// Small helpers for showing data nicely.

// Firestore Timestamp | Date | number | "2024-11-12" | "15-03-1985" → Date (or null)
export function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") {
    // CNIC style dd-mm-yyyy or dd.mm.yyyy or dd/mm/yyyy
    const m = value.match(/^(\d{1,2})[-./](\d{1,2})[-./](\d{4})$/);
    if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

// → "Nov 12, 2024"
export function formatDate(value) {
  const d = toDate(value);
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

// Age in years from a date of birth
export function ageFromDob(dob) {
  const d = toDate(dob);
  if (!d) return "";
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const hadBirthday =
    now.getMonth() > d.getMonth() ||
    (now.getMonth() === d.getMonth() && now.getDate() >= d.getDate());
  if (!hadBirthday) age -= 1;
  return age >= 0 && age < 150 ? String(age) : "";
}

// "Ahmed Hassan" → "AH"
export function initials(name) {
  return (
    (name || "")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "—"
  );
}

// "Sarah Mitchell" → "Dr. Sarah Mitchell" (doesn't double the "Dr.")
export function withDrPrefix(name) {
  if (!name) return "";
  return /^dr\.?\s/i.test(name.trim()) ? name.trim() : `Dr. ${name.trim()}`;
}

// "Dr. Khalid Mahmood" → "Dr. Khalid"  (short form used in visit history)
export function shortDoctorName(name) {
  const full = withDrPrefix(name);
  const parts = full.split(" ");
  return parts.length > 2 ? `${parts[0]} ${parts[1]}` : full;
}

// Today as "2026-11-25" in the user's local time
export function todayKey() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// "35202-1234567-9" → "3520212345679"
export function cnicDigits(cnic) {
  return (cnic || "").replace(/\D/g, "");
}
