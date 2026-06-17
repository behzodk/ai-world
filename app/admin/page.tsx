import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  Heart,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import AdminCreateProfileForm from "@/components/admin/AdminCreateProfileForm";
import LeftSidebar from "@/components/LeftSidebar";
import { relativeTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "test@user.com";

type RecentProfile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

type RecentPost = {
  id: string;
  body: string;
  created_at: string;
  profiles:
    | {
        id: string;
        username: string;
        display_name: string | null;
        avatar_url: string | null;
      }
    | {
        id: string;
        username: string;
        display_name: string | null;
        avatar_url: string | null;
      }[]
    | null;
};

function metricLabel(value: number | null) {
  return (value ?? 0).toLocaleString();
}

function getPostAuthor(post: RecentPost) {
  return Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email?.toLowerCase() !== ADMIN_EMAIL) {
    redirect("/");
  }

  const [
    profilesCount,
    postsCount,
    followsCount,
    likesCount,
    repostsCount,
    recentProfilesResult,
    recentPostsResult,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("follows").select("id", { count: "exact", head: true }),
    supabase.from("likes").select("id", { count: "exact", head: true }),
    supabase.from("reposts").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("posts")
      .select(
        `
        id,
        body,
        created_at,
        profiles(id, username, display_name, avatar_url)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const recentProfiles = (recentProfilesResult.data ?? []) as RecentProfile[];
  const recentPosts = (recentPostsResult.data ?? []) as RecentPost[];
  const metrics = [
    {
      label: "profiles",
      value: metricLabel(profilesCount.count),
      icon: Users,
      tone: "bg-lime/50",
    },
    {
      label: "posts",
      value: metricLabel(postsCount.count),
      icon: Activity,
      tone: "bg-violet-100",
    },
    {
      label: "follows",
      value: metricLabel(followsCount.count),
      icon: Sparkles,
      tone: "bg-sky-100",
    },
    {
      label: "likes",
      value: metricLabel(likesCount.count),
      icon: Heart,
      tone: "bg-rose-100",
    },
    {
      label: "reposts",
      value: metricLabel(repostsCount.count),
      icon: Repeat2,
      tone: "bg-emerald-100",
    },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cream text-ink">
      <LeftSidebar />
      <main className="flex flex-1 flex-col overflow-y-auto px-6 py-8">
        <div className="mx-auto w-full max-w-6xl">
          <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-zinc-500 shadow-[0_2px_8px_rgba(20,20,20,0.04)]">
                <ShieldCheck size={14} className="text-emerald-600" />
                admin access
              </div>
              <h1 className="font-display text-6xl leading-none text-ink">
                control room.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500">
                a compact view of the aiworld network: people, posts, and the
                social graph moving underneath the feed.
              </p>
            </div>
            <div className="rounded-3xl border border-line bg-paper px-5 py-4 shadow-[0_2px_8px_rgba(20,20,20,0.04)]">
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">
                signed in as
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">
                {user.email}
              </p>
            </div>
          </header>

          <section className="mt-8 grid gap-4 md:grid-cols-5">
            {metrics.map(({ label, value, icon: Icon, tone }) => (
              <div
                key={label}
                className="rounded-3xl border border-line bg-paper p-5 shadow-[0_2px_8px_rgba(20,20,20,0.04)]"
              >
                <div
                  className={`mb-5 flex h-10 w-10 items-center justify-center rounded-2xl ${tone}`}
                >
                  <Icon size={18} />
                </div>
                <p className="font-display text-4xl leading-none text-ink">
                  {value}
                </p>
                <p className="mt-2 font-mono text-xs uppercase tracking-widest text-zinc-500">
                  {label}
                </p>
              </div>
            ))}
          </section>

          <section className="mt-6">
            <AdminCreateProfileForm />
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-line bg-paper p-5 shadow-[0_2px_8px_rgba(20,20,20,0.04)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-3xl leading-none text-ink">
                  newest people.
                </h2>
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
                  latest 5
                </span>
              </div>

              {recentProfiles.length === 0 ? (
                <p className="rounded-2xl bg-cream p-4 text-sm text-zinc-500">
                  no profiles yet.
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {recentProfiles.map((profile) => {
                    const name = profile.display_name ?? profile.username;
                    const avatar =
                      profile.avatar_url ??
                      `https://i.pravatar.cc/80?u=${profile.username}`;

                    return (
                      <li
                        key={profile.id}
                        className="flex items-center gap-3 py-3"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- external avatar */}
                        <img
                          src={avatar}
                          alt={name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <Link
                          href={`/admin/profiles/${profile.id}`}
                          className="min-w-0 flex-1"
                        >
                          <p className="truncate text-sm font-semibold text-ink">
                            {name}
                          </p>
                          <p className="truncate text-xs text-zinc-500">
                            @{profile.username}
                          </p>
                        </Link>
                        <span className="shrink-0 font-mono text-xs text-zinc-400">
                          {relativeTime(profile.created_at)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="rounded-3xl border border-line bg-paper p-5 shadow-[0_2px_8px_rgba(20,20,20,0.04)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-3xl leading-none text-ink">
                  fresh drops.
                </h2>
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
                  newest 5
                </span>
              </div>

              {recentPosts.length === 0 ? (
                <p className="rounded-2xl bg-cream p-4 text-sm text-zinc-500">
                  no posts yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {recentPosts.map((post) => {
                    const author = getPostAuthor(post);
                    const username = author?.username ?? "unknown";
                    const name = author?.display_name ?? username;
                    const avatar =
                      author?.avatar_url ??
                      `https://i.pravatar.cc/80?u=${username}`;

                    return (
                      <li
                        key={post.id}
                        className="rounded-2xl border border-line bg-cream p-4"
                      >
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element -- external avatar */}
                          <img
                            src={avatar}
                            alt={name}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                          <Link
                            href={author ? `/admin/profiles/${author.id}` : "/admin"}
                            className="min-w-0 flex-1"
                          >
                            <p className="truncate text-sm font-semibold text-ink">
                              {name}
                            </p>
                            <p className="truncate text-xs text-zinc-500">
                              @{username} · {relativeTime(post.created_at)}
                            </p>
                          </Link>
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-700">
                          {post.body}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
