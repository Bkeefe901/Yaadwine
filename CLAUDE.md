# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

YaadWine (yaadwine.com) is a static, hand-written HTML/CSS/JS site — no framework, no build step, no bundler. Every page is a standalone `.html` file in the repo root that links directly to shared and page-specific stylesheets in `assets/`. It's hosted on Netlify, which deploys straight from `main` with no build command.

The only non-static piece is a single Netlify Function (`netlify/functions/unsubscribe.js`) that backs the mailing-list unsubscribe flow — see "Mailing list & unsubscribe flow" below.

## Commands

There is no build, lint, or test tooling in this repo (no `npm run` scripts, no linter config). `package.json` exists only to declare `nodemailer` as a dependency for the one Netlify Function — Netlify installs it automatically on deploy.

- **Preview locally**: open any `.html` file directly in a browser, or serve the repo root with any static file server (e.g. `npx serve .`). No dev server is configured.
- **Deploy**: push to `main` on GitHub; Netlify auto-deploys from there.
- **Test the unsubscribe function**: it only runs on Netlify's infrastructure (no local Netlify CLI is set up here), so testing means deploying and hitting `/.netlify/functions/unsubscribe?email=...` on the live site.

## Architecture

### Page structure

Every page follows the same `<head>` boilerplate: GA4 `gtag.js` snippet (property `G-7NCMWEVZXQ`, identical on every page — copy it exactly rather than re-deriving it), charset/viewport meta, title + description + Open Graph/Twitter card tags, favicon, Google Fonts preconnect for Fraunces (display) + Inter (body), then stylesheet links.

Stylesheets are always loaded in this order: `assets/style.css` (global tokens/base, every page) → zero or more page-type stylesheets → `assets/footer.css` (every page, last). The page-type stylesheet(s) depend on what kind of page it is:

| Page type | Stylesheets after `style.css` | Example pages |
|---|---|---|
| Prose/manifesto pages | `about.css` | `about.html`, `notebook.html`, `how-we-research.html` |
| Cellar/library listing | `library.css` | `cellar.html` |
| Drink Time story | `about.css`, `drinktime.css` | `drink-time-grolleau.html`, `drink-time-dream-deferred.html` |
| Wine/region article with map | `episode.css`, `article-map.css` | `malbec.html`, `jamaica_wines.html` |

When adding a new page, match it to the closest existing type above rather than inventing a new stylesheet unless the layout genuinely doesn't fit any of them.

Every page also carries: the `.announce-bar` newsletter nudge, `.site-header` with the same three nav links (Manifesto / Cellar / From YaadWine Crew!), a `.migrate-section` newsletter signup form near the bottom, and the full `.site-footer-full` footer. Copy these from an existing page rather than rebuilding from scratch.

### Styling conventions

Design tokens live as CSS custom properties at the top of `assets/style.css` (`--wine`, `--wine-deep`, `--parchment`, `--gold`, `--ink`, `--route-teal`, `--font-display` = Fraunces, `--font-body` = Inter). Use these tokens instead of hardcoding colors/fonts anywhere, including inline SVG (`stroke="var(--gold)"` etc., as in `index.html`'s hero route line).

Class names are semantic/BEM-ish and scoped by section (`.hero-*`, `.quiz-*`, `.migrate-*`, `.footer-*`) rather than utility classes — follow that pattern rather than introducing a utility-CSS approach.

### JavaScript

All vanilla JS, no framework. `assets/script.js` is the shared script loaded on every page (nav active-state highlighting, the Migrate-With-Us form submit handler, patois/stamp-map tap-tooltips). `assets/article-map.js` is intentionally kept separate so pages without a map don't pay for the fetch — follow that "split out if not every page needs it" pattern rather than growing `script.js` unboundedly.

Page-specific interactive logic (e.g. the homepage quiz in `index.html`) lives in an inline `<script>` at the bottom of that page's HTML rather than a separate file — that's consistent with how the quiz and its GA4 event firing (`quiz_start`, `quiz_complete`) are currently done in `index.html`.

Comments throughout tend to explain *why*, not just what (e.g. why `article-map.js` is a separate file, why the migrate-form fetch shows success even on failure locally). Match that density when adding new JS.

### Mailing list & unsubscribe flow

There's no backend/database — subscriber emails are collected via a Netlify Forms submission (the `.migrate-form` on every page, `name="migrate"`, honeypot field `bot-field`) and land in the Netlify dashboard's Forms tab. New-story emails are currently sent out **manually**: the site owner copies a story into an HTML file, opens it in a browser, and pastes the rendered content into Gmail.

The unsubscribe mechanism is a Netlify Function at `netlify/functions/unsubscribe.js`:
- Reads `?email=` from the query string.
- Sends a notification email via `nodemailer`/Gmail SMTP back to `process.env.SYSTEM_EMAIL` (not to the unsubscribing user — this alerts the site owner, who then manually deletes that submission from the Netlify Forms dashboard).
- Returns a static "Unsubscribed" HTML confirmation page to the browser.
- Requires `SYSTEM_EMAIL` (sending Gmail address) and `SYSTEM_EMAIL_PASS` (a 16-character Google App Password, not the account password) set as Netlify environment variables — `SYSTEM_EMAIL_PASS` is marked "contains secret values".

The unsubscribe link a subscriber clicks has this shape:
```
https://yaadwine.com/.netlify/functions/unsubscribe?email=<their-address>
```

## Planned work: mail-merge send workflow

The unsubscribe function itself is built and confirmed working end-to-end (deployed, tested with a real click-through and admin alert). What's **not yet implemented** is personalizing that `?email=` parameter per recipient when sending a new story — right now there's no way to send one email with each subscriber's own address baked into their unsubscribe link.

The planned approach:
1. Export the subscriber list from the Netlify Forms dashboard as CSV (column `email`, from the form field `name="email"`).
2. Import into a Google Sheet; rename the header to `Email` to match the merge tag.
3. Install the **Yet Another Mail Merge (YAMM)** Google Sheets add-on.
4. Build the story's HTML template with the unsubscribe link's `href` containing the literal merge tag `{{Email}}`:
   ```html
   <a href="https://yaadwine.com/.netlify/functions/unsubscribe?email={{Email}}">
     Unsubscribe from this list
   </a>
   ```
5. Open that template in a browser, select-all/copy, paste into a blank Gmail draft (recipient field left empty) — the `{{Email}}` tag survives inside the link even though it's not visible on screen.
6. Run YAMM from the Sheet (recipient column `Email`, template = the saved draft), send a test to self first, then send to the full list.

Note: YAMM's free tier is roughly 50 sends/day on a personal Gmail account — worth checking current limits if the subscriber list grows past that. Also note the unsubscribe flow still ends in a **manual** step (deleting the row from Netlify Forms after receiving the alert email) — full automation of that removal is a future improvement, not yet planned in detail.
