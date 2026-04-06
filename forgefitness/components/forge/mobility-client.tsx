"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

type HabitEntry = {
  id: string;
  habit_key: string;
  label: string;
  entry_date: string;
  completed: boolean;
  notes: string | null;
};

const habitOptions = [
  { key: "sugar_free", label: "Sugar-Free Day" },
  { key: "water_target", label: "Water Target" },
  { key: "mobility_block", label: "Mobility Block" },
  { key: "sleep_target", label: "Sleep Target" },
];

function streakFor(entries: HabitEntry[], habitKey: string) {
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

export function MobilityClient() {
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [habitKey, setHabitKey] = useState("mobility_block");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
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
      .from("habit_entries")
      .select("id, habit_key, label, entry_date, completed, notes")
      .eq("user_id", user.id)
      .order("entry_date", { ascending: false })
      .limit(24);

    if (loadError) throw loadError;
    setEntries(data ?? []);
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError("Add Supabase keys to load habits.");
      return;
    }

    loadEntries().catch((loadError) => {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load habits.",
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

      const selected = habitOptions.find((option) => option.key === habitKey);
      const { error: insertError } = await supabase.from("habit_entries").insert({
        user_id: user.id,
        habit_key: habitKey,
        label: selected?.label ?? habitKey,
        entry_date: entryDate,
        completed: true,
        notes: notes || null,
      });
      if (insertError) throw insertError;

      setNotes("");
      setStatus("Habit entry saved.");
      await loadEntries();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save habit entry.",
      );
    }
  }

  const habitSummaries = habitOptions.map((option) => ({
    ...option,
    streak: streakFor(entries, option.key),
  }));

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="forge-panel p-6">
        <div className="forge-kicker text-[10px] text-[var(--forge-red)]">
          Mobility
        </div>
        <h2 className="mt-4 text-4xl font-[family-name:var(--font-archivo-black)] text-[var(--forge-white)]">
          Recovery Habits
        </h2>
        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
          <select className="forge-select" value={habitKey} onChange={(event) => setHabitKey(event.target.value)}>
            {habitOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
          <input className="forge-input" type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} />
          <textarea className="forge-textarea min-h-28" placeholder="Add a mobility note, tight area, or recovery observation" value={notes} onChange={(event) => setNotes(event.target.value)} />
          {status ? <div className="border border-[rgba(20,160,64,0.3)] bg-[rgba(20,160,64,0.08)] px-4 py-3 text-sm text-[var(--forge-green)]">{status}</div> : null}
          {error ? <div className="border border-[rgba(209,10,38,0.3)] bg-[rgba(209,10,38,0.08)] px-4 py-3 text-sm text-[var(--forge-red-bright)]">{error}</div> : null}
          <button className="forge-button px-5 py-3 text-sm" type="submit">
            Record Habit
          </button>
        </form>
      </section>

      <section className="space-y-6">
        <div className="forge-panel overflow-hidden">
          <div className="border-b border-[var(--forge-border)] px-6 py-4">
            <div className="forge-title text-base text-[var(--forge-white)]">
              Streak Board
            </div>
          </div>
          <div className="grid gap-0 md:grid-cols-2">
            {habitSummaries.map((habit) => (
              <div key={habit.key} className="border-r border-t border-[var(--forge-border)] px-6 py-6 last:border-r-0">
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
        </div>

        <div className="forge-panel overflow-hidden">
          <div className="border-b border-[var(--forge-border)] px-6 py-4">
            <div className="forge-title text-base text-[var(--forge-white)]">
              Recent Recovery Notes
            </div>
          </div>
          <div className="divide-y divide-[var(--forge-border)]">
            {entries.length > 0 ? (
              entries.map((entry) => (
                <article key={entry.id} className="px-6 py-4">
                  <div className="forge-kicker text-[9px] text-[var(--forge-red)]">
                    {entry.label}
                  </div>
                  <div className="mt-2 text-sm text-[var(--forge-silver)]">
                    {entry.entry_date}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--forge-silver)]">
                    {entry.notes || "No note recorded."}
                  </p>
                </article>
              ))
            ) : (
              <div className="px-6 py-8 text-sm text-[var(--forge-silver)]">
                No recovery habit entries yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
