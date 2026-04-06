"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

type AuthMode = "sign-in" | "sign-up";

type AuthFormProps = {
  mode: AuthMode;
};

const content = {
  "sign-in": {
    eyebrow: "Welcome back",
    title: "Sign in to your ForgeFitness account",
    description:
      "Use your Supabase credentials to continue into your training dashboard.",
    submitLabel: "Sign in",
    alternateLabel: "Need an account?",
    alternateHref: "/auth/sign-up",
    alternateCta: "Create one",
  },
  "sign-up": {
    eyebrow: "Create account",
    title: "Set up your ForgeFitness account",
    description:
      "Create your account and we will prepare a profile record automatically in Supabase.",
    submitLabel: "Create account",
    alternateLabel: "Already have an account?",
    alternateHref: "/auth/sign-in",
    alternateCta: "Sign in",
  },
} satisfies Record<
  AuthMode,
  {
    eyebrow: string;
    title: string;
    description: string;
    submitLabel: string;
    alternateLabel: string;
    alternateHref: string;
    alternateCta: string;
  }
>;

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [goal, setGoal] = useState("");
  const [experience, setExperience] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copy = content[mode];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isSupabaseConfigured) {
      setError(
        "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStatus(null);

    try {
      const supabase = getSupabaseBrowserClient();

      if (mode === "sign-in") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        setStatus("Signed in successfully. Redirecting to your dashboard.");
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      const redirectTo =
        typeof window === "undefined"
          ? undefined
          : `${window.location.origin}/auth/sign-in`;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            display_name: fullName,
            primary_goal: goal,
            experience_level: experience,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        setStatus("Account created. Redirecting to your dashboard.");
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      setStatus(
        "Account created. Check your email to confirm your account, then sign in.",
      );
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Something went wrong during authentication.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-xl rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-[0_35px_120px_rgba(15,23,42,0.12)] sm:p-10">
      <p className="text-sm font-semibold tracking-[0.28em] text-amber-700">
        {copy.eyebrow.toUpperCase()}
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
        {copy.title}
      </h1>
      <p className="mt-3 text-sm leading-7 text-slate-600">{copy.description}</p>

      <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
        {mode === "sign-up" ? (
          <>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Full name"
              autoComplete="name"
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                placeholder="Training goal"
              />
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                value={experience}
                onChange={(event) => setExperience(event.target.value)}
                placeholder="Experience level"
              />
            </div>
          </>
        ) : null}

        <input
          type="email"
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          autoComplete="email"
          required
        />
        <input
          type="password"
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          minLength={8}
          required
        />

        {!isSupabaseConfigured ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Add your Supabase keys to `.env.local` before testing auth.
          </p>
        ) : null}

        {status ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {status}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <button
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Please wait..." : copy.submitLabel}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        {copy.alternateLabel}{" "}
        <Link href={copy.alternateHref} className="font-semibold text-slate-950">
          {copy.alternateCta}
        </Link>
      </p>
    </div>
  );
}
