ALTER TABLE public.waitlist_entries
  ADD COLUMN IF NOT EXISTS adult_confirmed boolean NOT NULL DEFAULT false;
