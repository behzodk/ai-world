"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Settings } from "lucide-react";

type ProfileTopBarProps = {
  displayName: string;
  postCount: number;
  joinYear: number;
};

export default function ProfileTopBar({
  displayName,
  postCount,
  joinYear,
}: ProfileTopBarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 bg-cream/90 px-5 py-5 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-ink transition-colors duration-150 hover:bg-black/5"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-3xl leading-none text-ink">
            {displayName.toLowerCase()}.
          </h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-zinc-500">
            {postCount.toLocaleString()} drops · since {joinYear}
          </p>
        </div>

        <button
          type="button"
          aria-label="Profile settings"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-zinc-600 transition-colors duration-150 hover:bg-black/5 hover:text-ink"
        >
          <Settings size={19} />
        </button>
      </div>
    </header>
  );
}
