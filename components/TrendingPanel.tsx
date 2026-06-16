"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Minus, Sparkles, TrendingUp } from "lucide-react";
import { trending } from "@/lib/data";
import { normalizeTag } from "@/lib/hashtags";

function formatPostCount(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}K posts`;
  }

  return `${count.toLocaleString()} ${count === 1 ? "post" : "posts"}`;
}

function EmptyTrending() {
  return (
    <div className="border-t border-zinc-100 py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100">
          <Sparkles size={16} className="text-zinc-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">
            no tags in orbit yet
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">
            hashtags will surface here as people start posting with them.
          </p>
        </div>
      </div>
    </div>
  );
}

function TrendingRow({
  item,
  index,
  activeTag,
  isLast,
}: {
  item: (typeof trending)[number];
  index: number;
  activeTag?: string;
  isLast: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const norm = normalizeTag(item.tag);
  const isActive = activeTag === norm;
  const href = isActive ? "/" : `/?tag=${norm}`;
  const rank = String(index + 1).padStart(2, "0");
  const TrendIcon = item.trend === "up" ? TrendingUp : Minus;
  const isHot = item.trend === "up";

  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, x: reduceMotion ? 0 : 12 },
        show: { opacity: 1, x: 0 },
      }}
      transition={{ duration: 0.18 }}
      className="last:border-b-0"
    >
      <Link
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`group relative flex cursor-pointer items-center gap-3 overflow-hidden px-1 py-3 transition-colors duration-150 ${
          isLast ? "" : "border-b border-line"
        } ${isActive ? "bg-lime/20" : ""
        }`}
      >
        <motion.span
          aria-hidden
          initial={false}
          animate={{ opacity: hovered && !isActive ? 1 : 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-cream/70"
        />

        <motion.div
          animate={{ opacity: hovered && !isActive ? 0.42 : 1 }}
          transition={{ duration: 0.15 }}
          className="relative z-10 flex w-6 shrink-0 justify-center"
        >
          {isActive ? (
            <span className="mt-1.5 h-2 w-2 rounded-full bg-lime" />
          ) : (
            <span className="font-mono text-xs text-zinc-400">{rank}</span>
          )}
        </motion.div>

        <motion.div
          animate={{ x: hovered && !reduceMotion ? 4 : 0 }}
          transition={{ duration: 0.15 }}
          className="relative z-10 min-w-0 flex-1"
        >
          <p
            className={`truncate text-sm font-semibold ${
              isActive ? "text-ink" : "text-ink"
            }`}
          >
            <span className="text-coral"># </span>
            {item.tag}
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">
            {formatPostCount(item.postCount)}
          </p>
        </motion.div>

        <div className="relative z-10 flex w-16 shrink-0 items-center justify-end">
          <AnimatePresence mode="wait" initial={false}>
            {hovered ? (
              <motion.span
                key="open"
                initial={{ opacity: 0, x: reduceMotion ? 0 : -3 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduceMotion ? 0 : 3 }}
                transition={{ duration: 0.15 }}
                className="text-coral"
              >
                <ArrowUpRight size={14} />
              </motion.span>
            ) : isHot ? (
              <motion.span
                key="hot"
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-1 rounded-full bg-lime px-2 py-1 text-xs font-medium text-ink"
              >
                <TrendingUp size={13} />
                hot
              </motion.span>
            ) : (
              <motion.span
                key="flat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-zinc-300"
              >
                <TrendIcon size={14} />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </Link>
    </motion.li>
  );
}

export default function TrendingPanel({ activeTag }: { activeTag?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="rounded-3xl border border-line bg-white p-5 shadow-[0_2px_8px_rgba(20,20,20,0.04)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            trending
          </h2>
          <motion.span
            aria-hidden
            animate={
              reduceMotion
                ? { scale: 1, opacity: 1 }
                : { scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }
            }
            transition={{ duration: 2, repeat: Infinity }}
            className="h-1.5 w-1.5 rounded-full bg-emerald-500"
          />
        </div>
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-widest text-zinc-400 transition-colors duration-150 hover:text-ink"
        >
          see all
        </Link>
      </div>

      {trending.length === 0 ? (
        <EmptyTrending />
      ) : (
        <motion.ul
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: reduceMotion ? 0 : 0.06,
              },
            },
          }}
          className="overflow-hidden border-y border-line"
        >
          {trending.map((item, index) => (
            <TrendingRow
              key={item.id}
              item={item}
              index={index}
              activeTag={activeTag}
              isLast={index === trending.length - 1}
            />
          ))}
        </motion.ul>
      )}
    </section>
  );
}
