"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

interface AnimatedInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  isPassword?: boolean;
}

// Light underline-only input (sits on the white right panel): floating label,
// violet underline that scales in from the left on focus, optional reveal.
export default function AnimatedInput({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  isPassword = false,
}: AnimatedInputProps) {
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);

  const active = focused || value.length > 0;
  const inputType = isPassword ? (reveal ? "text" : "password") : type;

  return (
    <div className="relative">
      <input
        id={id}
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        className="w-full border-b border-zinc-200 bg-transparent pb-2 pr-8 pt-6 text-sm text-zinc-900 outline-none"
      />

      {/* Floating label — zinc-400 → violet-600 when active. */}
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

      {/* Violet underline reveal. */}
      <motion.div
        layoutId={`underline-${id}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: focused ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-violet-600"
      />

      {isPassword && (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setReveal((r) => !r)}
          aria-label={reveal ? "Hide password" : "Show password"}
          className="absolute right-0 top-6 cursor-pointer text-zinc-400 transition-colors duration-150 hover:text-zinc-900"
        >
          {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
}
