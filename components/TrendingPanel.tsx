"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Minus, Sparkles, TrendingUp } from "lucide-react";
import { normalizeTag } from "@/lib/hashtags";
import { createClient } from "@/lib/supabase/client";

type TrendingItem = {
  id: string;
  tag: string;
  postCount: number;
  trend: "up" | "flat";
  latestAt: string | null;
};

type PostHashtagRow = {
  id: string;
  body: string | null;
  created_at: string;
};

const HASHTAG_REGEX = /#(\w+)/g;
const TRENDING_LIMIT = 5;
const POSTS_TO_SCAN = 500;

function extractTagMentions(body: string) {
  const mentions: { normalized: string; label: string }[] = [];
  const re = new RegExp(HASHTAG_REGEX.source, "g");
  let match: RegExpExecArray | null;

  while ((match = re.exec(body)) !== null) {
    mentions.push({
      normalized: normalizeTag(match[1]),
      label: match[1],
    });
  }

  return mentions;
}

function buildTrending(rows: PostHashtagRow[]): TrendingItem[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const counts = new Map<
    string,
    { label: string; postCount: number; latestAt: string | null; recentCount: number }
  >();

  rows.forEach((row) => {
    const body = row.body ?? "";
    const seenInPost = new Set<string>();

    extractTagMentions(body).forEach(({ normalized, label }) => {
      if (!normalized || seenInPost.has(normalized)) return;
      seenInPost.add(normalized);

      const current = counts.get(normalized) ?? {
        label,
        postCount: 0,
        latestAt: null,
        recentCount: 0,
      };
      const createdAtMs = new Date(row.created_at).getTime();
      const isRecent = Number.isFinite(createdAtMs) && now - createdAtMs <= dayMs;

      counts.set(normalized, {
        label: current.label,
        postCount: current.postCount + 1,
        latestAt:
          !current.latestAt || row.created_at > current.latestAt
            ? row.created_at
            : current.latestAt,
        recentCount: current.recentCount + (isRecent ? 1 : 0),
      });
    });
  });

  return Array.from(counts.entries())
    .map(([id, item]) => ({
      id,
      tag: item.label,
      postCount: item.postCount,
      trend: (item.recentCount > 0 ? "up" : "flat") as TrendingItem["trend"],
      latestAt: item.latestAt,
    }))
    .sort((a, b) => {
      if (b.postCount !== a.postCount) return b.postCount - a.postCount;
      return (b.latestAt ?? "").localeCompare(a.latestAt ?? "");
    })
    .slice(0, TRENDING_LIMIT);
}

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
  item: TrendingItem;
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
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<TrendingItem[]>([]);

  const loadTrending = useCallback(async () => {
    const { data } = await supabase
      .from("posts")
      .select("id, body, created_at")
      .order("created_at", { ascending: false })
      .limit(POSTS_TO_SCAN);

    setItems(buildTrending((data ?? []) as PostHashtagRow[]));
  }, [supabase]);

  useEffect(() => {
    void loadTrending();

    const channel = supabase
      .channel("right-panel-trending-posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => {
          void loadTrending();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadTrending, supabase]);

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

      {items.length === 0 ? (
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
          {items.map((item, index) => (
            <TrendingRow
              key={item.id}
              item={item}
              index={index}
              activeTag={activeTag}
              isLast={index === items.length - 1}
            />
          ))}
        </motion.ul>
      )}
    </section>
  );
}
