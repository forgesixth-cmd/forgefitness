"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

type CheckinRow = {
  id: string;
  checkin_date: string;
  weight_kg: number | null;
  body_fat_percentage: number | null;
  avg_sleep_hours: number | null;
  mood_score: number | null;
  notes: string | null;
};

function fmtDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function CheckInClient() {
  const [entries, setEntries] = useState<CheckinRow[]>([]);
  const [checkinDate, setCheckinDate] = useState(new Date().toISOString().slice(0, 10));
  const [weightKg, setWeightKg] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [sleep, setSleep] = useState("");
  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadEntries() {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No signed-in user found.");

    const { data, error: loadError } = await supabase
      .from("body_checkins")
      .select("id, checkin_date, weight_kg, body_fat_percentage, avg_sleep_hours, mood_score, notes")
      .eq("user_id", user.id)
      .order("checkin_date", { ascending: false })
      .limit(12);

    if (loadError) throw loadError;
    setEntries(data ?? []);
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError("Add Supabase keys to load check-ins.");
      return;
    }

    loadEntries().catch((loadError) => {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load check-ins.",
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

      const { error: insertError } = await supabase.from("body_checkins").insert({
        user_id: user.id,
        checkin_date: checkinDate,
        weight_kg: weightKg ? Number(weightKg) : null,
        body_fat_percentage: bodyFat ? Number(bodyFat) : null,
        avg_sleep_hours: sleep ? Number(sleep) : null,
        mood_score: mood ? Number(mood) : null,
        notes: notes || null,
      });

      if (insertError) throw insertError;

      setStatus("Check-in recorded.");
      setWeightKg("");
      setBodyFat("");
      setSleep("");
      setMood("");
      setNotes("");
      await loadEntries();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save check-in.",
      );
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="forge-panel p-6">
        <div className="forge-kicker text-[10px] text-[var(--forge-red)]">
          Check-In
        </div>
        <h2 className="mt-4 text-4xl font-[family-name:var(--font-archivo-black)] leading-none text-[var(--forge-white)]">
          Daily Body Snapshot
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--forge-silver)]">
          Capture weight, sleep, body fat, and mood so the overview reflects real
          changes instead of guesswork.
        </p>

        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
          <input className="forge-input" type="date" value={checkinDate} onChange={(event) => setCheckinDate(event.target.value)} />
          <div className="grid gap-4 md:grid-cols-2">
            <input className="forge-input" placeholder="Weight (kg)" value={weightKg} onChange={(event) => setWeightKg(event.target.value)} type="number" step="0.1" />
            <input className="forge-input" placeholder="Body fat %" value={bodyFat} onChange={(event) => setBodyFat(event.target.value)} type="number" step="0.1" />
            <input className="forge-input" placeholder="Avg sleep hours" value={sleep} onChange={(event) => setSleep(event.target.value)} type="number" step="0.1" />
            <input className="forge-input" placeholder="Mood score (1-10)" value={mood} onChange={(event) => setMood(event.target.value)} type="number" min="1" max="10" />
          </div>
          <textarea className="forge-textarea min-h-28" placeholder="Notes, cravings, soreness, or recovery flags" value={notes} onChange={(event) => setNotes(event.target.value)} />
          {status ? <div className="border border-[rgba(20,160,64,0.3)] bg-[rgba(20,160,64,0.08)] px-4 py-3 text-sm text-[var(--forge-green)]">{status}</div> : null}
          {error ? <div className="border border-[rgba(209,10,38,0.3)] bg-[rgba(209,10,38,0.08)] px-4 py-3 text-sm text-[var(--forge-red-bright)]">{error}</div> : null}
          <button className="forge-button px-5 py-3 text-sm" type="submit">
            Save Check-In
          </button>
        </form>
      </section>

      <section className="forge-panel overflow-hidden">
        <div className="border-b border-[var(--forge-border)] px-6 py-4">
          <div className="forge-title text-base text-[var(--forge-white)]">
            Recent Entries
          </div>
        </div>
        <div className="divide-y divide-[var(--forge-border)]">
          {entries.length > 0 ? (
            entries.map((entry) => (
              <article key={entry.id} className="px-6 py-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="forge-kicker text-[9px] text-[var(--forge-dim)]">
                      {fmtDate(entry.checkin_date)}
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-4">
                      <div className="text-3xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-white)]">
                        {entry.weight_kg ? `${Number(entry.weight_kg).toFixed(1)}kg` : "--"}
                      </div>
                      <div className="text-3xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-blue)]">
                        {entry.body_fat_percentage ? `${Number(entry.body_fat_percentage).toFixed(1)}%` : "--"}
                      </div>
                      <div className="text-3xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-gold)]">
                        {entry.avg_sleep_hours ? `${Number(entry.avg_sleep_hours).toFixed(1)}h` : "--"}
                      </div>
                      <div className="text-3xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-green)]">
                        {entry.mood_score ?? "--"}
                      </div>
                    </div>
                  </div>
                  <div className="max-w-md text-sm leading-7 text-[var(--forge-silver)]">
                    {entry.notes || "No notes attached to this check-in."}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="px-6 py-8 text-sm text-[var(--forge-silver)]">
              No body check-ins yet. Log your first one from the form.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
