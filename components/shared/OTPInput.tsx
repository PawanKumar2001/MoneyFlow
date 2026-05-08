"use client";

import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { motion } from "framer-motion";

type Props = {
  onComplete: (code: string) => void;
  disabled?: boolean;
};

export default function OTPInput({ onComplete, disabled }: Props) {
  const [values, setValues] = useState<string[]>(Array(6).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newValues = [...values];
    newValues[index] = value.slice(-1);
    setValues(newValues);

    // Auto advance
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    // Check complete
    const code = newValues.join("");
    if (code.length === 6) {
      onComplete(code);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newValues = Array(6).fill("");
    pasted.split("").forEach((char, i) => {
      newValues[i] = char;
    });
    setValues(newValues);

    // Focus last filled or next empty
    const lastIndex = Math.min(pasted.length - 1, 5);
    inputs.current[lastIndex]?.focus();

    if (pasted.length === 6) {
      onComplete(pasted);
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {values.map((val, i) => (
        <motion.input
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-bold rounded-xl border transition-all outline-none
            ${val
              ? "border-white/50 bg-white/10 text-white"
              : "border-white/20 bg-white/5 text-white"
            }
            focus:border-white focus:bg-white/15
            disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
}