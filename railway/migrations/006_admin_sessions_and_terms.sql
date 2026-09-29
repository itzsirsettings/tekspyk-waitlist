create table if not exists public.admin_sessions (
  token_hash text primary key,
  expires_at timestamptz not null
);
create index if not exists admin_sessions_expiry_idx on public.admin_sessions (expires_at);
alter table public.learning_users add column if not exists "termsAccepted" boolean not null default false;
alter table public.learning_users add column if not exists "termsVersion" text not null default '2026-09-28';
