"use client";

import { useEffect, useState } from "react";
import {
  CalendarClock,
  Flame,
  Gauge,
  MoonStar,
  TimerReset,
} from "lucide-react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

type DashboardState = {
  streak: number;
  planCompletion: number;
  monthlySessions: number;
  recoveryScore: number;
  weeklyStrengthMinutes: number;
  weeklyConditioningMinutes: number;
  weeklyMobilitySessions: number;
  upcomingSessions: Array<{
    id: string;
    day: string;
    name: string;
    duration: string;
    goal: string;
  }>;
};

const metricIcons = [Flame, Gauge, CalendarClock, MoonStar];

function daysAgo(dateString: string) {
  const now = new Date();
  const target = new Date(dateString);
  const diff = now.getTime() - target.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function formatUpcomingDay(dateString: string | null) {
  if (!dateString) return "Unscheduled";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
}

export function DashboardClient() {
  const [state, setState] = useState<DashboardState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      if (!isSupabaseConfigured) {
        if (isMounted) {
          setError("Add your Supabase keys to load dashboard data.");
          setIsLoading(false);
        }
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("No signed-in user found.");

        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);

        const [{ data: plans, error: plansError }, { data: sessions, error: sessionsError }] =
          await Promise.all([
            supabase
              .from("workout_plans")
              .select("id, name, description, schedule_days, is_active, created_at")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false }),
            supabase
              .from("workout_sessions")
              .select(
                "id, session_name, focus_area, duration_minutes, effort_score, completed_at, created_at, notes",
              )
              .eq("user_id", user.id)
              .order("completed_at", { ascending: false, nullsFirst: false })
              .order("created_at", { ascending: false }),
          ]);

        if (plansError) throw plansError;
        if (sessionsError) throw sessionsError;

        const allSessions = sessions ?? [];
        const completedSessions = allSessions.filter((session) => session.completed_at);
        const recentWeekSessions = completedSessions.filter((session) => {
          if (!session.completed_at) return false;
          return new Date(session.completed_at) >= weekStart;
        });

        const monthlySessions = completedSessions.filter((session) => {
          if (!session.completed_at) return false;
          return new Date(session.completed_at) >= monthStart;
        }).length;

        const activePlans = (plans ?? []).filter((plan) => plan.is_active);
        const expectedWeeklySessions = activePlans.reduce(
          (total, plan) => total + (plan.schedule_days ?? 0),
          0,
        );

        const planCompletion =
          expectedWeeklySessions > 0
            ? Math.min(
                100,
                Math.round((recentWeekSessions.length / expectedWeeklySessions) * 100),
              )
            : 0;

        const streak = completedSessions.reduce((best, session) => {
          if (!session.completed_at) return best;
          const ago = daysAgo(session.completed_at);
          return ago < 30 ? Math.max(best, 30 - ago) : best;
        }, 0);

        const strengthMinutes = recentWeekSessions
          .filter((session) =>
            (session.focus_area ?? "").toLowerCase().includes("strength"),
          )
          .reduce((total, session) => total + (session.duration_minutes ?? 0), 0);

        const conditioningMinutes = recentWeekSessions
          .filter((session) =>
            (session.focus_area ?? "").toLowerCase().includes("conditioning"),
          )
          .reduce((total, session) => total + (session.duration_minutes ?? 0), 0);

        const mobilitySessions = recentWeekSessions.filter((session) =>
          (session.focus_area ?? "").toLowerCase().includes("mobility"),
        ).length;

        const effortEntries = completedSessions.filter(
          (session) => typeof session.effort_score === "number",
        );
        const averageEffort =
          effortEntries.length > 0
            ? effortEntries.reduce(
                (total, session) => total + (session.effort_score ?? 0),
                0,
              ) / effortEntries.length
            : 0;
        const recoveryScore = Math.max(0, Math.min(10, Number((11 - averageEffort).toFixed(1))));

        const upcomingSessions = activePlans.slice(0, 3).map((plan, index) => ({
          id: plan.id,
          day: `Plan ${index + 1}`,
          name: plan.name,
          duration: `${(plan.schedule_days ?? 0) || 1} days/week`,
          goal: plan.description || "Add a description to clarify this plan's goal.",
        }));

        if (isMounted) {
          setState({
            streak,
            planCompletion,
            monthlySessions,
            recoveryScore,
            weeklyStrengthMinutes: strengthMinutes,
            weeklyConditioningMinutes: conditioningMinutes,
            weeklyMobilitySessions: mobilitySessions,
            upcomingSessions:
              upcomingSessions.length > 0
                ? upcomingSessions
                : completedSessions.slice(0, 3).map((session) => ({
                    id: session.id,
                    day: formatUpcomingDay(session.completed_at),
                    name: session.session_name,
                    duration: `${session.duration_minutes ?? 0} min`,
                    goal:
                      session.notes || session.focus_area || "Review this recent session.",
                  })),
          });
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load dashboard data.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-rose-700 shadow-sm">
        {error ?? "Unable to load dashboard."}
      </div>
    );
  }

  const metrics = [
    {
      label: "Current streak",
      value: `${state.streak} days`,
      change: "Based on recent logged activity",
    },
    {
      label: "Plan completion",
      value: `${state.planCompletion}%`,
      change: "Weekly completion against active plans",
    },
    {
      label: "Monthly sessions",
      value: `${state.monthlySessions}`,
      change: "Completed sessions this month",
    },
    {
      label: "Recovery score",
      value: `${state.recoveryScore} / 10`,
      change: "Inverse of recent effort trend",
    },
  ];

  const weeklyFocus = [
    {
      title: "Strength volume",
      value: `${state.weeklyStrengthMinutes} min`,
      note: "Minutes tagged with strength focus over the last 7 days.",
    },
    {
      title: "Conditioning",
      value: `${state.weeklyConditioningMinutes} min`,
      note: "Minutes tagged with conditioning over the last 7 days.",
    },
    {
      title: "Mobility",
      value: `${state.weeklyMobilitySessions} sessions`,
      note: "Sessions tagged with mobility in the last week.",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => {
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
            {state.upcomingSessions.length > 0 ? (
              state.upcomingSessions.map((session) => (
                <div
                  key={session.id}
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
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                Create your first plan or log your first workout to populate the
                dashboard.
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
