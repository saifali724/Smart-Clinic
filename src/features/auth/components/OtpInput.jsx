// src/features/auth/components/OtpInput.jsx
// Six code boxes: typing moves to the next box, Backspace goes back,
// pasting "123456" fills all six, arrow keys move between boxes.

import { useEffect, useRef } from "react";

export function OtpInput({ value, onChange, disabled, shakeKey, hasError, autoFocus }) {
  const refs = useRef([]);
  // newest value, updated immediately (React state arrives a moment later)
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  function emit(next) {
    latest.current = next;
    onChange(next);
  }

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  // after a wrong code the boxes are cleared → put the cursor back in box 1
  useEffect(() => {
    if (shakeKey) refs.current[0]?.focus();
  }, [shakeKey]);

  function setAt(index, digit) {
    const current = Array.from({ length: 6 }, (_, i) => latest.current[i] || "");
    current[index] = digit;
    emit(current.join(""));
  }

  function handleChange(index, raw) {
    const only = raw.replace(/\D/g, "");
    if (!only) return;
    if (only.length > 1) {
      // pasted or auto-filled several digits
      const merged = (latest.current.slice(0, index) + only).slice(0, 6);
      emit(merged);
      refs.current[Math.min(merged.length, 5)]?.focus();
      return;
    }
    setAt(index, only);
    if (index < 5) refs.current[index + 1]?.focus();
  }

  function handleKeyDown(index, event) {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (latest.current[index]) {
        emit(latest.current.slice(0, index));
      } else if (index > 0) {
        emit(latest.current.slice(0, index - 1));
        refs.current[index - 1]?.focus();
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < 5) {
      refs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    emit(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  }

  return (
    <div key={shakeKey} className={`grid grid-cols-6 gap-[8px] sm:gap-[12px] ${shakeKey ? "otp-shake" : ""}`}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          maxLength={6}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => {
            // always fill boxes left to right — no gaps
            const filled = latest.current.length;
            if (i > filled) refs.current[filled]?.focus();
            else e.target.select();
          }}
          className={`h-[52px] w-full min-w-0 rounded-[9px] border bg-[#121B2B] text-center text-[20px] font-extrabold text-[#EEF4FC] caret-[#00D4E9] outline-none transition-all duration-200 disabled:opacity-60 sm:h-[58px] sm:text-[22px] ${
            hasError
              ? "border-[#FF5C7A]/70"
              : digit
              ? "border-[#00D4E9] shadow-[0_0_0_1px_rgba(0,212,233,0.18)]"
              : "border-[#263552]"
          } focus:border-[#00D4E9] focus:shadow-[0_0_0_3px_rgba(0,212,233,0.15)]`}
        />
      ))}
    </div>
  );
}

export default OtpInput;
