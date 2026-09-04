# Hitesh Panwar — AI & Data Portfolio

A single-page portfolio site. Pure HTML, CSS, and vanilla JavaScript
(ES modules) — **no frameworks, no build tools, no dependencies.**

Originally authored as a React-runtime "Design Component" (`.dc.html`);
this version is a faithful, framework-free port. The rendered output is
identical, but it no longer loads React from a CDN or relies on a runtime
engine — it's just static files a browser can serve directly.

## Project structure

```
.
├── index.html            # the whole page (static markup, no inline styles/JS)
├── css/
│   ├── tokens.css        # design tokens: colours, fonts, breakpoints (:root vars)
│   ├── base.css          # resets, document defaults, shared primitives
│   ├── animations.css    # @keyframes, reveal/fade transitions, reduced-motion
│   ├── sections.css      # per-section layout (nav, hero, about, network, …)
│   └── responsive.css    # all media queries, consolidated
├── js/
│   ├── main.js           # entry point — imports & initialises every module
│   ├── loader.js         # hero loading sequence + character reveal
│   ├── scroll.js         # progress bar, sticky nav, section indicator, scroll-reveal, mobile menu
│   ├── cursor-glow.js    # cursor glow (hover-capable devices only)
│   ├── case-studies.js   # horizontal drag-to-scroll (desktop) + touch fallback
│   ├── neural-network.js # skill → output diagram, signal pulses, mobile fallback
│   └── counters.js       # stat count-up animation
├── case-studies/         # long-form work write-ups (4)
├── projects/             # per-project deep dives (4)
├── assets/               # favicon + room for images/icons
└── README.md
```

Every colour, font-family, and breakpoint is defined once in
`css/tokens.css` and referenced with `var(--token)` elsewhere. Each JS
file exports a single `init…()` function; `main.js` calls them on
`DOMContentLoaded`.

### Editing the neural network

The diagram is **5 skills → 4 labelled process stages → 4 outputs**. The
hidden layer carries `SCOPE / BUILD / MEASURE / GOVERN` and is fully
connected by design — it is not part of the map. The skill → work mapping
lives in one well-commented object, `SKILL_OUTPUT_MAP`, at the top of
`js/neural-network.js`.

Adding an output is a four-part change: the `<circle>` + `<text>` in
`index.html`, one `<line data-ho>` **per hidden node**, a matching
`.nn-idle-N` rule in `animations.css`, and a mobile `[data-mout]` button.
Adding a skill is the same minus the lines being per-output.

Two constraints worth knowing before you retitle anything:

- **Label length.** `.nn-svg` has `overflow: visible` and labels are 13
  user-units of mono, so width ≈ `chars × 8` units in a 1000-unit
  viewBox. Roughly **27 characters max**, including the `S1 · ` prefix or
  ` · W1` suffix. Output labels are short *names*, not case-study titles.
- **Governance has no output of its own.** S5 feeds three of the four
  outputs. That is deliberate — it argues visually that governance is a
  property of the work rather than a separate deliverable. Don't "fix" it
  by giving it a dedicated node.

## Run it locally

ES modules are fetched over HTTP, so **opening `index.html` directly with
a `file://` URL will fail** — the browser blocks module loading with a
CORS error. You must serve the folder over `http://`.

From the project root, pick whichever is handy:

```bash
# Python 3 (built in on macOS / most Linux)
python -m http.server 8000

# or Node
npx serve .

# or PHP
php -S localhost:8000
```

Then open **http://localhost:8000/** in your browser. Stop the server with
`Ctrl + C`.

## Deploy to GitHub Pages

All asset paths in `index.html` are **relative** (`css/…`, `js/…`,
`assets/…`, and in-page links like `#about`), so the site works correctly
whether it's served from a domain root or a project subpath such as
`https://<you>.github.io/<repo>/`.

1. Create the repo and push:

   ```bash
   git init
   git add .
   git commit -m "AI Governance portfolio — static site"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```

2. On GitHub: **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main**, folder: **/ (root)** → **Save**

3. Wait ~1 minute, then visit `https://<you>.github.io/<repo>/`.

No build step or GitHub Action is required — Pages serves the files as-is.

## Notes

- **JavaScript is required** (as in the original). With JS disabled the
  hero stays hidden behind the loader, since the reveal is JS-driven.
- **`prefers-reduced-motion`** is respected: the loader is skipped,
  scroll reveals appear instantly, and neural-network idle motion and
  signal pulses are suppressed.
- The original source files (`Portfolio.dc.html`, `Hero.dc.html`,
  `support.js`, the architecture doc) are **not used** by the deployed
  site and can be deleted or moved out of the repo once you're happy with
  the port.
- The favicon in `assets/favicon.svg` is a placeholder — swap in your own.


## Positioning

The site presents **AI analyst / consultant / builder / data analytics**
work. AI governance is kept deliberately — as one capability among
several (hero role strip, marquee, a Skills aside, one service card, and
the interactive EU AI Act pyramid) rather than as the site's thesis.
When editing copy, keep that balance: governance is a differentiator that
makes the builds defensible, not the headline.

Section order on the home page:

    hero → about → career → neural network → work → services
         → skills → projects → governance → contact

## Editing the content data

Most of the page's *words* live in HTML, but three interactive sections
are driven by data arrays in JS — edit those, not the markup:

| Section | Data lives in |
|---|---|
| Career chart | `PHASES` at the top of `js/journey.js` |
| ↳ | Four phases. The chart line continues past the last point as a dashed `.jc-open` segment — the trajectory is deliberately open-ended, so adding a phase means adding an SVG point *and* moving that segment's `x1/y1`. |
| Neural network | `SKILL_OUTPUT_MAP` inside `js/neural-network.js` |
| EU AI Act pyramid | `TIERS` at the top of `js/governance.js` |

## Draft pages

`case-studies/vision-qa.html` is a **draft scaffold**: final structure and
styling, placeholder prose. Its TODO blocks render in accent blue via the
`.todo` / `.todo-block` / `.study-draft` rules at the foot of
`css/case-study.css`, so an unfilled placeholder cannot be published by
accident. Fill in the prose, delete the `.study-draft` banner, and the
page is done.

## Cache busting

Every `<link>` and `<script>` carries a `?v=N`. Bump N in **all** HTML
files together whenever CSS or JS changes, or returning visitors get a
stale mix. Currently at `v=8`.

**The easy mistake:** bumping the `<script src="js/main.js?v=N">` tag is
*not* enough. ES module import specifiers are separate cache entries, so
the `?v=` inside `js/main.js` and `js/case-page.js` must be bumped too —
otherwise the browser serves new HTML against old modules and the page
half-works in ways that look like logic bugs. Grep before release:

```bash
grep -rn "v=[0-9]" --include=*.html --include=*.js .
```
