#!/usr/bin/env node
/* ==========================================================================
   AgriVision – set your live domain everywhere in one command
   --------------------------------------------------------------------------
   The SEO files (canonical URLs, Open Graph, robots.txt, sitemap.xml) ship
   with the placeholder domain https://example.com so that nothing in the
   repository pretends to know where the site will live.

   Once you know your address, run:

     npm run set-domain -- https://your-real-domain.com

   ...and every placeholder is rewritten. Run it again with a different
   address (or with no argument to see the current value) at any time.
   ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PLACEHOLDER = 'https://example.com';

const TARGETS = [
  ...fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')),
  'robots.txt',
  'sitemap.xml',
  'site.webmanifest',
  'README.md'
].filter((f) => fs.existsSync(path.join(ROOT, f)));

/** Discover the domain currently in use (placeholder or a previously set one). */
export function currentDomain() {
  const sitemap = path.join(ROOT, 'sitemap.xml');
  if (!fs.existsSync(sitemap)) return null;
  const match = /<loc>([^<]+)<\/loc>/.exec(fs.readFileSync(sitemap, 'utf8'));
  return match ? match[1].replace(/\/[^/]*$/, '') : null;
}

function normalise(input) {
  let url = input.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error(`Unsupported protocol: ${parsed.protocol}`);
  }
  return parsed.origin + (parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/+$/, ''));
}

const input = process.argv.slice(2).find((a) => !a.startsWith('-'));
const current = currentDomain();

if (!input) {
  console.log(`\n  Domain currently used in the site: ${current || 'unknown'}\n`);
  console.log('  Set a new one with:  npm run set-domain -- https://your-domain.com\n');
  process.exit(0);
}

let next;
try {
  next = normalise(input);
} catch (err) {
  console.error(`\n  "${input}" is not a valid address: ${err.message}\n`);
  process.exit(1);
}

const from = current || PLACEHOLDER;
let changed = 0;
for (const rel of TARGETS) {
  const file = path.join(ROOT, rel);
  const before = fs.readFileSync(file, 'utf8');
  const after = before.split(from).join(next);
  if (after !== before) {
    fs.writeFileSync(file, after);
    const hits = before.split(from).length - 1;
    changed += hits;
    console.log(`  updated ${rel} (${hits} reference${hits === 1 ? '' : 's'})`);
  }
}

console.log(`\n  ${changed} reference(s) rewritten from ${from} to ${next}`);
console.log('  Double-check sitemap.xml and the canonical tags, then commit.\n');
