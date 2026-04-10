create table if not exists public.apple_health_syncs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'apple_health',
  status text not null default 'pending',
  sync_started_at timestamptz not null default timezone('utc', now()),
  sync_completed_at timestamptz,
  records_imported integer not null default 0,
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.apple_health_daily_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  active_energy_burned_kcal numeric(8,2),
  resting_energy_burned_kcal numeric(8,2),
  exercise_minutes numeric(8,2),
  stand_hours numeric(8,2),
  step_count integer,
  distance_km numeric(8,2),
  sleep_hours numeric(6,2),
  source_payload jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, entry_date)
);

create table if not exists public.apple_health_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_external_id text,
  workout_type text not null,
  source text not null default 'apple_watch',
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes numeric(8,2),
  active_energy_burned_kcal numeric(8,2),
  total_energy_burned_kcal numeric(8,2),
  distance_km numeric(8,2),
  avg_heart_rate_bpm numeric(8,2),
  source_payload jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, workout_external_id)
);

create table if not exists public.apple_health_sleep_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'apple_watch',
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_hours numeric(6,2),
  sleep_stage text,
  source_payload jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists apple_health_syncs_user_id_idx
  on public.apple_health_syncs (user_id, sync_started_at desc);

create index if not exists apple_health_daily_metrics_user_id_idx
  on public.apple_health_daily_metrics (user_id, entry_date desc);

create index if not exists apple_health_workouts_user_id_idx
  on public.apple_health_workouts (user_id, started_at desc);

create index if not exists apple_health_sleep_sessions_user_id_idx
  on public.apple_health_sleep_sessions (user_id, started_at desc);

drop trigger if exists apple_health_syncs_set_updated_at on public.apple_health_syncs;
create trigger apple_health_syncs_set_updated_at
  before update on public.apple_health_syncs
  for each row execute function public.set_updated_at();

drop trigger if exists apple_health_daily_metrics_set_updated_at on public.apple_health_daily_metrics;
create trigger apple_health_daily_metrics_set_updated_at
  before update on public.apple_health_daily_metrics
  for each row execute function public.set_updated_at();

drop trigger if exists apple_health_workouts_set_updated_at on public.apple_health_workouts;
create trigger apple_health_workouts_set_updated_at
  before update on public.apple_health_workouts
  for each row execute function public.set_updated_at();

drop trigger if exists apple_health_sleep_sessions_set_updated_at on public.apple_health_sleep_sessions;
create trigger apple_health_sleep_sessions_set_updated_at
  before update on public.apple_health_sleep_sessions
  for each row execute function public.set_updated_at();

alter table public.apple_health_syncs enable row level security;
alter table public.apple_health_daily_metrics enable row level security;
alter table public.apple_health_workouts enable row level security;
alter table public.apple_health_sleep_sessions enable row level security;

drop policy if exists "Users can manage own apple health syncs" on public.apple_health_syncs;
create policy "Users can manage own apple health syncs"
  on public.apple_health_syncs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage own apple health daily metrics" on public.apple_health_daily_metrics;
create policy "Users can manage own apple health daily metrics"
  on public.apple_health_daily_metrics
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage own apple health workouts" on public.apple_health_workouts;
create policy "Users can manage own apple health workouts"
  on public.apple_health_workouts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage own apple health sleep sessions" on public.apple_health_sleep_sessions;
create policy "Users can manage own apple health sleep sessions"
  on public.apple_health_sleep_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
