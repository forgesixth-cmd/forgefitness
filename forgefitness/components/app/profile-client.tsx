"use client";

import { useEffect, useState } from "react";
import { BASE_PATH } from "@/lib/base-path";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

type ProfileState = {
  id: string;
  email: string;
  displayName: string;
  primaryGoal: string;
  experienceLevel: string;
  weeklyAvailability: string;
  heightCm: string;
  currentWeightKg: string;
  targetWeightKg: string;
  targetDays: string;
  dailyCalorieTarget: string;
  dailyCaloriesToBurn: string;
  dailyProtein: string;
  dailyCarbs: string;
  dailyFats: string;
  strategySummary: string;
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
        .select("id, display_name, primary_goal, experience_level, weekly_availability, height_cm, current_weight_kg, target_weight_kg, target_days, daily_calorie_target, daily_calories_to_burn, daily_protein_grams, daily_carbs_grams, daily_fats_grams, target_strategy_summary")
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
        id: user.id,
        email: user.email ?? "",
        displayName,
        primaryGoal,
        experienceLevel,
        weeklyAvailability,
        heightCm: data?.height_cm ? String(data.height_cm) : "",
        currentWeightKg: data?.current_weight_kg ? String(data.current_weight_kg) : "",
        targetWeightKg: data?.target_weight_kg ? String(data.target_weight_kg) : "",
        targetDays: data?.target_days ? String(data.target_days) : "",
        dailyCalorieTarget: data?.daily_calorie_target ? String(data.daily_calorie_target) : "",
        dailyCaloriesToBurn: data?.daily_calories_to_burn ? String(data.daily_calories_to_burn) : "",
        dailyProtein: data?.daily_protein_grams ? String(data.daily_protein_grams) : "",
        dailyCarbs: data?.daily_carbs_grams ? String(data.daily_carbs_grams) : "",
        dailyFats: data?.daily_fats_grams ? String(data.daily_fats_grams) : "",
        strategySummary: data?.target_strategy_summary || "",
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

  async function refreshAiTargets(nextProfile: ProfileState) {
    const response = await fetch(`${BASE_PATH}/api/profile/recommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentWeightKg: Number(nextProfile.currentWeightKg),
        targetWeightKg: Number(nextProfile.targetWeightKg),
        heightCm: Number(nextProfile.heightCm),
        targetDays: Number(nextProfile.targetDays),
        experienceLevel: nextProfile.experienceLevel,
      }),
    });

    const result = (await response.json()) as {
      error?: string;
      summary: string;
      daily_calories: number;
      protein_grams: number;
      carbs_grams: number;
      fats_grams: number;
      daily_calories_to_burn: number;
    };

    if (!response.ok) {
      throw new Error(result.error || "Unable to generate AI targets.");
    }

    return result;
  }

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

      const recommendation =
        profile.heightCm && profile.currentWeightKg && profile.targetWeightKg && profile.targetDays
          ? await refreshAiTargets(profile)
          : null;

      const { error: updateError } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: profile.displayName || null,
        primary_goal: profile.primaryGoal || null,
        experience_level: profile.experienceLevel || null,
        weekly_availability: profile.weeklyAvailability
          ? Number(profile.weeklyAvailability)
          : null,
        height_cm: profile.heightCm ? Number(profile.heightCm) : null,
        current_weight_kg: profile.currentWeightKg ? Number(profile.currentWeightKg) : null,
        target_weight_kg: profile.targetWeightKg ? Number(profile.targetWeightKg) : null,
        target_days: profile.targetDays ? Number(profile.targetDays) : null,
        daily_calorie_target: recommendation?.daily_calories ?? null,
        daily_calories_to_burn: recommendation?.daily_calories_to_burn ?? null,
        daily_protein_grams: recommendation?.protein_grams ?? null,
        daily_carbs_grams: recommendation?.carbs_grams ?? null,
        daily_fats_grams: recommendation?.fats_grams ?? null,
        target_strategy_summary: recommendation?.summary ?? null,
        last_recommendation_at: recommendation ? new Date().toISOString() : null,
      });

      if (updateError) throw updateError;

      setProfile((current) =>
        current
          ? {
              ...current,
              dailyCalorieTarget: recommendation ? String(recommendation.daily_calories) : current.dailyCalorieTarget,
              dailyCaloriesToBurn: recommendation ? String(recommendation.daily_calories_to_burn) : current.dailyCaloriesToBurn,
              dailyProtein: recommendation ? String(recommendation.protein_grams) : current.dailyProtein,
              dailyCarbs: recommendation ? String(recommendation.carbs_grams) : current.dailyCarbs,
              dailyFats: recommendation ? String(recommendation.fats_grams) : current.dailyFats,
              strategySummary: recommendation?.summary ?? current.strategySummary,
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
    { label: "Target weight", value: profile.targetWeightKg ? `${profile.targetWeightKg} kg` : "Not set" },
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
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Height (cm)"
              type="number"
              value={profile.heightCm}
              onChange={(event) =>
                setProfile((current) =>
                  current ? { ...current, heightCm: event.target.value } : current,
                )
              }
            />
            <input
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Current weight (kg)"
              type="number"
              step="0.1"
              value={profile.currentWeightKg}
              onChange={(event) =>
                setProfile((current) =>
                  current ? { ...current, currentWeightKg: event.target.value } : current,
                )
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Target weight (kg)"
              type="number"
              step="0.1"
              value={profile.targetWeightKg}
              onChange={(event) =>
                setProfile((current) =>
                  current ? { ...current, targetWeightKg: event.target.value } : current,
                )
              }
            />
            <input
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Target days"
              type="number"
              value={profile.targetDays}
              onChange={(event) =>
                setProfile((current) =>
                  current ? { ...current, targetDays: event.target.value } : current,
                )
              }
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
              AI target plan
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <p className="text-sm text-slate-300">
                Calories: <span className="font-semibold text-white">{profile.dailyCalorieTarget || "--"}</span>
              </p>
              <p className="text-sm text-slate-300">
                Burn target: <span className="font-semibold text-white">{profile.dailyCaloriesToBurn || "--"}</span>
              </p>
              <p className="text-sm text-slate-300">
                Protein: <span className="font-semibold text-white">{profile.dailyProtein || "--"} g</span>
              </p>
              <p className="text-sm text-slate-300">
                Carbs: <span className="font-semibold text-white">{profile.dailyCarbs || "--"} g</span>
              </p>
              <p className="text-sm text-slate-300 sm:col-span-2">
                Fats: <span className="font-semibold text-white">{profile.dailyFats || "--"} g</span>
              </p>
            </div>
            {profile.strategySummary ? (
              <p className="mt-4 text-sm leading-7 text-slate-300">
                {profile.strategySummary}
              </p>
            ) : null}
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
