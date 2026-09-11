create table if not exists public.invites (
  id uuid not null default gen_random_uuid(),
  code text not null,
  role text not null check (role in ('caregiver', 'patient')),
  created_by uuid references public.profiles(id) on delete set null,
  patient_id uuid references public.profiles(id) on delete set null,
  max_uses integer not null default 1,
  uses integer not null default 0,
  expires_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  constraint invites_pkey primary key (id),
  constraint invites_code_key unique (code)
) TABLESPACE pg_default;

-- Enable RLS and permissive policy for app usage with anon key
alter table public.invites enable row level security;

create policy "Allow public read access to active invites" on public.invites
  for select to public
  using (true);

create policy "Allow public insert and update on invites" on public.invites
  for all to public
  using (true)
  with check (true);

-- Seed initial bootstrap invite code for caregiver sign up
insert into public.invites (code, role, max_uses)
values ('COGNIA-CARE-2026', 'caregiver', 100)
on conflict (code) do nothing;
