import { notFound } from "next/navigation";
import LeftSidebar from "@/components/LeftSidebar";
import RightPanel from "@/components/RightPanel";
import BottomNav from "@/components/BottomNav";
import UserRow from "@/components/UserRow";
import { createClient } from "@/lib/supabase/server";

type FollowingPageProps = {
  params: Promise<{ handle: string }>;
};

type ListProfile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

type FollowingRow = {
  following: ListProfile | ListProfile[] | null;
};

export default async function FollowingPage({ params }: FollowingPageProps) {
  const { handle } = await params;
  const supabase = await createClient();

  const [userResult, profileResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("profiles")
      .select("id, username, display_name")
      .eq("username", handle)
      .single(),
  ]);

  const user = userResult.data.user;
  const profile = profileResult.data;
  if (!profile) notFound();

  const [{ data: rows }, { data: myFollows }] = await Promise.all([
    supabase
      .from("follows")
      .select(
        `
        following:following_id (
          id,
          username,
          display_name,
          avatar_url,
          bio
        )
      `,
      )
      .eq("follower_id", profile.id)
      .limit(50),
    user
      ? supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id)
          .limit(500)
      : Promise.resolve({ data: [] }),
  ]);

  const followingIds = new Set(
    (myFollows ?? []).map((follow) => follow.following_id),
  );
  const following = ((rows ?? []) as unknown as FollowingRow[])
    .map((row) =>
      Array.isArray(row.following) ? row.following[0] : row.following,
    )
    .filter((row): row is ListProfile => Boolean(row));
  const displayName = profile.display_name ?? profile.username;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cream text-ink">
      <LeftSidebar />
      <main className="flex flex-1 flex-col overflow-y-auto border-r border-line pb-20 md:pb-0">
        <header className="sticky top-0 z-10 border-b border-line bg-cream/80 px-4 py-3 backdrop-blur">
          <h1 className="text-2xl font-semibold text-zinc-900">Following</h1>
          <p className="text-xs text-zinc-400">
            {displayName} · @{profile.username}
          </p>
        </header>

        {following.length === 0 ? (
          <div className="p-4 text-sm text-zinc-400">
            Not following anyone yet
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100 px-4">
            {following.map((followedUser) => (
              <UserRow
                key={followedUser.id}
                user={followedUser}
                initialIsFollowing={followingIds.has(followedUser.id)}
              />
            ))}
          </ul>
        )}
      </main>
      <RightPanel />
      <BottomNav />
    </div>
  );
}
