/*
  Supabase project configuration.
  ------------------------------------------------------------
  Fill these in with your own project's values from:
  Supabase Dashboard -> Project Settings -> API

  SUPABASE_URL       -> "Project URL"
  SUPABASE_ANON_KEY   -> "anon" "public" key

  These two values are meant to be public / client-side (that is how
  Supabase is designed to work) — access control is enforced by the
  Row Level Security policies in supabase-schema.sql, NOT by keeping
  this key secret. NEVER put your "service_role" key here or anywhere
  in frontend code — that key bypasses RLS entirely.
*/
window.SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
window.SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";
