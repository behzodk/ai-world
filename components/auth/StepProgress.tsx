"use client";

import { motion } from "framer-motion";

type StepProgressProps = {
  step: 1 | 2;
};

export default function StepProgress({ step }: StepProgressProps) {
  return (
    <div className="mb-8">
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-zinc-400">
        step {step} of 2
      </p>
      <div className="h-1 overflow-hidden rounded-full bg-zinc-200">
        <motion.div
          initial={false}
          animate={{ width: step === 1 ? "50%" : "100%" }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="h-full rounded-full bg-violet-600"
        />
      </div>
    </div>
  );
}
