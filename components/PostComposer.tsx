"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Hash, Image as ImageIcon, Smile, Check, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { splitBody } from "@/lib/hashtags";
import CharCounterRing from "@/components/CharCounterRing";
import ProfileLink from "@/components/ProfileLink";
import Spinner from "@/components/Spinner";
import type { Post, Profile } from "@/lib/types";

const MAX_CHARS = 280;

interface PostComposerProps {
  /** The logged-in user's profile — needed for author_id and the avatar. */
  currentUser: Profile | null;
  /** Receives the freshly-created post so the parent can prepend it. */
  onPost?: (post: Post) => void;
}

// Trimmed to the actions that will actually do something soon.
const actionTools = [
  { Icon: ImageIcon, label: "media" },
  { Icon: Hash, label: "hashtag" },
  { Icon: Smile, label: "emoji" },
  { Icon: Zap, label: "spark" },
];

export default function PostComposer({
  currentUser,
  onPost,
}: PostComposerProps) {
  const supabase = createClient();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEmpty = value.trim().length === 0;
  const disabled = isEmpty || submitting || !currentUser;
  // Collapsed when idle + empty; expands on focus or once there's content.
  const expanded = focused || value.length > 0;
  // Keep the button solid (not greyed) during the success flash.
  const btnFaded = disabled && !success;

  const avatarUrl =
    currentUser?.avatar_url ?? "https://i.pravatar.cc/80?u=you";
  const profileHref = currentUser ? `/profile/${currentUser.username}` : null;
  const avatar = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- external avatar */}
      <img
        src={avatarUrl}
        alt={currentUser ? `${currentUser.username}'s avatar` : "Your avatar"}
        className="h-full w-full rounded-full object-cover"
      />
    </>
  );

  // Auto-resize: collapse to scrollHeight on every keystroke.
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value.slice(0, MAX_CHARS);
    setValue(next);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  const handlePost = async () => {
    if (disabled || !currentUser) return;
    setError(null);
    setSubmitting(true);

    const body = value.trim();
    const { data, error: insertError } = await supabase
      .from("posts")
      .insert({ body, author_id: currentUser.id })
      .select("id, body, created_at, author_id")
      .single();

    setSubmitting(false);

    if (insertError || !data) {
      setError(insertError?.message ?? "Could not post. Try again.");
      return;
    }

    onPost?.({
      id: data.id,
      author: {
        name: currentUser.display_name ?? currentUser.username,
        handle: currentUser.username,
        avatar: avatarUrl,
      },
      body: data.body,
      timestamp: "now",
      replies: 0,
      reposts: 0,
      likes: 0,
      bookmarks: 0,
    });

    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Brief success flash on the button.
    setSuccess(true);
    setTimeout(() => setSuccess(false), 900);
  };

  return (
    <div className="mx-5 mt-5 flex gap-3 rounded-3xl border border-line bg-white p-5 shadow-[0_2px_8px_rgba(20,20,20,0.04)]">
      {currentUser ? (
        <ProfileLink
          href={profileHref!}
          aria-label="Your profile"
          indicator="overlay"
          className="h-9 w-9 shrink-0 rounded-full transition-opacity duration-150 hover:opacity-80"
        >
          {avatar}
        </ProfileLink>
      ) : (
        <div className="h-9 w-9 shrink-0 rounded-full">{avatar}</div>
      )}

      <div className="min-w-0 flex-1">
        {/* Live token highlighting: a mirror layer renders the same text with
            hashtags and mentions colored behind a transparent-text textarea.
            Both share identical metrics so the caret stays aligned. */}
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 whitespace-pre-wrap break-words pt-1.5 text-sm leading-relaxed text-zinc-800"
          >
            {splitBody(value).map((seg, i) =>
              seg.type === "text" ? (
                <span key={i}>{seg.value}</span>
              ) : seg.type === "mention" ? (
                <span key={i} className="font-medium text-violet-600">
                  {seg.value}
                </span>
              ) : (
                <span key={i} className="font-medium text-[#3d4d0a]">
                  {seg.value}
                </span>
              ),
            )}
            {/* Zero-width char keeps the final (possibly empty) line's height. */}
            {"​"}
          </div>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={1}
            placeholder="drop a thought, a link, a half-baked idea…"
            className="relative w-full resize-none overflow-hidden bg-transparent pt-1.5 text-sm leading-relaxed text-transparent caret-ink placeholder:text-zinc-400 focus:outline-none"
          />
        </div>

        {/* Action bar + submit — revealed only once the composer is expanded. */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="actions"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <div className="flex items-center gap-1">
                  {actionTools.map(({ Icon, label }) => (
                    <button
                      key={label}
                      type="button"
                      aria-label={label}
                      // Don't blur the textarea (which would collapse the bar).
                      onMouseDown={(e) => e.preventDefault()}
                      className="cursor-pointer rounded-full p-1.5 text-zinc-400 transition-colors duration-150 hover:text-[#3d4d0a]"
                    >
                      <Icon size={16} strokeWidth={2} />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  {error && (
                    <span className="text-xs text-rose-500">{error}</span>
                  )}
                  <CharCounterRing count={value.length} max={MAX_CHARS} />
                  <button
                    type="button"
                    onClick={handlePost}
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={disabled}
                    className={`flex min-w-[72px] items-center justify-center rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-150 ${
                      btnFaded
                        ? "cursor-not-allowed bg-ink/30 text-white"
                        : "cursor-pointer bg-ink text-white hover:bg-ink/80"
                    }`}
                  >
                    {success ? (
                      <motion.span
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 22,
                        }}
                        className="inline-flex"
                      >
                        <Check size={14} strokeWidth={3} />
                      </motion.span>
                    ) : submitting ? (
                      <Spinner size={14} />
                    ) : (
                      "post it"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
