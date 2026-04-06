"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

type PlanOption = {
  id: string;
  name: string;
};

type SessionRow = {
  id: string;
  session_name: string;
  duration_minutes: number | null;
  effort_score: number | null;
  focus_area: string | null;
  notes: string | null;
  completed_at: string | null;
};

function formatDate(dateString: string | null) {
  if (!dateString) return "Unscheduled";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

export function LogClient() {
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [sessionName, setSessionName] = useState("");
  const [duration, setDuration] = useState("");
  const [effort, setEffort] = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [notes, setNotes] = useState("");
  const [planId, setPlanId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadData() {
    if (!isSupabaseConfigured) {
      setError("Add your Supabase keys to load workout logs.");
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

      const [{ data: plansData, error: plansError }, { data: sessionData, error: sessionError }] =
        await Promise.all([
          supabase
            .from("workout_plans")
            .select("id, name")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .order("created_at", { ascending: false }),
          supabase
            .from("workout_sessions")
            .select(
              "id, session_name, duration_minutes, effort_score, focus_area, notes, completed_at",
            )
            .eq("user_id", user.id)
            .order("completed_at", { ascending: false, nullsFirst: false })
            .order("created_at", { ascending: false }),
        ]);

      if (plansError) throw plansError;
      if (sessionError) throw sessionError;

      setPlans(plansData ?? []);
      setSessions(sessionData ?? []);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load workout logs.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleCreateSession(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
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

      const { error: insertError } = await supabase.from("workout_sessions").insert({
        user_id: user.id,
        plan_id: planId || null,
        session_name: sessionName,
        duration_minutes: duration ? Number(duration) : null,
        effort_score: effort ? Number(effort) : null,
        focus_area: focusArea || null,
        notes: notes || null,
        completed_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      setSessionName("");
      setDuration("");
      setEffort("");
      setFocusArea("");
      setNotes("");
      setPlanId("");
      setStatus("Workout log saved.");
      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save workout log.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-slate-100 shadow-sm">
        <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
          Quick log
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Capture today&apos;s workout
        </h2>

        <form className="mt-6 space-y-4" onSubmit={handleCreateSession}>
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Session name
            </label>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Push strength"
              value={sessionName}
              onChange={(event) => setSessionName(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Workout plan
            </label>
            <select
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
              value={planId}
              onChange={(event) => setPlanId(event.target.value)}
            >
              <option value="">No linked plan</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Duration
              </label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                placeholder="55"
                type="number"
                min="1"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Effort
              </label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                placeholder="7"
                type="number"
                min="1"
                max="10"
                value={effort}
                onChange={(event) => setEffort(event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Focus area
            </label>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Strength, conditioning, mobility..."
              value={focusArea}
              onChange={(event) => setFocusArea(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Notes
            </label>
            <textarea
              className="min-h-32 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Bench press felt smooth, increase top set next week."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          {status ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {status}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <button className="w-full rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save workout log"}
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
          {isLoading ? (
            <div className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-200">
              <p className="text-sm text-slate-500">Loading sessions...</p>
            </div>
          ) : sessions.length > 0 ? (
            sessions.map((log) => (
              <article
                key={log.id}
                className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-200"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      {formatDate(log.completed_at)}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-950">
                      {log.session_name}
                    </h3>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {log.duration_minutes ?? 0} min
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Intensity
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {log.effort_score ? `${log.effort_score} / 10` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Focus
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {log.focus_area || "General"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Status
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      Logged
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {log.notes || "No notes captured for this session."}
                </p>
              </article>
            ))
          ) : (
            <article className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-200">
              <p className="text-lg font-semibold text-slate-950">No sessions yet</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Save your first workout log from the form on the left.
              </p>
            </article>
          )}
        </div>
      </section>
    </div>
  );
}
