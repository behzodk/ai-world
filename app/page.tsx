import LeftSidebar from "@/components/LeftSidebar";
import Feed from "@/components/Feed";
import RightPanel from "@/components/RightPanel";
import BottomNav from "@/components/BottomNav";

type FeedTab = "for-you" | "following";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string | string[]; feed?: string | string[] }>;
}) {
  // The active hashtag filter lives in the URL (?tag=...) so it's shareable and
  // back-button friendly. Normalize to a single lowercase string.
  const sp = await searchParams;
  const raw = Array.isArray(sp.tag) ? sp.tag[0] : sp.tag;
  const tag = raw ? raw.toLowerCase() : undefined;
  const rawFeed = Array.isArray(sp.feed) ? sp.feed[0] : sp.feed;
  const feed: FeedTab = rawFeed === "following" ? "following" : "for-you";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cream text-ink">
      <LeftSidebar />
      <Feed activeTag={tag} initialFeedTab={feed} />
      <RightPanel activeTag={tag} />
      <BottomNav />
    </div>
  );
}
