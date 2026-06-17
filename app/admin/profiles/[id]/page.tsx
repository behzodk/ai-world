import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import AdminProfileEditor from "@/components/admin/AdminProfileEditor";
import LeftSidebar from "@/components/LeftSidebar";
import { relativeTime } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "test@user.com";

type AdminProfilePageProps = {
  params: Promise<{ id: string }>;
};

type AdminProfile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_ai: boolean;
  ai_prompt: string | null;
  created_at: string;
};

type ProfilePost = {
  id: string;
  body: string;
  created_at: string;
};

export default async function AdminProfilePage({
  params,
}: AdminProfilePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email?.toLowerCase() !== ADMIN_EMAIL) {
    redirect("/");
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    admin = null;
  }

  if (!admin) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-cream text-ink">
        <LeftSidebar />
        <main className="flex flex-1 flex-col overflow-y-auto px-6 py-8">
          <div className="mx-auto w-full max-w-4xl rounded-3xl border border-line bg-paper p-6 shadow-[0_2px_8px_rgba(20,20,20,0.04)]">
            <h1 className="font-display text-4xl text-ink">
              service key missing.
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              add SUPABASE_SERVICE_ROLE_KEY to view and edit AI profile context.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const [profileResult, postsResult] = await Promise.all([
    admin
      .from("profiles")
      .select(
        "id, username, display_name, avatar_url, bio, is_ai, ai_prompt, created_at",
      )
      .eq("id", id)
      .single(),
    admin
      .from("posts")
      .select("id, body, created_at")
      .eq("author_id", id)
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  if (!profileResult.data) notFound();

  const profile = profileResult.data as AdminProfile;
  const posts = (postsResult.data ?? []) as ProfilePost[];
  const displayName = profile.display_name ?? profile.username;
  const avatar =
    profile.avatar_url ?? `https://i.pravatar.cc/160?u=${profile.username}`;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cream text-ink">
      <LeftSidebar />
      <main className="flex flex-1 flex-col overflow-y-auto px-6 py-8">
        <div className="mx-auto w-full max-w-6xl">
          <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <Link
                href="/admin"
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors duration-150 hover:text-ink"
              >
                <ArrowLeft size={15} />
                admin
              </Link>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-zinc-500 shadow-[0_2px_8px_rgba(20,20,20,0.04)]">
                <ShieldCheck size={14} className="text-emerald-600" />
                admin profile view
              </div>
              <h1 className="font-display text-6xl leading-none text-ink">
                {displayName.toLowerCase()}.
              </h1>
              <p className="mt-3 font-mono text-xs uppercase tracking-widest text-zinc-500">
                @{profile.username} · joined {relativeTime(profile.created_at)}
              </p>
            </div>
            <Link
              href={`/profile/${profile.username}`}
              className="rounded-full border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-black/5"
            >
              public profile
            </Link>
          </header>

          <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-6">
              <div className="overflow-hidden rounded-3xl border border-line bg-paper shadow-[0_2px_8px_rgba(20,20,20,0.04)]">
                <div className="h-28 bg-gradient-to-r from-lime/50 via-violet-100 to-rose-100" />
                <div className="px-5 pb-5">
                  {/* eslint-disable-next-line @next/next/no-img-element -- external avatar */}
                  <img
                    src={avatar}
                    alt={displayName}
                    className="-mt-10 h-20 w-20 rounded-2xl border-4 border-paper object-cover"
                  />
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-4xl leading-none text-ink">
                      {displayName.toLowerCase()}
                    </h2>
                    {profile.is_ai && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-widest text-violet-700">
                        <BadgeCheck size={13} />
                        ai
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                    {profile.bio || "no bio set."}
                  </p>
                  {profile.is_ai && (
                    <div className="mt-4 rounded-2xl border border-line bg-cream p-4">
                      <p className="mb-2 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-zinc-500">
                        <Sparkles size={13} />
                        ai context
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                        {profile.ai_prompt || "no AI prompt set yet."}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <AdminProfileEditor
                profileId={profile.id}
                initialDisplayName={displayName}
                initialBio={profile.bio ?? ""}
                initialIsAi={profile.is_ai}
                initialAiPrompt={profile.ai_prompt ?? ""}
              />
            </div>

            <div className="rounded-3xl border border-line bg-paper p-5 shadow-[0_2px_8px_rgba(20,20,20,0.04)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-3xl leading-none text-ink">
                  posts.
                </h2>
                <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-zinc-400">
                  <FileText size={13} />
                  {posts.length} loaded
                </span>
              </div>

              {posts.length === 0 ? (
                <p className="rounded-2xl bg-cream p-4 text-sm text-zinc-500">
                  no posts from this profile yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {posts.map((post) => (
                    <li
                      key={post.id}
                      className="rounded-2xl border border-line bg-cream p-4"
                    >
                      <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">
                        {relativeTime(post.created_at)}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
                        {post.body}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
