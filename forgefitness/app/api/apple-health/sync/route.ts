import { NextResponse } from "next/server";
import type { Json } from "@/lib/database.types";
import {
  isRecord,
  toOptionalNumber,
  toOptionalString,
  type AppleHealthSyncPayload,
} from "@/lib/apple-health";
import {
  getSupabaseServerAuthClient,
  getSupabaseServiceRoleClient,
} from "@/lib/supabase-server";

function toJsonValue(value: unknown): Json | null {
  if (value === undefined) return null;
  return JSON.parse(JSON.stringify(value)) as Json;
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  return authorization.slice("Bearer ".length).trim();
}

function normalizePayload(body: unknown): AppleHealthSyncPayload {
  if (!isRecord(body)) {
    throw new Error("Sync payload must be a JSON object.");
  }

  return {
    source: toOptionalString(body.source) ?? "apple_health",
    syncStartedAt: toOptionalString(body.syncStartedAt),
    dailyMetrics: Array.isArray(body.dailyMetrics)
      ? body.dailyMetrics
          .filter(isRecord)
          .map((entry) => ({
            entryDate: toOptionalString(entry.entryDate) ?? "",
            activeEnergyBurnedKcal: toOptionalNumber(entry.activeEnergyBurnedKcal),
            restingEnergyBurnedKcal: toOptionalNumber(entry.restingEnergyBurnedKcal),
            exerciseMinutes: toOptionalNumber(entry.exerciseMinutes),
            standHours: toOptionalNumber(entry.standHours),
            stepCount: toOptionalNumber(entry.stepCount),
            distanceKm: toOptionalNumber(entry.distanceKm),
            sleepHours: toOptionalNumber(entry.sleepHours),
            sourcePayload: entry.sourcePayload,
          }))
          .filter((entry) => entry.entryDate)
      : [],
    workouts: Array.isArray(body.workouts)
      ? body.workouts
          .filter(isRecord)
          .map((entry) => ({
            workoutExternalId: toOptionalString(entry.workoutExternalId),
            workoutType: toOptionalString(entry.workoutType) ?? "Workout",
            source: toOptionalString(entry.source) ?? "apple_watch",
            startedAt: toOptionalString(entry.startedAt) ?? "",
            endedAt: toOptionalString(entry.endedAt),
            durationMinutes: toOptionalNumber(entry.durationMinutes),
            activeEnergyBurnedKcal: toOptionalNumber(entry.activeEnergyBurnedKcal),
            totalEnergyBurnedKcal: toOptionalNumber(entry.totalEnergyBurnedKcal),
            distanceKm: toOptionalNumber(entry.distanceKm),
            avgHeartRateBpm: toOptionalNumber(entry.avgHeartRateBpm),
            sourcePayload: entry.sourcePayload,
          }))
          .filter((entry) => entry.startedAt)
      : [],
    sleepSessions: Array.isArray(body.sleepSessions)
      ? body.sleepSessions
          .filter(isRecord)
          .map((entry) => ({
            source: toOptionalString(entry.source) ?? "apple_watch",
            startedAt: toOptionalString(entry.startedAt) ?? "",
            endedAt: toOptionalString(entry.endedAt) ?? "",
            durationHours: toOptionalNumber(entry.durationHours),
            sleepStage: toOptionalString(entry.sleepStage),
            sourcePayload: entry.sourcePayload,
          }))
          .filter((entry) => entry.startedAt && entry.endedAt)
      : [],
  };
}

export async function POST(request: Request) {
  const bearerToken = getBearerToken(request);

  if (!bearerToken) {
    return NextResponse.json(
      { error: "Missing Authorization bearer token." },
      { status: 401 },
    );
  }

  try {
    const authClient = getSupabaseServerAuthClient();
    const serviceClient = getSupabaseServiceRoleClient();

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(bearerToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid Supabase access token." },
        { status: 401 },
      );
    }

    const payload = normalizePayload(await request.json());

    const { data: syncRow, error: syncInsertError } = await serviceClient
      .from("apple_health_syncs")
      .insert({
        user_id: user.id,
        source: payload.source ?? "apple_health",
        status: "processing",
        sync_started_at: payload.syncStartedAt ?? new Date().toISOString(),
      })
      .select("id")
      .single();

    if (syncInsertError || !syncRow) {
      throw syncInsertError ?? new Error("Unable to create sync record.");
    }

    const totalRecords =
      (payload.dailyMetrics?.length ?? 0) +
      (payload.workouts?.length ?? 0) +
      (payload.sleepSessions?.length ?? 0);

    try {
      if (payload.dailyMetrics?.length) {
        const { error } = await serviceClient.from("apple_health_daily_metrics").upsert(
          payload.dailyMetrics.map((entry) => ({
            user_id: user.id,
            entry_date: entry.entryDate,
            active_energy_burned_kcal: entry.activeEnergyBurnedKcal ?? null,
            resting_energy_burned_kcal: entry.restingEnergyBurnedKcal ?? null,
            exercise_minutes: entry.exerciseMinutes ?? null,
            stand_hours: entry.standHours ?? null,
            step_count: entry.stepCount ? Math.round(entry.stepCount) : null,
            distance_km: entry.distanceKm ?? null,
            sleep_hours: entry.sleepHours ?? null,
            source_payload: toJsonValue(entry.sourcePayload),
          })),
          { onConflict: "user_id,entry_date" },
        );

        if (error) throw error;
      }

      if (payload.workouts?.length) {
        const { error } = await serviceClient.from("apple_health_workouts").upsert(
          payload.workouts.map((entry) => ({
            user_id: user.id,
            workout_external_id: entry.workoutExternalId ?? null,
            workout_type: entry.workoutType,
            source: entry.source ?? "apple_watch",
            started_at: entry.startedAt,
            ended_at: entry.endedAt ?? null,
            duration_minutes: entry.durationMinutes ?? null,
            active_energy_burned_kcal: entry.activeEnergyBurnedKcal ?? null,
            total_energy_burned_kcal: entry.totalEnergyBurnedKcal ?? null,
            distance_km: entry.distanceKm ?? null,
            avg_heart_rate_bpm: entry.avgHeartRateBpm ?? null,
            source_payload: toJsonValue(entry.sourcePayload),
          })),
          { onConflict: "user_id,workout_external_id" },
        );

        if (error) throw error;
      }

      if (payload.sleepSessions?.length) {
        const { error } = await serviceClient.from("apple_health_sleep_sessions").insert(
          payload.sleepSessions.map((entry) => ({
            user_id: user.id,
            source: entry.source ?? "apple_watch",
            started_at: entry.startedAt,
            ended_at: entry.endedAt,
            duration_hours: entry.durationHours ?? null,
            sleep_stage: entry.sleepStage ?? null,
            source_payload: toJsonValue(entry.sourcePayload),
          })),
        );

        if (error) throw error;
      }

      await serviceClient
        .from("apple_health_syncs")
        .update({
          status: "completed",
          sync_completed_at: new Date().toISOString(),
          records_imported: totalRecords,
        })
        .eq("id", syncRow.id);

      return NextResponse.json({
        success: true,
        recordsImported: totalRecords,
        syncId: syncRow.id,
      });
    } catch (syncError) {
      await serviceClient
        .from("apple_health_syncs")
        .update({
          status: "failed",
          sync_completed_at: new Date().toISOString(),
          error_message:
            syncError instanceof Error ? syncError.message : "Apple Health sync failed.",
        })
        .eq("id", syncRow.id);

      throw syncError;
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to sync Apple Health data.",
      },
      { status: 500 },
    );
  }
}
