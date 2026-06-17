"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Calendar,
  Link as LinkIcon,
  MapPin,
  Share2,
  Sparkles,
  Zap,
  BadgeCheck,
} from "lucide-react";
import ProfileFollowDialog from "@/components/ProfileFollowDialog";
import FollowButton from "@/components/ui/FollowButton";

type ProfileTag = {
  tag: string;
  className: string;
};

type ProfileHeroCardProps = {
  profileId: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string | null;
  isAi: boolean;
  joinedLabel: string;
  isOwnProfile: boolean;
  initialIsFollowing: boolean;
  postCount: number;
  followingCount: number;
  followerCount: number;
  tags: ProfileTag[];
};

function AnimatedStat({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplayValue(value);
      return;
    }

    const duration = 600;
    const startedAt = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));

      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion, value]);

  return (
    <motion.span
      className="block font-display text-2xl leading-none text-ink"
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {displayValue.toLocaleString()}
    </motion.span>
  );
}

export default function ProfileHeroCard({
  profileId,
  username,
  displayName,
  avatar,
  bio,
  isAi,
  joinedLabel,
  isOwnProfile,
  initialIsFollowing,
  postCount,
  followingCount,
  followerCount,
  tags,
}: ProfileHeroCardProps) {
  const reduceMotion = useReducedMotion();
  const [followDialog, setFollowDialog] = useState<
    "followers" | "following" | null
  >(null);
  const fallbackBio =
    "shipping small tools for tech-native humans. agents, tiny uis, fast feedback loops.";

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mx-auto mt-7 w-[calc(100%-2rem)] max-w-4xl overflow-hidden rounded-3xl border border-line bg-paper shadow-[0_2px_8px_rgba(20,20,20,0.04)]"
    >
      <div className="relative z-0 h-32 bg-gradient-to-r from-lime/60 via-violet-200/60 to-rose-200/70">
        <Sparkles className="absolute left-5 top-5 text-ink" size={28} />
        <p className="absolute bottom-5 right-5 font-mono text-xs uppercase tracking-widest text-zinc-600">
          vibe · lime / lilac / coral
        </p>
      </div>

      <div className="px-5 pb-5 md:px-9 md:pb-8">
        <div className="flex items-start justify-between gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- external avatar */}
          <img
            src={avatar}
            alt={displayName}
            className="relative z-10 -mt-12 h-24 w-24 shrink-0 rounded-2xl border-4 border-paper object-cover"
          />

          <div className="mt-4 flex items-center gap-2">
            {isOwnProfile ? (
              <button
                type="button"
                className="rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:bg-black/5"
              >
                edit profile
              </button>
            ) : (
              <FollowButton
                targetUserId={profileId}
                initialIsFollowing={initialIsFollowing}
                variant="solid"
              />
            )}
            <button
              type="button"
              aria-label="Share profile"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper text-zinc-600 transition-colors duration-150 hover:bg-black/5 hover:text-ink"
            >
              <Share2 size={17} />
            </button>
          </div>
        </div>

        <div className="mt-7">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-3xl leading-none text-ink">
              {displayName.toLowerCase()}
            </h2>
            <span className="font-mono text-sm text-zinc-500">@{username}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-lime px-2.5 py-0.5 text-xs font-medium uppercase tracking-widest text-ink">
              <Zap size={13} />
              builder
            </span>
            {isAi && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium uppercase tracking-widest text-violet-700">
                <BadgeCheck size={13} />
                ai
              </span>
            )}
          </div>

          <p className="mt-4 max-w-4xl text-base leading-relaxed text-zinc-900">
            {(bio ?? fallbackBio).toLowerCase()}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={15} />
              online
            </span>
            <span>·</span>
            <Link
              href={`https://${username}.dev`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-violet-700 transition-colors duration-150 hover:text-violet-900"
            >
              <LinkIcon size={15} />
              {username}.dev
            </Link>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={15} />
              joined {joinedLabel}
            </span>
          </div>

          {tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((item) => (
                <Link
                  key={item.tag}
                  href={`/?tag=${item.tag}`}
                  className={`rounded-full px-3 py-1 font-mono text-sm text-ink transition-opacity duration-150 hover:opacity-75 ${item.className}`}
                >
                  #{item.tag}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 grid grid-cols-3 overflow-hidden rounded-2xl border border-line bg-cream">
            <div className="px-3 py-5 text-center">
              <AnimatedStat value={postCount} />
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-zinc-500">
                posts
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFollowDialog("following")}
              className="cursor-pointer border-x border-line px-3 py-5 text-center transition-colors duration-150 hover:bg-paper/60"
            >
              <AnimatedStat value={followingCount} />
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-zinc-500">
                following
              </p>
            </button>
            <button
              type="button"
              onClick={() => setFollowDialog("followers")}
              className="cursor-pointer px-3 py-5 text-center transition-colors duration-150 hover:bg-paper/60"
            >
              <AnimatedStat value={followerCount} />
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-zinc-500">
                followers
              </p>
            </button>
          </div>
        </div>
      </div>
      <ProfileFollowDialog
        profileId={profileId}
        displayName={displayName}
        type={followDialog ?? "followers"}
        open={followDialog !== null}
        onOpenChange={(open) => {
          if (!open) setFollowDialog(null);
        }}
      />
    </motion.section>
  );
}
