create extension if not exists postgis;

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  place text not null check (char_length(place) between 1 and 40),
  title text not null check (char_length(title) between 1 and 60),
  story text not null check (char_length(story) between 1 and 500),
  nickname text not null check (char_length(nickname) between 1 and 20),
  youtube_id text not null check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  latitude double precision not null check (latitude between 37.5585 and 37.572),
  longitude double precision not null check (longitude between 126.928 and 126.947),
  color text not null default '#6550d8',
  status text not null default 'published' check (status in ('published', 'hidden')),
  location geography(point, 4326)
    generated always as (
      st_setsrid(st_makepoint(longitude, latitude), 4326)::geography
    ) stored,
  created_at timestamptz not null default now()
);

create index if not exists stories_location_gix
  on public.stories using gist (location);
create index if not exists stories_status_created_idx
  on public.stories (status, created_at desc);

alter table public.stories enable row level security;

drop policy if exists "Published stories are public" on public.stories;
create policy "Published stories are public"
  on public.stories for select
  to anon, authenticated
  using (status = 'published');

create or replace function public.nearby_stories(
  user_lat double precision,
  user_lng double precision,
  radius_m integer default 50
)
returns setof public.stories
language sql
stable
security invoker
set search_path = public
as $$
  select *
  from public.stories
  where status = 'published'
    and st_dwithin(
      location,
      st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography,
      greatest(20, least(radius_m, 500))
    )
  order by st_distance(
    location,
    st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography
  );
$$;

grant execute on function public.nearby_stories(double precision, double precision, integer)
  to anon, authenticated;
