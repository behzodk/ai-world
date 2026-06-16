"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Repeat2,
  Heart,
  Share2,
  Bookmark,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";
import type { Post } from "@/lib/types";
import { formatCount } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import PostBody from "@/components/PostBody";
import ProfileLink from "@/components/ProfileLink";

interface PostCardProps {
  post: Post;
  /** ReplyThread renders nested replies at a slightly reduced scale. */
  compact?: boolean;
  /** Logged-in user's id — required to write likes/reposts. */
  currentUserId?: string | null;
}

// Tactile keyframe pop with spring physics, used by like / repost / bookmark.
const popSpring = {
  type: "spring" as const,
  stiffness: 400,
  damping: 17,
};

export default function PostCard({
  post,
  compact = false,
  currentUserId = null,
}: PostCardProps) {
  const supabase = createClient();
  const [liked, setLiked] = useState(post.likedByMe ?? false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [reposted, setReposted] = useState(post.repostedByMe ?? false);
  const [repostCount, setRepostCount] = useState(post.reposts);
  const [bookmarked, setBookmarked] = useState(false);
  const profileHref = `/profile/${post.author.handle}`;

  // Insert/delete the like, keep the count in sync, revert on failure.
  const toggleLike = async () => {
    if (!currentUserId) return;
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));

    const { error } = next
      ? await supabase
          .from("likes")
          .insert({ user_id: currentUserId, post_id: post.id })
      : await supabase
          .from("likes")
          .delete()
          .eq("user_id", currentUserId)
          .eq("post_id", post.id);

    if (error) {
      setLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
    }
  };

  // Same insert/delete pattern for reposts.
  const toggleRepost = async () => {
    if (!currentUserId) return;
    const next = !reposted;
    setReposted(next);
    setRepostCount((c) => c + (next ? 1 : -1));

    const { error } = next
      ? await supabase
          .from("reposts")
          .insert({ user_id: currentUserId, post_id: post.id })
      : await supabase
          .from("reposts")
          .delete()
          .eq("user_id", currentUserId)
          .eq("post_id", post.id);

    if (error) {
      setReposted(!next);
      setRepostCount((c) => c + (next ? -1 : 1));
    }
  };

  return (
    <article
      className={`group flex gap-3 rounded-3xl border border-line bg-white shadow-[0_2px_8px_rgba(20,20,20,0.04)] ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <ProfileLink
        href={profileHref}
        aria-label={`${post.author.name}'s profile`}
        indicator="overlay"
        className="h-10 w-10 shrink-0 rounded-full transition-opacity duration-150 hover:opacity-80"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- external avatar */}
        <img
          src={post.author.avatar}
          alt={post.author.name}
          className="h-full w-full rounded-full object-cover"
        />
      </ProfileLink>

      <div className="min-w-0 flex-1">
        {post.id === "p1" && (
          <div className="mb-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            <Sparkles size={12} className="text-[#3d4d0a]" />
            pinned drop
          </div>
        )}

        {/* Header line: name · @handle · timestamp */}
        <div className="flex items-center gap-1.5">
          <ProfileLink
            href={profileHref}
            className="truncate text-sm font-semibold text-ink transition-colors duration-150 hover:text-zinc-600"
          >
            {post.author.name}
          </ProfileLink>
          <ProfileLink
            href={profileHref}
            className="truncate text-xs text-zinc-400 transition-colors duration-150 hover:text-zinc-600"
          >
            @{post.author.handle}
          </ProfileLink>
          <span className="text-xs text-zinc-400">·</span>
          <span className="shrink-0 text-xs text-zinc-400">
            {post.timestamp}
          </span>
          {/* Overflow menu — revealed on card hover. */}
          <button
            type="button"
            aria-label="More"
            className="ml-auto shrink-0 cursor-pointer rounded-full p-1 text-zinc-400 opacity-0 transition-all duration-150 hover:bg-black/5 hover:text-ink group-hover:opacity-100"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* Body — hashtags render as clickable pills (see PostBody). */}
        <PostBody body={post.body} />

        {/* Optional image attachment. */}
        {post.image && (
          <div className="mt-4 overflow-hidden rounded-3xl border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element -- user attachment */}
            <img
              src={post.image}
              alt=""
              className="max-h-[420px] w-full object-cover"
            />
          </div>
        )}

        {/* Engagement bar */}
        <div className="mt-4 flex items-center text-zinc-400">
          <EngagementButton
            icon={<MessageCircle size={16} strokeWidth={2} />}
            label={formatCount(post.replies)}
          />

          <EngagementButton
            icon={<Repeat2 size={16} strokeWidth={2} />}
            label={formatCount(repostCount)}
            active={reposted}
            activeColor="text-emerald-500"
            onClick={toggleRepost}
            animateKey={reposted ? "on" : "off"}
          />

          <EngagementButton
            icon={
              <Heart
                size={16}
                strokeWidth={2}
                fill={liked ? "currentColor" : "none"}
              />
            }
            label={formatCount(likeCount)}
            active={liked}
            activeColor="text-rose-500"
            onClick={toggleLike}
            animateKey={liked ? "on" : "off"}
          />

          <EngagementButton
            icon={<Share2 size={16} strokeWidth={2} />}
          />

          <EngagementButton
            icon={
              <Bookmark
                size={16}
                strokeWidth={2}
                fill={bookmarked ? "currentColor" : "none"}
              />
            }
            active={bookmarked}
            activeColor="text-[#3d4d0a]"
            onClick={() => setBookmarked((v) => !v)}
            animateKey={bookmarked ? "on" : "off"}
            popScale={1.25}
            last
          />
        </div>
      </div>
    </article>
  );
}

interface EngagementButtonProps {
  icon: React.ReactNode;
  label?: string;
  active?: boolean;
  activeColor?: string;
  onClick?: () => void;
  /** Changing this key retriggers the scale pop on toggle. */
  animateKey?: string;
  /** Peak scale of the pop keyframe (like/repost 1.3, bookmark 1.25). */
  popScale?: number;
  /** Drops the trailing gap on the last button in the row. */
  last?: boolean;
}

function EngagementButton({
  icon,
  label,
  active = false,
  activeColor = "",
  onClick,
  animateKey,
  popScale = 1.3,
  last = false,
}: EngagementButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-1.5 text-xs transition-colors duration-150 hover:text-zinc-900 ${
        last ? "" : "mr-4"
      } ${active ? activeColor : ""}`}
    >
      <motion.span
        key={animateKey}
        animate={active ? { scale: [1, popScale, 1] } : { scale: 1 }}
        transition={popSpring}
        className="flex items-center justify-center"
      >
        {icon}
      </motion.span>
      {label ? <span className="tabular-nums">{label}</span> : null}
    </button>
  );
}
