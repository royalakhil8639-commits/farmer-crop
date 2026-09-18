#!/usr/bin/env node
/* ==========================================================================
   AgriVision – static site integrity checker (zero dependencies)
   --------------------------------------------------------------------------
   Run with:  npm run check

   Catches the class of bug that is easy to introduce when editing a static
   site by hand:

     - internal links / assets that point at files that do not exist
     - in-page anchors (#section) that no longer match an id
     - duplicate id attributes
     - DOM hooks referenced by script.js that no page actually contains
     - crops referenced by the homepage "featured" list that are not in the DB
     - missing SEO / accessibility basics on any page

   Exits non-zero when an error is found, so it can gate CI.
   ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];
const notes = [];

const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

const htmlFiles = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')).sort();
if (!htmlFiles.length) {
  console.error('No HTML files found. Run this from the project root.');
  process.exit(1);
}

const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

/* --------------------------------------------------------------------------
   1. Collect ids + links per page
   -------------------------------------------------------------------------- */
const pageIds = new Map();
const pages = new Map();

for (const file of htmlFiles) {
  const html = read(file);
  pages.set(file, html);

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  pageIds.set(file, new Set(ids));

  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  for (const dup of new Set(duplicates)) err(file, `duplicate id="${dup}"`);

  /* --- links + assets ------------------------------------------------- */
  const refs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (/^(data:|mailto:|tel:|javascript:|#)/i.test(ref)) continue;
    if (/^https?:\/\//i.test(ref)) continue; // external CDN / fonts – checked separately below

    const [rawPath, hash] = ref.split('#');
    const target = rawPath.split('?')[0];
    if (target && !exists(target)) {
      err(file, `link/asset not found: ${ref}`);
    } else if (target && hash && target.endsWith('.html')) {
      const targetIds = pageIds.get(target) ?? new Set([...read(target).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
      if (!targetIds.has(hash)) warn(file, `anchor target missing: ${ref}`);
    }
  }

  /* --- page-level requirements ---------------------------------------- */
  if (!/<title>[^<]{8,}<\/title>/.test(html)) err(file, 'missing or too-short <title>');
  if (!/<html[^>]+lang="/.test(html)) err(file, '<html> is missing a lang attribute');
  if (!/<meta name="viewport"/.test(html)) err(file, 'missing viewport meta tag');
  if (!/<meta name="description" content="[^"]{40,}"/.test(html)) err(file, 'missing or too-short meta description');
  const h1s = [...html.matchAll(/<h1[^>]*>/g)].length;
  if (h1s !== 1) err(file, `expected exactly one <h1>, found ${h1s}`);
  if (!/rel="icon"/.test(html)) warn(file, 'no favicon link');
  if (!/rel="canonical"/.test(html)) warn(file, 'no canonical link');
  if (!/property="og:title"/.test(html)) warn(file, 'no Open Graph tags');
  if (!/class="skip-link"/.test(html)) warn(file, 'no skip-to-content link');
}

/* --------------------------------------------------------------------------
   2. Cross-check script.js DOM hooks against the pages that use them
   -------------------------------------------------------------------------- */
const script = read('script.js');
const hooks = new Set([...script.matchAll(/\$\('#([\w-]+)'\)/g)].map((m) => m[1]));
hooks.add('cName', 'cEmail', 'cPhone', 'cSubject', 'cMessage', 'formSuccess', 'formSuccessText');

const pagesUsingHooks = new Map();
for (const [file, html] of pages) {
  for (const hook of hooks) {
    if (html.includes(`id="${hook}"`)) pagesUsingHooks.set(hook, file);
  }
}

const expectedOnPage = {
  'index.html': ['siteHeader', 'hamburger', 'navLinks', 'featuredCrops', 'homeSearchForm', 'homeSearchInput'],
  'crops.html': ['siteHeader', 'cropGrid', 'cropSearch', 'filterChips', 'resultsCount', 'noResults'],
  'crop-details.html': ['siteHeader', 'cropDetail', 'detailCrumbs'],
  'contact.html': ['siteHeader', 'contactForm', 'cName', 'cEmail', 'cPhone', 'cSubject', 'cMessage', 'formSuccess', 'formSuccessText']
};

for (const [file, required] of Object.entries(expectedOnPage)) {
  if (!pages.has(file)) {
    err(file, 'expected page is missing from the project');
    continue;
  }
  const ids = pageIds.get(file);
  for (const id of required) {
    if (!ids.has(id)) err(file, `script.js expects #${id} on this page but it is missing`);
  }
}

/* --------------------------------------------------------------------------
   3. Crop database consistency
   -------------------------------------------------------------------------- */
const cropBlocks = [...script.matchAll(/\{\s*\n\s*id: '([\w-]+)', name: '([^']+)'/g)].map((m) => ({
  id: m[1],
  name: m[2]
}));
if (!cropBlocks.length) {
  err('script.js', 'could not parse any crops out of the CROPS array');
} else {
  notes.push(`Crop database contains ${cropBlocks.length} crops`);
  const ids = new Set(cropBlocks.map((c) => c.id));

  const featured = /var picks = \[([^\]]+)\]/.exec(script);
  if (featured) {
    for (const id of featured[1].split(',').map((s) => s.trim().replace(/['"]/g, ''))) {
      if (!ids.has(id)) err('index.html', `featured crop "${id}" is not present in the CROPS database`);
    }
  }

  const requiredFields = [
    'season', 'soil', 'water', 'duration', 'temp', 'seed', 'desc', 'c1', 'c2', 'climate',
    'sowingSeason', 'harvestSeason', 'landPrep', 'sowing', 'irrigation', 'fertilizer',
    'weed', 'pest', 'disease', 'harvest', 'storage', 'uses'
  ];
  const blocks = script.split(/\n\s{4}\{\s*\n\s*id: '/).slice(1);
  blocks.forEach((block, i) => {
    const crop = cropBlocks[i];
    if (!crop) return;
    for (const field of requiredFields) {
      if (!new RegExp(`\\b${field}:`).test(block)) {
        err('script.js', `crop "${crop.id}" is missing the "${field}" field used by crop-details.html`);
      }
    }
  });

  /* Categories used by cards must exist in the filter list */
  const categories = /var CATEGORIES = \[([^\]]+)\]/.exec(script);
  if (categories) {
    const cats = categories[1].split(',').map((s) => s.trim().replace(/['"]/g, ''));
    for (const crop of cropBlocks) {
      const match = new RegExp(`id: '${crop.id}'[\\s\\S]{0,120}?category: '([^']+)'`).exec(script);
      if (match && !cats.includes(match[1])) {
        err('script.js', `crop "${crop.id}" uses category "${match[1]}" which is not in CATEGORIES`);
      }
    }
  }
}

/* --------------------------------------------------------------------------
   4. Hard-coded numbers in the marketing copy vs. reality
   -------------------------------------------------------------------------- */
const index = pages.get('index.html') ?? '';
const statedCrops = /data-count="(\d+)"><\/?span>?[\s\S]{0,80}?Major Crops Covered/.exec(index);
const allCropsClaim = /View All (\d+) Crops/.exec(index);
for (const claim of [statedCrops && Number(statedCrops[1]), allCropsClaim && Number(allCropsClaim[1])]) {
  if (claim && claim !== cropBlocks.length) {
    warn('index.html', `page text claims ${claim} crops but the database has ${cropBlocks.length}`);
  }
}

const methodCount = (pages.get('farming.html') ?? '').match(/<h3>/g)?.length ?? 0;
const claimedMethods = /data-count="(\d+)"><\/?span>?[\s\S]{0,120}?Farming Methods/.exec(index);
if (claimedMethods && methodCount && Number(claimedMethods[1]) !== methodCount) {
  warn('index.html', `stats band claims ${claimedMethods[1]} farming methods, farming.html lists ${methodCount} headings`);
}

/* --------------------------------------------------------------------------
   5. External resources: make sure each CDN we depend on is listed once and
      clearly, so a reader knows what the site needs at runtime.
   -------------------------------------------------------------------------- */
const externalHosts = new Set();
for (const html of pages.values()) {
  for (const m of html.matchAll(/\s(?:href|src)="(https?:\/\/[^"]+)"/g)) {
    const host = new URL(m[1]).host;
    if (host === 'example.com') continue; // our own placeholder domain, not a CDN
    externalHosts.add(host);
  }
}
notes.push(`External hosts referenced: ${[...externalHosts].sort().join(', ') || 'none'}`);

/* --------------------------------------------------------------------------
   Report
   -------------------------------------------------------------------------- */
const label = (s) => s.toUpperCase().padEnd(6);
console.log('\nAgriVision site check');
console.log('='.repeat(60));
for (const note of notes) console.log(`  ${label('info')} ${note}`);
for (const w of warnings) console.log(`  ${label('warn')} ${w}`);
for (const e of errors) console.log(`  ${label('error')} ${e}`);
console.log('='.repeat(60));

if (errors.length) {
  console.log(`  ${errors.length} error(s), ${warnings.length} warning(s)\n`);
  process.exit(1);
}
console.log(`  No errors. ${warnings.length} warning(s).\n`);
