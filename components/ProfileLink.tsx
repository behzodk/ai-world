"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Spinner from "@/components/Spinner";

type ProfileLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
  indicator?: "inline" | "overlay";
};

export default function ProfileLink({
  href,
  children,
  className = "",
  "aria-label": ariaLabel,
  indicator = "inline",
}: ProfileLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const prefetch = () => router.prefetch(href);

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-busy={pending}
      onFocus={prefetch}
      onPointerEnter={prefetch}
      onTouchStart={prefetch}
      onClick={(event) => {
        if (
          pathname === href ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        setPending(true);
      }}
      className={`relative ${pending ? "opacity-60" : ""} ${className}`}
    >
      {children}
      <AnimatePresence>
        {pending &&
          (indicator === "overlay" ? (
            <motion.span
              key="profile-loading-overlay"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.14 }}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/35 text-white backdrop-blur-[1px]"
            >
              <Spinner size={14} />
            </motion.span>
          ) : (
            <motion.span
              key="profile-loading-inline"
              initial={{ opacity: 0, scale: 0.85, x: -2 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: -2 }}
              transition={{ duration: 0.14 }}
              className="ml-1.5 inline-flex align-[-2px] text-zinc-400"
            >
              <Spinner size={12} />
            </motion.span>
          ))}
      </AnimatePresence>
    </Link>
  );
}
