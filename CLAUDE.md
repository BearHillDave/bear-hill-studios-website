# Bear Hill Studios — Website

Static multi-page site. No framework, no build step.

## Dev server

```bash
cd /Users/dcox/Documents/Workspace-Web/bear-hill-studios-website
python3 -m http.server 8081
```

Browser: `http://localhost:8081`

## Repo

GitHub: `git@github-bearhill:BearHillDave/bear-hill-studios-website.git`  
SSH alias `github-bearhill` → `~/.ssh/dave_bearhill_github` (BearHillDave account)

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Home |
| `work.html` | Portfolio / work samples |
| `laura.html` | Laura's profile page |
| `about.html` | About the studio |
| `contact.html` | Contact |

Shared: `main.css`, `main.js` — linked from every page.

## Palette (7 colours)

```css
--true-black: #000000;
--black:      #2C2823;   /* warm near-black, main text colour */
--tan:        #E9CC9C;
--cream:      #F6EBDA;
--yellow:     #F5C800;
--red:        #EE1111;
--cobalt:     #0055FF;
```

No greens in the palette — greens come from photography only.

Active theme is **c (Red + Cobalt)**, set permanently via `data-theme="c"` on `<html>` in `main.js`. Theme variants a/b/c are defined in `main.css` but only c is used.

Theme tokens used in components:
- `--c1` / `--c1t` — primary accent + its text colour
- `--c2` / `--c2t` — secondary accent + its text colour
- `--c3` / `--c3t` — tertiary accent + its text colour

## Typography

```css
--serif: 'Cormorant Garamond', Georgia, serif;
--sans:  'Jost', Helvetica, sans-serif;
```

Both loaded from Google Fonts in each HTML file.

## Audio players (`main.js`)

Two styles, both initialised by `initPlayers()` on page load:

**Circular** (`[data-player]` without `data-style="bar"`):
- SVG ring shows progress arc (`r-prog`) and a dot (`r-dot`) that orbits while playing
- Dot is hidden when paused; visible and rotating at 25 fps while playing
- Sizes: `.player-lg` 148px (hero), `.player-md` 76px (default), `.player-sm` 64px (reels)
- `data-dur` sets duration in seconds; `data-color` sets accent token (e.g. `c1`, `c2`, `c3`)

**Size behaviour differs — do not homogenise:**
- `.player-lg` — renders label inside circle (`player-inner-label`) + time readout below. `flex-direction: column` on `.player-inner` is required for this stacking — do not remove it.
- `.player-md` / `.player-sm` — arrow only. No label, no time. Use `.player-unit` wrapper for external labels.
- `data-label` on md/sm is stored as data but intentionally not rendered inside the circle.

**Colour convention** (theme c — Red + Cobalt):
- `c3` (Yellow) — audiobook players
- `c2` (Cobalt) — digital / interactive (e.g. Important Small Things)
- `c1` (Red) — everything else

**Player unit** (`.player-unit`) — standard wrapper for players with external labels:
```html
<div class="player-unit">
  <div class="player player-md" data-player="id" data-dur="120" data-color="c3"></div>
  <div class="player-unit-meta">
    <span class="player-unit-label">Label text</span>
    <a class="player-unit-dl" href="sample.mp3" download>
      <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
      MP3
    </a>
  </div>
</div>
```
- Circle left, label + download link right
- Download `href` is a placeholder `#` until real audio files exist

**Bar** (`data-style="bar"`):
- Horizontal progress bar with play/pause button
- `data-dark="true"` for on-dark-background variant
- Not currently used on any live page (replaced by circular players)

Only one player plays at a time — starting any player pauses the others.

## Scroll reveal

Elements with `.reveal` animate in when they enter the viewport.  
Uses `IntersectionObserver` with a `getBoundingClientRect` fallback (runs at 100ms, 600ms, and on scroll) for sandboxed environments.

## Assets

Real images in `/assets/`:
- `hero-moss.jpg` — moss-covered forest branch (hero background, home page)
- `VR Cover 3000x3000.png` — Velveteen Rabbit audiobook cover
- `TTNBC Cover 3000x3000.jpg` — The Tiger No Body Could... audiobook cover
- `laura.jpeg` — Laura portrait
- `david.jpg` — David portrait
- `stream.jpg` — rocky stream (Work page hero)
- `flowers1.jpg`, `flowers2.jpg` — yellow meadow flowers (Laura page hero)
- `meadow-clover.jpg`, `meadow-daisies.jpg`, `meadow-dark.jpg`, `meadow-poppie.jpg`, `meadow-yellow.jpg` — meadow photography
- `forest.jpg`, `leaves.jpg`, `moss-bark.jpg` — forest textures
- `fairy-door.jpg`, `fairy-door2.jpg` — fairy door photography
- `cars.jpg`, `gramerphone.jpg`, `paper37.jpg`, `radio.jpg` — object photography
- `velvet-grass.png` — texture (pull quote background)
- `bear-icon.png`, `logo-black.svg`, `logo-white.svg` — logo assets

Do not use the in-app preview tool for UI verification. The user reviews changes directly at:
- `http://localhost:8081` (local dev server)
- `https://bearhilldave.github.io/bear-hill-studios-website` (GitHub Pages)

## Current branch: `style-experiments`

Exploring a **full dark theme** on the home page. Changes live in an inline `<style>` block at the top of `index.html` — not yet moved to `main.css`. Key additions:

- `body { background: #000 }` — base is pure black
- `.sec-dark` — dark section: `#000` background, `--cream` text
- `.sec-img` — section with a low-opacity background image behind content (using `.sec-img-bg` child div)
- `.feat-card-dk`, `.team-card-dk` — dark variants of feature and team cards (`rgba(237,230,216,0.09)` background)
- `.testimonial`, `.cta-band`, `.footer` — all overridden to `#000`
- Footer link colours forced to `#f6ebda`

Other pages (`work.html`, `laura.html`, `about.html`, `contact.html`) remain on the default cream theme.

The branch also contains experimental homepage files (`index_1.html` – `index_4.html`) and extra photography assets that aren't yet used in the live pages.

## Figma

Design file: `https://www.figma.com/design/OdCJuGJR63vyKEcnofSUqR/Bear-Hill-Studios-—-Website`  
Figma MCP is available but the Starter plan has rate limits — fall back to reading local files in `/Design/` if it errors.

**Site 3 page** (`node-id=129-996`): Contains 5 page frames (Home `125:996`, Work `135:996`, Laura `136:996`, About `136:1089`, Contact `137:996`) plus a Style Guide frame (`123:996`). As of April 2026, the 5 page frames have screenshot image fills (flat, uneditable) — a previous sync attempt went wrong. They need to be rebuilt as proper layered Figma designs (text nodes, rectangles, image fills). The Style Guide frame is the most accurate reference for the design system.
