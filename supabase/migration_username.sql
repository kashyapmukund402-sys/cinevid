-- RUN ONCE in Supabase SQL Editor AFTER the earlier migrations. Additive only.
alter table profiles add column if not exists username text;
create unique index if not exists profiles_username_key on profiles (lower(username)) where username is not null;

-- Trigger now also stores the username chosen at registration
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, username)
  values (new.id, lower(new.email), nullif(lower(new.raw_user_meta_data->>'username'), ''))
  on conflict (id) do nothing;
  return new;
end $$;
