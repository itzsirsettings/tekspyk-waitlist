alter table public.learning_users
  add column if not exists phone text not null default '',
  add column if not exists country text not null default '',
  add column if not exists occupation text not null default '',
  add column if not exists "experienceLevel" text not null default '',
  add column if not exists "learningGoals" text not null default '',
  add column if not exists "referralCode" text not null default '',
  add column if not exists newsletter boolean not null default false;

alter table public.learning_users
  add constraint learning_users_registration_profile_lengths check (
    length(phone) <= 40 and length(country) <= 100 and length(occupation) <= 100 and
    length("experienceLevel") <= 100 and length("learningGoals") <= 2000 and length("referralCode") <= 50
  );
