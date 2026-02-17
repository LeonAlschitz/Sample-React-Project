insert into floors (id, name) values
  ('floor1', 'Floor 1'),
  ('floor2', 'Floor 2'),
  ('floor3', 'Floor 3')
on conflict (id) do nothing;

alter table devices
  add constraint devices_floor_fkey
  foreign key (floor) references floors (id);

create index devices_floor_idx on devices (floor);

alter table floors enable row level security;
alter table devices enable row level security;

create policy "Allow anon read floors"
  on floors for select to anon using (true);

create policy "Allow anon read devices"
  on devices for select to anon using (true);
