-- Victory Academy / TC-Podcast Schema
-- Run this in Supabase SQL Editor

-- Episodes table
create table if not exists episodes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  episode_number integer,
  category text default 'General',
  audio_url text not null,
  duration text,
  published boolean default true,
  created_at timestamptz default now()
);

-- Quotes table (for admin-managed quotes)
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  author text default 'Victor Simz — Take Command',
  category text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Allow public read access to published episodes
alter table episodes enable row level security;
create policy "Public can read published episodes"
  on episodes for select
  using (published = true);

-- Allow public read access to active quotes
alter table quotes enable row level security;
create policy "Public can read active quotes"
  on quotes for select
  using (active = true);

-- Storage bucket for audio files
insert into storage.buckets (id, name, public)
values ('podcast-audio', 'podcast-audio', true)
on conflict do nothing;

-- Allow public to read audio files
create policy "Public audio access"
  on storage.objects for select
  using (bucket_id = 'podcast-audio');

-- Allow authenticated uploads (admin)
create policy "Admin can upload audio"
  on storage.objects for insert
  with check (bucket_id = 'podcast-audio');

create policy "Admin can delete audio"
  on storage.objects for delete
  using (bucket_id = 'podcast-audio');
