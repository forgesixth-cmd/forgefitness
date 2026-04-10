"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

type MealType = "Breakfast" | "Lunch" | "Snacks" | "Dinner";

type MealAnalysis = {
  summary: string;
  items: Array<{
    name: string;
    quantity: string;
    calories: number;
    protein_grams: number;
    carbs_grams: number;
    fats_grams: number;
  }>;
  totals: {
    calories: number;
    protein_grams: number;
    carbs_grams: number;
    fats_grams: number;
  };
};

type LoggedMeal = {
  id: string;
  meal_type: string;
  meal_description: string;
  ai_summary: string | null;
  calories: number | null;
  protein_grams: number | null;
  carbs_grams: number | null;
  fats_grams: number | null;
  logged_at: string;
};

const mealTypes: MealType[] = ["Breakfast", "Lunch", "Snacks", "Dinner"];

function formatLoggedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

export function NutritionClient() {
  const [mealType, setMealType] = useState<MealType>("Breakfast");
  const [mealDescription, setMealDescription] = useState("");
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [meals, setMeals] = useState<LoggedMeal[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingMeals, setIsLoadingMeals] = useState(true);

  async function loadMeals() {
    if (!isSupabaseConfigured) {
      setError("Add Supabase keys to load nutrition meals.");
      setIsLoadingMeals(false);
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

      const { data, error: loadError } = await supabase
        .from("nutrition_meals")
        .select(
          "id, meal_type, meal_description, ai_summary, calories, protein_grams, carbs_grams, fats_grams, logged_at",
        )
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false })
        .limit(12);

      if (loadError) throw loadError;
      setMeals(data ?? []);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load nutrition meals.",
      );
    } finally {
      setIsLoadingMeals(false);
    }
  }

  useEffect(() => {
    void loadMeals();
  }, []);

  async function handleAnalyze(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsAnalyzing(true);
    setStatus(null);
    setError(null);
    setAnalysis(null);

    try {
      if (!mealDescription.trim()) {
        throw new Error("Enter a meal before analyzing it.");
      }

      const response = await fetch("/api/nutrition/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mealType,
          mealDescription,
        }),
      });

      const result = (await response.json()) as MealAnalysis & { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Unable to analyze meal.");
      }

      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No signed-in user found.");

      const payload = {
        user_id: user.id,
        meal_type: mealType,
        meal_description: mealDescription.trim(),
        ai_summary: result.summary,
        calories: roundOne(result.totals.calories),
        protein_grams: roundOne(result.totals.protein_grams),
        carbs_grams: roundOne(result.totals.carbs_grams),
        fats_grams: roundOne(result.totals.fats_grams),
        analysis_json: result,
      };

      const { error: insertError } = await supabase.from("nutrition_meals").insert(payload);
      if (insertError) throw insertError;

      setAnalysis(result);
      setStatus("Meal analyzed and saved.");
      setMealDescription("");
      await loadMeals();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to analyze meal.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="forge-panel p-6">
        <div className="forge-kicker text-[10px] text-[var(--forge-red)]">
          Nutrition
        </div>
        <h2 className="mt-4 text-4xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-white)]">
          Meal Analyzer
        </h2>
        <p className="mt-4 text-sm leading-7 text-[var(--forge-silver)]">
          Log meals in plain English, choose the meal slot, and let AI estimate
          calories, protein, carbs, and fats before saving the entry.
        </p>

        <form className="mt-8 grid gap-4" onSubmit={handleAnalyze}>
          <select
            className="forge-select"
            value={mealType}
            onChange={(event) => setMealType(event.target.value as MealType)}
          >
            {mealTypes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <input
            className="forge-input"
            placeholder="Example: 2 idlis, sambar and chutney"
            value={mealDescription}
            onChange={(event) => setMealDescription(event.target.value)}
          />

          {status ? (
            <div className="border border-[rgba(20,160,64,0.3)] bg-[rgba(20,160,64,0.08)] px-4 py-3 text-sm text-[var(--forge-green)]">
              {status}
            </div>
          ) : null}

          {error ? (
            <div className="border border-[rgba(209,10,38,0.3)] bg-[rgba(209,10,38,0.08)] px-4 py-3 text-sm text-[var(--forge-red-bright)]">
              {error}
            </div>
          ) : null}

          <button className="forge-button px-5 py-3 text-sm" type="submit" disabled={isAnalyzing}>
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </button>
        </form>

        {analysis ? (
          <div className="mt-8 border border-[var(--forge-border)] bg-[rgba(255,255,255,0.02)]">
            <div className="border-b border-[var(--forge-border)] px-4 py-3">
              <div className="forge-title text-sm text-[var(--forge-white)]">
                Latest Breakdown
              </div>
            </div>
            <div className="grid gap-0 sm:grid-cols-4">
              {[
                ["Calories", `${roundOne(analysis.totals.calories)}`],
                ["Protein", `${roundOne(analysis.totals.protein_grams)} g`],
                ["Carbs", `${roundOne(analysis.totals.carbs_grams)} g`],
                ["Fats", `${roundOne(analysis.totals.fats_grams)} g`],
              ].map(([label, value]) => (
                <div key={label} className="border-r border-t border-[var(--forge-border)] px-4 py-4 last:border-r-0">
                  <div className="forge-kicker text-[9px] text-[var(--forge-dim)]">
                    {label}
                  </div>
                  <div className="mt-3 text-2xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-white)]">
                    {value}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[var(--forge-border)] px-4 py-4 text-sm leading-7 text-[var(--forge-silver)]">
              {analysis.summary}
            </div>
            <div className="divide-y divide-[var(--forge-border)]">
              {analysis.items.map((item) => (
                <div key={`${item.name}-${item.quantity}`} className="grid gap-4 px-4 py-4 md:grid-cols-[1.3fr_0.7fr]">
                  <div>
                    <div className="text-base font-semibold text-[var(--forge-white)]">
                      {item.name}
                    </div>
                    <div className="mt-1 text-sm text-[var(--forge-silver)]">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm text-[var(--forge-silver)]">
                    <div>Calories: {roundOne(item.calories)}</div>
                    <div>Protein: {roundOne(item.protein_grams)}g</div>
                    <div>Carbs: {roundOne(item.carbs_grams)}g</div>
                    <div>Fats: {roundOne(item.fats_grams)}g</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="forge-panel overflow-hidden">
        <div className="border-b border-[var(--forge-border)] px-6 py-4">
          <div className="forge-title text-base text-[var(--forge-white)]">
            Logged Meals
          </div>
        </div>
        <div className="divide-y divide-[var(--forge-border)]">
          {isLoadingMeals ? (
            <div className="px-6 py-8 text-sm text-[var(--forge-silver)]">
              Loading meals...
            </div>
          ) : meals.length > 0 ? (
            meals.map((meal) => (
              <article key={meal.id} className="px-6 py-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="forge-kicker text-[9px] text-[var(--forge-red)]">
                      {meal.meal_type}
                    </div>
                    <h3 className="mt-3 text-2xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-white)]">
                      {meal.meal_description}
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--forge-silver)]">
                      {meal.ai_summary || "No AI summary saved."}
                    </p>
                    <div className="mt-2 text-xs text-[var(--forge-dim)]">
                      {formatLoggedAt(meal.logged_at)}
                    </div>
                  </div>
                  <div className="grid gap-2 text-right text-sm text-[var(--forge-silver)]">
                    <div>Calories: {meal.calories ? roundOne(meal.calories) : 0}</div>
                    <div>Protein: {meal.protein_grams ? roundOne(meal.protein_grams) : 0}g</div>
                    <div>Carbs: {meal.carbs_grams ? roundOne(meal.carbs_grams) : 0}g</div>
                    <div>Fats: {meal.fats_grams ? roundOne(meal.fats_grams) : 0}g</div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="px-6 py-8 text-sm text-[var(--forge-silver)]">
              No meals logged yet. Analyze your first meal from the form.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
