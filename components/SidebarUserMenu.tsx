"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  User,
  Settings,
  LogOut,
  MoreHorizontal,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Spinner from "@/components/Spinner";
import type { Profile } from "@/lib/types";

// Bottom-of-sidebar account control: avatar trigger that opens a dropdown with
// Profile, Settings, and Sign out. Collapses to avatar-only on the icon tier.
export default function SidebarUserMenu() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [profilePending, setProfilePending] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setIsAdmin(user.email?.toLowerCase() === "test@user.com");
      const { data } = await supabase
        .from("profiles")
        .select(
          "id, username, display_name, avatar_url, bio, is_ai, ai_prompt, created_at",
        )
        .eq("id", user.id)
        .single();
      setProfile(data);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close the menu on any outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const name = profile?.display_name ?? profile?.username ?? "You";
  const handle = profile?.username ?? "you";
  const avatar = profile?.avatar_url ?? "https://i.pravatar.cc/80?u=you";

  useEffect(() => {
    if (profile?.username) router.prefetch(`/profile/${profile.username}`);
  }, [profile?.username, router]);

  useEffect(() => {
    if (isAdmin) router.prefetch("/admin");
  }, [isAdmin, router]);

  const itemClass =
    "flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors duration-150";

  return (
    <div ref={ref} className="relative mt-auto pt-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute bottom-full left-0 mb-2 w-52 origin-bottom overflow-hidden rounded-2xl border border-line bg-white py-1 shadow-[0_2px_8px_rgba(20,20,20,0.04)]"
          >
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setProfilePending(true);
                router.push(`/profile/${handle}`);
              }}
              disabled={profilePending}
              className={`${itemClass} text-zinc-700 hover:bg-black/5`}
            >
              {profilePending ? <Spinner size={16} /> : <User size={16} />}
              profile
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={`${itemClass} text-zinc-700 hover:bg-black/5`}
            >
              <Settings size={16} />
              settings
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push("/admin");
                }}
                className={`${itemClass} text-zinc-700 hover:bg-black/5`}
              >
                <ShieldCheck size={16} />
                admin
              </button>
            )}
            <div className="my-1 border-t border-zinc-100" />
            <button
              type="button"
              onClick={handleSignOut}
              className={`${itemClass} text-rose-500 hover:bg-rose-50`}
            >
              <LogOut size={16} />
              sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        className={`flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-line bg-white px-2 py-2 shadow-[0_2px_8px_rgba(20,20,20,0.04)] transition-colors duration-150 hover:bg-black/5 xl:justify-start ${
          open ? "bg-black/5" : ""
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- external avatar */}
        <img
          src={avatar}
          alt={name}
          className="h-8 w-8 shrink-0 rounded-full object-cover"
        />
        <div className="hidden min-w-0 flex-1 text-left xl:block">
          <p className="truncate text-sm font-semibold text-ink">{name}</p>
          <p className="truncate font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            @{handle}
          </p>
        </div>
        <MoreHorizontal
          size={16}
          className="hidden shrink-0 text-zinc-500 xl:block"
        />
      </button>
    </div>
  );
}
