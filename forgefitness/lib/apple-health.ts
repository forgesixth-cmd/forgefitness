export type AppleHealthDailyMetricInput = {
  entryDate: string;
  activeEnergyBurnedKcal?: number;
  restingEnergyBurnedKcal?: number;
  exerciseMinutes?: number;
  standHours?: number;
  stepCount?: number;
  distanceKm?: number;
  sleepHours?: number;
  sourcePayload?: unknown;
};

export type AppleHealthWorkoutInput = {
  workoutExternalId?: string;
  workoutType: string;
  source?: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes?: number;
  activeEnergyBurnedKcal?: number;
  totalEnergyBurnedKcal?: number;
  distanceKm?: number;
  avgHeartRateBpm?: number;
  sourcePayload?: unknown;
};

export type AppleHealthSleepSessionInput = {
  source?: string;
  startedAt: string;
  endedAt: string;
  durationHours?: number;
  sleepStage?: string;
  sourcePayload?: unknown;
};

export type AppleHealthSyncPayload = {
  source?: string;
  syncStartedAt?: string;
  dailyMetrics?: AppleHealthDailyMetricInput[];
  workouts?: AppleHealthWorkoutInput[];
  sleepSessions?: AppleHealthSleepSessionInput[];
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function toOptionalNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function toOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

