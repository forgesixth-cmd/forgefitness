import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--forge-ink)] text-[var(--forge-silver)]">
      <div className="border-b-[3px] border-[var(--forge-red)] bg-[var(--forge-ink)]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5">
          <div className="font-[family-name:var(--font-archivo-black)] text-3xl tracking-[0.35em] text-[var(--forge-white)]">
            FORGE
          </div>
          <div className="flex gap-3">
            <Link href="/auth/sign-in" className="forge-button-secondary px-4 py-3 text-xs">
              Sign In
            </Link>
            <Link href="/auth/sign-up" className="forge-button px-4 py-3 text-xs">
              Join Forge
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 py-10">
        <section className="forge-panel overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="px-6 py-10 sm:px-8">
              <div className="forge-kicker text-[10px] text-[var(--forge-red)]">
                Performance Workspace
              </div>
              <h1 className="mt-5 text-6xl leading-[0.9] text-[var(--forge-white)] sm:text-8xl">
                <span className="font-[family-name:var(--font-archivo-black)]">Forge</span>
                <span className="block font-[family-name:var(--font-archivo-black)] text-[var(--forge-red)]">
                  Discipline
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--forge-silver)]">
                A dark, metric-driven control room for body recomposition,
                nutrition targets, habit streaks, training blocks, open gym
                sessions, and recovery rituals.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/dashboard" className="forge-button px-5 py-3 text-xs">
                  Enter Dashboard
                </Link>
                <Link href="/auth/sign-up" className="forge-button-secondary px-5 py-3 text-xs">
                  Create Account
                </Link>
              </div>
            </div>
            <div className="border-l border-[var(--forge-border)]">
              <div className="grid gap-0 md:grid-cols-2">
                {[
                  ["Check-In", "Body metrics, sleep, and recovery snapshots"],
                  ["Nutrition", "Calories, macros, and hydration targets"],
                  ["Training", "Programming blocks and weekly structure"],
                  ["Open Gym", "Session logs and effort history"],
                ].map(([title, body]) => (
                  <div key={title} className="border-b border-r border-[var(--forge-border)] px-6 py-6 last:border-r-0">
                    <div className="forge-kicker text-[9px] text-[var(--forge-red)]">
                      {title}
                    </div>
                    <p className="mt-4 text-sm leading-7 text-[var(--forge-silver)]">
                      {body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
