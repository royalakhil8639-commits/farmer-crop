# AgriVision — Smart Farming & Crop Guide

A free, educational agriculture website for India: crop-by-crop cultivation guides, farming
methods, soil health, irrigation, integrated pest management and modern smart-farming
technology — in plain language, on a fast static site.

It is plain **HTML + CSS + JavaScript** with **no build step and no framework**. Open
`index.html` through any static host (or the bundled dev server) and the whole site works.

```
Crops      rice · wheat · maize · cotton · sugarcane · groundnut · soybean · tomato · chilli
           potato · onion · turmeric · pulses · millets · mango   (15 complete guides)
Topics     farming methods · soil & soil health · irrigation · IPM · modern farming
Pages      10 HTML pages + a branded 404
Backend    one optional Supabase table for the contact form (everything else is static)
```

---

## Quick start

```bash
git clone https://github.com/royalakhil8639-commits/farmer-crop.git
cd farmer-crop
npm start                 # http://localhost:4173
```

`npm start` runs `node tools/serve.mjs` — a zero-dependency static server that mirrors how
GitHub Pages / Netlify / Vercel serve the folder (clean URLs like `/crops` instead of
`/crops.html`, the branded 404 page, correct MIME types). **Node 18+ is required for the
tooling only; the site itself has no runtime dependencies.**

You can also just open `index.html` in a browser. Two things behave differently over
`file://` because browsers restrict local files: clean URLs and the custom 404 page. Use
`npm start` if you want to see exactly what visitors will see.

```bash
npm run check   # links, anchors, duplicate ids, SEO basics, crop-data consistency
npm test        # the checks above + 220 DOM smoke tests (jsdom)
```

Both run automatically in CI on every push and pull request
(`.github/workflows/ci.yml`).

---

## Project layout

```
index.html              Home: hero (3D scene), stats, featured crops, seasons, knowledge hub
crops.html              All 15 crops with live search + category filters
crop-details.html       One cultivation guide per crop, driven by ?crop=<id>
farming.html            10 farming methods, compared
soil.html               Soil types, pH, nutrients (N-P-K), organic matter, soil testing
irrigation.html         Drip, sprinkler, surface, furrow, basin, rainwater harvesting
pest-management.html    Pests, diseases and integrated pest management
modern-farming.html     Precision agriculture, drones, IoT, AI, protected cultivation
about.html              Purpose, audience, educational mission
contact.html            Validated contact form -> Supabase
404.html                Branded not-found page

style.css               All styling (design tokens, components, responsive, print, a11y)
script.js               All behaviour: crop database, rendering, search, 3D hero, form
supabase-config.js      *** the only file you must edit to go live ***
supabase-schema.sql     One-time database setup (table + Row Level Security policies)

assets/og-cover.jpg     1200x630 social share image
favicon.svg             Site icon
site.webmanifest        Installable-app metadata
robots.txt, sitemap.xml Search engine files (placeholder domain until you set yours)

tools/serve.mjs         Local dev server
tools/check-site.mjs    Static integrity checker
tools/set-domain.mjs    Replaces the example.com placeholder everywhere
test/smoke.mjs          DOM smoke tests
netlify.toml            Netlify config (redirects, headers, CSP)
vercel.json             Vercel config (clean URLs, headers, CSP)
.github/workflows/      CI + GitHub Pages deployment
```

---

## Deploying

Everything below assumes the repository is pushed to GitHub already.

### GitHub Pages (free, simplest)

1. Push to `main`.
2. Repository **Settings → Pages → Source → GitHub Actions**.
3. The `Deploy to GitHub Pages` workflow publishes the site on the next push
   (or run it manually from the **Actions** tab).

The workflow runs the checks first and only then publishes, so a broken link never ships.

### Netlify / Vercel (free tiers, custom domains, headers)

Both hosts read the config files in this repository, so there is nothing to configure in a UI:

- **Netlify** — “Add new site → Import an existing project → GitHub”, pick the repo, deploy.
  `netlify.toml` sets the publish folder, the `example.com`-free cleanup redirects, the
  security headers and the Content-Security-Policy.
- **Vercel** — “Add New → Project → Import Git Repository”, pick the repo, deploy.
  `vercel.json` enables clean URLs (`/crops` instead of `/crops.html`) and the same headers.

Both hosts serve `404.html` for unknown URLs automatically.

### After the first deploy: set your real domain

The SEO files ship with the placeholder `https://example.com` so that nothing pretends to
know where the site lives. Once you know your address:

```bash
npm run set-domain -- https://your-domain.com
```

That rewrites the canonical tags, Open Graph URLs, `robots.txt`, `sitemap.xml` and this
README in one go. Commit the result, then submit `sitemap.xml` in
[Google Search Console](https://search.google.com/search-console).

---

## Contact form setup (Supabase)

The contact form validates in the browser and inserts one row into Supabase. It is the only
part of the site that needs any setup. **Until you do this, the form shows visitors a clear
message that the site is not connected yet — it never pretends a message was sent.**

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the contents of `supabase-schema.sql`, run it.
   This creates the `contact_submissions` table, keeps Row Level Security **on**, and adds a
   single policy: *anyone may INSERT, nobody may SELECT/UPDATE/DELETE with the public key*.
3. Open **Project Settings → API** and copy two values:
   - **Project URL** → `window.SUPABASE_URL`
   - **anon / public** key → `window.SUPABASE_ANON_KEY`
4. Paste them into `supabase-config.js` (also set `CONTACT_EMAIL` / `CONTACT_PHONE`, which
   fill the contact details on `contact.html`).
5. Reload `contact.html` and send yourself a test message. Read it back in
   **Table Editor → contact_submissions**.

### Why the key is safe to publish

The anon key is designed to be public. Access control lives in the database, in the Row
Level Security policies from step 2: with the anon key a visitor can *only* insert a new
message — they cannot read anybody’s submissions, including their own. Submissions are
meant to be read by you, in the Supabase Table Editor or dashboard, using your own account.

**Never** put the `service_role` key in `supabase-config.js` or any other front-end file:
that key bypasses Row Level Security entirely.

### Spam and volume control (recommended for a public site)

The insert policy is intentionally open, because the site has no accounts. If the form
attracts spam, add either or both of these in the SQL editor:

```sql
-- 1. Cap what a single message may contain (defence in depth, mirrors the front end)
alter table public.contact_submissions
  add constraint contact_submissions_email_len check (char_length(email) <= 160),
  add constraint contact_submissions_subject_len check (char_length(subject) <= 120),
  add constraint contact_submissions_message_len_max check (char_length(message) <= 5000);

-- 2. Reject messages claiming an unrealistic name/phone length
alter table public.contact_submissions
  add constraint contact_submissions_phone_len check (char_length(coalesce(phone, '')) <= 20);
```

For heavier protection, put Cloudflare Turnstile or hCaptcha in front of the form and verify
the token in a Supabase Edge Function (a small server-side function), so the insert only
happens after the captcha passes. That is a deliberate upgrade path, not required to launch.

### Handy queries for the dashboard

```sql
-- Newest first
select * from public.contact_submissions order by created_at desc limit 50;

-- Count per week
select date_trunc('week', created_at) as week, count(*)
from public.contact_submissions group by 1 order by 1 desc;
```

---

## Editing the site

### Adding or changing a crop

Everything about crops lives in the `CROPS` array at the top of `script.js`. Copy an existing
block and edit the fields; `crops.html`, the homepage featured grid and
`crop-details.html?crop=<id>` all update automatically.

```js
{
  id: 'banana', name: 'Banana', sci: 'Musa × paradisiaca', category: 'Fruits',
  season: 'Perennial', soil: 'Deep, well-drained loam', water: 'High',
  duration: '11–14 months', temp: '20–30 °C', seed: 'Suckers / tissue-culture plants',
  desc: 'One line shown on the crop card.',
  c1: '#f6cf5a', c2: '#e0a12c',                  // card artwork gradient
  climate: '…', sowingSeason: '…', harvestSeason: '…',   // used by the fact grid
  landPrep: '…', sowing: '…', irrigation: '…', fertilizer: '…', weed: '…',
  pest: '…', disease: '…', harvest: '…', storage: '…', uses: '…'  // the 10 guide sections
}
```

Then run `npm test`: it renders **every** crop’s detail page and fails if a required field is
missing, so a half-finished entry cannot ship. If you add a new `category`, also add it to
`CATEGORIES` a few lines below the array (the checker verifies this too).

> The homepage stats band hard-codes “15 Major Crops Covered”. Update `index.html` if your
> count changes — `npm run check` warns when the page text and the database disagree.

### Changing contact details or the response-time promise

`window.CONTACT_EMAIL` and `window.CONTACT_PHONE` in `supabase-config.js` drive the
“Reach the Team” panel on `contact.html`. Set either to `""` to hide that row. The demo
values are intentional — replace them, or you will publish a placeholder address.

### Analysing traffic (optional, privacy-friendly)

No analytics are included. If you want some, add one privacy-respecting snippet
(Plausible, Fathom, Simple Analytics or a self-hosted Umami) just before `</body>` on the
pages you care about — the Content-Security-Policy in `netlify.toml` / `vercel.json` must
list that host under `script-src` or the browser will block it. Avoid heavy third-party
trackers: they cost you the “fast, free, educational” promise.

---

## What the site does with the browser

- **3D hero** (`index.html`) — a three.js farm scene, loaded from cdnjs. On phones and
  small laptops it renders a lighter scene; if WebGL is unavailable, `prefers-reduced-motion`
  is set, or the library fails to load, the animated CSS fallback stays visible and the page
  carries on. The animation loops only while the tab is visible *and* the hero is on screen.
- **Graceful degradation** — with JavaScript disabled, every page still reads end-to-end;
  only the interactive parts (crop filtering, the form) are lost, and those say so.
- **Accessibility** — skip link, landmarks, `aria-current` on navigation, labelled form
  fields, keyboard-focus styling, live regions for message banners, and reduced-motion
  support. Verified by the automated checks for structure; manual screen-reader testing is
  still worth doing before a public launch.
- **Security** — no user input is ever rendered as HTML from a URL parameter; crop ids are
  matched against the database and query strings are only used as search text. Submissions
  go straight to Supabase under an insert-only policy. The CSP in the hosting configs limits
  scripts to this site plus the three CDNs actually used.

---

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Contact form says “not connected to its database yet” | `supabase-config.js` still has the `YOUR-PROJECT-REF` placeholder — set your URL and anon key. |
| “The secure messaging library could not be loaded” | A network filter, ad-blocker or strict CSP is blocking `cdn.jsdelivr.net` (the supabase-js CDN). |
| “The database refused this message” | The insert policy is missing: re-run `supabase-schema.sql` in the Supabase SQL editor. |
| The form spins, then times out | The request never completed — usually the Supabase URL is wrong or the network dropped. `window.CONTACT_TIMEOUT_MS` (in `supabase-config.js`) controls the wait. |
| Hero is a flat illustration instead of 3D | Expected fallback: no WebGL, reduced motion, or `cdnjs.cloudflare.com` blocked. |
| Nav highlight is missing on a host with clean URLs | Already handled (`/crops` is compared by page name); if you rename a page, keep the `href` in the header in sync. |
| `npm start` reports “Port 4173 is already in use” | `npm start -- --port 4174` |
| `npm test` fails on the contact tests | The tests need a local port; ensure nothing blocks `127.0.0.1` and that Node is 18+. |

---

## Content, accuracy and licence

Every page carries a footer disclaimer, and each crop guide repeats it: this site is
**educational**. Sowing windows, varieties, doses and practices vary by region, soil and
weather, so field decisions should be confirmed with the local agriculture department or a
Krishi Vigyan Kendra (KVK).

- Text and site code: **MIT** (see `LICENSE`).
- `assets/og-cover.jpg`: illustrative image.

Contributions that fix a fact, add a crop or improve accessibility are welcome — please run
`npm test` before opening a pull request.
