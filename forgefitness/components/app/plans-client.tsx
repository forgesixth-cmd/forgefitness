"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

type WorkoutPlanRow = {
  id: string;
  name: string;
  description: string | null;
  level: string | null;
  schedule_days: number | null;
  is_active: boolean;
};

const templateFocus = [
  "Track progression and session quality",
  "Use notes to capture recovery and technique",
  "Keep active plans aligned with weekly availability",
];

export function PlansClient() {
  const [plans, setPlans] = useState<WorkoutPlanRow[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("");
  const [scheduleDays, setScheduleDays] = useState("4");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadPlans() {
    if (!isSupabaseConfigured) {
      setError("Add your Supabase keys to load plans.");
      setIsLoading(false);
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

      const { data, error: plansError } = await supabase
        .from("workout_plans")
        .select("id, name, description, level, schedule_days, is_active")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (plansError) throw plansError;

      setPlans(data ?? []);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load plans.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPlans();
  }, []);

  async function handleCreatePlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setStatus(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("No signed-in user found.");

      const { error: insertError } = await supabase.from("workout_plans").insert({
        user_id: user.id,
        name,
        description: description || null,
        level: level || null,
        schedule_days: Number(scheduleDays) || null,
        is_active: true,
      });

      if (insertError) throw insertError;

      setName("");
      setDescription("");
      setLevel("");
      setScheduleDays("4");
      setStatus("Workout plan created.");
      await loadPlans();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create workout plan.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
          Workout plans
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
              Structured training templates
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Create real plans in Supabase and use them as the base for session
              logging and dashboard progress.
            </p>
          </div>
        </div>

        <form className="mt-6 grid gap-4 lg:grid-cols-2" onSubmit={handleCreatePlan}>
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            placeholder="Plan name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            placeholder="Level"
            value={level}
            onChange={(event) => setLevel(event.target.value)}
          />
          <textarea
            className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 lg:col-span-2"
            placeholder="Plan description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            placeholder="Schedule days per week"
            type="number"
            min="1"
            max="7"
            value={scheduleDays}
            onChange={(event) => setScheduleDays(event.target.value)}
          />
          <button
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create custom plan"}
          </button>
        </form>

        {status ? (
          <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {status}
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        {isLoading ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Loading plans...</p>
          </div>
        ) : plans.length > 0 ? (
          plans.map((plan) => (
            <article
              key={plan.id}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">{plan.level ?? "Custom"}</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {plan.name}
                  </h3>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  {(plan.schedule_days ?? 0) > 0
                    ? `${plan.schedule_days} days / week`
                    : "Flexible"}
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                {plan.description || "Add a description to define the training goal."}
              </p>

              <div className="mt-6 space-y-3">
                {templateFocus.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
                Active in dashboard
                <ArrowRight className="h-4 w-4" />
              </div>
            </article>
          ))
        ) : (
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-3">
            <p className="text-lg font-semibold text-slate-950">No plans yet</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Create your first custom workout plan above and it will appear
              here immediately.
            </p>
          </article>
        )}
      </section>
    </div>
  );
}
