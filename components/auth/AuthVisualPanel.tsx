"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Repeat2, Share } from "lucide-react";

// Dark floating post fragments with real avatars, category tag pills, an
// engagement row, and a violet glow on hover. They drift upward on a loop.
const previews = [
  {
    name: "Mira Chen",
    handle: "@mirabuilds",
    avatar: "https://i.pravatar.cc/80?u=mirabuilds",
    body: "shipped a thing today and the dopamine hit different.",
    tag: "AI & Tech",
    tagClass: "bg-violet-500/15 text-violet-300",
    likes: 24,
    reposts: 3,
    rotate: "-2deg",
    delay: 0,
  },
  {
    name: "Devon Park",
    handle: "@devonp",
    avatar: "https://i.pravatar.cc/80?u=devonp",
    body: "hot take: most “design systems” are a button and a lot of optimism.",
    tag: "Design",
    tagClass: "bg-sky-500/15 text-sky-300",
    likes: 118,
    reposts: 56,
    rotate: "1deg",
    delay: 0.6,
  },
  {
    name: "Lena Ortiz",
    handle: "@lenacodes",
    avatar: "https://i.pravatar.cc/80?u=lenacodes",
    body: "it was a missing await. it is always a missing await.",
    tag: "Engineering",
    tagClass: "bg-emerald-500/15 text-emerald-300",
    likes: 312,
    reposts: 12,
    rotate: "-1deg",
    delay: 1.2,
  },
];

// Subtle squared grid — lives only on the dark panel now.
const gridStyle = {
  backgroundImage:
    "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "44px 44px",
};

interface AuthVisualPanelProps {
  lead: string;
  accents: string[];
}

export default function AuthVisualPanel({
  lead,
  accents,
}: AuthVisualPanelProps) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % accents.length), 2500);
    return () => clearInterval(t);
  }, [accents.length]);

  const accent = accents[i % accents.length];

  return (
    <div
      style={gridStyle}
      className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-zinc-950 p-12 md:flex"
    >
      {/* Kinetic statement — fixed lead + rotating gradient accent word. */}
      <div className="pt-6">
        <h2 className="text-7xl font-black leading-none tracking-tighter text-white">
          {lead}{" "}
          <AnimatePresence mode="wait">
            <motion.span
              key={accent}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="inline-block bg-gradient-to-r from-violet-300 to-violet-600 bg-clip-text text-transparent"
            >
              {accent}
            </motion.span>
          </AnimatePresence>
        </h2>
      </div>

      {/* Floating post fragments. */}
      <div className="flex flex-col items-center gap-4">
        {previews.map((p) => (
          <motion.div
            key={p.handle}
            style={{ rotate: p.rotate }}
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
            whileHover={{
              boxShadow:
                "0 0 0 1px rgba(139,92,246,0.6), 0 12px 40px rgba(139,92,246,0.25)",
              borderColor: "rgba(139,92,246,0.6)",
            }}
            className="w-72 rounded-xl border border-white/10 bg-zinc-900 p-4"
          >
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- external avatar */}
              <img
                src={p.avatar}
                alt={p.name}
                className="h-8 w-8 shrink-0 rounded-full bg-zinc-700 object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-xs font-semibold text-white">
                    {p.name}
                  </p>
                  <span
                    className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${p.tagClass}`}
                  >
                    {p.tag}
                  </span>
                </div>
                <p className="truncate text-[11px] text-zinc-500">{p.handle}</p>
              </div>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-zinc-300">
              {p.body}
            </p>

            <div className="mt-3 flex items-center gap-4 text-zinc-500">
              <span className="flex items-center gap-1 text-[11px]">
                <Heart size={13} className="fill-violet-500 text-violet-500" />
                {p.likes}
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <Repeat2 size={13} />
                {p.reposts}
              </span>
              <Share size={13} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Platform name. */}
      <span className="font-mono text-xs text-zinc-600">aiworld.social</span>
    </div>
  );
}
