-- ============================================================
-- RUN ONCE in Supabase SQL Editor (additive, safe, no data loss).
-- Adds: profiles (user ID + plan), access_keys (24h free keys).
-- ============================================================

-- 1) Profiles: one row per Supabase Auth user (id = auth user UUID)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  premium_until timestamptz,          -- null = not premium
  free_until timestamptz,             -- null = no active free key
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists profiles_email_idx on profiles (email);
alter table profiles enable row level security;
drop policy if exists "own profile read" on profiles;
create policy "own profile read" on profiles for select to authenticated using (auth.uid() = id);
-- No insert/update policy: users cannot change their own plan.

-- 2) Auto-create profile when a user signs in for the first time
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, lower(new.email))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3) Backfill profiles for users who already signed in with Google
insert into profiles (id, email)
select id, lower(email) from auth.users
on conflict (id) do nothing;

-- 4) Free access keys (only SHA-256 hashes are stored, never the key)
create table if not exists access_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  key_hash text not null unique,
  created_at timestamptz default now(),
  expires_at timestamptz not null,     -- key must be redeemed before this
  redeemed_at timestamptz              -- set once; makes key one-time use
);
create index if not exists access_keys_user_idx on access_keys (user_id, created_at desc);
alter table access_keys enable row level security;  -- no policies: server only

-- 5) Generate a key: max 1 per user per cooldown window (DB-enforced, race-safe)
create or replace function public.generate_access_key(
  p_user uuid, p_hash text, p_valid_hours int default 24, p_cooldown_hours int default 24
) returns timestamptz language plpgsql security definer set search_path = public as $$
declare last_at timestamptz;
begin
  perform 1 from profiles where id = p_user for update;   -- serialize requests per user
  select max(created_at) into last_at from access_keys where user_id = p_user;
  if last_at is not null and last_at > now() - make_interval(hours => p_cooldown_hours) then
    raise exception 'COOLDOWN' using errcode = 'P0001';
  end if;
  insert into access_keys (user_id, key_hash, expires_at)
  values (p_user, p_hash, now() + make_interval(hours => p_valid_hours));
  return now() + make_interval(hours => p_valid_hours);
end $$;

-- 6) Redeem a key: one-time, owner-only, atomic. Grants 24h free access.
create or replace function public.redeem_access_key(
  p_user uuid, p_hash text, p_hours int default 24
) returns timestamptz language plpgsql security definer set search_path = public as $$
declare k uuid; new_until timestamptz;
begin
  update access_keys set redeemed_at = now()
   where key_hash = p_hash and user_id = p_user
     and redeemed_at is null and expires_at > now()
  returning id into k;
  if k is null then raise exception 'INVALID_KEY' using errcode = 'P0001'; end if;

  update profiles
     set free_until = greatest(coalesce(free_until, now()), now()) + make_interval(hours => p_hours),
         updated_at = now()
   where id = p_user
  returning free_until into new_until;
  return new_until;
end $$;

-- Only the server (service role) may call these functions
revoke execute on function public.generate_access_key(uuid, text, int, int) from public, anon, authenticated;
revoke execute on function public.redeem_access_key(uuid, text, int) from public, anon, authenticated;
