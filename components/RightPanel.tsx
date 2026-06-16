"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import FollowButton from "@/components/ui/FollowButton";
import ProfileLink from "@/components/ProfileLink";
import TrendingPanel from "@/components/TrendingPanel";
import { createClient } from "@/lib/supabase/client";

type SuggestedProfile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

function RightPanelEmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="border-t border-violet-200/60 pt-4">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">{body}</p>
    </div>
  );
}

export default function RightPanel({ activeTag }: { activeTag?: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [suggestions, setSuggestions] = useState<SuggestedProfile[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) setSuggestions([]);
        return;
      }

      const { data: follows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id)
        .limit(500);

      const followedIds = (follows ?? []).map((follow) => follow.following_id);

      let query = supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .neq("id", user.id)
        .limit(3);

      if (followedIds.length > 0) {
        query = query.not("id", "in", `(${followedIds.join(",")})`);
      }

      const { data } = await query;

      if (!cancelled) setSuggestions((data ?? []) as SuggestedProfile[]);
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  return (
    // No left border — the feed's border-x owns that divider (no double border).
    <aside className="hidden h-screen w-80 shrink-0 flex-col gap-8 overflow-y-auto px-6 py-6 lg:flex">
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        <input
          type="text"
          placeholder="search the feed"
          className="h-12 w-full rounded-full border border-line bg-white pl-11 pr-16 text-sm text-ink shadow-[0_2px_8px_rgba(20,20,20,0.04)] outline-none transition-colors duration-150 placeholder:text-zinc-400 focus:border-ink"
        />
        <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-line bg-cream px-2 py-1 font-mono text-[10px] font-medium text-zinc-500">
          ⌘K
        </kbd>
      </div>

      <TrendingPanel activeTag={activeTag} />

      <section className="rounded-3xl border border-violet-200/60 bg-violet-100/60 p-5 shadow-[0_2px_8px_rgba(20,20,20,0.04)]">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          who to follow
        </h2>
        {suggestions.length === 0 ? (
          <RightPanelEmptyState
            title="you're caught up"
            body="fresh builders will show up here soon."
          />
        ) : (
          <ul className="divide-y divide-violet-200/60">
            {suggestions.map((user) => {
              const name = user.display_name ?? user.username;
              const avatar =
                user.avatar_url ?? `https://i.pravatar.cc/80?u=${user.username}`;
              const profileHref = `/profile/${user.username}`;

              return (
                <li
                  key={user.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <ProfileLink
                    href={profileHref}
                    aria-label={`${name}'s profile`}
                    indicator="overlay"
                    className="h-9 w-9 shrink-0 rounded-full transition-opacity duration-150 hover:opacity-80"
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
                      @{user.username}
                    </p>
                  </ProfileLink>
                  <FollowButton
                    targetUserId={user.id}
                    initialIsFollowing={false}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="text-xs leading-relaxed text-zinc-400">
        Terms · Privacy · © 2026 AIWorld
      </p>
    </aside>
  );
}
