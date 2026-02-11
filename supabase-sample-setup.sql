-- Run this in the Supabase Dashboard: SQL Editor → New query → paste and Run

-- Sample table
create table if not exists sample_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- Allow anonymous read (so your app can fetch without auth)
alter table sample_items enable row level security;

create policy "Allow anon read"
  on sample_items for select
  to anon
  using (true);

-- Seed a few rows
insert into sample_items (name, description) values
  ('First item', 'Created from Supabase SQL'),
  ('Second item', 'Sample data for your app'),
  ('Third item', 'You can edit this in Table Editor');