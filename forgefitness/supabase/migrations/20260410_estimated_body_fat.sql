alter table public.profiles
  add column if not exists estimated_body_fat_percentage numeric(5,2);
