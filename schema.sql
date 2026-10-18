create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  sender_name text not null,
  note text not null,
  image_path text not null,
  status text not null default 'pending' check (status in ('pending','replied')),
  reply text,
  replied_at timestamptz
);

-- RLS on with no policies: only the server (service role key) can touch the data.
alter table submissions enable row level security;

-- Private bucket: images are only visible through short-lived signed links.
insert into storage.buckets (id, name, public)
values ('prescriptions', 'prescriptions', false)
on conflict (id) do nothing;
