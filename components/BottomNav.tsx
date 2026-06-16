"use client";

import { Home, Compass, Bell, Mail } from "lucide-react";

const items = [
  { icon: Home, label: "Home", active: true },
  { icon: Compass, label: "Explore" },
  { icon: Bell, label: "Notifications" },
  { icon: Mail, label: "Messages" },
];

// Mobile-only nav bar; the desktop layout uses LeftSidebar instead.
export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-line bg-cream/90 py-2 backdrop-blur md:hidden">
      {items.map(({ icon: Icon, label, active }) => (
        <a
          key={label}
          href="#"
          aria-label={label}
          className={`cursor-pointer rounded-lg p-3 transition-colors duration-150 ${
            active
              ? "text-violet-600 hover:bg-zinc-100"
              : "text-zinc-400 hover:text-zinc-900"
          }`}
        >
          <Icon size={20} strokeWidth={2} />
        </a>
      ))}
    </nav>
  );
}
