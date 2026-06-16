"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { X } from "lucide-react";

// Shown under the feed header when a tag filter is active. The X links back to
// "/", clearing the filter. Animates its height/opacity (wrapped in
// AnimatePresence by the feed).
export default function ActiveTagBar({ tag }: { tag: string }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="overflow-hidden border-b border-zinc-200"
    >
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-sm text-zinc-500">
          Showing{" "}
          <span className="rounded-md bg-violet-50 px-1.5 py-0.5 text-[13px] font-medium text-violet-700">
            #{tag}
          </span>
        </span>
        <Link
          href="/"
          aria-label="Clear filter"
          className="cursor-pointer rounded-md p-1 text-zinc-400 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900"
        >
          <X size={16} />
        </Link>
      </div>
    </motion.div>
  );
}
