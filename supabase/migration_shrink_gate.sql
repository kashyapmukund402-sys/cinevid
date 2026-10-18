-- RUN ONCE in Supabase SQL Editor AFTER migration_access.sql. Additive only.

-- Admin-configurable settings (uses the existing single-row settings table)
alter table settings add column if not exists shrink_url text default '';
alter table settings add column if not exists free_cooldown_hours int default 24;

-- Shrink Earn tasks. One user, many tasks over time, each must be admin-verified.
create table if not exists free_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'started'
    check (status in ('started','returned','verified','rejected','claimed')),
  created_at timestamptz default now(),
  returned_at timestamptz,
  verified_at timestamptz,
  verified_by text,
  claimed_at timestamptz
);
create index if not exists free_tasks_user_idx on free_tasks (user_id, created_at desc);
create index if not exists free_tasks_status_idx on free_tasks (status, created_at);
alter table free_tasks enable row level security;   -- server only

-- Link each key to the task that earned it (a task can produce only one key)
alter table access_keys add column if not exists task_id uuid unique references free_tasks(id);

-- Audit trail for admin actions
create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_label text not null,
  action text not null,
  target_user_id uuid,
  related_id uuid,
  created_at timestamptz default now()
);
alter table admin_audit_logs enable row level security;  -- server only

-- Remove the old direct key generator (the bypass path)
drop function if exists public.generate_access_key(uuid, text, int, int);

-- Issue a key ONLY for a verified, unclaimed task owned by this user.
-- Enforces cooldown after the previous free access ends, and one pending key at a time.
create or replace function public.issue_free_key(
  p_user uuid, p_task uuid, p_hash text, p_cooldown_hours int, p_valid_hours int default 24
) returns timestamptz language plpgsql security definer set search_path = public as $$
declare t_status text; prof_free timestamptz; until_ts timestamptz; exp timestamptz;
begin
  perform 1 from profiles where id = p_user for update;             -- serialize per user
  select status into t_status from free_tasks where id = p_task and user_id = p_user for update;
  if t_status is null or t_status <> 'verified' then
    raise exception 'TASK_NOT_VERIFIED' using errcode = 'P0001';
  end if;
  if exists (select 1 from access_keys where user_id = p_user and redeemed_at is null and expires_at > now()) then
    raise exception 'KEY_PENDING' using errcode = 'P0001';
  end if;
  select free_until into prof_free from profiles where id = p_user;
  if prof_free is not null then
    until_ts := prof_free + make_interval(hours => p_cooldown_hours);
    if now() < until_ts then raise exception 'COOLDOWN|%', until_ts::text using errcode = 'P0001'; end if;
  end if;
  update free_tasks set status = 'claimed', claimed_at = now() where id = p_task;
  exp := now() + make_interval(hours => p_valid_hours);
  insert into access_keys (user_id, key_hash, expires_at, task_id) values (p_user, p_hash, exp, p_task);
  return exp;
end $$;
revoke execute on function public.issue_free_key(uuid, uuid, text, int, int) from public, anon, authenticated;
