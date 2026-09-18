/* ==========================================================================
   AgriVision – site configuration
   --------------------------------------------------------------------------
   This is the ONLY file you need to edit to make the contact form and the
   contact details live. Everything here is client-side and public by design.
   ==========================================================================

   1) SUPABASE (the contact form database)
   ---------------------------------------
   Get the two values from:  Supabase Dashboard -> Project Settings -> API

     SUPABASE_URL       ->  "Project URL"
     SUPABASE_ANON_KEY  ->  "anon" "public" key

   These two values are meant to be public / client-side (that is how Supabase
   is designed to work) — access control is enforced by the Row Level Security
   policies in supabase-schema.sql, NOT by keeping this key secret.

   NEVER put your "service_role" key here or anywhere in frontend code.
   That key bypasses Row Level Security entirely.

   Until you replace the placeholders below, the contact form fails loudly and
   politely (it tells the visitor the site is not connected yet) instead of
   silently dropping messages.

   Full walkthrough: see README.md -> "Contact form setup (Supabase)".


   2) CONTACT DETAILS (shown on contact.html)
   ------------------------------------------
   Leave a value as an empty string to hide that row — or keep the demo text.
   ========================================================================== */

window.SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
window.SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";

window.CONTACT_EMAIL = "info@agrivision.example";
window.CONTACT_PHONE = "+91 00000 00000";

/* Optional: how long the form waits for the database before giving up (ms). */
window.CONTACT_TIMEOUT_MS = 15000;
