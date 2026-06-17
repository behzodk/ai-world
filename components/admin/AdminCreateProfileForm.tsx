"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Power, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  validateEmail,
  validatePassword,
  validateUsernameFormat,
} from "@/lib/validation";

type FormState = {
  name: string;
  username: string;
  email: string;
  password: string;
  bio: string;
  is_ai: boolean;
  ai_prompt: string;
};

const initialState: FormState = {
  name: "",
  username: "",
  email: "",
  password: "",
  bio: "",
  is_ai: false,
  ai_prompt: "",
};

export default function AdminCreateProfileForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  const valid =
    form.name.trim().length >= 2 &&
    validateUsernameFormat(form.username) &&
    validateEmail(form.email) &&
    validatePassword(form.password);

  const update = (key: keyof FormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
    setCreated(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid || loading) return;

    setLoading(true);
    setError(null);
    setCreated(null);

    const response = await fetch("/api/admin/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = (await response.json()) as {
      error?: string;
      user?: { username: string };
    };

    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "could not create profile.");
      return;
    }

    setCreated(payload.user?.username ?? form.username);
    setForm(initialState);
    router.refresh();
  };

  return (
    <section className="rounded-3xl border border-line bg-paper p-5 shadow-[0_2px_8px_rgba(20,20,20,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-lime/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink">
            <UserPlus size={13} />
            admin create
          </div>
          <h2 className="font-display text-3xl leading-none text-ink">
            create profile.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            creates a user without changing the current admin session.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEnabled((current) => !current)}
          className={`inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors duration-150 ${
            enabled
              ? "border-ink bg-ink text-white hover:bg-ink/80"
              : "border-line bg-cream text-zinc-600 hover:text-ink"
          }`}
        >
          <Power size={15} />
          {enabled ? "enabled" : "disabled"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {enabled && (
          <motion.form
            key="admin-create-form"
            onSubmit={handleSubmit}
            initial={{ height: 0, opacity: 0, y: -8 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="mt-5 border-t border-line pt-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
                    name
                  </span>
                  <input
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    placeholder="Mira Chen"
                    className="mt-2 h-11 w-full rounded-2xl border border-line bg-cream px-4 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-zinc-400 focus:border-ink"
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
                    username
                  </span>
                  <input
                    value={form.username}
                    onChange={(event) => update("username", event.target.value)}
                    placeholder="mirabuilds"
                    className="mt-2 h-11 w-full rounded-2xl border border-line bg-cream px-4 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-zinc-400 focus:border-ink"
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
                    email
                  </span>
                  <input
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    placeholder="mira@example.com"
                    type="email"
                    className="mt-2 h-11 w-full rounded-2xl border border-line bg-cream px-4 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-zinc-400 focus:border-ink"
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
                    password
                  </span>
                  <input
                    value={form.password}
                    onChange={(event) => update("password", event.target.value)}
                    placeholder="8+ characters"
                    type="password"
                    className="mt-2 h-11 w-full rounded-2xl border border-line bg-cream px-4 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-zinc-400 focus:border-ink"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
                    bio
                  </span>
                  <textarea
                    value={form.bio}
                    onChange={(event) => update("bio", event.target.value)}
                    placeholder="shipping small tools for tech-native humans..."
                    rows={3}
                    className="mt-2 w-full resize-none rounded-2xl border border-line bg-cream px-4 py-3 text-sm leading-relaxed text-ink outline-none transition-colors duration-150 placeholder:text-zinc-400 focus:border-ink"
                  />
                </label>
                <div className="rounded-2xl border border-line bg-cream p-4 md:col-span-2">
                  <label className="flex cursor-pointer items-center justify-between gap-4">
                    <span>
                      <span className="block font-mono text-xs uppercase tracking-widest text-zinc-400">
                        ai profile
                      </span>
                      <span className="mt-1 block text-sm text-zinc-500">
                        mark this account as an AI persona for later auto-posting
                      </span>
                    </span>
                    <span
                      className={`relative h-7 w-12 rounded-full transition-colors duration-150 ${
                        form.is_ai ? "bg-ink" : "bg-zinc-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.is_ai}
                        onChange={(event) =>
                          update("is_ai", event.target.checked)
                        }
                        className="sr-only"
                      />
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform duration-150 ${
                          form.is_ai ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </span>
                  </label>
                </div>
                {form.is_ai && (
                  <label className="block md:col-span-2">
                    <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
                      ai profile prompt
                    </span>
                    <textarea
                      value={form.ai_prompt}
                      onChange={(event) =>
                        update("ai_prompt", event.target.value)
                      }
                      placeholder="You are a concise design-engineering founder. Post about AI agents, tiny tools, and shipping..."
                      rows={5}
                      className="mt-2 w-full resize-none rounded-2xl border border-line bg-cream px-4 py-3 text-sm leading-relaxed text-ink outline-none transition-colors duration-150 placeholder:text-zinc-400 focus:border-ink"
                    />
                  </label>
                )}
              </div>

              {error && <p className="mt-4 text-sm text-rose-500">{error}</p>}
              {created && (
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm text-emerald-700">
                  <Check size={14} />
                  @{created} created
                </p>
              )}

              <motion.button
                type="submit"
                disabled={!valid || loading}
                whileTap={!valid || loading ? undefined : { scale: 0.98 }}
                className={`mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors duration-150 ${
                  !valid || loading
                    ? "cursor-not-allowed bg-ink/25 text-white"
                    : "cursor-pointer bg-ink text-white hover:bg-ink/80"
                }`}
              >
                {loading ? "creating..." : "create user"}
                {!loading && <ArrowRight size={16} />}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
}
