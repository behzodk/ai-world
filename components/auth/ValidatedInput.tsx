"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type ValidatedInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  valid: boolean;
  error?: string | null;
  touched: boolean;
  type?: string;
  autoComplete?: string;
  isPassword?: boolean;
};

export default function ValidatedInput({
  id,
  label,
  value,
  onChange,
  valid,
  error,
  touched,
  type = "text",
  autoComplete,
  isPassword = false,
}: ValidatedInputProps) {
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);
  const active = focused || value.length > 0;
  const invalid = touched && value.length > 0 && !valid;
  const inputType = isPassword ? (reveal ? "text" : "password") : type;
  const borderClass = valid
    ? "border-emerald-500"
    : invalid
      ? "border-rose-500"
      : "border-zinc-200";

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          className={`w-full border-b bg-transparent pb-2 pr-16 pt-6 text-sm text-zinc-900 outline-none transition-colors duration-150 ${borderClass}`}
        />

        <motion.label
          htmlFor={id}
          initial={false}
          animate={
            active
              ? { y: -22, fontSize: "11px", color: "#7c3aed" }
              : { y: 0, fontSize: "14px", color: "#a1a1aa" }
          }
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="pointer-events-none absolute left-0 top-6 origin-left font-medium"
        >
          {label}
        </motion.label>

        <AnimatePresence initial={false}>
          {valid && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-6 text-emerald-500"
            >
              <Check size={16} strokeWidth={2.5} />
            </motion.span>
          )}
        </AnimatePresence>

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setReveal((current) => !current)}
            aria-label={reveal ? "Hide password" : "Show password"}
            className="absolute right-7 top-6 cursor-pointer text-zinc-400 transition-colors duration-150 hover:text-zinc-900"
          >
            {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {invalid && error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="mt-2 text-xs text-rose-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
