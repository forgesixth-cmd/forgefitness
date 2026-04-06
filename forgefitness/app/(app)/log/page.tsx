import { recentLogs } from "@/lib/mock-data";

export default function LogPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-slate-100 shadow-sm">
        <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
          Quick log
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Capture today&apos;s workout
        </h2>

        <form className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Session name
            </label>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Push strength"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Duration
              </label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                placeholder="55 min"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Effort
              </label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                placeholder="7 / 10"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Notes
            </label>
            <textarea
              className="min-h-32 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Bench press felt smooth, increase top set next week."
            />
          </div>

          <button className="w-full rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200">
            Save workout log
          </button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
          Recent activity
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Logged sessions
        </h2>

        <div className="mt-6 space-y-4">
          {recentLogs.map((log) => (
            <article
              key={log.id}
              className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-200"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">{log.date}</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-950">
                    {log.name}
                  </h3>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {log.duration}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Volume
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {log.volume}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Intensity
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {log.intensity}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Focus
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {log.focus}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-600">{log.note}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
