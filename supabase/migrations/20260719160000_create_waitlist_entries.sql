create table if not exists public.waitlist_entries (
  id uuid primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  country text not null,
  occupation text not null,
  experience_level text not null,
  learning_goals text not null,
  referral_code text,
  newsletter boolean not null default true,
  terms_accepted boolean not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'waitlisted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists waitlist_entries_email_lower_unique
  on public.waitlist_entries (lower(email));

create index if not exists waitlist_entries_created_at_idx
  on public.waitlist_entries (created_at desc);

alter table public.waitlist_entries enable row level security;
