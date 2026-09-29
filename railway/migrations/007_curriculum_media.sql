alter table public.learning_classes
  add column if not exists subject text not null default 'Digital skills'
    check (length(subject) between 2 and 100),
  add column if not exists level text not null default 'Beginner'
    check (length(level) between 2 and 80),
  add column if not exists illustration_url text;

alter table public.learning_lessons
  add column if not exists topic text not null default 'Getting started'
    check (length(topic) between 2 and 120),
  add column if not exists subtopic text not null default ''
    check (length(subtopic) <= 160);

update public.learning_classes
set subject = 'AI Engineering', level = 'Beginner'
where slug = 'ai-foundations';

update public.learning_lessons l
set topic = case l.position
    when 0 then 'Product discovery'
    when 1 then 'AI development'
    when 2 then 'Prompt engineering'
    when 3 then 'AI-assisted workflows'
    when 4 then 'Evaluation and testing'
    when 5 then 'Responsible release'
    when 6 then 'Deployment'
    when 7 then 'Operations and support'
    when 8 then 'Monitoring and improvement'
    else 'AI engineering foundations'
  end,
  subtopic = case l.position
    when 0 then 'Problem statements and acceptance criteria'
    when 1 then 'Language models and their limits'
    when 2 then 'Instructions, context, and output format'
    when 3 then 'Human review and useful automation'
    when 4 then 'Test cases, criteria, and failure patterns'
    when 5 then 'Limitations, privacy, and human oversight'
    when 6 then 'Environment checks and release verification'
    when 7 then 'Failure response and user feedback'
    when 8 then 'Signals, outcomes, and iteration'
    else ''
  end
from public.learning_classes c
where l.class_id = c.id and c.slug = 'ai-foundations';

create table if not exists public.learning_media (
  id uuid primary key,
  class_id uuid not null references public.learning_classes(id) on delete cascade,
  lesson_id uuid references public.learning_lessons(id) on delete cascade,
  storage_key text not null unique,
  original_name text not null check (length(original_name) between 1 and 240),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm')),
  byte_size bigint not null check (byte_size between 1 and 67108864),
  alt_text text not null default '' check (length(alt_text) <= 300),
  created_at timestamptz not null default now()
);
create index if not exists learning_media_class_idx on public.learning_media (class_id, created_at desc);
create index if not exists learning_media_lesson_idx on public.learning_media (lesson_id, created_at);

grant select, insert, update, delete on public.learning_media to tekspyk_app;
