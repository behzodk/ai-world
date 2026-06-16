import { notFound } from "next/navigation";
import ProfileHeroCard from "@/components/ProfileHeroCard";
import ProfileTabs from "@/components/ProfileTabs";
import ProfileTopBar from "@/components/ProfileTopBar";
import { relativeTime } from "@/lib/format";
import { extractTags } from "@/lib/hashtags";
import { createClient } from "@/lib/supabase/server";
import type { Post, Profile } from "@/lib/types";

type ProfilePageProps = {
  params: Promise<{ handle: string }>;
};

type PostAuthorProfile = Pick<
  Profile,
  "id" | "username" | "display_name" | "avatar_url"
>;

type ProfilePostRow = {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  profiles: PostAuthorProfile | PostAuthorProfile[] | null;
  likes: { count: number }[] | null;
  reposts: { count: number }[] | null;
};

const profilePostSelect = `
  id,
  body,
  created_at,
  author_id,
  profiles(id, username, display_name, avatar_url),
  likes(count),
  reposts(count)
`;

const tagChipClasses = [
  "bg-lime/40",
  "bg-sky-100",
  "bg-rose-100",
  "bg-violet-100",
];

function monthYear(iso: string) {
  const date = new Date(iso);
  const month = date.toLocaleString("en", { month: "short" }).toLowerCase();
  return `${month} ${date.getFullYear()}`;
}

function mapProfilePost(
  row: ProfilePostRow,
  likedIds: Set<string>,
  repostedIds: Set<string>,
): Post {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const handle = profile?.username ?? "unknown";

  return {
    id: row.id,
    author: {
      name: profile?.display_name ?? handle,
      handle,
      avatar: profile?.avatar_url ?? `https://i.pravatar.cc/80?u=${handle}`,
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

function getTopTags(rows: ProfilePostRow[]) {
  const counts = new Map<string, number>();

  rows.forEach((row) => {
    const uniqueTags = new Set(extractTags(row.body));
    uniqueTags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 4)
    .map(([tag], index) => ({
      tag,
      className: tagChipClasses[index % tagChipClasses.length],
    }));
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { handle } = await params;
  const supabase = await createClient();

  const [userResult, profileResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio, created_at")
      .eq("username", handle)
      .single(),
  ]);

  const user = userResult.data.user;
  const profile = profileResult.data as Profile | null;
  if (!profile) notFound();

  const [
    followersResult,
    followingResult,
    postCountResult,
    followResult,
    postsResult,
  ] = await Promise.all([
    supabase
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("following_id", profile.id),
    supabase
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("follower_id", profile.id),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", profile.id),
    user && user.id !== profile.id
      ? supabase
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", profile.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("posts")
      .select(profilePostSelect)
      .eq("author_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const rows = (postsResult.data ?? []) as ProfilePostRow[];
  const postIds = rows.map((row) => row.id);
  const likedIds = new Set<string>();
  const repostedIds = new Set<string>();

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

    (myLikes ?? []).forEach((like) => likedIds.add(like.post_id));
    (myReposts ?? []).forEach((repost) => repostedIds.add(repost.post_id));
  }

  const displayName = profile.display_name ?? profile.username;
  const avatar =
    profile.avatar_url ?? `https://i.pravatar.cc/160?u=${profile.username}`;
  const postCount = postCountResult.count ?? 0;
  const followingCount = followingResult.count ?? 0;
  const followerCount = followersResult.count ?? 0;
  const isOwnProfile = user?.id === profile.id;
  const initialIsFollowing = Boolean(followResult.data);
  const joinedYear = new Date(profile.created_at).getFullYear();
  const joinedLabel = monthYear(profile.created_at);
  const profilePosts = rows.map((row) =>
    mapProfilePost(row, likedIds, repostedIds),
  );
  const topTags = getTopTags(rows);

  return (
    <div className="h-screen w-screen overflow-hidden bg-cream text-ink">
      <main className="h-full overflow-y-auto pb-12">
        <ProfileTopBar
          displayName={displayName}
          postCount={postCount}
          joinYear={joinedYear}
        />
        <ProfileHeroCard
          profileId={profile.id}
          username={profile.username}
          displayName={displayName}
          avatar={avatar}
          bio={profile.bio}
          joinedLabel={joinedLabel}
          isOwnProfile={isOwnProfile}
          initialIsFollowing={initialIsFollowing}
          postCount={postCount}
          followingCount={followingCount}
          followerCount={followerCount}
          tags={topTags}
        />
        <ProfileTabs posts={profilePosts} currentUserId={user?.id ?? null} />
      </main>
    </div>
  );
}
