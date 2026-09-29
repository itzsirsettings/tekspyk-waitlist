create table if not exists public.curriculum_topics (
  id text primary key,
  program text not null,
  phase_id text not null,
  topic text not null,
  status text not null default 'active' check (status in ('active', 'coming-soon', 'hidden')),
  tutor_note text,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists curriculum_topics_program_phase_idx
  on public.curriculum_topics (program, phase_id);
