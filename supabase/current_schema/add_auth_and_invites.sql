-- Migration: Add password authentication and invite-based sign up

-- 1. Add password_hash column to profiles if it doesn't already exist
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'profiles' 
    and column_name = 'password_hash'
  ) then
    alter table public.profiles add column password_hash text null;
  end if;
end $$;

-- 2. Create the invites table
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

-- 3. Configure RLS Policies
alter table public.invites enable row level security;

drop policy if exists "Allow public read access to active invites" on public.invites;
create policy "Allow public read access to active invites" on public.invites
  for select to public
  using (true);

drop policy if exists "Allow public insert and update on invites" on public.invites;
create policy "Allow public insert and update on invites" on public.invites
  for all to public
  using (true)
  with check (true);

-- 4. Seed initial default caregiver invite code
insert into public.invites (code, role, max_uses)
values ('COGNIA-CARE-2026', 'caregiver', 100)
on conflict (code) do nothing;
