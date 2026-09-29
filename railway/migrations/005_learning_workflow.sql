create table if not exists public.learning_classes (
  id uuid primary key,
  slug text not null unique,
  title text not null check (length(title) between 3 and 140),
  description text not null check (length(description) between 10 and 2000),
  instructor_id text not null references public.learning_users(id),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);
create index if not exists learning_classes_instructor_idx on public.learning_classes (instructor_id);

create table if not exists public.learning_lessons (
  id uuid primary key,
  class_id uuid not null references public.learning_classes(id),
  title text not null check (length(title) between 3 and 140),
  content text not null check (length(content) between 50 and 50000),
  position integer not null check (position >= 0),
  published boolean not null default true,
  created_at timestamptz not null default now(),
  unique (class_id, position)
);

create table if not exists public.learning_assignments (
  id uuid primary key,
  lesson_id uuid not null unique references public.learning_lessons(id),
  kind text not null check (kind in ('written', 'quiz')),
  prompt text not null check (length(prompt) between 10 and 5000),
  questions jsonb not null default '[]'::jsonb check (jsonb_typeof(questions) = 'array'),
  created_at timestamptz not null default now()
);

create table if not exists public.learning_enrollments (
  user_id text not null references public.learning_users(id),
  class_id uuid not null references public.learning_classes(id),
  created_at timestamptz not null default now(),
  primary key (user_id, class_id)
);
create index if not exists learning_enrollments_class_idx on public.learning_enrollments (class_id);

create table if not exists public.learning_progress (
  user_id text not null references public.learning_users(id),
  lesson_id uuid not null references public.learning_lessons(id),
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.learning_submissions (
  id uuid primary key,
  assignment_id uuid not null references public.learning_assignments(id),
  user_id text not null references public.learning_users(id),
  body text not null default '' check (length(body) <= 20000),
  answers jsonb not null default '[]'::jsonb check (jsonb_typeof(answers) = 'array'),
  auto_score integer check (auto_score between 0 and 100),
  grade integer check (grade between 0 and 100),
  feedback text not null default '' check (length(feedback) <= 5000),
  grading_source text check (grading_source in ('automatic', 'teacher')),
  graded_by text references public.learning_users(id),
  version integer not null default 1 check (version > 0),
  submitted_at timestamptz not null default now(),
  graded_at timestamptz,
  unique (assignment_id, user_id),
  check ((grade is null and grading_source is null and graded_at is null) or
    (grade is not null and grading_source is not null and graded_at is not null))
);
create index if not exists learning_submissions_user_idx on public.learning_submissions (user_id, submitted_at desc);

create table if not exists public.learning_audit (
  id uuid primary key,
  actor_id text,
  action text not null,
  resource_id text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists learning_audit_resource_idx on public.learning_audit (resource_id, created_at desc);
