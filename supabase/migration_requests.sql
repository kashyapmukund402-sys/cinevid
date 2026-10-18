-- Run this ONCE in Supabase SQL Editor if your project already exists (don't re-run schema.sql).
create table if not exists video_requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  reference_link text default '',
  status text not null default 'pending' check (status in ('pending','reviewing','approved','rejected','completed')),
  admin_response text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table video_requests enable row level security;
