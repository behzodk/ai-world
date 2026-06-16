"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import AnimatedInput from "@/components/auth/AnimatedInput";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import AuthVisualPanel from "@/components/auth/AuthVisualPanel";

type Mode = "login" | "signup";

// Kinetic statement per mode: a fixed lead + rotating gradient accent word.
const STATEMENT: Record<Mode, { lead: string; accents: string[] }> = {
  login: { lead: "Welcome", accents: ["back.", "home.", "in."] },
  signup: { lead: "Find your", accents: ["people.", "tribe.", "crowd."] },
};

// Stagger the right panel's children in on load — they arrive, not appear.
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// Login ↔ signup cross-fade + slide for the swapping blocks.
const swap = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function AuthExperience({
  initialMode,
}: {
  initialMode: Mode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const shake = useAnimationControls();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";
  const passwordTooShort =
    !isLogin && password.length > 0 && password.length < 6;
  const disabled =
    loading ||
    !email ||
    !password ||
    (!isLogin && (!username.trim() || password.length < 6));

  const switchMode = () => {
    const next: Mode = isLogin ? "signup" : "login";
    setMode(next);
    setError(null);
    try {
      window.history.replaceState(null, "", `/${next}`);
    } catch {
      /* no-op */
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    setError(null);
    setLoading(true);

    const { error: authError } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username.trim(), display_name: username.trim() },
          },
        });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      shake.start({ x: [0, -8, 8, -8, 8, 0], transition: { duration: 0.4 } });
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Dark visual panel (owns the grid texture). */}
      <AuthVisualPanel
        lead={STATEMENT[mode].lead}
        accents={STATEMENT[mode].accents}
      />

      {/* Pure-white form panel. */}
      <div className="relative flex w-full flex-col bg-white md:w-1/2">
        <div className="flex flex-1 flex-col justify-center px-6 py-12 md:px-12">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mx-auto w-full max-w-sm"
          >
            {/* Wordmark. */}
            <motion.div
              variants={item}
              className="mb-12 flex items-center gap-2"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-600 text-xs font-bold text-white">
                A
              </span>
              <span className="text-lg font-bold text-zinc-900">AIWorld</span>
            </motion.div>

            {/* Heading + subtitle, swapped on mode change. */}
            <motion.div variants={item}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mode}
                  variants={swap}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <h1 className="text-2xl font-bold text-zinc-900">
                    {isLogin ? "Welcome back." : "Join the conversation."}
                  </h1>
                  <p className="mb-8 mt-1 text-sm text-zinc-400">
                    {isLogin
                      ? "Log in to your account."
                      : "Create your account to get started."}
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <form onSubmit={handleSubmit}>
              {/* Field group: staggered entrance (outer) + shake (inner). */}
              <motion.div variants={item}>
                <motion.div animate={shake}>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={mode}
                      variants={swap}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="space-y-8"
                    >
                      {!isLogin && (
                        <AnimatedInput
                          id="username"
                          label="Username"
                          value={username}
                          onChange={setUsername}
                          autoComplete="username"
                        />
                      )}
                      <AnimatedInput
                        id="email"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        autoComplete="email"
                      />
                      <div>
                        <AnimatedInput
                          id="password"
                          label="Password"
                          value={password}
                          onChange={setPassword}
                          autoComplete={
                            isLogin ? "current-password" : "new-password"
                          }
                          isPassword
                        />
                        <AnimatePresence initial={false}>
                          {passwordTooShort && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.2 }}
                              className="mt-2 text-xs text-rose-500"
                            >
                              Password must be at least 6 characters.
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Form-level error. */}
                  <AnimatePresence initial={false}>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 text-xs text-rose-500"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              {/* Submit. */}
              <motion.div variants={item} className="mt-12">
                <AuthSubmitButton
                  label={isLogin ? "Log in" : "Create account"}
                  loading={loading}
                  disabled={disabled}
                />
              </motion.div>
            </form>

            {/* Switch link. */}
            <motion.div variants={item} className="mt-6 text-sm text-zinc-400">
              <span>
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </span>{" "}
              <motion.button
                type="button"
                onClick={switchMode}
                whileHover="hover"
                className="inline-flex cursor-pointer items-center gap-1 font-medium text-violet-600"
              >
                {isLogin ? "Sign up" : "Log in"}
                <motion.span
                  variants={{ hover: { x: 3 } }}
                  className="inline-flex"
                >
                  →
                </motion.span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
