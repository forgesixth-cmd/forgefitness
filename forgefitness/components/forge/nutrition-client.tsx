"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

type NutritionState = {
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  hydration: string;
};

export function NutritionClient() {
  const [state, setState] = useState<NutritionState>({
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    hydration: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError("Add Supabase keys to load nutrition targets.");
      return;
    }

    async function loadTargets() {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("No signed-in user found.");

        const { data, error: loadError } = await supabase
          .from("nutrition_targets")
          .select("calories, protein_grams, carbs_grams, fats_grams, hydration_liters")
          .eq("user_id", user.id)
          .maybeSingle();

        if (loadError) throw loadError;
        if (data) {
          setState({
            calories: data.calories ? String(data.calories) : "",
            protein: data.protein_grams ? String(data.protein_grams) : "",
            carbs: data.carbs_grams ? String(data.carbs_grams) : "",
            fats: data.fats_grams ? String(data.fats_grams) : "",
            hydration: data.hydration_liters ? String(data.hydration_liters) : "",
          });
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load nutrition targets.",
        );
      }
    }

    void loadTargets();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No signed-in user found.");

      const { error: upsertError } = await supabase.from("nutrition_targets").upsert({
        user_id: user.id,
        calories: state.calories ? Number(state.calories) : null,
        protein_grams: state.protein ? Number(state.protein) : null,
        carbs_grams: state.carbs ? Number(state.carbs) : null,
        fats_grams: state.fats ? Number(state.fats) : null,
        hydration_liters: state.hydration ? Number(state.hydration) : null,
      });

      if (upsertError) throw upsertError;
      setStatus("Nutrition targets updated.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to update nutrition targets.",
      );
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="forge-panel p-6">
        <div className="forge-kicker text-[10px] text-[var(--forge-red)]">
          Nutrition
        </div>
        <h2 className="mt-4 text-4xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-white)]">
          Intake Targets
        </h2>
        <p className="mt-4 text-sm leading-7 text-[var(--forge-silver)]">
          Set your daily calories and macro targets so your weekly check-ins have
          context and your dashboard reflects the plan, not just the outcome.
        </p>
        <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <input className="forge-input" placeholder="Calories" type="number" value={state.calories} onChange={(event) => setState((current) => ({ ...current, calories: event.target.value }))} />
          <input className="forge-input" placeholder="Protein (g)" type="number" value={state.protein} onChange={(event) => setState((current) => ({ ...current, protein: event.target.value }))} />
          <input className="forge-input" placeholder="Carbs (g)" type="number" value={state.carbs} onChange={(event) => setState((current) => ({ ...current, carbs: event.target.value }))} />
          <input className="forge-input" placeholder="Fats (g)" type="number" value={state.fats} onChange={(event) => setState((current) => ({ ...current, fats: event.target.value }))} />
          <input className="forge-input md:col-span-2" placeholder="Hydration target (liters)" type="number" step="0.1" value={state.hydration} onChange={(event) => setState((current) => ({ ...current, hydration: event.target.value }))} />
          {status ? <div className="border border-[rgba(20,160,64,0.3)] bg-[rgba(20,160,64,0.08)] px-4 py-3 text-sm text-[var(--forge-green)] md:col-span-2">{status}</div> : null}
          {error ? <div className="border border-[rgba(209,10,38,0.3)] bg-[rgba(209,10,38,0.08)] px-4 py-3 text-sm text-[var(--forge-red-bright)] md:col-span-2">{error}</div> : null}
          <button className="forge-button px-5 py-3 text-sm md:col-span-2" type="submit">
            Save Targets
          </button>
        </form>
      </section>

      <section className="forge-panel overflow-hidden">
        <div className="border-b border-[var(--forge-border)] px-6 py-4">
          <div className="forge-title text-base text-[var(--forge-white)]">
            Fuel Framework
          </div>
        </div>
        <div className="grid gap-0 md:grid-cols-2">
          {[
            ["Discipline", "Targets turn nutrition into a repeatable system, not a mood-driven choice."],
            ["Recovery", "Use protein and hydration to support training volume and sleep quality."],
            ["Body Recomp", "Weekly check-ins show whether calories need to move up or down."],
            ["Consistency", "Tie daily water and sugar-free habits to your streak board."],
          ].map(([title, body]) => (
            <div key={title} className="border-r border-t border-[var(--forge-border)] px-6 py-6 last:border-r-0">
              <div className="forge-kicker text-[9px] text-[var(--forge-red)]">{title}</div>
              <p className="mt-4 text-sm leading-7 text-[var(--forge-silver)]">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
