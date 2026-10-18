-- Run this ONCE in Supabase SQL Editor (don't re-run schema.sql).
create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  type text not null default 'view' check (type in ('view','unlock')),
  episode_number int,
  created_at timestamptz default now()
);
alter table page_views enable row level security;
create index if not exists page_views_created_idx on page_views (created_at);
create index if not exists page_views_episode_idx on page_views (episode_number);
