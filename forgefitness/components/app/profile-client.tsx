"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

type ProfileState = {
  email: string;
  displayName: string;
  primaryGoal: string;
  experienceLevel: string;
  weeklyAvailability: string;
  initials: string;
};

function toInitials(name: string, email: string) {
  if (name.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }

  return email.slice(0, 2).toUpperCase();
}

export function ProfileClient() {
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadProfile() {
    if (!isSupabaseConfigured) {
      setError("Add your Supabase keys to load profile data.");
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

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("display_name, primary_goal, experience_level, weekly_availability")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const displayName =
        data?.display_name || (user.user_metadata.display_name as string | undefined) || "";
      const primaryGoal =
        data?.primary_goal || (user.user_metadata.primary_goal as string | undefined) || "";
      const experienceLevel =
        data?.experience_level ||
        (user.user_metadata.experience_level as string | undefined) ||
        "";
      const weeklyAvailability =
        data?.weekly_availability !== null && data?.weekly_availability !== undefined
          ? String(data.weekly_availability)
          : "";

      setProfile({
        email: user.email ?? "",
        displayName,
        primaryGoal,
        experienceLevel,
        weeklyAvailability,
        initials: toInitials(displayName, user.email ?? "FF"),
      });
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load profile.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;

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

      const { error: updateError } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: profile.displayName || null,
        primary_goal: profile.primaryGoal || null,
        experience_level: profile.experienceLevel || null,
        weekly_availability: profile.weeklyAvailability
          ? Number(profile.weeklyAvailability)
          : null,
      });

      if (updateError) throw updateError;

      setProfile((current) =>
        current
          ? {
              ...current,
              initials: toInitials(current.displayName, current.email),
            }
          : current,
      );
      setStatus("Profile updated.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to update profile.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-rose-700 shadow-sm">
        {error ?? "Unable to load profile."}
      </div>
    );
  }

  const stats = [
    { label: "Primary goal", value: profile.primaryGoal || "Not set" },
    { label: "Experience", value: profile.experienceLevel || "Not set" },
    {
      label: "Weekly availability",
      value: profile.weeklyAvailability
        ? `${profile.weeklyAvailability} sessions`
        : "Not set",
    },
    { label: "Preferred session length", value: "60 minutes" },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-300 text-lg font-semibold text-slate-950">
            {profile.initials}
          </div>
          <div>
            <p className="text-sm text-slate-500">Athlete profile</p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              {profile.displayName || "ForgeFitness athlete"}
            </h2>
            <p className="text-sm text-slate-600">{profile.email}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-200"
            >
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-slate-100 shadow-sm">
        <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
          Goals and preferences
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Training profile
        </h2>

        <form className="mt-6 grid gap-4" onSubmit={handleSave}>
          <input
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="Display name"
            value={profile.displayName}
            onChange={(event) =>
              setProfile((current) =>
                current
                  ? {
                      ...current,
                      displayName: event.target.value,
                    }
                  : current,
              )
            }
          />
          <input
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="Primary goal"
            value={profile.primaryGoal}
            onChange={(event) =>
              setProfile((current) =>
                current
                  ? {
                      ...current,
                      primaryGoal: event.target.value,
                    }
                  : current,
              )
            }
          />
          <input
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="Experience level"
            value={profile.experienceLevel}
            onChange={(event) =>
              setProfile((current) =>
                current
                  ? {
                      ...current,
                      experienceLevel: event.target.value,
                    }
                  : current,
              )
            }
          />
          <input
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="Weekly availability"
            type="number"
            min="1"
            max="7"
            value={profile.weeklyAvailability}
            onChange={(event) =>
              setProfile((current) =>
                current
                  ? {
                      ...current,
                      weeklyAvailability: event.target.value,
                    }
                  : current,
              )
            }
          />

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

          <button
            className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save profile"}
          </button>
        </form>
      </section>
    </div>
  );
}
