alter table public.profiles
  add column if not exists height_cm numeric(6,2),
  add column if not exists current_weight_kg numeric(6,2),
  add column if not exists target_weight_kg numeric(6,2),
  add column if not exists target_days integer,
  add column if not exists daily_calorie_target numeric(8,2),
  add column if not exists daily_protein_grams numeric(8,2),
  add column if not exists daily_carbs_grams numeric(8,2),
  add column if not exists daily_fats_grams numeric(8,2),
  add column if not exists daily_calories_to_burn numeric(8,2),
  add column if not exists target_strategy_summary text,
  add column if not exists last_recommendation_at timestamptz;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    display_name,
    primary_goal,
    experience_level,
    height_cm,
    current_weight_kg,
    target_weight_kg,
    target_days
  )
  values (
    new.id,
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'primary_goal',
    new.raw_user_meta_data ->> 'experience_level',
    nullif(new.raw_user_meta_data ->> 'height_cm', '')::numeric,
    nullif(new.raw_user_meta_data ->> 'current_weight_kg', '')::numeric,
    nullif(new.raw_user_meta_data ->> 'target_weight_kg', '')::numeric,
    nullif(new.raw_user_meta_data ->> 'target_days', '')::integer
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
