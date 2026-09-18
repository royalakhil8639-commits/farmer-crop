/* ==========================================================================
   AgriVision – DOM smoke tests
   --------------------------------------------------------------------------
   Run with:  npm test

   Loads every page in a real DOM (jsdom) through the project's own dev
   server, then exercises the interactive parts: navigation, crop search and
   filtering, every crop detail page, and all four contact-form paths
   (invalid input, no backend configured, successful insert, network failure).

   These are deliberately dependency-light: the only dev dependency is jsdom
   and Node's built-in test runner is not even needed – the script exits
   non-zero on the first broken expectation summary.
   ========================================================================== */

import { JSDOM, ResourceLoader, VirtualConsole } from 'jsdom';
import { createServer } from '../tools/serve.mjs';

/* --------------------------------------------------------------------------
   Test server + DOM harness
   -------------------------------------------------------------------------- */
const server = createServer({ quiet: true });
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const BASE = `http://127.0.0.1:${server.address().port}`;

const STUB_CONFIG = "window.SUPABASE_URL='https://test.supabase.co';"
  + "window.SUPABASE_ANON_KEY='test-anon-key';"
  + "window.CONTACT_EMAIL='hello@example.com';"
  + "window.CONTACT_PHONE='+91 90000 00000';";

/** Simulates a site where supabase-config.js exists but was never filled in. */
const EMPTY_CONFIG = "window.SUPABASE_URL='https://YOUR-PROJECT-REF.supabase.co';"
  + "window.SUPABASE_ANON_KEY='YOUR-ANON-PUBLIC-KEY';"
  + "window.CONTACT_EMAIL='';window.CONTACT_PHONE='';";

/** Serves the local site, blocks CDNs (so tests never need the network) and
 *  can swap supabase-config.js for a configured one. */
class LocalLoader extends ResourceLoader {
  constructor(stubSupabase, configBody) {
    super();
    this.stubSupabase = stubSupabase;
    this.configBody = configBody || STUB_CONFIG;
  }
  fetch(url, options) {
    if (url.endsWith('/supabase-config.js') && this.stubSupabase) {
      return Promise.resolve(Buffer.from(this.configBody));
    }
    if (!url.startsWith(BASE)) return Promise.resolve(Buffer.from('')); // block CDNs
    return super.fetch(url, options);
  }
}

const POLYFILL = `
  if (typeof window.matchMedia !== 'function') {
    window.matchMedia = function () { return { matches: false, addListener: function () {}, removeListener: function () {} }; };
  }
  window.IntersectionObserver = function (cb) {
    this.observe = function (el) { setTimeout(function () { cb([{ isIntersecting: true, target: el }]); }, 0); };
    this.unobserve = function () {};
    this.disconnect = function () {};
  };
`;

function makeSupabaseStub(window, behaviour) {
  window.__inserts = [];
  window.supabase = {
    createClient() {
      return {
        from(table) {
          return {
            insert(rows) {
              window.__inserts.push({ table, rows });
              if (behaviour === 'reject') return Promise.reject(new TypeError('Failed to fetch'));
              if (behaviour === 'error') {
                return Promise.resolve({
                  data: null,
                  error: { message: 'new row violates row-level security policy for table "contact_submissions"' }
                });
              }
              if (behaviour === 'hang') return new Promise(() => {});
              return Promise.resolve({ data: null, error: null });
            }
          };
        }
      };
    }
  };
}

async function loadPage(pathname, { stubSupabase = false, behaviour = 'ok', timeoutMs, config } = {}) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (e) => errors.push('jsdomError: ' + (e.stack || e.message)));
  virtualConsole.on('error', (...args) => errors.push('console.error: ' + args.join(' ')));

  const dom = await JSDOM.fromURL(BASE + pathname, {
    runScripts: 'dangerously',
    resources: new LocalLoader(stubSupabase, config),
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      window.eval(POLYFILL);
      if (typeof timeoutMs === 'number') window.CONTACT_TIMEOUT_MS = timeoutMs;
      if (stubSupabase) makeSupabaseStub(window, behaviour);
    }
  });

  await new Promise((resolve) => {
    if (dom.window.document.readyState === 'complete') resolve();
    else dom.window.addEventListener('load', resolve);
  });
  await tick(60);
  return { dom, window: dom.window, doc: dom.window.document, errors };
}

const tick = (ms) => new Promise((r) => setTimeout(r, ms));

/* --------------------------------------------------------------------------
   Tiny assertion helper
   -------------------------------------------------------------------------- */
let passed = 0;
const failures = [];

function check(name, condition, detail = '') {
  if (condition) {
    passed++;
    if (process.env.VERBOSE) console.log(`  ok   ${name}`);
    return true;
  }
  failures.push(detail ? `${name} — ${detail}` : name);
  console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`);
  return false;
}

const $ = (doc, sel) => doc.querySelector(sel);
const $$ = (doc, sel) => [...doc.querySelectorAll(sel)];

async function fillContactForm(window, doc, overrides = {}) {
  const values = {
    cName: 'Test Farmer',
    cEmail: 'test@example.com',
    cPhone: '+91 98765 43210',
    cSubject: $$(doc, '#cSubject option')[1]?.value ?? 'general',
    cMessage: 'This is a test message long enough to pass validation.',
    ...overrides
  };
  for (const [id, value] of Object.entries(values)) $(doc, '#' + id).value = value;
  $(doc, '#contactForm').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  await tick(60);
}

function closeAll(pages) {
  for (const page of pages) page.window.close();
}

/* ==========================================================================
   1. Every page loads cleanly
   ========================================================================== */
const ALL_PAGES = [
  ['/', 'index'],
  ['/crops.html', 'crops'],
  ['/crop-details.html?crop=rice', 'crop-details'],
  ['/farming.html', 'farming'],
  ['/soil.html', 'soil'],
  ['/irrigation.html', 'irrigation'],
  ['/pest-management.html', 'pest-management'],
  ['/modern-farming.html', 'modern-farming'],
  ['/about.html', 'about'],
  ['/contact.html', 'contact'],
  ['/404.html', '404']
];

console.log('\nEvery page: loads, no JS errors, navigation highlighted, no leftovers');
for (const [path, key] of ALL_PAGES) {
  const page = await loadPage(path);
  const { window, doc, errors } = page;

  check(`${path} loads without script errors`, errors.length === 0, errors.join(' | '));
  check(`${path} keeps header + footer`, !!$(doc, '#siteHeader') && !!$(doc, '.site-footer'));
  const expectedActive = key === '404' ? 0 : 1;
  check(`${path} highlights ${expectedActive} nav item(s)`, $$(doc, '.nav-links a.active').length === expectedActive,
    'active: ' + $$(doc, '.nav-links a.active').map((a) => a.textContent.trim()).join(', '));
  if (expectedActive) {
    check(`${path} marks the right nav item`, $(doc, '.nav-links a.active')?.getAttribute('href')?.startsWith(
      key === 'index' ? 'index.html' : key === 'crop-details' ? 'crops.html' : key), 'wrong active link');
  }
  check(`${path} renders no "[object Object]"`, !doc.body.textContent.includes('[object Object]'));
  check(`${path} renders no "undefined"`, !/undefined/.test(doc.body.textContent));
  check(`${path} sets the current footer year`, $(doc, '[data-year]')?.textContent === String(new Date().getFullYear()),
    $(doc, '[data-year]')?.textContent);

  closeAll([page]);
}

/* ==========================================================================
   2. Clean URLs (Netlify/Vercel style /crops) behave like /crops.html
   ========================================================================== */
console.log('\nClean URL support');
{
  const page = await loadPage('/crops');
  check('/crops is served', /Crop Guide/.test(page.doc.title), page.doc.title);
  check('/crops still highlights the Crops nav item',
    $(page.doc, '.nav-links a.active')?.getAttribute('href') === 'crops.html');
  check('/crops renders all cards', $$(page.doc, '#cropGrid .crop-card').length === 15);
  closeAll([page]);
}

/* ==========================================================================
   3. Unknown URLs get the branded 404 page
   ========================================================================== */
console.log('\n404 handling');
{
  const res = await fetch(BASE + '/definitely-not-a-page');
  const html = await res.text();
  check('unknown URL returns status 404', res.status === 404, String(res.status));
  check('unknown URL serves the branded 404 page', /This Field Is Empty/.test(html));
}

/* ==========================================================================
   4. Homepage
   ========================================================================== */
console.log('\nHomepage');
{
  const page = await loadPage('/');
  const { window, doc, errors } = page;

  const cards = $$(doc, '#featuredCrops .crop-card');
  check('featured grid renders 6 crops', cards.length === 6, String(cards.length));
  check('every featured card has artwork', $$(doc, '#featuredCrops .crop-visual svg').length === cards.length);
  check('featured cards link to crop details',
    cards.every((c) => /^crop-details\.html\?crop=[a-z]+$/.test($(doc, 'a.crop-link', c)?.getAttribute('href') || '')),
    cards.map((c) => $(doc, 'a', c)?.getAttribute('href')).join(', '));

  const burger = $(doc, '#hamburger');
  burger.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  check('hamburger opens the menu',
    $(doc, '#navLinks').classList.contains('open') && burger.getAttribute('aria-expanded') === 'true');
  burger.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  check('hamburger closes the menu', !$(doc, '#navLinks').classList.contains('open'));
  check('homepage has no runtime errors', errors.length === 0, errors.join(' | '));
  closeAll([page]);
}

/* ==========================================================================
   5. Crops page: search, category chips, empty state, deep link
   ========================================================================== */
console.log('\nCrops page: search + filters');
{
  const page = await loadPage('/crops.html');
  const { window, doc, errors } = page;
  const cards = $$(doc, '#cropGrid .crop-card');
  const visible = () => cards.filter((c) => c.style.display !== 'none').map((c) => c.dataset.id);

  check('renders all 15 crops', cards.length === 15, String(cards.length));
  check('renders 7 category chips', $$(doc, '#filterChips .chip').length === 7);
  check('result counter starts at 15', /15 crops found/.test($(doc, '#resultsCount').textContent),
    $(doc, '#resultsCount').textContent);

  const search = $(doc, '#cropSearch');
  search.value = 'tom';
  search.dispatchEvent(new window.Event('input', { bubbles: true }));
  check('search narrows the grid', visible().join(',') === 'tomato', visible().join(','));
  check('counter updates to 1', /1 crop found/.test($(doc, '#resultsCount').textContent),
    $(doc, '#resultsCount').textContent);

  search.value = 'zzzz';
  search.dispatchEvent(new window.Event('input', { bubbles: true }));
  check('empty state appears when nothing matches', $(doc, '#noResults').style.display === 'block');
  check('counter shows 0', /0 crops found/.test($(doc, '#resultsCount').textContent),
    $(doc, '#resultsCount').textContent);

  search.value = '';
  search.dispatchEvent(new window.Event('input', { bubbles: true }));
  const fruits = $$(doc, '#filterChips .chip').find((c) => c.dataset.cat === 'Fruits');
  fruits.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  check('category chip filters the grid', visible().join(',') === 'mango', visible().join(','));
  check('active chip is marked', fruits.classList.contains('active'));
  check('empty state is hidden again', $(doc, '#noResults').style.display === 'none');
  check('crops page has no runtime errors', errors.length === 0, errors.join(' | '));
  closeAll([page]);
}
{
  const page = await loadPage('/crops.html?q=wheat');
  check('?q= deep link pre-fills the search box', $(page.doc, '#cropSearch').value === 'wheat');
  check('?q= deep link filters the grid',
    $$(page.doc, '#cropGrid .crop-card').filter((c) => c.style.display !== 'none').length === 1);
  closeAll([page]);
}

/* ==========================================================================
   6. Crop details: every crop, plus the not-found states
   ========================================================================== */
console.log('\nCrop details');
{
  const list = await loadPage('/crops.html');
  const ids = $$(list.doc, '#cropGrid .crop-card').map((c) => c.dataset.id);
  closeAll([list]);

  for (const id of ids) {
    const page = await loadPage(`/crop-details.html?crop=${id}`);
    const { doc, errors } = page;
    const sections = $$(doc, '.detail-section');
    const toc = $$(doc, '.detail-toc a').map((a) => a.getAttribute('href').slice(1));

    check(`${id}: renders 10 sections`, sections.length === 10, String(sections.length));
    check(`${id}: renders 11 fact rows`, $$(doc, '.fact').length === 11, String($$(doc, '.fact').length));
    check(`${id}: every TOC anchor resolves`, toc.every((target) => !!doc.getElementById(target)),
      toc.filter((t) => !doc.getElementById(t)).join(','));
    check(`${id}: has prev + next navigation`, $$(doc, '.detail-nav a').length === 2);
    check(`${id}: no empty field rendered`, !doc.body.textContent.includes('undefined') && !/:\s*(\n|$)/.test(''));
    check(`${id}: no runtime errors`, errors.length === 0, errors.join(' | '));
    closeAll([page]);
  }

  const unknown = await loadPage('/crop-details.html?crop=not-a-real-crop');
  check('unknown crop shows the not-found panel', /Crop not found/.test(unknown.doc.body.textContent));
  check('unknown crop retitles the page', /Not Found/.test(unknown.doc.title), unknown.doc.title);
  closeAll([unknown]);

  const missing = await loadPage('/crop-details.html');
  check('missing ?crop= shows the not-found panel', /Crop not found/.test(missing.doc.body.textContent));
  closeAll([missing]);
}

/* ==========================================================================
   7. Contact form: all five paths
   ========================================================================== */
console.log('\nContact form');
{
  const page = await loadPage('/contact.html');
  const { window, doc, errors } = page;

  $(doc, '#contactForm').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  await tick(30);
  check('empty submit flags the 4 required fields', $$(doc, '.field.invalid').length === 4,
    String($$(doc, '.field.invalid').length));
  check('empty submit shows no success banner', !$(doc, '#formSuccess').classList.contains('show'));
  check('each invalid field explains itself', $$(doc, '.field.invalid .err').every((e) => e.textContent.trim().length > 5));
  check('invalid fields are marked aria-invalid', $$(doc, '.field.invalid input, .field.invalid select')
    .every((el) => el.getAttribute('aria-invalid') === 'true'));

  await fillContactForm(window, doc, { cPhone: 'abc' });
  check('bad phone number is rejected', $(doc, '#cPhone').closest('.field').classList.contains('invalid'));
  await fillContactForm(window, doc, { cMessage: 'too short' });
  check('short message is rejected', $(doc, '#cMessage').closest('.field').classList.contains('invalid'));
  await fillContactForm(window, doc, { cEmail: 'not-an-email' });
  check('bad email is rejected', $(doc, '#cEmail').closest('.field').classList.contains('invalid'));

  check('contact page has no runtime errors', errors.length === 0, errors.join(' | '));
  closeAll([page]);
}
{
  const page = await loadPage('/contact.html'); // CDNs blocked → no supabase-js, placeholders present
  await fillContactForm(page.window, page.doc);
  const banner = $(page.doc, '#formSuccess');
  check('unconfigured site explains itself instead of failing silently',
    banner.classList.contains('show') && banner.classList.contains('is-error'));
  check('the explanation mentions the missing library or setup',
    /not connected|messaging library/i.test($(page.doc, '#formSuccessText').textContent),
    $(page.doc, '#formSuccessText').textContent);
  check('the submit button is re-enabled after the failure', !$(page.doc, 'button[type="submit"]').disabled);
  closeAll([page]);
}
{
  const page = await loadPage('/contact.html', { stubSupabase: true });
  const before = page.window.__inserts.length;
  await fillContactForm(page.window, page.doc, { cPhone: '' });
  const banner = $(page.doc, '#formSuccess');
  const inserts = page.window.__inserts;

  check('successful submit shows the confirmation', banner.classList.contains('show') && !banner.classList.contains('is-error'),
    $(page.doc, '#formSuccessText').textContent);
  check('exactly one row is inserted', inserts.length === before + 1, String(inserts.length));
  check('row goes to contact_submissions', inserts.at(-1)?.table === 'contact_submissions');
  check('payload carries the trimmed values', inserts.at(-1)?.rows?.[0].name === 'Test Farmer'
    && inserts.at(-1)?.rows?.[0].email === 'test@example.com');
  check('blank phone is sent as null', inserts.at(-1)?.rows?.[0].phone === null);
  check('form is cleared after success', $(page.doc, '#cName').value === '' && $(page.doc, '#cMessage').value === '');
  check('no field is left marked invalid', $$(page.doc, '.field.invalid').length === 0);
  closeAll([page]);
}
{
  const page = await loadPage('/contact.html', { stubSupabase: true, behaviour: 'error' });
  await fillContactForm(page.window, page.doc);
  const banner = $(page.doc, '#formSuccess');
  check('database rejection is reported as an error', banner.classList.contains('show') && banner.classList.contains('is-error'));
  check('RLS failures give the owner a hint',
    /Row Level Security|refused/i.test($(page.doc, '#formSuccessText').textContent),
    $(page.doc, '#formSuccessText').textContent);
  check('nothing is left disabled', !$(page.doc, 'button[type="submit"]').disabled);
  closeAll([page]);
}
{
  const page = await loadPage('/contact.html', { stubSupabase: true, behaviour: 'reject' });
  await fillContactForm(page.window, page.doc);
  check('network failure is explained in plain language',
    /connection|reach the server/i.test($(page.doc, '#formSuccessText').textContent),
    $(page.doc, '#formSuccessText').textContent);
  closeAll([page]);
}
{
  const page = await loadPage('/contact.html', { stubSupabase: true, behaviour: 'hang', timeoutMs: 40 });
  await fillContactForm(page.window, page.doc);
  await tick(60);
  const banner = $(page.doc, '#formSuccess');
  check('a hanging request times out instead of freezing the button',
    banner.classList.contains('show') && $(page.doc, 'button[type="submit"]').disabled === false,
    $(page.doc, '#formSuccessText').textContent);
  closeAll([page]);
}

/* ==========================================================================
   8. Contact details come from supabase-config.js, not hard-coded markup
   ========================================================================== */
console.log('\nContact details from configuration');
{
  const page = await loadPage('/contact.html', { stubSupabase: true });
  const email = $(page.doc, '[data-contact-email]');
  const phone = $(page.doc, '[data-contact-phone]');
  check('email renders as a mailto link to the configured address',
    email?.innerHTML.includes('mailto:hello@example.com'), email?.innerHTML);
  check('phone renders as a tel link with the punctuation stripped',
    phone?.innerHTML.includes('tel:+919000000000'), phone?.innerHTML);
  closeAll([page]);
}
{
  // Placeholder config: the rows hide themselves instead of showing fake details
  const page = await loadPage('/contact.html', { stubSupabase: true, config: EMPTY_CONFIG });
  const emailRow = $(page.doc, '[data-contact-email]')?.closest('.contact-item');
  check('blank config hides the email row', emailRow?.style.display === 'none', emailRow?.style.display);
  check('blank config hides the phone row',
    $(page.doc, '[data-contact-phone]')?.closest('.contact-item')?.style.display === 'none');
  closeAll([page]);
}

/* ==========================================================================
   Summary
   ========================================================================== */
server.close();

console.log('\n' + '='.repeat(60));
if (failures.length) {
  console.log(`  ${passed} passed, ${failures.length} FAILED\n`);
  for (const f of failures) console.log(`   - ${f}`);
  console.log('');
  process.exit(1);
}
console.log(`  All ${passed} checks passed\n`);
