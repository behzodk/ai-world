"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// Shared Framer Motion loading spinner. Used by auth buttons and the composer
// so every loading state in the app reads the same way.
export default function Spinner({ size = 16 }: { size?: number }) {
  return (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
      className="inline-flex"
    >
      <Loader2 size={size} strokeWidth={2.5} />
    </motion.span>
  );
}
