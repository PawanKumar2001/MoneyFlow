"use client";

import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { motion } from "framer-motion";

const OTP_LENGTH = 6;

type Props = {
  onComplete: (code: string) => void;
  disabled?: boolean;
};

export default function OTPInput({ onComplete, disabled = false }: Props) {
  const [values, setValues] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const focusInput = (index: number) => {
    inputs.current[index]?.focus();
    inputs.current[index]?.select();
  };

  const handleChange = (index: number, value: string) => {
    if (disabled) return;
    if (!/^\d*$/.test(value)) return;

    const nextValues = [...values];
    nextValues[index] = value.slice(-1);
    setValues(nextValues);

    if (value && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }

    const code = nextValues.join("");
    if (code.length === OTP_LENGTH && nextValues.every(Boolean)) {
      onComplete(code);
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (event.key === "Backspace" && !values[index] && index > 0) {
      focusInput(index - 1);
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const nextValues = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, index) => {
      nextValues[index] = char;
    });

    setValues(nextValues);

    const nextFocusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    focusInput(nextFocusIndex);

    if (pasted.length === OTP_LENGTH) {
      onComplete(pasted);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-center gap-1.5 sm:gap-2">
        {values.map((value, index) => (
          <motion.input
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.2 }}
            ref={(element) => {
              inputs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={value}
            disabled={disabled}
            aria-label={`Verification digit ${index + 1}`}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            className={`h-11 w-9 rounded-xl border text-center text-base font-semibold text-white outline-none transition-all sm:h-12 sm:w-11 sm:text-lg ${
              value
                ? "border-white/35 bg-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
                : "border-white/10 bg-[#0b0b0b]/95"
            } focus:border-white/60 focus:bg-white/[0.08] focus:ring-2 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-50`}
          />
        ))}
      </div>

      <p className="text-center text-[11px] leading-relaxed text-slate-500">
        Enter the 6-digit verification code sent to your email.
      </p>
    </div>
  );
}
