create table if not exists public.nutrition_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_type text not null,
  meal_description text not null,
  ai_summary text,
  calories numeric(8,2),
  protein_grams numeric(8,2),
  carbs_grams numeric(8,2),
  fats_grams numeric(8,2),
  analysis_json jsonb,
  logged_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists nutrition_meals_user_id_idx
  on public.nutrition_meals (user_id, logged_at desc);

drop trigger if exists nutrition_meals_set_updated_at on public.nutrition_meals;
create trigger nutrition_meals_set_updated_at
  before update on public.nutrition_meals
  for each row execute procedure public.set_updated_at();

alter table public.nutrition_meals enable row level security;

drop policy if exists "Users can manage own nutrition meals" on public.nutrition_meals;
create policy "Users can manage own nutrition meals"
  on public.nutrition_meals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
