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

4. In your Supabase project, run the SQL in [supabase/migrations/20260406_initial_schema.sql](/Users/chintantejani/forgefitness/supabase/migrations/20260406_initial_schema.sql), [supabase/migrations/20260406_forge_tracking.sql](/Users/chintantejani/forgefitness/supabase/migrations/20260406_forge_tracking.sql), [supabase/migrations/20260410_nutrition_meals.sql](/Users/chintantejani/forgefitness/supabase/migrations/20260410_nutrition_meals.sql), and [supabase/migrations/20260410_profile_goal_targets.sql](/Users/chintantejani/forgefitness/supabase/migrations/20260410_profile_goal_targets.sql) using the SQL editor.

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
