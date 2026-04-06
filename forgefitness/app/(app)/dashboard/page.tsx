import {
  CalendarClock,
  Flame,
  Gauge,
  MoonStar,
  TimerReset,
} from "lucide-react";
import { dashboardMetrics, upcomingSessions, weeklyFocus } from "@/lib/mock-data";

const metricIcons = [Flame, Gauge, CalendarClock, MoonStar];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric, index) => {
          const Icon = metricIcons[index];

          return (
            <article
              key={metric.label}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{metric.label}</p>
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
                {metric.value}
              </p>
              <p className="mt-2 text-sm text-emerald-600">{metric.change}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
                This week
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Focus blocks
              </h2>
            </div>
            <TimerReset className="h-5 w-5 text-slate-400" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {weeklyFocus.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-200"
              >
                <p className="text-sm font-medium text-slate-500">{item.title}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  {item.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-slate-100 shadow-sm">
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
            Upcoming
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Planned sessions
          </h2>

          <div className="mt-6 space-y-4">
            {upcomingSessions.map((session) => (
              <div
                key={`${session.day}-${session.name}`}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-400">{session.day}</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {session.name}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-200">
                    {session.duration}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {session.goal}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
