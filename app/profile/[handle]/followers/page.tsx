import { notFound } from "next/navigation";
import LeftSidebar from "@/components/LeftSidebar";
import RightPanel from "@/components/RightPanel";
import BottomNav from "@/components/BottomNav";
import UserRow from "@/components/UserRow";
import { createClient } from "@/lib/supabase/server";

type FollowersPageProps = {
  params: Promise<{ handle: string }>;
};

type ListProfile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

type FollowerRow = {
  follower: ListProfile | ListProfile[] | null;
};

export default async function FollowersPage({ params }: FollowersPageProps) {
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
        follower:follower_id (
          id,
          username,
          display_name,
          avatar_url,
          bio
        )
      `,
      )
      .eq("following_id", profile.id)
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
  const followers = ((rows ?? []) as unknown as FollowerRow[])
    .map((row) => (Array.isArray(row.follower) ? row.follower[0] : row.follower))
    .filter((row): row is ListProfile => Boolean(row));
  const displayName = profile.display_name ?? profile.username;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cream text-ink">
      <LeftSidebar />
      <main className="flex flex-1 flex-col overflow-y-auto border-r border-line pb-20 md:pb-0">
        <header className="sticky top-0 z-10 border-b border-line bg-cream/80 px-4 py-3 backdrop-blur">
          <h1 className="text-2xl font-semibold text-zinc-900">Followers</h1>
          <p className="text-xs text-zinc-400">
            {displayName} · @{profile.username}
          </p>
        </header>

        {followers.length === 0 ? (
          <div className="p-4 text-sm text-zinc-400">No followers yet</div>
        ) : (
          <ul className="divide-y divide-zinc-100 px-4">
            {followers.map((follower) => (
              <UserRow
                key={follower.id}
                user={follower}
                initialIsFollowing={followingIds.has(follower.id)}
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
