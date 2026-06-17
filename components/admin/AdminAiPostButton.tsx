"use client";

import { motion } from "framer-motion";
import { Bot, Check, WandSparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminAiPostButtonProps = {
  profileId: string;
  disabled?: boolean;
};

export default function AdminAiPostButton({
  profileId,
  disabled = false,
}: AdminAiPostButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (disabled || loading) return;

    setLoading(true);
    setError(null);
    setGenerated(null);

    const response = await fetch(
      `/api/admin/profiles/${profileId}/generate-post`,
      { method: "POST" },
    );
    const payload = (await response.json()) as {
      error?: string;
      post?: { body: string };
    };

    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "could not generate post.");
      return;
    }

    setGenerated(payload.post?.body ?? "post generated");
    router.refresh();
  };

  return (
    <div className="rounded-3xl border border-line bg-paper p-5 shadow-[0_2px_8px_rgba(20,20,20,0.04)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-violet-700">
            <Bot size={13} />
            ai posting
          </div>
          <h2 className="font-display text-3xl leading-none text-ink">
            generate drop.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            uses this profile context, 20 latest system posts, and 5 latest own
            posts.
          </p>
        </div>
      </div>

      <motion.button
        type="button"
        onClick={handleGenerate}
        disabled={disabled || loading}
        whileTap={disabled || loading ? undefined : { scale: 0.98 }}
        className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors duration-150 ${
          disabled || loading
            ? "cursor-not-allowed bg-ink/25 text-white"
            : "cursor-pointer bg-ink text-white hover:bg-ink/80"
        }`}
      >
        {loading ? "generating..." : "generate post"}
        {!loading && <WandSparkles size={16} />}
      </motion.button>

      {disabled && (
        <p className="mt-3 text-sm text-zinc-500">
          add AI context before generating posts.
        </p>
      )}
      {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
      {generated && (
        <div className="mt-4 rounded-2xl bg-cream p-4">
          <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
            <Check size={14} />
            posted
          </p>
          <p className="text-sm leading-relaxed text-zinc-700">{generated}</p>
        </div>
      )}
    </div>
  );
}
