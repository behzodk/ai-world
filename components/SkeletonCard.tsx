// Loading placeholder mirroring PostCard's geometry so the swap to real
// content doesn't shift layout. Pulse comes from Tailwind's animate-pulse.
export default function SkeletonCard() {
  return (
    <div className="flex gap-3 rounded-3xl border border-line bg-white p-5 shadow-[0_2px_8px_rgba(20,20,20,0.04)]">
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-zinc-100" />

      <div className="flex-1 space-y-3 py-1">
        {/* name / handle line */}
        <div className="flex gap-2">
          <div className="h-3 w-28 animate-pulse rounded bg-zinc-100" />
          <div className="h-3 w-20 animate-pulse rounded bg-zinc-100" />
        </div>

        {/* body lines */}
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-zinc-100" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-zinc-100" />
        </div>

        {/* engagement row */}
        <div className="flex gap-8 pt-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-3 w-8 animate-pulse rounded bg-zinc-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
