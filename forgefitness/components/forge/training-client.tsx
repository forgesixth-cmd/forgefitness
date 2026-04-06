"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

type PlanRow = {
  id: string;
  name: string;
  level: string | null;
  description: string | null;
  schedule_days: number | null;
};

export function TrainingClient() {
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [schedule, setSchedule] = useState("4");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadPlans() {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No signed-in user found.");

    const { data, error: loadError } = await supabase
      .from("workout_plans")
      .select("id, name, level, description, schedule_days")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (loadError) throw loadError;
    setPlans(data ?? []);
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError("Add Supabase keys to load training plans.");
      return;
    }

    loadPlans().catch((loadError) => {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load training plans.",
      );
    });
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

      const { error: insertError } = await supabase.from("workout_plans").insert({
        user_id: user.id,
        name,
        level: level || null,
        description: description || null,
        schedule_days: schedule ? Number(schedule) : null,
      });
      if (insertError) throw insertError;

      setName("");
      setLevel("");
      setSchedule("4");
      setDescription("");
      setStatus("Training block created.");
      await loadPlans();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create training block.",
      );
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="forge-panel p-6">
        <div className="forge-kicker text-[10px] text-[var(--forge-red)]">
          Training
        </div>
        <h2 className="mt-4 text-4xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-white)]">
          Program Builder
        </h2>
        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
          <input className="forge-input" placeholder="Training block name" value={name} onChange={(event) => setName(event.target.value)} required />
          <div className="grid gap-4 md:grid-cols-2">
            <input className="forge-input" placeholder="Level" value={level} onChange={(event) => setLevel(event.target.value)} />
            <input className="forge-input" placeholder="Days per week" type="number" min="1" max="7" value={schedule} onChange={(event) => setSchedule(event.target.value)} />
          </div>
          <textarea className="forge-textarea min-h-32" placeholder="Focus, split, progression, or deload notes" value={description} onChange={(event) => setDescription(event.target.value)} />
          {status ? <div className="border border-[rgba(20,160,64,0.3)] bg-[rgba(20,160,64,0.08)] px-4 py-3 text-sm text-[var(--forge-green)]">{status}</div> : null}
          {error ? <div className="border border-[rgba(209,10,38,0.3)] bg-[rgba(209,10,38,0.08)] px-4 py-3 text-sm text-[var(--forge-red-bright)]">{error}</div> : null}
          <button className="forge-button px-5 py-3 text-sm" type="submit">
            Create Block
          </button>
        </form>
      </section>

      <section className="forge-panel overflow-hidden">
        <div className="border-b border-[var(--forge-border)] px-6 py-4">
          <div className="forge-title text-base text-[var(--forge-white)]">
            Active Blocks
          </div>
        </div>
        <div className="divide-y divide-[var(--forge-border)]">
          {plans.length > 0 ? (
            plans.map((plan, index) => (
              <article key={plan.id} className="px-6 py-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="forge-kicker text-[9px] text-[var(--forge-red)]">
                      Block {String(index + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mt-3 text-3xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-white)]">
                      {plan.name}
                    </h3>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--forge-silver)]">
                      {plan.description || "No training note added yet."}
                    </p>
                  </div>
                  <div className="grid gap-3 text-right">
                    <div className="forge-kicker text-[9px] text-[var(--forge-dim)]">
                      {plan.level || "Custom"}
                    </div>
                    <div className="text-4xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-white)]">
                      {plan.schedule_days ?? 0}
                    </div>
                    <div className="text-sm text-[var(--forge-silver)]">days / week</div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="px-6 py-8 text-sm text-[var(--forge-silver)]">
              No active training blocks yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
