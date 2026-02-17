create table devices (
  id text not null,
  floor text not null,
  name text,
  type text,
  status text,
  location text,
  ip_address text,
  subnet text,
  subnet_label text,
  cpu_usage numeric,
  memory_usage numeric,
  uptime numeric,
  last_seen timestamptz,
  tags jsonb default '[]',
  connected_to jsonb default '[]',
  primary key (id, floor)
);
