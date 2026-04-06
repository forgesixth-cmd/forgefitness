import { profile, profileGoals } from "@/lib/mock-data";

export default function ProfilePage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-300 text-lg font-semibold text-slate-950">
            {profile.initials}
          </div>
          <div>
            <p className="text-sm text-slate-500">Athlete profile</p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              {profile.name}
            </h2>
            <p className="text-sm text-slate-600">{profile.email}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {profile.stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-200"
            >
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-slate-100 shadow-sm">
        <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
          Goals and preferences
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Training profile
        </h2>

        <div className="mt-6 grid gap-4">
          {profileGoals.map((goal) => (
            <article
              key={goal.label}
              className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
            >
              <p className="text-sm text-slate-400">{goal.label}</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {goal.value}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                {goal.note}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
