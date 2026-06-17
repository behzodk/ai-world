"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Save, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProfilePhotoUploader from "@/components/ProfilePhotoUploader";

type AdminProfileEditorProps = {
  profileId: string;
  initialDisplayName: string;
  initialAvatar: string;
  initialBio: string;
  initialIsAi: boolean;
  initialAiPrompt: string;
};

export default function AdminProfileEditor({
  profileId,
  initialDisplayName,
  initialAvatar,
  initialBio,
  initialIsAi,
  initialAiPrompt,
}: AdminProfileEditorProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [isAi, setIsAi] = useState(initialIsAi);
  const [aiPrompt, setAiPrompt] = useState(initialAiPrompt);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const canSave = displayName.trim().length >= 2 && !saving;

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSave) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    const response = await fetch(`/api/admin/profiles/${profileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        display_name: displayName,
        bio,
        is_ai: isAi,
        ai_prompt: isAi ? aiPrompt : "",
      }),
    });
    const payload = (await response.json()) as { error?: string };

    setSaving(false);

    if (!response.ok) {
      setError(payload.error ?? "could not save profile.");
      return;
    }

    setSaved(true);
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSave}
      className="rounded-3xl border border-line bg-paper p-5 shadow-[0_2px_8px_rgba(20,20,20,0.04)]"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-lime/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink">
            <Sparkles size={13} />
            profile controls
          </div>
          <h2 className="font-display text-3xl leading-none text-ink">
            edit persona.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            tune the public profile and private AI context from Supabase.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-line bg-cream p-4">
          <span className="mb-3 block font-mono text-xs uppercase tracking-widest text-zinc-400">
            profile photo
          </span>
          <ProfilePhotoUploader
            endpoint={`/api/admin/profiles/${profileId}/avatar`}
            initialAvatar={initialAvatar}
            alt={displayName}
            size="admin"
          />
        </div>

        <label className="block">
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
            display name
          </span>
          <input
            value={displayName}
            onChange={(event) => {
              setDisplayName(event.target.value);
              setSaved(false);
              setError(null);
            }}
            className="mt-2 h-11 w-full rounded-2xl border border-line bg-cream px-4 text-sm text-ink outline-none transition-colors duration-150 focus:border-ink"
          />
        </label>

        <label className="block">
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
            bio
          </span>
          <textarea
            value={bio}
            onChange={(event) => {
              setBio(event.target.value);
              setSaved(false);
              setError(null);
            }}
            rows={4}
            placeholder="what this profile is about..."
            className="mt-2 w-full resize-none rounded-2xl border border-line bg-cream px-4 py-3 text-sm leading-relaxed text-ink outline-none transition-colors duration-150 placeholder:text-zinc-400 focus:border-ink"
          />
        </label>

        <div className="rounded-2xl border border-line bg-cream p-4">
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span>
              <span className="block font-mono text-xs uppercase tracking-widest text-zinc-400">
                AI profile
              </span>
              <span className="mt-1 block text-sm text-zinc-500">
                show AI tick and enable this profile for future auto-posting.
              </span>
            </span>
            <span
              className={`relative h-7 w-12 rounded-full transition-colors duration-150 ${
                isAi ? "bg-ink" : "bg-zinc-200"
              }`}
            >
              <input
                type="checkbox"
                checked={isAi}
                onChange={(event) => {
                  setIsAi(event.target.checked);
                  setSaved(false);
                  setError(null);
                }}
                className="sr-only"
              />
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform duration-150 ${
                  isAi ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </span>
          </label>
        </div>

        <AnimatePresence initial={false}>
          {isAi && (
            <motion.label
              initial={{ height: 0, opacity: 0, y: -8 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="block overflow-hidden"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
                AI context prompt
              </span>
              <textarea
                value={aiPrompt}
                onChange={(event) => {
                  setAiPrompt(event.target.value);
                  setSaved(false);
                  setError(null);
                }}
                rows={8}
                placeholder="Describe this profile's voice, interests, posting style, constraints, and topics..."
                className="mt-2 w-full resize-none rounded-2xl border border-line bg-cream px-4 py-3 text-sm leading-relaxed text-ink outline-none transition-colors duration-150 placeholder:text-zinc-400 focus:border-ink"
              />
            </motion.label>
          )}
        </AnimatePresence>
      </div>

      {error && <p className="mt-4 text-sm text-rose-500">{error}</p>}
      {saved && (
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm text-emerald-700">
          <Check size={14} />
          profile saved
        </p>
      )}

      <button
        type="submit"
        disabled={!canSave}
        className={`mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors duration-150 ${
          canSave
            ? "cursor-pointer bg-ink text-white hover:bg-ink/80"
            : "cursor-not-allowed bg-ink/25 text-white"
        }`}
      >
        {saving ? "saving..." : "save profile"}
        {!saving && <Save size={16} />}
      </button>
    </form>
  );
}
