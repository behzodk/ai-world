"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ProfileLink from "@/components/ProfileLink";
import FollowButton from "@/components/ui/FollowButton";
import { createClient } from "@/lib/supabase/client";

type FollowListType = "followers" | "following";

type ListProfile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

type FollowerRow = {
  follower: ListProfile | ListProfile[] | null;
};

type FollowingRow = {
  following: ListProfile | ListProfile[] | null;
};

type ProfileFollowDialogProps = {
  profileId: string;
  displayName: string;
  open: boolean;
  type: FollowListType;
  onOpenChange: (open: boolean) => void;
};

export default function ProfileFollowDialog({
  profileId,
  displayName,
  open,
  type,
  onOpenChange,
}: ProfileFollowDialogProps) {
  const reduceMotion = useReducedMotion();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<ListProfile[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const title = type === "followers" ? "followers" : "following";

  const loadList = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [listResult, myFollowsResult] = await Promise.all([
      type === "followers"
        ? supabase
            .from("follows")
            .select(
              `
              follower:follower_id (
                id,
                username,
                display_name,
                avatar_url,
                bio
              )
            `,
            )
            .eq("following_id", profileId)
            .limit(80)
        : supabase
            .from("follows")
            .select(
              `
              following:following_id (
                id,
                username,
                display_name,
                avatar_url,
                bio
              )
            `,
            )
            .eq("follower_id", profileId)
            .limit(80),
      user
        ? supabase
            .from("follows")
            .select("following_id")
            .eq("follower_id", user.id)
            .limit(500)
        : Promise.resolve({ data: [] }),
    ]);

    const nextUsers =
      type === "followers"
        ? ((listResult.data ?? []) as unknown as FollowerRow[])
            .map((row) =>
              Array.isArray(row.follower) ? row.follower[0] : row.follower,
            )
            .filter((row): row is ListProfile => Boolean(row))
        : ((listResult.data ?? []) as unknown as FollowingRow[])
            .map((row) =>
              Array.isArray(row.following) ? row.following[0] : row.following,
            )
            .filter((row): row is ListProfile => Boolean(row));

    setUsers(nextUsers);
    setFollowingIds(
      new Set((myFollowsResult.data ?? []).map((follow) => follow.following_id)),
    );
    setLoading(false);
  }, [profileId, supabase, type]);

  useEffect(() => {
    if (!open) return;
    void loadList();
  }, [loadList, open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-4 backdrop-blur-sm"
          onMouseDown={() => onOpenChange(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${displayName} ${title}`}
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            onMouseDown={(event) => event.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-paper shadow-[0_24px_80px_rgba(14,14,14,0.18)]"
          >
            <div className="border-b border-line bg-gradient-to-r from-lime/30 via-violet-100/70 to-rose-100/80 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-paper/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    <Sparkles size={12} />
                    social graph
                  </div>
                  <h2 className="font-display text-3xl leading-none text-ink">
                    {title}.
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    {displayName.toLowerCase()} · {users.length}{" "}
                    {users.length === 1 ? "person" : "people"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  aria-label="Close"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-zinc-500 transition-colors duration-150 hover:bg-black/5 hover:text-ink"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="relative mt-4">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <div className="h-10 rounded-full border border-line bg-paper/80 pl-9 pr-3 text-sm leading-10 text-zinc-400">
                  search coming soon
                </div>
              </div>
            </div>

            <div className="max-h-[55vh] overflow-y-auto px-2 py-2">
              {loading ? (
                <div className="space-y-2 p-3">
                  {[0, 1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="flex animate-pulse items-center gap-3 rounded-2xl p-2"
                    >
                      <div className="h-11 w-11 rounded-full bg-zinc-100" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-3 w-32 rounded-full bg-zinc-100" />
                        <div className="h-3 w-20 rounded-full bg-zinc-100" />
                      </div>
                      <div className="h-8 w-20 rounded-full bg-zinc-100" />
                    </div>
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="font-display text-3xl text-ink">{title}.</p>
                  <p className="mt-2 text-sm text-zinc-500">
                    {type === "followers"
                      ? "no followers yet — first sparks arrive soon."
                      : "not following anyone yet — the feed is wide open."}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {users.map((profile) => {
                    const name = profile.display_name ?? profile.username;
                    const avatar =
                      profile.avatar_url ??
                      `https://i.pravatar.cc/80?u=${profile.username}`;
                    const profileHref = `/profile/${profile.username}`;

                    return (
                      <li
                        key={profile.id}
                        className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors duration-150 hover:bg-cream"
                      >
                        <ProfileLink
                          href={profileHref}
                          aria-label={`${name}'s profile`}
                          indicator="overlay"
                          className="h-11 w-11 shrink-0 rounded-full"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- external avatar */}
                          <img
                            src={avatar}
                            alt={name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        </ProfileLink>
                        <ProfileLink
                          href={profileHref}
                          className="min-w-0 flex-1"
                        >
                          <p className="truncate text-sm font-semibold text-ink">
                            {name}
                          </p>
                          <p className="truncate text-xs text-zinc-500">
                            @{profile.username}
                          </p>
                          {profile.bio && (
                            <p className="mt-1 line-clamp-1 text-xs text-zinc-400">
                              {profile.bio}
                            </p>
                          )}
                        </ProfileLink>
                        <FollowButton
                          targetUserId={profile.id}
                          initialIsFollowing={followingIds.has(profile.id)}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
