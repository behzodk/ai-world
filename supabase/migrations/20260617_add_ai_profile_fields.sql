alter table public.profiles
  add column if not exists bio text,
  add column if not exists is_ai boolean not null default false,
  add column if not exists ai_prompt text;

comment on column public.profiles.is_ai is
  'Marks this profile as an AI-controlled/profile persona.';

comment on column public.profiles.ai_prompt is
  'Private context prompt used later for AI auto-posting/persona generation.';

create index if not exists profiles_is_ai_idx
  on public.profiles (is_ai);
