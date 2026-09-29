create table if not exists public.learning_users (
  id text primary key,
  name text not null,
  email text not null unique,
  "emailVerified" boolean not null default false,
  image text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  role text not null default 'student' check (role in ('student', 'teacher', 'admin')),
  "adultConfirmed" boolean not null default false
);

create table if not exists public.learning_sessions (
  id text primary key,
  "expiresAt" timestamptz not null,
  token text not null unique,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text not null references public.learning_users(id) on delete cascade
);
create index if not exists learning_sessions_user_idx on public.learning_sessions ("userId");

create table if not exists public.learning_accounts (
  id text primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" text not null references public.learning_users(id) on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("providerId", "accountId")
);
create index if not exists learning_accounts_user_idx on public.learning_accounts ("userId");

create table if not exists public.learning_verifications (
  id text primary key,
  identifier text not null,
  value text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists learning_verifications_identifier_idx on public.learning_verifications (identifier);

create table if not exists public.auth_rate_limits (
  id text primary key,
  key text not null unique,
  count integer not null,
  "lastRequest" bigint not null
);
