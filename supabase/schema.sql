create table settings (id int primary key default 1, site_name text default 'CINE', footer text default '© All rights reserved', constraint one check (id=1));
insert into settings default values;
create table episodes (
  id uuid primary key default gen_random_uuid(),
  episode_number int unique not null,
  title text not null,
  description text default '',
  video_path text not null,
  thumbnail_path text,
  password_hash text not null,
  published boolean default false,
  published_at timestamptz default now(),
  prev_episode int, next_episode int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table episodes enable row level security;  -- no policies: only the server (service role) can read/write
alter table settings enable row level security;
insert into storage.buckets (id,name,public) values ('videos','videos',false),('thumbnails','thumbnails',true) on conflict do nothing;

create table video_requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  reference_link text default '',
  status text not null default 'pending' check (status in ('pending','reviewing','approved','rejected','completed')),
  admin_response text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table video_requests enable row level security;  -- only the server (service role) reads/writes
