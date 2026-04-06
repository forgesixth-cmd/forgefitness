"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

type OverviewState = {
  currentWeight: string;
  targetWeight: string;
  bodyFat: string;
  avgSleep: string;
  totalLost: string;
  bodyCheckins: Array<{ date: string; weight: number | null }>;
  sugarFreeStreak: number;
  waterStreak: number;
  planCount: number;
  sessionCount: number;
  focusStatus: string;
};

function dateLabel(input: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
  }).format(new Date(input));
}

function computeStreak(
  entries: Array<{ entry_date: string; completed: boolean; habit_key: string }>,
  habitKey: string,
) {
  const lookup = new Map(
    entries
      .filter((entry) => entry.habit_key === habitKey && entry.completed)
      .map((entry) => [entry.entry_date, true]),
  );

  let streak = 0;
  const cursor = new Date();

  for (let i = 0; i < 60; i += 1) {
    const key = cursor.toISOString().slice(0, 10);
    if (!lookup.has(key)) {
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function OverviewClient() {
  const [state, setState] = useState<OverviewState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadOverview() {
      if (!isSupabaseConfigured) {
        if (mounted) {
          setError("Add Supabase keys to load Forge data.");
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

        const [
          { data: checkins, error: checkinsError },
          { data: habits, error: habitsError },
          { data: plans, error: plansError },
          { data: sessions, error: sessionsError },
          { data: profile, error: profileError },
        ] = await Promise.all([
          supabase
            .from("body_checkins")
            .select("checkin_date, weight_kg, body_fat_percentage, avg_sleep_hours")
            .eq("user_id", user.id)
            .order("checkin_date", { ascending: false })
            .limit(8),
          supabase
            .from("habit_entries")
            .select("habit_key, completed, entry_date")
            .eq("user_id", user.id)
            .order("entry_date", { ascending: false })
            .limit(180),
          supabase
            .from("workout_plans")
            .select("id")
            .eq("user_id", user.id)
            .eq("is_active", true),
          supabase
            .from("workout_sessions")
            .select("id, completed_at")
            .eq("user_id", user.id)
            .order("completed_at", { ascending: false, nullsFirst: false })
            .limit(30),
          supabase
            .from("profiles")
            .select("primary_goal")
            .eq("id", user.id)
            .maybeSingle(),
        ]);

        if (checkinsError && checkinsError.code !== "PGRST205") throw checkinsError;
        if (habitsError && habitsError.code !== "PGRST205") throw habitsError;
        if (plansError) throw plansError;
        if (sessionsError) throw sessionsError;
        if (profileError) throw profileError;

        const recentCheckins = checkins ?? [];
        const latest = recentCheckins[0];
        const first = recentCheckins[recentCheckins.length - 1];
        const totalLost =
          latest?.weight_kg !== null &&
          latest?.weight_kg !== undefined &&
          first?.weight_kg !== null &&
          first?.weight_kg !== undefined
            ? (Number(first.weight_kg) - Number(latest.weight_kg)).toFixed(1)
            : "0.0";

        const habitsSafe = habits ?? [];
        const sugarFreeStreak = computeStreak(habitsSafe, "sugar_free");
        const waterStreak = computeStreak(habitsSafe, "water_target");

        if (mounted) {
          setState({
            currentWeight:
              latest?.weight_kg !== null && latest?.weight_kg !== undefined
                ? `${Number(latest.weight_kg).toFixed(1)}kg`
                : "--",
            targetWeight: profile?.primary_goal || "Set target",
            bodyFat:
              latest?.body_fat_percentage !== null &&
              latest?.body_fat_percentage !== undefined
                ? `${Number(latest.body_fat_percentage).toFixed(1)}%`
                : "--",
            avgSleep:
              latest?.avg_sleep_hours !== null &&
              latest?.avg_sleep_hours !== undefined
                ? `${Number(latest.avg_sleep_hours).toFixed(1)}h`
                : "--",
            totalLost: `${totalLost}kg`,
            bodyCheckins: recentCheckins
              .slice()
              .reverse()
              .map((item) => ({ date: dateLabel(item.checkin_date), weight: item.weight_kg })),
            sugarFreeStreak,
            waterStreak,
            planCount: (plans ?? []).length,
            sessionCount: (sessions ?? []).length,
            focusStatus:
              recentCheckins.length > 0
                ? "Right on target."
                : "Log your first check-in to activate the dashboard.",
          });
        }
      } catch (loadError) {
        if (mounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load the Forge overview.",
          );
        }
      }
    }

    void loadOverview();
    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <section className="forge-panel p-6 text-sm text-rose-300">
        {error}
        <div className="mt-3 text-[var(--forge-silver)]">
          If you just added the new FORGE features, run the latest Supabase
          migration first.
        </div>
      </section>
    );
  }

  if (!state) {
    return (
      <section className="forge-panel p-6 text-sm text-[var(--forge-silver)]">
        Initialising Forge control room...
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="forge-panel overflow-hidden">
        <div className="border-b border-[var(--forge-border)] px-6 py-4">
          <div className="forge-kicker text-[10px] text-[var(--forge-red)]">
            Overview
          </div>
        </div>
        <div className="grid gap-0 border-b border-[var(--forge-border)] lg:grid-cols-[1.3fr_0.7fr]">
          <div className="px-6 py-8">
            <div className="forge-kicker text-[10px] text-[var(--forge-red)]">
              Current cycle
            </div>
            <h1 className="mt-4 text-5xl leading-[0.92] text-[var(--forge-white)] sm:text-7xl">
              <span className="font-[family-name:var(--font-archivo-black)]">
                ForgeFitness
              </span>
              <span className="mt-2 block font-[family-name:var(--font-archivo-black)] text-[var(--forge-red)]">
                Control Room
              </span>
            </h1>
          </div>
          <div className="border-l border-[var(--forge-border)] px-6 py-8">
            <div className="forge-kicker text-[10px] text-[var(--forge-dim)]">
              Total lost
            </div>
            <div className="mt-4 flex items-end gap-3">
              <div className="text-6xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-white)]">
                {state.totalLost.replace("kg", "")}
              </div>
              <div className="pb-2 text-3xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-silver)]">
                kg
              </div>
            </div>
            <div className="mt-4 forge-kicker text-[10px] text-[var(--forge-blue)]">
              {state.focusStatus}
            </div>
          </div>
        </div>
        <div className="grid gap-0 md:grid-cols-4">
          {[
            ["Current weight", state.currentWeight],
            ["Goal", state.targetWeight],
            ["Body fat", state.bodyFat],
            ["Avg sleep", state.avgSleep],
          ].map(([label, value]) => (
            <div
              key={label}
              className="border-r border-t border-[var(--forge-border)] px-6 py-4 last:border-r-0"
            >
              <div className="forge-kicker text-[9px] text-[var(--forge-dim)]">
                {label}
              </div>
              <div className="mt-3 text-3xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-white)]">
                {value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="forge-panel px-6 py-4 text-sm text-[var(--forge-green)]">
        <span className="forge-kicker mr-3 text-[9px] text-[var(--forge-dim)]">
          Status
        </span>
        {state.focusStatus}
      </div>

      <section className="forge-panel overflow-hidden">
        <div className="border-b border-[var(--forge-border)] px-6 py-4">
          <div className="forge-title text-base text-[var(--forge-white)]">
            01 Current Stats
          </div>
        </div>
        <div className="grid gap-0 lg:grid-cols-4">
          {[
            ["Body weight", state.currentWeight, state.totalLost, "var(--forge-red)"],
            ["Body fat", state.bodyFat, "Latest check-in", "var(--forge-blue)"],
            ["Avg sleep", state.avgSleep, "Recovery lens", "var(--forge-gold)"],
            ["Active plans", `${state.planCount}`, `${state.sessionCount} recent sessions`, "var(--forge-green)"],
          ].map(([label, value, note, border]) => (
            <div
              key={label}
              className="border-r border-[var(--forge-border)] px-6 py-6 last:border-r-0"
              style={{ boxShadow: `inset 0 3px 0 0 ${border}` }}
            >
              <div className="forge-kicker text-[9px] text-[var(--forge-dim)]">
                {label}
              </div>
              <div className="mt-4 text-5xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-white)]">
                {value}
              </div>
              <div className="mt-4 text-sm text-[var(--forge-silver)]">{note}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="forge-panel overflow-hidden">
        <div className="border-b border-[var(--forge-border)] px-6 py-4">
          <div className="forge-title text-base text-[var(--forge-white)]">
            02 Habit Streaks
          </div>
        </div>
        <div className="grid gap-0 md:grid-cols-2">
          {[
            ["Sugar-free days", state.sugarFreeStreak, "var(--forge-gold)"],
            ["Water target days", state.waterStreak, "var(--forge-blue)"],
          ].map(([label, value, tone]) => (
            <div
              key={label}
              className="border-r border-[var(--forge-border)] px-6 py-6 last:border-r-0"
              style={{ boxShadow: `inset 0 3px 0 0 ${tone}` }}
            >
              <div className="forge-kicker text-[9px] text-[var(--forge-dim)]">
                {label}
              </div>
              <div className="mt-5 text-6xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-white)]">
                {value}
              </div>
              <div className="mt-3 text-sm text-[var(--forge-silver)]">
                consecutive days
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="forge-panel overflow-hidden">
        <div className="border-b border-[var(--forge-border)] px-6 py-4">
          <div className="forge-title text-base text-[var(--forge-white)]">
            03 Weight vs Target
          </div>
        </div>
        <div className="px-6 py-8">
          <div className="flex h-64 items-end gap-4 overflow-x-auto">
            {state.bodyCheckins.length > 0 ? (
              state.bodyCheckins.map((point) => {
                const height = point.weight ? `${Math.max(18, Number(point.weight) * 2.2)}px` : "18px";
                return (
                  <div key={point.date} className="flex min-w-16 flex-col items-center gap-3">
                    <div className="text-xs text-[var(--forge-dim)]">
                      {point.weight ? `${Number(point.weight).toFixed(1)}kg` : "--"}
                    </div>
                    <div
                      className="w-6 bg-[var(--forge-red)] shadow-[0_0_18px_rgba(209,10,38,0.22)]"
                      style={{ height }}
                    />
                    <div className="forge-kicker text-[8px] text-[var(--forge-dim)]">
                      {point.date}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-[var(--forge-silver)]">
                No check-ins yet. Head to Check-In and log your first body metric snapshot.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
