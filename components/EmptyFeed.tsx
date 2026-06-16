import { MessageSquare } from "lucide-react";

// Shown when the feed has no posts — copy adapts to whether a tag filter is on.
export default function EmptyFeed({ tag }: { tag?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
        <MessageSquare size={20} className="text-zinc-400" />
      </div>
      <p className="mt-4 text-sm font-medium text-zinc-900">
        {tag ? `No posts tagged #${tag} yet` : "No posts yet"}
      </p>
      <p className="mt-1 text-xs text-zinc-400">
        {tag
          ? "Try a different tag or clear the filter."
          : "Be the first to share something."}
      </p>
    </div>
  );
}
