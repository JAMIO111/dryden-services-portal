-- Change log: one row per edit (not per field), with a JSON array of the
-- individual field changes. Built for Properties/Owners/Bookings/AdHocJobs/
-- Employees; table_name + record_id are plain text so this table works for
-- any entity without a schema change per record type.
create table if not exists "ChangeLog" (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id text not null,
  -- Array of { field, label, old, new }, e.g.
  -- [{ "field": "bedrooms", "label": "Bedrooms", "old": 3, "new": 4 }]
  changes jsonb not null,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists change_log_table_record_idx
  on "ChangeLog" (table_name, record_id, created_at desc);

alter table "ChangeLog" enable row level security;

-- Matches the access model the rest of the app currently uses (no
-- per-role restrictions yet - see the standing audit note about adding a
-- real permission system). Tighten this if/when that lands.
create policy "Authenticated users can read change log"
  on "ChangeLog" for select
  to authenticated
  using (true);

create policy "Authenticated users can insert change log"
  on "ChangeLog" for insert
  to authenticated
  with check (true);
