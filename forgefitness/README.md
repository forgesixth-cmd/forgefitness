## ForgeFitness

ForgeFitness is a Next.js app scaffold for:

- authentication
- user profiles
- workout plans
- workout logging
- progress dashboard

The current build includes a product shell and mock-backed routes so we can
iterate on UX and architecture before wiring full persistence.

## Getting Started

1. Install dependencies if needed:

```bash
npm install
```

2. Add environment variables:

```bash
cp .env.example .env.local
```

3. Fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...
```

4. In your Supabase project, run the SQL in [supabase/migrations/20260406_initial_schema.sql](/Users/chintantejani/forgefitness/supabase/migrations/20260406_initial_schema.sql), [supabase/migrations/20260406_forge_tracking.sql](/Users/chintantejani/forgefitness/supabase/migrations/20260406_forge_tracking.sql), [supabase/migrations/20260410_nutrition_meals.sql](/Users/chintantejani/forgefitness/supabase/migrations/20260410_nutrition_meals.sql), [supabase/migrations/20260410_profile_goal_targets.sql](/Users/chintantejani/forgefitness/supabase/migrations/20260410_profile_goal_targets.sql), [supabase/migrations/20260410_estimated_body_fat.sql](/Users/chintantejani/forgefitness/supabase/migrations/20260410_estimated_body_fat.sql), and [supabase/migrations/20260410_apple_health_bridge.sql](/Users/chintantejani/forgefitness/supabase/migrations/20260410_apple_health_bridge.sql) using the SQL editor.

5. Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000` to view the app.

In production, this app is configured to run under the `/forgefitness`
subpath, so deployed routes will look like `/forgefitness/auth/sign-up`.

## App Routes

- `/` marketing landing page
- `/dashboard` dashboard overview
- `/plans` workout plans
- `/log` workout logging
- `/profile` user profile
- `/auth/sign-in` sign-in screen
- `/auth/sign-up` sign-up screen

## Next Build Steps

1. Create Supabase tables for `profiles`, `workout_plans`, `workout_sessions`, and `exercise_logs`
2. Connect auth forms to Supabase Auth
3. Replace mock dashboard/profile/workout data in `lib/mock-data.ts` with live queries
4. Add onboarding after sign-up for weekly availability and preferences
5. Add create/edit plan flows and log submission handlers

## Notes

`lib/supabase.ts` includes the typed browser client helper and throws a clear
error if the public keys are missing.

The private app shell currently uses a client-side auth gate. That keeps the
flow simple for the first integration pass, and we can move to server-side
session handling once we add SSR helpers and production auth hardening.

Apple Watch syncing is not possible directly from a web page. The current repo is now ready to receive Apple Health data in Supabase, but the final bridge still needs a small iPhone app or native wrapper that reads HealthKit and writes the synced records.

## Apple Health Sync Contract

The repo now exposes a protected sync endpoint for the future iPhone companion app:

- `POST /forgefitness/api/apple-health/sync`

Authentication:

- Send the signed-in user's Supabase access token in the `Authorization` header
- Format: `Authorization: Bearer <supabase_access_token>`

Server requirements:

- Set `SUPABASE_SERVICE_ROLE_KEY` in local and Vercel env vars

Payload shape:

```json
{
  "source": "apple_health",
  "syncStartedAt": "2026-04-10T07:30:00.000Z",
  "dailyMetrics": [
    {
      "entryDate": "2026-04-10",
      "activeEnergyBurnedKcal": 540,
      "restingEnergyBurnedKcal": 1710,
      "exerciseMinutes": 42,
      "standHours": 11,
      "stepCount": 9342,
      "distanceKm": 6.4,
      "sleepHours": 7.3
    }
  ],
  "workouts": [
    {
      "workoutExternalId": "apple-workout-123",
      "workoutType": "Traditional Strength Training",
      "source": "apple_watch",
      "startedAt": "2026-04-10T05:45:00.000Z",
      "endedAt": "2026-04-10T06:32:00.000Z",
      "durationMinutes": 47,
      "activeEnergyBurnedKcal": 312,
      "totalEnergyBurnedKcal": 360,
      "avgHeartRateBpm": 128
    }
  ],
  "sleepSessions": [
    {
      "source": "apple_watch",
      "startedAt": "2026-04-09T17:40:00.000Z",
      "endedAt": "2026-04-10T01:02:00.000Z",
      "durationHours": 7.4,
      "sleepStage": "asleep"
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "recordsImported": 3,
  "syncId": "uuid"
}
```
