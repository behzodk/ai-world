"use client";

import { useCallback, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type FollowOptions = {
  currentUserId: string | null;
  initialFollowingIds?: string[];
};

type FollowResult = {
  ok: boolean;
  error?: string;
};

export function useFollow({
  currentUserId,
  initialFollowingIds = [],
}: FollowOptions) {
  const supabase = useMemo(() => createClient(), []);
  const [followingIds, setFollowingIds] = useState(
    () => new Set(initialFollowingIds),
  );

  const isFollowing = useCallback(
    (userId: string) => followingIds.has(userId),
    [followingIds],
  );

  const follow = useCallback(
    async (userId: string): Promise<FollowResult> => {
      if (!currentUserId || userId === currentUserId) {
        return { ok: false, error: "Invalid follow target." };
      }

      const wasFollowing = followingIds.has(userId);
      if (!wasFollowing) {
        setFollowingIds((prev) => new Set(prev).add(userId));
      }

      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: currentUserId, following_id: userId });

      if (error) {
        if (!wasFollowing) {
          setFollowingIds((prev) => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
        }
        return { ok: false, error: error.message };
      }

      return { ok: true };
    },
    [currentUserId, followingIds, supabase],
  );

  const unfollow = useCallback(
    async (userId: string): Promise<FollowResult> => {
      if (!currentUserId) {
        return { ok: false, error: "You must be signed in to unfollow." };
      }

      const wasFollowing = followingIds.has(userId);
      if (wasFollowing) {
        setFollowingIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }

      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", userId);

      if (error) {
        if (wasFollowing) {
          setFollowingIds((prev) => new Set(prev).add(userId));
        }
        return { ok: false, error: error.message };
      }

      return { ok: true };
    },
    [currentUserId, followingIds, supabase],
  );

  const toggleFollow = useCallback(
    (userId: string) => (isFollowing(userId) ? unfollow(userId) : follow(userId)),
    [follow, isFollowing, unfollow],
  );

  return {
    followingIds,
    follow,
    unfollow,
    isFollowing,
    toggleFollow,
  };
}
