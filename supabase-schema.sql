-- ==========================================================================
--  AgriVision – contact form database setup
--  ------------------------------------------------------------------------
--  HOW TO USE
--    1. Open your project at https://supabase.com
--    2. Go to  SQL Editor -> New query
--    3. Paste this whole file and press RUN
--
--  The script is safe to run more than once: it creates anything that is
--  missing and leaves existing data untouched.
--
--  WHAT IT CREATES
--    * public.contact_submissions  – one row per message from contact.html
--    * Sanity constraints mirroring the browser-side validation
--    * Row Level Security: the public "anon" key may INSERT a message and
--      nothing else. Nobody can read, edit or delete submissions with a key
--      that is published in the website source.
--
--  READING YOUR MESSAGES
--    Use the Supabase dashboard -> Table Editor -> contact_submissions.
--    Do NOT add a SELECT policy for "anon" unless you really mean to expose
--    every visitor's name, email and message to the whole internet.
-- ==========================================================================

-- --------------------------------------------------------------------------
-- 1. The table
-- --------------------------------------------------------------------------
create table if not exists public.contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  subject     text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

comment on table public.contact_submissions is
  'Messages sent through the AgriVision contact form (contact.html). Write-only from the website: the public anon key may insert, never read.';

comment on column public.contact_submissions.created_at is
  'When the message arrived. Submissions are read from the Supabase Table Editor or dashboard.';

-- --------------------------------------------------------------------------
-- 2. Constraints – defence in depth behind the browser-side validation.
--    Added by name so that re-running this script is harmless.
-- --------------------------------------------------------------------------
do $$
declare
  item record;
begin
  for item in
    select * from (values
      ('contact_submissions_name_len',      'char_length(trim(name)) >= 2 and char_length(trim(name)) <= 120'),
      ('contact_submissions_email_format',  'email ~* ''^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'' and char_length(email) <= 160'),
      ('contact_submissions_phone_len',     'phone is null or char_length(phone) <= 20'),
      ('contact_submissions_subject_len',   'char_length(trim(subject)) between 1 and 120'),
      ('contact_submissions_message_len',   'char_length(trim(message)) >= 10 and char_length(message) <= 5000')
    ) as t(constraint_name, expression)
  loop
    if not exists (
      select 1 from pg_constraint
      where conname = item.constraint_name
        and conrelid = 'public.contact_submissions'::regclass
    ) then
      execute format(
        'alter table public.contact_submissions add constraint %I check (%s)',
        item.constraint_name, item.expression
      );
      raise notice 'added constraint %', item.constraint_name;
    end if;
  end loop;
end $$;

-- Fast "newest first" listing in the dashboard
create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

-- --------------------------------------------------------------------------
-- 3. Privileges – the anon role needs INSERT; everything else is denied
-- --------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant insert on table public.contact_submissions to anon, authenticated;

-- --------------------------------------------------------------------------
-- 4. Row Level Security
-- --------------------------------------------------------------------------
alter table public.contact_submissions enable row level security;

-- Optional extra hardening: with FORCE, even the table owner is subject to the
-- policies. Leave it off unless you know your roles bypass RLS, otherwise the
-- dashboard can appear to show an empty table.
-- alter table public.contact_submissions force row level security;

-- The public website may INSERT a new message (that is the contact form)...
drop policy if exists "Anyone can submit a contact message" on public.contact_submissions;
create policy "Anyone can submit a contact message"
  on public.contact_submissions
  for insert
  to anon
  with check (true);

-- ...but may NOT read, update or delete anything. No SELECT / UPDATE / DELETE
-- policy is created for anon or authenticated, so those operations are denied
-- by default while RLS is enabled.
--
-- If you later add an admin dashboard that signs users in, create a policy for
-- the "authenticated" role restricted to your own account, for example:
--
--   create policy "Owners can read submissions"
--     on public.contact_submissions
--     for select
--     to authenticated
--     using ( (auth.jwt() ->> 'email') = 'you@example.com' );

-- --------------------------------------------------------------------------
-- 5. Optional housekeeping: delete messages older than a year
--    (uncomment if you want the table to stay small; run it as a cron job in
--     Supabase -> Database -> Cron Jobs, or from the SQL editor monthly)
-- --------------------------------------------------------------------------
-- delete from public.contact_submissions where created_at < now() - interval '12 months';

-- --------------------------------------------------------------------------
-- 6. Quick self-test after running the script
--    Expect: the insert succeeds, then a SELECT returns zero rows, because
--    read access is denied for the anon key. That is the intended design.
-- --------------------------------------------------------------------------
-- insert into public.contact_submissions (name, email, subject, message)
-- values ('Test', 'test@example.com', 'general', 'Checking the contact form setup.');
--
-- select * from public.contact_submissions;   -- run with RLS anon key: returns nothing
