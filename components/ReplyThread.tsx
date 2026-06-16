"use client";

import PostCard from "@/components/PostCard";
import type { Post } from "@/lib/types";

interface ReplyThreadProps {
  replies: Post[];
}

// Nested replies indented beneath a PostCard, joined by a hairline connector.
// Reuses PostCard in `compact` mode for the reduced scale.
export default function ReplyThread({ replies }: ReplyThreadProps) {
  if (replies.length === 0) return null;

  return (
    <div className="pl-7">
      {/* 1px hairline connector running down the left edge of the reply group. */}
      <div className="border-l border-zinc-200 pl-3">
        {replies.map((reply) => (
          <PostCard key={reply.id} post={reply} compact />
        ))}
      </div>
    </div>
  );
}
