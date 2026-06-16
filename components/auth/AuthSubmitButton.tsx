"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface AuthSubmitButtonProps {
  label: string;
  loading?: boolean;
  disabled?: boolean;
}

// Rounded violet submit button with a persistent arrow that nudges on hover.
// Loading state = staggered pulsing dots.
export default function AuthSubmitButton({
  label,
  loading = false,
  disabled = false,
}: AuthSubmitButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type="submit"
      disabled={isDisabled}
      whileHover={isDisabled ? undefined : "hover"}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-colors duration-200 ${
        isDisabled
          ? "cursor-not-allowed bg-violet-600/40"
          : "cursor-pointer bg-violet-600 hover:bg-violet-500"
      }`}
    >
      {loading ? (
        <span className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-white"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </span>
      ) : (
        <>
          <span>{label}</span>
          <motion.span
            variants={{ hover: { x: 4 } }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="inline-flex"
          >
            <ArrowRight size={16} />
          </motion.span>
        </>
      )}
    </motion.button>
  );
}
