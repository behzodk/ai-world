import Link from "next/link";
import { notFound } from "next/navigation";
import LeftSidebar from "@/components/LeftSidebar";
import RightPanel from "@/components/RightPanel";
import BottomNav from "@/components/BottomNav";
import FollowButton from "@/components/ui/FollowButton";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

type ProfilePageProps = {
  params: Promise<{ handle: string }>;
};

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
  const profile = profileResult.data;
  if (!profile) notFound();

  const [followersResult, followingResult, followResult] = await Promise.all([
    supabase
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("following_id", profile.id),
    supabase
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("follower_id", profile.id),
    user && user.id !== profile.id
      ? supabase
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", profile.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const typedProfile = profile as Profile;
  const displayName = typedProfile.display_name ?? typedProfile.username;
  const avatar =
    typedProfile.avatar_url ??
    `https://i.pravatar.cc/160?u=${typedProfile.username}`;
  const isOwnProfile = user?.id === typedProfile.id;
  const followerCount = followersResult.count ?? 0;
  const followingCount = followingResult.count ?? 0;
  const initialIsFollowing = Boolean(followResult.data);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cream text-ink">
      <LeftSidebar />
      <main className="flex flex-1 flex-col overflow-y-auto border-r border-line pb-20 md:pb-0">
        <header className="sticky top-0 z-10 border-b border-line bg-cream/80 px-4 py-3 backdrop-blur">
          <h1 className="text-2xl font-semibold text-zinc-900">
            {displayName}
          </h1>
          <p className="text-xs text-zinc-400">@{typedProfile.username}</p>
        </header>

        <section className="border-b border-zinc-200 p-4">
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- external avatar */}
            <img
              src={avatar}
              alt={displayName}
              className="h-20 w-20 shrink-0 rounded-full object-cover"
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-semibold text-zinc-900">
                    {displayName}
                  </h2>
                  <p className="truncate text-sm text-zinc-400">
                    @{typedProfile.username}
                  </p>
                </div>

                {isOwnProfile ? (
                  <button
                    type="button"
                    className="shrink-0 rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-900 transition-colors duration-150 hover:border-zinc-900"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <FollowButton
                    targetUserId={typedProfile.id}
                    initialIsFollowing={initialIsFollowing}
                  />
                )}
              </div>

              {typedProfile.bio && (
                <p className="mt-3 text-sm leading-relaxed text-zinc-800">
                  {typedProfile.bio}
                </p>
              )}

              <div className="mt-4 flex items-center gap-5 text-sm">
                <Link
                  href={`/profile/${typedProfile.username}/following`}
                  className="transition-colors duration-150 hover:text-violet-600"
                >
                  <span className="font-semibold text-zinc-900">
                    {followingCount.toLocaleString()}
                  </span>{" "}
                  <span className="text-zinc-400">Following</span>
                </Link>
                <Link
                  href={`/profile/${typedProfile.username}/followers`}
                  className="transition-colors duration-150 hover:text-violet-600"
                >
                  <span className="font-semibold text-zinc-900">
                    {followerCount.toLocaleString()}
                  </span>{" "}
                  <span className="text-zinc-400">Followers</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <RightPanel />
      <BottomNav />
    </div>
  );
}
