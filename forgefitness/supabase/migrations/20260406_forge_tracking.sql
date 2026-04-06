create table if not exists public.body_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_date date not null default current_date,
  weight_kg numeric(6,2),
  body_fat_percentage numeric(5,2),
  avg_sleep_hours numeric(4,2),
  steps_average integer,
  mood_score integer check (mood_score between 1 and 10),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.habit_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_key text not null,
  label text not null,
  entry_date date not null default current_date,
  completed boolean not null default true,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.nutrition_targets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  calories integer,
  protein_grams integer,
  carbs_grams integer,
  fats_grams integer,
  hydration_liters numeric(4,2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists body_checkins_user_id_idx
  on public.body_checkins (user_id, checkin_date desc);

create index if not exists habit_entries_user_id_idx
  on public.habit_entries (user_id, entry_date desc);

drop trigger if exists body_checkins_set_updated_at on public.body_checkins;
create trigger body_checkins_set_updated_at
  before update on public.body_checkins
  for each row execute procedure public.set_updated_at();

drop trigger if exists habit_entries_set_updated_at on public.habit_entries;
create trigger habit_entries_set_updated_at
  before update on public.habit_entries
  for each row execute procedure public.set_updated_at();

drop trigger if exists nutrition_targets_set_updated_at on public.nutrition_targets;
create trigger nutrition_targets_set_updated_at
  before update on public.nutrition_targets
  for each row execute procedure public.set_updated_at();

alter table public.body_checkins enable row level security;
alter table public.habit_entries enable row level security;
alter table public.nutrition_targets enable row level security;

drop policy if exists "Users can manage own body checkins" on public.body_checkins;
create policy "Users can manage own body checkins"
  on public.body_checkins
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage own habit entries" on public.habit_entries;
create policy "Users can manage own habit entries"
  on public.habit_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage own nutrition targets" on public.nutrition_targets;
create policy "Users can manage own nutrition targets"
  on public.nutrition_targets
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
