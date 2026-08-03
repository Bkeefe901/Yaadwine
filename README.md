# YaadWine

Source for [yaadwine.com](https://yaadwine.com) — built with [Eleventy (11ty)](https://www.11ty.dev/) and edited through [Decap CMS](https://decapcms.org/).

## How it's put together

```
src/
  _includes/
    layouts/       base.njk (shared head/header/footer), plus one layout
                    per post type: post-episode.njk (Cellar) and
                    post-drinktime.njk (Drink Time)
    partials/       header, footer, and the reusable story-card used on
                    the Cellar page
  posts/            the actual posts — markdown files with front matter
  admin/             Decap CMS: config.yml (the field definitions) and
                    index.html (the app shell)
  index.njk, about.njk, notebook.njk, cellar.njk, 404.njk
                    the non-post pages
assets/              CSS, fonts, images — copied through untouched
```

Eleventy builds everything in `src/` into `_site/`, which is what actually
gets deployed. Nothing outside `src/` and `assets/` is part of the site.

`cellar.njk` builds its "Cellar" listing automatically from post front
matter — any post with `pillar: migration|science|culture|drinktime` in
its front matter shows up under the matching section with no need to
hand-edit `cellar.njk` itself. The "Coming Soon" cards on that page are
placeholders with no post behind them yet, and live directly in
`cellar.njk`'s own front matter.

## Local development

```
npm install
npm start
```

Opens an Eleventy dev server at `http://localhost:8080` with live reload —
edit anything in `src/` and the browser refreshes automatically.

One known quirk: if you **delete** a post while the dev server is running
(including via the local CMS below), the dev server doesn't notice —
you'll need to restart `npm start` to see the deletion reflected locally.
This only affects local preview; the live site rebuilds from scratch on
every deploy, so deletions always take effect correctly there.

## Editing content through the CMS

**Locally**, in a second terminal:

```
npm run cms
```

Then visit `http://localhost:8080/admin/` (with `npm start` also running).
This uses Decap's local backend — no login needed, and changes write
directly to the files in `src/posts/` on your machine.

**On the live site**, visit `https://yaadwine.com/admin/` and log in with
GitHub. Changes are committed straight to the `main` branch on GitHub,
which triggers a new Netlify deploy automatically.

The CMS has two collections, matching the two post layouts:

- **Cellar Episodes** — long-form pieces (`pillar`: migration / science /
  culture)
- **Drink Time** — shorter reaction posts (`pillar` is fixed to
  `drinktime`)

Both write to `src/posts/`; the `layout` field (hidden in the CMS form)
is what tells Eleventy which template to use.

## Deployment

Netlify builds and deploys automatically on every push to `main`, using
the settings in `netlify.toml` (`npx eleventy` → publishes `_site/`).

### GitHub OAuth (already set up, documented for reference)

The live CMS authenticates through GitHub via Netlify's OAuth relay —
**not** Netlify Identity/Git Gateway, which is being sunset. If this ever
needs to be redone (e.g. rotating the secret, moving to a new Netlify
site):

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth
   App**. Authorization callback URL must be exactly
   `https://api.netlify.com/auth/done`.
2. Netlify → the site → **Site configuration → General → OAuth** → add
   the GitHub Client ID/Secret from step 1.

`src/admin/config.yml`'s `backend` section (`repo: Bkeefe901/Yaadwine`,
`branch: main`) has to match wherever the site is actually deployed from.
