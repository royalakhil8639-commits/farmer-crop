# Contributing to AgriVision

Thanks for helping. This project is a static educational website, so most changes are a few
lines of HTML, CSS or JavaScript — no build tooling to learn.

## Before you open a pull request

```bash
npm start     # look at your change in a browser: http://localhost:4173
npm test      # static checks + 220 DOM smoke tests
```

`npm test` fails on broken links, duplicate ids, missing crop fields and any JavaScript error
on any page, so a green run is a good sign the change is safe. CI runs the same two commands.

## Ground rules

- **Keep it static.** No frameworks, no build step, no runtime dependencies. The site must
  work when the folder is dropped on any host.
- **Accuracy over marketing.** Crop data must be defensible general guidance for India. If a
  number appears in the copy (crop counts, method counts), it must match what the site
  actually contains — the checker warns when it does not.
- **Say where a claim comes from.** Anything specific — a dose, a spacing, a season window —
  should match the local-variation caveats already used across the site.
- **Accessibility is not optional.** Use semantic landmarks, label every form control, keep
  keyboard focus visible, and keep `prefers-reduced-motion` support working.
- **Cite the source of any new image** and make sure it is licensed for reuse.

## Adding a crop

1. Add an object to the `CROPS` array in `script.js` (copy an existing one — every field is
   required, the tests enforce it).
2. Add its `category` to `CATEGORIES` if it is a new one.
3. Update the count in the homepage stats band and the “View All *n* Crops” link if the total
   changes; `npm run check` warns when they drift.
4. Run `npm test` — it renders every crop’s detail page and verifies the table of contents,
   the fact grid and the prev/next links.

## Reporting a problem

Open an issue with the page, what you expected, what happened, and your browser. For content
corrections, mention your region, because much of the guidance is region-dependent.
