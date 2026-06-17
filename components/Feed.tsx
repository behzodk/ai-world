"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import PostComposer from "@/components/PostComposer";
import PostCard from "@/components/PostCard";
import SkeletonCard from "@/components/SkeletonCard";
import ActiveTagBar from "@/components/ActiveTagBar";
import EmptyFeed from "@/components/EmptyFeed";
import { createClient } from "@/lib/supabase/client";
import { relativeTime } from "@/lib/format";
import type { Post, Profile } from "@/lib/types";

type PostAuthorProfile = Pick<
  Profile,
  "id" | "username" | "display_name" | "avatar_url"
>;

// Shape returned by the feed query's explicit post/profile/count projection.
type PostRow = {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  profiles: PostAuthorProfile | PostAuthorProfile[] | null;
  likes: { count: number }[] | null;
  reposts: { count: number }[] | null;
};

type FeedTab = "for-you" | "following";

const feedTabs: { id: FeedTab; label: string }[] = [
  { id: "for-you", label: "for you" },
  { id: "following", label: "following" },
];

const PAGE_SIZE = 20;
const postSelect = `
  id,
  body,
  created_at,
  author_id,
  profiles(id, username, display_name, avatar_url),
  likes(count),
  reposts(count)
`;

function mapRow(
  row: PostRow,
  likedIds: Set<string>,
  repostedIds: Set<string>,
): Post {
  const p = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const handle = p?.username ?? "unknown";
  return {
    id: row.id,
    author: {
      name: p?.display_name ?? handle,
      handle,
      avatar: p?.avatar_url ?? `https://i.pravatar.cc/80?u=${handle}`,
    },
    body: row.body,
    timestamp: relativeTime(row.created_at),
    replies: 0,
    reposts: row.reposts?.[0]?.count ?? 0,
    likes: row.likes?.[0]?.count ?? 0,
    bookmarks: 0,
    likedByMe: likedIds.has(row.id),
    repostedByMe: repostedIds.has(row.id),
  };
}

export default function Feed({
  activeTag,
  initialFeedTab,
}: {
  activeTag?: string;
  initialFeedTab: FeedTab;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const scrollRef = useRef<HTMLElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [activeFeedTab, setActiveFeedTab] = useState<FeedTab>(initialFeedTab);

  useEffect(() => {
    setActiveFeedTab(initialFeedTab);
  }, [initialFeedTab]);

  const loadPage = useCallback(
    async ({
      mode,
      cursorValue,
    }: {
      mode: "replace" | "append";
      cursorValue: string | null;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const likedIds = new Set<string>();
      const repostedIds = new Set<string>();

      if (mode === "replace") {
        setCurrentUser(null);
      }

      if (user && mode === "replace") {
        const { data: profile } = await supabase
          .from("profiles")
          .select(
            "id, username, display_name, avatar_url, bio, is_ai, ai_prompt, created_at",
          )
          .eq("id", user.id)
          .single();
        setCurrentUser(profile);
      }

      let followingIds: string[] | null = null;
      if (activeFeedTab === "following") {
        if (!user) {
          return { mappedPosts: [], nextCursor: null, hasNextPage: false };
        }

        const { data: follows } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id)
          .limit(500);

        followingIds = (follows ?? []).map((follow) => follow.following_id);

        if (followingIds.length === 0) {
          return { mappedPosts: [], nextCursor: null, hasNextPage: false };
        }
      }

      let query = supabase
        .from("posts")
        .select(postSelect)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (cursorValue) query = query.lt("created_at", cursorValue);
      if (followingIds) query = query.in("author_id", followingIds);
      if (activeTag) query = query.ilike("body", `%#${activeTag}%`);

      const { data } = await query;
      const rows = data ? (data as PostRow[]) : [];
      const postIds = rows.map((row) => row.id);

      if (user && postIds.length > 0) {
        const [{ data: myLikes }, { data: myReposts }] = await Promise.all([
          supabase
            .from("likes")
            .select("post_id")
            .eq("user_id", user.id)
            .in("post_id", postIds),
          supabase
            .from("reposts")
            .select("post_id")
            .eq("user_id", user.id)
            .in("post_id", postIds),
        ]);

        (myLikes ?? []).forEach((l) => likedIds.add(l.post_id));
        (myReposts ?? []).forEach((r) => repostedIds.add(r.post_id));
      }

      return {
        mappedPosts: rows.map((row) => mapRow(row, likedIds, repostedIds)),
        nextCursor: rows.at(-1)?.created_at ?? null,
        hasNextPage: rows.length === PAGE_SIZE,
      };
    },
    [activeFeedTab, activeTag, supabase],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setInitialLoading(true);
      setLoadingMore(false);
      loadingMoreRef.current = false;

      const result = await loadPage({ mode: "replace", cursorValue: null });

      if (!cancelled) {
        setPosts(result.mappedPosts);
        setCursor(result.nextCursor);
        setHasMore(result.hasNextPage);
        setInitialLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadPage]);

  const loadNextPage = useCallback(async () => {
    if (!hasMore || !cursor || loadingMoreRef.current) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);

    const result = await loadPage({ mode: "append", cursorValue: cursor });

    setPosts((prev) => {
      const existingIds = new Set(prev.map((post) => post.id));
      const nextPosts = result.mappedPosts.filter(
        (post) => !existingIds.has(post.id),
      );
      return [...prev, ...nextPosts];
    });
    setCursor(result.nextCursor);
    setHasMore(result.hasNextPage);
    setLoadingMore(false);
    loadingMoreRef.current = false;
  }, [cursor, hasMore, loadPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = scrollRef.current;

    if (!sentinel || !root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void loadNextPage();
        }
      },
      { root, rootMargin: "300px 0px 300px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadNextPage]);

  // Optimistic prepend — skip if it wouldn't match the active tag filter.
  const handlePost = (post: Post) => {
    if (activeFeedTab === "following") return;
    if (activeTag && !post.body.toLowerCase().includes(`#${activeTag}`)) return;
    setPosts((prev) => [post, ...prev]);
  };

  const handleTabChange = (tab: FeedTab) => {
    setActiveFeedTab(tab);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("feed", tab);
    const nextQuery = nextParams.toString();

    router.push(nextQuery ? `/?${nextQuery}` : "/");
  };

  return (
    <main
      ref={scrollRef}
      className="flex flex-1 flex-col overflow-y-auto border-r border-line pb-20 md:pb-0"
    >
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-cream/80 px-5 py-5 backdrop-blur">
        <div>
          <h1 className="font-display text-5xl leading-none text-ink">home.</h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            what the internet is making today
          </p>
        </div>
        <div
          role="tablist"
          aria-label="Home feed"
          className="flex rounded-full border border-line bg-white p-1 text-sm shadow-[0_2px_8px_rgba(20,20,20,0.04)]"
        >
          {feedTabs.map((tab) => {
            const isActive = activeFeedTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabChange(tab.id)}
                className={`relative rounded-full px-4 py-2 transition-colors duration-150 ${
                  isActive
                    ? "font-semibold text-white"
                    : "font-medium text-zinc-500 hover:text-ink"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="feed-tab-indicator"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-ink"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      <AnimatePresence initial={false}>
        {activeTag && <ActiveTagBar key={activeTag} tag={activeTag} />}
      </AnimatePresence>

      <PostComposer currentUser={currentUser} onPost={handlePost} />

      <div className="space-y-4 px-5 py-5">
        {initialLoading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : posts.length === 0 ? (
          <EmptyFeed tag={activeTag} />
        ) : (
          // initial={false}: existing posts appear instantly on load; only
          // posts added afterward (via the composer) spring in from the top.
          <AnimatePresence initial={false}>
            {posts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              >
                <PostCard
                  post={post}
                  currentUserId={currentUser?.id ?? null}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      {loadingMore && (
        <div className="space-y-4 px-5 pb-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}
      <div ref={sentinelRef} className="h-px" aria-hidden />
    </main>
  );
}
