import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  ChartColumnIncreasing,
  Dumbbell,
  ShieldCheck,
  Target,
} from "lucide-react";

const highlights = [
  {
    title: "Train with structure",
    description:
      "Create focused workout plans with weekly goals, target muscle groups, and progressive sessions.",
    icon: Dumbbell,
  },
  {
    title: "Log every session",
    description:
      "Track sets, reps, load, and notes so each workout tells you what to repeat and what to improve.",
    icon: CalendarRange,
  },
  {
    title: "See your momentum",
    description:
      "A dashboard surfaces streaks, recovery status, completion rates, and next best actions.",
    icon: ChartColumnIncreasing,
  },
];

const pillars = [
  "Email and social sign-in ready for Supabase Auth",
  "Dashboard built around consistency, recovery, and training balance",
  "Workout plans designed for beginner, intermediate, and athlete templates",
  "Logging flow optimized for speed during an active gym session",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#07111f_0%,_#040814_56%,_#02040a_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-12 pt-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/90 text-sm font-semibold text-slate-950">
              FF
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-amber-200">
                FORGEFITNESS
              </p>
              <p className="text-xs text-slate-400">
                Workout planning and progress tracking
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-3 md:flex">
            <Link
              href="/dashboard"
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-amber-300/40 hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/auth/sign-in"
              className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              Sign in
            </Link>
          </nav>
        </header>

        <section className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              Built for disciplined training, not generic habit tracking
            </div>

            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-400">
                Forge stronger routines
              </p>
              <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-white sm:text-6xl">
                A focused fitness app for plans, logging, and measurable
                progress.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                ForgeFitness gives athletes and everyday lifters a single place
                to manage workouts, stay consistent, and understand whether
                training is actually moving forward.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
              >
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/25 hover:bg-white/10"
              >
                Start building account flow
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {pillars.map((pillar) => (
                <div
                  key={pillar}
                  className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm leading-7 text-slate-300"
                >
                  {pillar}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-[0_30px_80px_rgba(2,8,23,0.45)] backdrop-blur">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                    Weekly score
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-white">82%</p>
                </div>
                <div className="rounded-2xl bg-emerald-400/15 px-4 py-2 text-sm font-medium text-emerald-200">
                  +3 sessions vs last week
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Sessions", "4 / 5"],
                  ["Streak", "11 days"],
                  ["Volume", "14.2k lb"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-3xl border border-white/10 bg-slate-950/30 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {label}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="mt-5 text-xl font-semibold text-white">
                      {item.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="rounded-[1.75rem] border border-amber-300/20 bg-amber-300/10 p-5 text-sm leading-7 text-amber-50">
              <div className="mb-3 flex items-center gap-2 text-amber-200">
                <Target className="h-4 w-4" />
                v1 build focus
              </div>
              Auth, user profile, workout plans, workout logging, and dashboard
              now have a dedicated scaffold and route structure ready to expand.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
