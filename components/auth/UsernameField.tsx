"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getUsernameRules,
  validateUsernameFormat,
  type UsernameRules,
} from "@/lib/validation";

export type UsernameAvailability = "idle" | "checking" | "available" | "taken";

type UsernameFieldProps = {
  value: string;
  onChange: (value: string) => void;
  availability: UsernameAvailability;
  onAvailabilityChange: (value: UsernameAvailability) => void;
};

const checklist: { key: keyof UsernameRules; label: string }[] = [
  { key: "startsWithLetter", label: "starts with a letter" },
  { key: "minLength", label: "at least 4 characters" },
  { key: "allowedCharacters", label: "only letters, numbers, _ or ." },
  { key: "notEndingDot", label: "doesn't end with a dot" },
];

export default function UsernameField({
  value,
  onChange,
  availability,
  onAvailabilityChange,
}: UsernameFieldProps) {
  const supabase = useMemo(() => createClient(), []);
  const [focused, setFocused] = useState(false);
  const trimmed = value.trim();
  const active = focused || value.length > 0;
  const rules = getUsernameRules(trimmed);
  const formatValid = validateUsernameFormat(trimmed);
  const valid = formatValid && availability === "available";
  const invalid = value.length > 0 && (!formatValid || availability === "taken");
  const borderClass = valid
    ? "border-emerald-500"
    : invalid
      ? "border-rose-500"
      : "border-zinc-200";

  useEffect(() => {
    if (!formatValid) {
      onAvailabilityChange("idle");
      return;
    }

    onAvailabilityChange("checking");
    const timeout = window.setTimeout(async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", trimmed)
        .limit(1);

      if (error) {
        onAvailabilityChange("taken");
        return;
      }

      onAvailabilityChange(data && data.length > 0 ? "taken" : "available");
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [formatValid, onAvailabilityChange, supabase, trimmed]);

  return (
    <div>
      <div className="relative">
        <input
          id="username"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="username"
          className={`w-full border-b bg-transparent pb-2 pr-8 pt-6 text-sm text-zinc-900 outline-none transition-colors duration-150 ${borderClass}`}
        />

        <motion.label
          htmlFor="username"
          initial={false}
          animate={
            active
              ? { y: -22, fontSize: "11px", color: "#7c3aed" }
              : { y: 0, fontSize: "14px", color: "#a1a1aa" }
          }
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="pointer-events-none absolute left-0 top-6 origin-left font-medium"
        >
          Username
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
      </div>

      <div className="mt-3 space-y-1.5">
        {checklist.map((item) => {
          const passed = rules[item.key];
          return (
            <div
              key={item.key}
              className={`flex items-center gap-2 text-xs ${
                passed ? "text-emerald-600" : "text-zinc-400"
              }`}
            >
              {passed ? <Check size={13} /> : <X size={13} />}
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {formatValid && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className={`mt-2 flex items-center gap-2 text-xs ${
              availability === "taken"
                ? "text-rose-500"
                : availability === "available"
                  ? "text-emerald-600"
                  : "text-zinc-400"
            }`}
          >
            {availability === "checking" && (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                className="inline-flex"
              >
                <Loader2 size={13} />
              </motion.span>
            )}
            {availability === "available" && <Check size={13} />}
            {availability === "taken" && <X size={13} />}
            <span>
              {availability === "checking"
                ? "checking…"
                : availability === "available"
                  ? "available"
                  : availability === "taken"
                    ? "that username is taken"
                    : ""}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
