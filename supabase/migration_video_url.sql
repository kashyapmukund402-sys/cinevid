-- Run this ONCE in Supabase SQL Editor (don't re-run schema.sql).
-- Adds URL-based videos. Existing episodes keep working through video_path.
alter table episodes add column if not exists video_url text;
alter table episodes alter column video_path drop not null;

-- Every episode must have either an old uploaded file or a URL.
alter table episodes drop constraint if exists episodes_video_source_check;
alter table episodes add constraint episodes_video_source_check
  check (video_path is not null or video_url is not null);
