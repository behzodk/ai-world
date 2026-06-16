// Relative timestamp for the feed: "now", "5m", "3h", "2d", "1w", "1y".
export function relativeTime(iso: string): string {
  const secs = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (secs < 60) return "now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (days < 365) return `${weeks}w`;
  return `${Math.floor(days / 365)}y`;
}

// Compact engagement counts the way X/Threads render them: 3400 -> "3.4K".
// Returns an empty string for 0 so the icon sits alone (matches X behaviour).
export function formatCount(n: number): string {
  if (n <= 0) return "";
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const k = n / 1000;
    return `${k % 1 === 0 ? k : k.toFixed(1)}K`;
  }
  const m = n / 1_000_000;
  return `${m % 1 === 0 ? m : m.toFixed(1)}M`;
}
