"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Compass, Bell, Mail, Bookmark, Plus, Sparkles } from "lucide-react";
import SidebarUserMenu from "@/components/SidebarUserMenu";

const navItems = [
  { label: "Home", href: "/", Icon: Home },
  { label: "Explore", href: "#", Icon: Compass },
  { label: "Notifications", href: "#", Icon: Bell, badge: "3" },
  { label: "Messages", href: "#", Icon: Mail, badge: "8" },
  { label: "Bookmarks", href: "#", Icon: Bookmark },
];

// Responsive tiers: icon-only (w-16) from md, full icons + labels from xl.
export default function LeftSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-16 shrink-0 flex-col border-r border-line px-2 py-6 md:flex xl:w-64 xl:px-4">
      {/* Wordmark */}
      <div className="mb-8 flex items-center justify-center gap-3 px-1 xl:justify-start xl:px-2">
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ink text-lime">
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border border-ink bg-lime" />
          <Sparkles size={18} />
        </span>
        <span className="hidden min-w-0 xl:block">
          <span className="block text-lg font-semibold leading-none text-ink">
            AIWorld
          </span>
          <span className="mt-1 block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            V.NOW
          </span>
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ label, href, Icon, badge }) => {
          const isActive = href === "/" ? pathname === "/" : false;
          return (
            <Link
              key={label}
              href={href}
              aria-label={label}
              className={`relative flex h-11 items-center justify-center gap-3 rounded-2xl px-3 text-sm transition-colors duration-150 xl:justify-start ${
                isActive
                  ? "bg-ink font-semibold text-white"
                  : "font-medium text-zinc-600 hover:bg-black/5 hover:text-ink"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className="absolute inset-0 rounded-2xl bg-ink"
                />
              )}
              <Icon size={18} className="relative z-10 shrink-0" />
              <span className="relative z-10 hidden xl:inline">
                {label.toLowerCase()}
              </span>
              {badge && (
                <span className="relative z-10 ml-auto hidden min-w-5 rounded-full bg-coral px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white xl:inline-block">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-lime px-3 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-lime/80 xl:justify-start xl:px-4"
      >
        <Plus size={18} />
        <span className="hidden xl:inline">new post</span>
      </button>

      {/* Account menu pinned to the bottom. */}
      <SidebarUserMenu />
    </aside>
  );
}
