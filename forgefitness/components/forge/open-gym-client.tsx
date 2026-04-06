"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

type PlanOption = { id: string; name: string };
type SessionRow = {
  id: string;
  session_name: string;
  focus_area: string | null;
  duration_minutes: number | null;
  effort_score: number | null;
  notes: string | null;
  completed_at: string | null;
};

function fmtDate(value: string | null) {
  if (!value) return "Open";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function OpenGymClient() {
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [sessionName, setSessionName] = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [duration, setDuration] = useState("");
  const [effort, setEffort] = useState("");
  const [notes, setNotes] = useState("");
  const [planId, setPlanId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadSessions() {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No signed-in user found.");

    const [{ data: plansData, error: plansError }, { data: sessionsData, error: sessionsError }] =
      await Promise.all([
        supabase
          .from("workout_plans")
          .select("id, name")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("workout_sessions")
          .select("id, session_name, focus_area, duration_minutes, effort_score, notes, completed_at")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false, nullsFirst: false })
          .limit(10),
      ]);

    if (plansError) throw plansError;
    if (sessionsError) throw sessionsError;
    setPlans(plansData ?? []);
    setSessions(sessionsData ?? []);
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError("Add Supabase keys to load open gym data.");
      return;
    }

    loadSessions().catch((loadError) => {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load open gym sessions.",
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

      const { error: insertError } = await supabase.from("workout_sessions").insert({
        user_id: user.id,
        plan_id: planId || null,
        session_name: sessionName,
        focus_area: focusArea || null,
        duration_minutes: duration ? Number(duration) : null,
        effort_score: effort ? Number(effort) : null,
        notes: notes || null,
        completed_at: new Date().toISOString(),
      });
      if (insertError) throw insertError;

      setSessionName("");
      setFocusArea("");
      setDuration("");
      setEffort("");
      setNotes("");
      setPlanId("");
      setStatus("Open gym session logged.");
      await loadSessions();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save session.",
      );
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="forge-panel p-6">
        <div className="forge-kicker text-[10px] text-[var(--forge-red)]">
          Open Gym
        </div>
        <h2 className="mt-4 text-4xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-white)]">
          Session Logger
        </h2>
        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
          <input className="forge-input" placeholder="Session name" value={sessionName} onChange={(event) => setSessionName(event.target.value)} required />
          <select className="forge-select" value={planId} onChange={(event) => setPlanId(event.target.value)}>
            <option value="">No linked block</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
          <div className="grid gap-4 md:grid-cols-3">
            <input className="forge-input" placeholder="Focus area" value={focusArea} onChange={(event) => setFocusArea(event.target.value)} />
            <input className="forge-input" placeholder="Duration" type="number" value={duration} onChange={(event) => setDuration(event.target.value)} />
            <input className="forge-input" placeholder="Effort 1-10" type="number" min="1" max="10" value={effort} onChange={(event) => setEffort(event.target.value)} />
          </div>
          <textarea className="forge-textarea min-h-28" placeholder="Top sets, conditioning, bar speed, or anything worth remembering" value={notes} onChange={(event) => setNotes(event.target.value)} />
          {status ? <div className="border border-[rgba(20,160,64,0.3)] bg-[rgba(20,160,64,0.08)] px-4 py-3 text-sm text-[var(--forge-green)]">{status}</div> : null}
          {error ? <div className="border border-[rgba(209,10,38,0.3)] bg-[rgba(209,10,38,0.08)] px-4 py-3 text-sm text-[var(--forge-red-bright)]">{error}</div> : null}
          <button className="forge-button px-5 py-3 text-sm" type="submit">
            Log Session
          </button>
        </form>
      </section>

      <section className="forge-panel overflow-hidden">
        <div className="border-b border-[var(--forge-border)] px-6 py-4">
          <div className="forge-title text-base text-[var(--forge-white)]">
            Recent Sessions
          </div>
        </div>
        <div className="divide-y divide-[var(--forge-border)]">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <article key={session.id} className="px-6 py-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="forge-kicker text-[9px] text-[var(--forge-dim)]">
                      {fmtDate(session.completed_at)}
                    </div>
                    <div className="mt-3 text-3xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-white)]">
                      {session.session_name}
                    </div>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--forge-silver)]">
                      {session.notes || "No notes captured."}
                    </p>
                  </div>
                  <div className="grid gap-2 text-right">
                    <div className="text-sm text-[var(--forge-silver)]">
                      {session.focus_area || "General"}
                    </div>
                    <div className="text-4xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-white)]">
                      {session.duration_minutes ?? 0}
                    </div>
                    <div className="forge-kicker text-[9px] text-[var(--forge-red)]">
                      {session.effort_score ? `${session.effort_score}/10 effort` : "no effort score"}
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="px-6 py-8 text-sm text-[var(--forge-silver)]">
              No sessions logged yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
