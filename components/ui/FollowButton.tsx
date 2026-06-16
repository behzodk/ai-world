"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useFollow } from "@/hooks/useFollow";

type FollowButtonProps = {
  targetUserId: string;
  initialIsFollowing: boolean;
  onFollowChange?: (isFollowing: boolean, targetUserId: string) => void;
};

export default function FollowButton({
  targetUserId,
  initialIsFollowing,
  onFollowChange,
}: FollowButtonProps) {
  const reduceMotion = useReducedMotion();
  const supabase = useMemo(() => createClient(), []);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const [feedbackKey, setFeedbackKey] = useState(0);
  const { follow, unfollow, isFollowing } = useFollow({
    currentUserId,
    initialFollowingIds: initialIsFollowing ? [targetUserId] : [],
  });

  const following = isFollowing(targetUserId);
  const disabled = !currentUserId || currentUserId === targetUserId;
  const label =
    following && hovered ? "Unfollow" : following ? "Following" : "Follow";

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!cancelled) setCurrentUserId(user?.id ?? null);
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const handleClick = async () => {
    if (disabled) return;

    const nextFollowing = !following;
    if (nextFollowing && !reduceMotion) {
      setFeedbackKey((key) => key + 1);
    }
    onFollowChange?.(nextFollowing, targetUserId);

    const result = following
      ? await unfollow(targetUserId)
      : await follow(targetUserId);

    if (!result.ok) {
      onFollowChange?.(!nextFollowing, targetUserId);
    }
  };

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileTap={reduceMotion || disabled ? undefined : { scale: 0.96 }}
      className={`relative inline-flex h-8 min-w-[96px] items-center justify-center overflow-hidden rounded-full border px-3 text-xs font-medium transition-colors duration-150 ${
        following && hovered
          ? "border-rose-500 text-rose-500"
          : following
            ? "border-zinc-900 text-zinc-900"
          : "border-zinc-300 text-zinc-900 hover:border-zinc-900"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <AnimatePresence>
        {feedbackKey > 0 && !reduceMotion && (
          <motion.span
            key={feedbackKey}
            aria-hidden
            initial={{ opacity: 0.45, scale: 0.88 }}
            animate={{ opacity: 0, scale: 1.22 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 rounded-full border border-violet-600"
          />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={label}
          className="relative z-10 inline-flex items-center gap-1.5"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {following && !hovered && (
            <motion.span
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 520, damping: 20 }}
              className="text-violet-600"
            >
              <Check size={13} strokeWidth={3} />
            </motion.span>
          )}
          {label}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
