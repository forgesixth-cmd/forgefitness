"use client";

import { useEffect, useState } from "react";
import { BASE_PATH } from "@/lib/base-path";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

type RingMetric = {
  label: string;
  target: number;
  consumed: number;
  color: string;
  size: number;
  stroke: number;
};

type DashboardInsight = {
  fitness_score: number;
  status_label: string;
  daily_insight: string;
  nutrition_feedback: string;
  exercise_feedback: string;
  motivation: string;
  top_actions: string[];
};

type OverviewState = {
  currentWeight: string;
  targetWeight: string;
  bodyFat: string;
  avgSleep: string;
  totalLost: string;
  heightCm: string;
  caloriesToday: number;
  caloriesTarget: number;
  caloriesLeft: number;
  proteinToday: number;
  proteinTarget: number;
  carbsToday: number;
  carbsTarget: number;
  fatsToday: number;
  fatsTarget: number;
  exerciseBurnToday: number;
  exerciseBurnTarget: number;
  daysRemaining: number | null;
  goalGapKg: number | null;
  strategySummary: string;
  bodyCheckins: Array<{ date: string; weight: number | null; targetWeight: number | null }>;
  dailySeries: Array<{
    label: string;
    caloriesIn: number;
    caloriesTarget: number;
    burn: number;
    burnTarget: number;
  }>;
  foodSignals: string[];
  habitSummary: Array<{ label: string; streak: number }>;
};

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatShortDate(input: string) {
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
    if (!lookup.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function estimateExerciseBurn(durationMinutes: number | null, effortScore: number | null) {
  const duration = durationMinutes ?? 0;
  const effort = effortScore ?? 6;
  return Math.round(duration * (effort * 0.95 + 3));
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function Ring({ label, target, consumed, color, size, stroke }: RingMetric) {
  const pct = target > 0 ? clampPercent((consumed / target) * 100) : 0;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <svg
      aria-label={label}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        fill="none"
        r={radius}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        fill="none"
        r={radius}
        stroke={color}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        strokeWidth={stroke}
        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
      />
    </svg>
  );
}

export function OverviewClient() {
  const [state, setState] = useState<OverviewState | null>(null);
  const [insight, setInsight] = useState<DashboardInsight | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadOverview() {
      if (!isSupabaseConfigured) {
        if (mounted) setError("Add Supabase keys to load Forge data.");
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

        const todayStart = startOfToday();
        const sevenDaysAgo = new Date(todayStart);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

        const [
          { data: checkins, error: checkinsError },
          { data: habits, error: habitsError },
          { data: sessions, error: sessionsError },
          { data: profile, error: profileError },
          { data: meals, error: mealsError },
        ] = await Promise.all([
          supabase
            .from("body_checkins")
            .select("checkin_date, weight_kg, body_fat_percentage, avg_sleep_hours")
            .eq("user_id", user.id)
            .order("checkin_date", { ascending: false })
            .limit(12),
          supabase
            .from("habit_entries")
            .select("habit_key, completed, entry_date")
            .eq("user_id", user.id)
            .order("entry_date", { ascending: false })
            .limit(180),
          supabase
            .from("workout_sessions")
            .select("completed_at, duration_minutes, effort_score, focus_area")
            .eq("user_id", user.id)
            .order("completed_at", { ascending: false, nullsFirst: false })
            .limit(90),
          supabase
            .from("profiles")
            .select("primary_goal, target_weight_kg, current_weight_kg, target_days, daily_calorie_target, daily_carbs_grams, daily_fats_grams, daily_protein_grams, daily_calories_to_burn, target_strategy_summary, height_cm, estimated_body_fat_percentage")
            .eq("id", user.id)
            .maybeSingle(),
          supabase
            .from("nutrition_meals")
            .select("meal_description, calories, protein_grams, carbs_grams, fats_grams, logged_at")
            .eq("user_id", user.id)
            .order("logged_at", { ascending: false })
            .limit(60),
        ]);

        if (checkinsError && checkinsError.code !== "PGRST205") throw checkinsError;
        if (habitsError && habitsError.code !== "PGRST205") throw habitsError;
        if (sessionsError) throw sessionsError;
        if (profileError) throw profileError;
        if (mealsError && mealsError.code !== "PGRST205") throw mealsError;

        const profileData = profile ?? null;

        if (
          profileData &&
          profileData.current_weight_kg &&
          profileData.target_weight_kg &&
          profileData.height_cm &&
          profileData.target_days &&
          !profileData.daily_calorie_target
        ) {
          const recommendationResponse = await fetch(
            `${BASE_PATH}/api/profile/recommendations`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                currentWeightKg: profileData.current_weight_kg,
                targetWeightKg: profileData.target_weight_kg,
                heightCm: profileData.height_cm,
                targetDays: profileData.target_days,
              }),
            },
          );

          if (recommendationResponse.ok) {
            const recommendation = (await recommendationResponse.json()) as {
              summary: string;
              daily_calories: number;
              protein_grams: number;
              carbs_grams: number;
              fats_grams: number;
              daily_calories_to_burn: number;
              estimated_body_fat_percentage: number;
            };

            await supabase.from("profiles").upsert({
              id: user.id,
              daily_calorie_target: recommendation.daily_calories,
              daily_protein_grams: recommendation.protein_grams,
              daily_carbs_grams: recommendation.carbs_grams,
              daily_fats_grams: recommendation.fats_grams,
              daily_calories_to_burn: recommendation.daily_calories_to_burn,
              estimated_body_fat_percentage: recommendation.estimated_body_fat_percentage,
              target_strategy_summary: recommendation.summary,
              last_recommendation_at: new Date().toISOString(),
            });

            profileData.daily_calorie_target = recommendation.daily_calories;
            profileData.daily_protein_grams = recommendation.protein_grams;
            profileData.daily_carbs_grams = recommendation.carbs_grams;
            profileData.daily_fats_grams = recommendation.fats_grams;
            profileData.daily_calories_to_burn = recommendation.daily_calories_to_burn;
            profileData.estimated_body_fat_percentage =
              recommendation.estimated_body_fat_percentage;
            profileData.target_strategy_summary = recommendation.summary;
          }
        }

        const recentCheckins = checkins ?? [];
        const latestCheckin = recentCheckins[0];
        const firstCheckin = recentCheckins[recentCheckins.length - 1];

        const totalLost =
          latestCheckin?.weight_kg !== null &&
          latestCheckin?.weight_kg !== undefined &&
          firstCheckin?.weight_kg !== null &&
          firstCheckin?.weight_kg !== undefined
            ? (Number(firstCheckin.weight_kg) - Number(latestCheckin.weight_kg)).toFixed(1)
            : "0.0";

        const allMeals = meals ?? [];
        const todayMeals = allMeals.filter(
          (meal) => new Date(meal.logged_at) >= todayStart,
        );

        const caloriesToday = todayMeals.reduce(
          (sum, meal) => sum + Number(meal.calories ?? 0),
          0,
        );
        const proteinToday = todayMeals.reduce(
          (sum, meal) => sum + Number(meal.protein_grams ?? 0),
          0,
        );
        const carbsToday = todayMeals.reduce(
          (sum, meal) => sum + Number(meal.carbs_grams ?? 0),
          0,
        );
        const fatsToday = todayMeals.reduce(
          (sum, meal) => sum + Number(meal.fats_grams ?? 0),
          0,
        );

        const allSessions = sessions ?? [];
        const todaySessions = allSessions.filter(
          (session) => session.completed_at && new Date(session.completed_at) >= todayStart,
        );
        const exerciseBurnToday = todaySessions.reduce(
          (sum, session) =>
            sum + estimateExerciseBurn(session.duration_minutes, session.effort_score),
          0,
        );

        const habitSummary = [
          {
            label: "Sugar-free days",
            streak: computeStreak(habits ?? [], "sugar_free"),
          },
          {
            label: "Water target days",
            streak: computeStreak(habits ?? [], "water_target"),
          },
          {
            label: "Mobility blocks",
            streak: computeStreak(habits ?? [], "mobility_block"),
          },
        ];

        const labels = Array.from({ length: 7 }, (_, index) => {
          const date = new Date(sevenDaysAgo);
          date.setDate(sevenDaysAgo.getDate() + index);
          return date;
        });

        const dailySeries = labels.map((date) => {
          const dayStart = new Date(date);
          dayStart.setHours(0, 0, 0, 0);
          const nextDay = new Date(dayStart);
          nextDay.setDate(dayStart.getDate() + 1);

          const mealsForDay = allMeals.filter((meal) => {
            const loggedAt = new Date(meal.logged_at);
            return loggedAt >= dayStart && loggedAt < nextDay;
          });

          const sessionsForDay = allSessions.filter((session) => {
            if (!session.completed_at) return false;
            const completedAt = new Date(session.completed_at);
            return completedAt >= dayStart && completedAt < nextDay;
          });

          return {
            label: formatShortDate(dayStart.toISOString()),
            caloriesIn: mealsForDay.reduce((sum, meal) => sum + Number(meal.calories ?? 0), 0),
            caloriesTarget: Number(profileData?.daily_calorie_target ?? 0),
            burn: sessionsForDay.reduce(
              (sum, session) =>
                sum + estimateExerciseBurn(session.duration_minutes, session.effort_score),
              0,
            ),
            burnTarget: Number(profileData?.daily_calories_to_burn ?? 0),
          };
        });

        const recentMealDescriptions = todayMeals.map((meal) => meal.meal_description);
        const foodSignals =
          recentMealDescriptions.length > 0
            ? recentMealDescriptions.slice(0, 3)
            : ["No meals logged yet today."];

        const currentWeightNumber = Number(
          latestCheckin?.weight_kg ?? profileData?.current_weight_kg ?? 0,
        );
        const targetWeightNumber = Number(profileData?.target_weight_kg ?? 0);
        const goalGapKg =
          currentWeightNumber && targetWeightNumber
            ? Number((currentWeightNumber - targetWeightNumber).toFixed(1))
            : null;

        const insightPayload = {
          calories_today: caloriesToday,
          calories_target: Number(profileData?.daily_calorie_target ?? 0),
          protein_today: proteinToday,
          protein_target: Number(profileData?.daily_protein_grams ?? 0),
          carbs_today: carbsToday,
          carbs_target: Number(profileData?.daily_carbs_grams ?? 0),
          fats_today: fatsToday,
          fats_target: Number(profileData?.daily_fats_grams ?? 0),
          exercise_burn_today: exerciseBurnToday,
          exercise_burn_target: Number(profileData?.daily_calories_to_burn ?? 0),
          current_weight: currentWeightNumber,
          target_weight: targetWeightNumber,
          target_days: Number(profileData?.target_days ?? 0),
          recent_foods: recentMealDescriptions.slice(0, 5),
          habit_streaks: habitSummary,
        };

        const insightResponse = await fetch(`${BASE_PATH}/api/dashboard/insights`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(insightPayload),
        });

        let dashboardInsight: DashboardInsight | null = null;
        if (insightResponse.ok) {
          dashboardInsight = (await insightResponse.json()) as DashboardInsight;
        }

        if (mounted) {
          setState({
            currentWeight: currentWeightNumber ? `${currentWeightNumber.toFixed(1)}kg` : "--",
            targetWeight: targetWeightNumber ? `${targetWeightNumber.toFixed(1)}kg` : "Set target",
            bodyFat:
              latestCheckin?.body_fat_percentage !== null &&
              latestCheckin?.body_fat_percentage !== undefined
                ? `${Number(latestCheckin.body_fat_percentage).toFixed(1)}%`
                : profileData?.estimated_body_fat_percentage
                  ? `${Number(profileData.estimated_body_fat_percentage).toFixed(1)}%`
                  : "--",
            avgSleep:
              latestCheckin?.avg_sleep_hours !== null &&
              latestCheckin?.avg_sleep_hours !== undefined
                ? `${Number(latestCheckin.avg_sleep_hours).toFixed(1)}h`
                : "--",
            totalLost: `${totalLost}kg`,
            heightCm: profileData?.height_cm ? `${Number(profileData.height_cm).toFixed(0)} cm` : "--",
            caloriesToday,
            caloriesTarget: Number(profileData?.daily_calorie_target ?? 0),
            caloriesLeft: Math.max(
              Number(profileData?.daily_calorie_target ?? 0) - caloriesToday,
              0,
            ),
            proteinToday,
            proteinTarget: Number(profileData?.daily_protein_grams ?? 0),
            carbsToday,
            carbsTarget: Number(profileData?.daily_carbs_grams ?? 0),
            fatsToday,
            fatsTarget: Number(profileData?.daily_fats_grams ?? 0),
            exerciseBurnToday,
            exerciseBurnTarget: Number(profileData?.daily_calories_to_burn ?? 0),
            daysRemaining: profileData?.target_days ?? null,
            goalGapKg,
            strategySummary: profileData?.target_strategy_summary || "",
            bodyCheckins: recentCheckins
              .slice()
              .reverse()
              .map((item) => ({
                date: formatShortDate(item.checkin_date),
                weight: item.weight_kg,
                targetWeight: profileData?.target_weight_kg ?? null,
              })),
            dailySeries,
            foodSignals,
            habitSummary,
          });
          setInsight(dashboardInsight);
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
          Run the latest profile and nutrition migrations, then refresh.
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
        <div className="grid gap-0 border-b border-[var(--forge-border)] lg:grid-cols-[1fr_0.85fr]">
          <div className="px-6 py-8">
            <div className="forge-kicker text-[10px] text-[var(--forge-red)]">
              Current cycle
            </div>
            <h1 className="mt-4 text-5xl leading-[0.92] text-[var(--forge-white)] sm:text-7xl">
              <span className="font-[family-name:var(--font-archivo-black)]">
                ForgeFitness
              </span>
              <span className="mt-2 block font-[family-name:var(--font-archivo-black)] text-[var(--forge-red)]">
                Target Engine
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-[var(--forge-silver)]">
              {state.strategySummary || "Complete your profile to generate an AI target strategy."}
            </p>
          </div>
          <div className="border-l border-[var(--forge-border)] px-6 py-8">
            <div className="forge-kicker text-[10px] text-[var(--forge-dim)]">
              Goal gap
            </div>
            <div className="mt-4 flex items-end gap-3">
              <div className="text-6xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-white)]">
                {state.goalGapKg !== null ? state.goalGapKg.toFixed(1) : "--"}
              </div>
              <div className="pb-2 text-3xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-silver)]">
                kg
              </div>
            </div>
            <div className="mt-4 forge-kicker text-[10px] text-[var(--forge-blue)]">
              {state.daysRemaining ? `${state.daysRemaining} days to target` : "Set your goal timeline"}
            </div>
          </div>
        </div>
        <div className="grid gap-0 md:grid-cols-5">
          {[
            ["Current weight", state.currentWeight],
            ["Target weight", state.targetWeight],
            ["Height", state.heightCm],
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

      <section className="forge-panel overflow-hidden">
        <div className="border-b border-[var(--forge-border)] px-6 py-4">
          <div className="forge-title text-base text-[var(--forge-white)]">
            01 Daily Intake Rings
          </div>
        </div>
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="mx-auto flex w-full max-w-[420px] items-center justify-center">
            <div className="relative h-[360px] w-[360px]">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0,rgba(255,255,255,0.01)_38%,transparent_70%)]" />
              <div className="absolute inset-[18px] rounded-full border border-[rgba(255,255,255,0.04)]" />
            <Ring
              label="Calories"
              target={state.caloriesTarget}
              consumed={state.caloriesToday}
              color="var(--forge-red)"
              size={360}
              stroke={24}
            />
              <Ring
                label="Carbs"
                target={state.carbsTarget}
                consumed={state.carbsToday}
                color="var(--forge-blue)"
                size={280}
                stroke={20}
              />
              <Ring
                label="Fats"
                target={state.fatsTarget}
                consumed={state.fatsToday}
                color="var(--forge-gold)"
                size={214}
                stroke={18}
              />
              <Ring
                label="Protein"
                target={state.proteinTarget}
                consumed={state.proteinToday}
                color="var(--forge-green)"
                size={152}
                stroke={16}
              />
              <div className="absolute inset-[116px] flex flex-col items-center justify-center rounded-full border border-[var(--forge-border)] bg-[rgba(7,7,12,0.92)] text-center shadow-[0_0_40px_rgba(0,0,0,0.35)]">
                <div className="forge-kicker text-[8px] text-[var(--forge-dim)]">
                  Daily intake
                </div>
                <div className="mt-3 text-4xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-white)]">
                  {Math.round(state.caloriesToday)}
                </div>
                <div className="text-xs text-[var(--forge-silver)]">
                  of {Math.round(state.caloriesTarget)} kcal
                </div>
                <div className="mt-4 forge-kicker text-[8px] text-[var(--forge-green)]">
                  {Math.round(state.exerciseBurnToday)} burned today
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Calories left", `${Math.round(state.caloriesLeft)} kcal`, "var(--forge-red)"],
              ["Exercise burn", `${Math.round(state.exerciseBurnToday)} / ${Math.round(state.exerciseBurnTarget)} kcal`, "var(--forge-green)"],
              ["Carbs", `${Math.round(state.carbsToday)} / ${Math.round(state.carbsTarget)} g`, "var(--forge-blue)"],
              ["Fats", `${Math.round(state.fatsToday)} / ${Math.round(state.fatsTarget)} g`, "var(--forge-gold)"],
              ["Protein", `${Math.round(state.proteinToday)} / ${Math.round(state.proteinTarget)} g`, "var(--forge-green)"],
              ["Total lost", state.totalLost, "var(--forge-red)"],
            ].map(([label, value, accent]) => (
              <div
                key={label}
                className="border border-[var(--forge-border)] bg-[rgba(255,255,255,0.02)] px-5 py-5"
                style={{ boxShadow: `inset 3px 0 0 ${accent}` }}
              >
                <div className="forge-kicker text-[9px] text-[var(--forge-dim)]">
                  {label}
                </div>
                <div className="mt-3 text-3xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-white)]">
                  {value}
                </div>
                {label !== "Total lost" ? (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${
                          label === "Calories left"
                            ? clampPercent(
                                state.caloriesTarget > 0
                                  ? (state.caloriesToday / state.caloriesTarget) * 100
                                  : 0,
                              )
                            : label === "Exercise burn"
                              ? clampPercent(
                                  state.exerciseBurnTarget > 0
                                    ? (state.exerciseBurnToday / state.exerciseBurnTarget) * 100
                                    : 0,
                                )
                              : label === "Carbs"
                                ? clampPercent(
                                    state.carbsTarget > 0
                                      ? (state.carbsToday / state.carbsTarget) * 100
                                      : 0,
                                  )
                                : label === "Fats"
                                  ? clampPercent(
                                      state.fatsTarget > 0
                                        ? (state.fatsToday / state.fatsTarget) * 100
                                        : 0,
                                    )
                                  : clampPercent(
                                      state.proteinTarget > 0
                                        ? (state.proteinToday / state.proteinTarget) * 100
                                        : 0,
                                    )
                        }%`,
                        background: accent,
                      }}
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="forge-panel overflow-hidden">
          <div className="border-b border-[var(--forge-border)] px-6 py-4">
            <div className="forge-title text-base text-[var(--forge-white)]">
              02 Diet and Exercise Graph
            </div>
          </div>
          <div className="px-6 py-8">
            <div className="grid grid-cols-7 gap-4">
              {state.dailySeries.map((day) => {
                const caloriesPct = day.caloriesTarget
                  ? clampPercent((day.caloriesIn / day.caloriesTarget) * 100)
                  : 0;
                const burnPct = day.burnTarget
                  ? clampPercent((day.burn / day.burnTarget) * 100)
                  : 0;

                return (
                  <div key={day.label} className="flex flex-col items-center gap-3">
                    <div className="flex h-52 items-end gap-2">
                      <div className="flex h-full flex-col justify-end">
                        <div
                          className="w-5 bg-[var(--forge-red)]"
                          style={{ height: `${Math.max(6, caloriesPct)}%` }}
                        />
                      </div>
                      <div className="flex h-full flex-col justify-end">
                        <div
                          className="w-5 bg-[var(--forge-green)]"
                          style={{ height: `${Math.max(6, burnPct)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="forge-kicker text-[8px] text-[var(--forge-dim)]">
                        {day.label}
                      </div>
                      <div className="mt-1 text-[10px] text-[var(--forge-silver)]">
                        in {Math.round(day.caloriesIn)}
                      </div>
                      <div className="text-[10px] text-[var(--forge-silver)]">
                        burn {Math.round(day.burn)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="forge-panel overflow-hidden">
            <div className="border-b border-[var(--forge-border)] px-6 py-4">
              <div className="forge-title text-base text-[var(--forge-white)]">
                03 Fitness Score
              </div>
            </div>
            <div className="px-6 py-8">
              <div className="text-6xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-white)]">
                {insight ? Math.round(insight.fitness_score) : "--"}
              </div>
              <div className="mt-3 forge-kicker text-[10px] text-[var(--forge-red)]">
                {insight?.status_label || "Waiting for AI coaching"}
              </div>
              <p className="mt-5 text-sm leading-7 text-[var(--forge-silver)]">
                {insight?.daily_insight ||
                  "Log meals and workouts consistently to unlock personalized guidance."}
              </p>
            </div>
          </section>

          <section className="forge-panel overflow-hidden">
            <div className="border-b border-[var(--forge-border)] px-6 py-4">
              <div className="forge-title text-base text-[var(--forge-white)]">
                04 Daily Insights
              </div>
            </div>
            <div className="space-y-5 px-6 py-6">
              <div>
                <div className="forge-kicker text-[9px] text-[var(--forge-red)]">
                  Nutrition
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--forge-silver)]">
                  {insight?.nutrition_feedback ||
                    "Keep logging meals to see what food choices are helping or hurting progress."}
                </p>
              </div>
              <div>
                <div className="forge-kicker text-[9px] text-[var(--forge-red)]">
                  Exercise
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--forge-silver)]">
                  {insight?.exercise_feedback ||
                    "Your session quality and daily burn will show up here after more training logs."}
                </p>
              </div>
              <div>
                <div className="forge-kicker text-[9px] text-[var(--forge-red)]">
                  Motivation
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--forge-silver)]">
                  {insight?.motivation ||
                    "Consistency compounds. Nail today and the graph starts bending toward your target."}
                </p>
              </div>
              <div>
                <div className="forge-kicker text-[9px] text-[var(--forge-red)]">
                  Food signals today
                </div>
                <ul className="mt-3 space-y-2 text-sm text-[var(--forge-silver)]">
                  {state.foodSignals.map((signal) => (
                    <li key={signal}>• {signal}</li>
                  ))}
                </ul>
              </div>
              {insight?.top_actions?.length ? (
                <div>
                  <div className="forge-kicker text-[9px] text-[var(--forge-red)]">
                    Top actions
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--forge-silver)]">
                    {insight.top_actions.map((action) => (
                      <li key={action}>• {action}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="forge-panel overflow-hidden">
          <div className="border-b border-[var(--forge-border)] px-6 py-4">
            <div className="forge-title text-base text-[var(--forge-white)]">
              05 Habit Streaks
            </div>
          </div>
          <div className="grid gap-0 md:grid-cols-3">
            {state.habitSummary.map((habit, index) => (
              <div
                key={habit.label}
                className="border-r border-[var(--forge-border)] px-6 py-6 last:border-r-0"
                style={{
                  boxShadow: `inset 0 3px 0 0 ${
                    index === 0
                      ? "var(--forge-gold)"
                      : index === 1
                        ? "var(--forge-blue)"
                        : "var(--forge-green)"
                  }`,
                }}
              >
                <div className="forge-kicker text-[9px] text-[var(--forge-dim)]">
                  {habit.label}
                </div>
                <div className="mt-4 text-5xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-white)]">
                  {habit.streak}
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
              06 Weight vs Target
            </div>
          </div>
          <div className="px-6 py-8">
            <div className="flex h-64 items-end gap-4 overflow-x-auto">
              {state.bodyCheckins.length > 0 ? (
                state.bodyCheckins.map((point) => {
                  const height = point.weight
                    ? `${Math.max(18, Number(point.weight) * 2.2)}px`
                    : "18px";
                  return (
                    <div key={point.date} className="flex min-w-16 flex-col items-center gap-3">
                      <div className="text-xs text-[var(--forge-dim)]">
                        {point.weight ? `${Number(point.weight).toFixed(1)}kg` : "--"}
                      </div>
                      <div className="relative flex h-[240px] items-end">
                        <div
                          className="w-6 bg-[var(--forge-red)] shadow-[0_0_18px_rgba(209,10,38,0.22)]"
                          style={{ height }}
                        />
                      </div>
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
      </section>
    </div>
  );
}
