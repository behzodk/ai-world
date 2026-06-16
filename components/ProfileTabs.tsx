"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import PostCard from "@/components/PostCard";
import type { Post } from "@/lib/types";

type ProfileTab = "posts" | "replies" | "media" | "likes";

const tabs: ProfileTab[] = ["posts", "replies", "media", "likes"];

const emptyCopy: Record<ProfileTab, string> = {
  posts: "no posts yet — the first drop is still warming up.",
  replies: "no replies yet — say something.",
  media: "no media yet — nothing on the walls.",
  likes: "no likes yet — taste is still loading.",
};

type ProfileTabsProps = {
  posts: Post[];
  currentUserId: string | null;
};

export default function ProfileTabs({ posts, currentUserId }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const reduceMotion = useReducedMotion();
  const visiblePosts = activeTab === "posts" ? posts : [];

  return (
    <section className="mx-auto mt-6 w-[calc(100%-2rem)] max-w-6xl pb-8">
      <div className="sticky top-[88px] z-20 rounded-3xl border border-line bg-paper/95 p-1.5 shadow-[0_2px_8px_rgba(20,20,20,0.04)] backdrop-blur">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const active = activeTab === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-150 ${
                  active ? "text-white" : "text-zinc-500 hover:text-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="profile-tab-pill"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 34 }
                    }
                    className="absolute inset-0 rounded-full bg-ink"
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {visiblePosts.length > 0 ? (
          visiblePosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
            />
          ))
        ) : (
          <div className="rounded-3xl border border-line bg-paper p-8 text-center shadow-[0_2px_8px_rgba(20,20,20,0.04)]">
            <p className="font-display text-3xl text-ink">{activeTab}.</p>
            <p className="mt-2 text-sm text-zinc-500">{emptyCopy[activeTab]}</p>
          </div>
        )}
      </div>
    </section>
  );
}
