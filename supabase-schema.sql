-- Run this once in the Supabase SQL editor for your project.

create table if not exists public.contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  subject     text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

-- Basic sanity constraints matching the frontend validation
alter table public.contact_submissions
  add constraint contact_submissions_name_len check (char_length(trim(name)) >= 2),
  add constraint contact_submissions_message_len check (char_length(trim(message)) >= 10),
  add constraint contact_submissions_email_format check (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$');

-- Lock the table down: RLS on, nothing allowed by default.
alter table public.contact_submissions enable row level security;

-- The public website may INSERT a new message (that's the contact form)...
create policy "Anyone can submit a contact message"
  on public.contact_submissions
  for insert
  to anon
  with check (true);

-- ...but may NOT read, update, or delete any submissions (including their own or
-- other people's). There is no admin UI in this project, so submissions are
-- meant to be viewed from the Supabase Table Editor / dashboard directly,
-- using your account's own access, not the public anon key.
-- (No select/update/delete policies are created for `anon`, so those
-- operations are denied by default once RLS is enabled.)
