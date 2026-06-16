"use client";

import { motion } from "framer-motion";

interface CharCounterRingProps {
  count: number;
  max: number;
}

const R = 9;
const CIRC = 2 * Math.PI * R;
const WARN = 20; // show the number + go rose with this many chars (or fewer) left

// Twitter-style circular progress ring. Fills as the post approaches the limit;
// turns rose and reveals the remaining count in the final stretch.
export default function CharCounterRing({ count, max }: CharCounterRingProps) {
  const remaining = max - count;
  const warn = remaining <= WARN;
  const pct = Math.min(count / max, 1);
  const offset = CIRC * (1 - pct);

  return (
    <div className="relative flex h-6 w-6 items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24" className="-rotate-90">
        {/* Track */}
        <circle
          cx="12"
          cy="12"
          r={R}
          fill="none"
          stroke="#E8E3D5"
          strokeWidth="2.5"
        />
        {/* Progress */}
        <motion.circle
          cx="12"
          cy="12"
          r={R}
          fill="none"
          stroke={warn ? "#f43f5e" : "#C4F542"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </svg>
      {warn && (
        <span className="absolute text-[10px] font-medium tabular-nums text-rose-500">
          {remaining}
        </span>
      )}
    </div>
  );
}
