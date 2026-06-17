"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AnimatedInput from "@/components/auth/AnimatedInput";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import AuthVisualPanel from "@/components/auth/AuthVisualPanel";
import StepProgress from "@/components/auth/StepProgress";
import UsernameField, {
  type UsernameAvailability,
} from "@/components/auth/UsernameField";
import ValidatedInput from "@/components/auth/ValidatedInput";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/validation";

type Mode = "login" | "signup";

// Kinetic statement per mode: a fixed lead + rotating gradient accent word.
const STATEMENT: Record<Mode, { lead: string; accents: string[] }> = {
  login: { lead: "Welcome", accents: ["back.", "home.", "in."] },
  signup: { lead: "Find your", accents: ["people.", "vibe.", "crowd."] },
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

const stepSwap = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 24 : -24 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -24 : 24 }),
};

function useDebouncedValue(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debounced;
}

export default function AuthExperience({
  initialMode,
}: {
  initialMode: Mode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const shake = useAnimationControls();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [stepDirection, setStepDirection] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameAvailability, setUsernameAvailability] =
    useState<UsernameAvailability>("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";
  const debouncedFirstName = useDebouncedValue(firstName, 300);
  const debouncedLastName = useDebouncedValue(lastName, 300);
  const debouncedEmail = useDebouncedValue(email, 300);
  const debouncedPassword = useDebouncedValue(password, 300);
  const firstNameValid = isLogin || validateName(debouncedFirstName);
  const lastNameValid = isLogin || validateName(debouncedLastName);
  const usernameValid =
    isLogin || usernameAvailability === "available";
  const emailValid = validateEmail(debouncedEmail);
  const passwordValid = isLogin
    ? password.length > 0
    : validatePassword(debouncedPassword);
  const stepOneValid = firstNameValid && lastNameValid && usernameValid;
  const stepTwoValid = emailValid && passwordValid;
  const disabled =
    loading ||
    (isLogin ? !email || !password : signupStep === 1 ? !stepOneValid : !stepTwoValid);

  const switchMode = () => {
    const next: Mode = isLogin ? "signup" : "login";
    setMode(next);
    setError(null);
    setSignupStep(1);
    setStepDirection(1);
    try {
      window.history.replaceState(null, "", `/${next}`);
    } catch {
      /* no-op */
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    if (!isLogin && signupStep === 1) {
      setStepDirection(1);
      setSignupStep(2);
      return;
    }

    setError(null);
    setLoading(true);

    const { error: authError } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: username.trim(),
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              display_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
            },
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
                  {!isLogin && <StepProgress step={signupStep} />}
                  <h1 className="text-2xl font-bold text-zinc-900">
                    {isLogin
                      ? "Welcome back."
                      : signupStep === 1
                        ? "Join the conversation."
                        : "Almost there."}
                  </h1>
                  <p className="mb-8 mt-1 text-sm text-zinc-400">
                    {isLogin
                      ? "Log in to your account."
                      : signupStep === 1
                        ? "First, who are you?"
                        : "Now secure your account."}
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <form onSubmit={handleSubmit}>
              {/* Field group: staggered entrance (outer) + shake (inner). */}
              <motion.div variants={item}>
                <motion.div animate={shake}>
                  <AnimatePresence mode="wait" initial={false}>
                    {isLogin ? (
                      <motion.div
                        key="login"
                        variants={swap}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="space-y-8"
                      >
                        <AnimatedInput
                          id="email"
                          label="Email"
                          type="email"
                          value={email}
                          onChange={setEmail}
                          autoComplete="email"
                        />
                        <AnimatedInput
                          id="password"
                          label="Password"
                          value={password}
                          onChange={setPassword}
                          autoComplete="current-password"
                          isPassword
                        />
                      </motion.div>
                    ) : signupStep === 1 ? (
                      <motion.div
                        key="signup-step-1"
                        custom={stepDirection}
                        variants={stepSwap}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="space-y-8"
                      >
                        <ValidatedInput
                          id="first-name"
                          label="First name"
                          value={firstName}
                          onChange={setFirstName}
                          valid={firstNameValid}
                          touched={firstName.length > 0}
                          error="use letters only, at least 2 characters"
                          autoComplete="given-name"
                        />
                        <ValidatedInput
                          id="last-name"
                          label="Last name"
                          value={lastName}
                          onChange={setLastName}
                          valid={lastNameValid}
                          touched={lastName.length > 0}
                          error="use letters only, at least 2 characters"
                          autoComplete="family-name"
                        />
                        <UsernameField
                          value={username}
                          onChange={setUsername}
                          availability={usernameAvailability}
                          onAvailabilityChange={setUsernameAvailability}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="signup-step-2"
                        custom={stepDirection}
                        variants={stepSwap}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="space-y-8"
                      >
                        <ValidatedInput
                          id="email"
                          label="Email"
                          type="email"
                          value={email}
                          onChange={setEmail}
                          valid={emailValid}
                          touched={email.length > 0}
                          error="enter a valid email"
                          autoComplete="email"
                        />
                        <ValidatedInput
                          id="password"
                          label="Password"
                          value={password}
                          onChange={setPassword}
                          valid={passwordValid}
                          touched={password.length > 0}
                          error="password must be at least 8 characters"
                          autoComplete="new-password"
                          isPassword
                        />
                      </motion.div>
                    )}
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
                {!isLogin && signupStep === 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      setStepDirection(-1);
                      setSignupStep(1);
                      setError(null);
                    }}
                    className="mb-4 inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-zinc-400 transition-colors duration-150 hover:text-violet-600"
                  >
                    <ArrowLeft size={14} />
                    back
                  </button>
                )}
                <AuthSubmitButton
                  label={
                    isLogin
                      ? "Log in"
                      : signupStep === 1
                        ? "Continue"
                        : "Create account"
                  }
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
