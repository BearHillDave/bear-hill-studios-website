# Bear Hill Studios — Website

Static multi-page site. No framework, no build step.

## Dev server

```bash
cd /Users/dcox/Documents/Workspace-Web/bear-hill-studios-website
python3 -m http.server 8081
```

Browser: `http://localhost:8081`

The preview server is configured in `.claude/launch.json` (name: `website`). Use `preview_start` to start it via Claude.

## Repo

GitHub: `git@github-bearhill:BearHillDave/bear-hill-studios-website.git`  
SSH alias `github-bearhill` → `~/.ssh/dave_bearhill_github` (BearHillDave account)

## Current branch: `v2-redesign`

Full V2 redesign based on Figma file:  
`https://www.figma.com/design/pEGgx9Yk74dL1SzgxjHF1X/Bear-Hill-Studios-Website-V2`

Finals section node IDs: Home `289:7860`, Work `352:6823`, Laura `352:7144`, Production `352:7513`

## Pages

| File | Purpose | Status |
|------|---------|--------|
| `index.html` | Home | ✅ V2 done |
| `work.html` | Work / portfolio | ✅ V2 done |
| `laura.html` | Laura's profile | ✅ V2 done |
| `production.html` | Production services | 🔲 Stub (under construction) |
| `about.html` | About | 🔲 Stub (under construction) |
| `contact.html` | Contact | 🔲 Stub (under construction) |

Shared: `main.css`, `main.js` — linked from every page.

---

## V2 Design System

### Palette

```css
--dark-white:  #f9f4ec;   /* primary text on dark */
--light-black: #211e1a;   /* base background, warm near-black */
--red:         #cf2a0a;   /* primary accent */
--cream:       #f6ebda;   /* player labels, secondary warm white */
--blue:        #6aaab8;   /* Narration player accent */
--yellow:      #d49000;   /* Commercial/Technical player accent */
```

Alpha tints (pre-defined variables):
```css
--cream-50: rgba(246, 235, 218, 0.5);   /* muted text, muted icons */
--cream-20: rgba(246, 235, 218, 0.2);   /* hairline dividers */
--lb-50:    rgba(33, 30, 26, 0.5);      /* muted on light bg */
```

Theme tokens (single theme, no a/b/c variants):
```css
--c1: var(--red);     --c1t: var(--cream);
--c2: var(--blue);    --c2t: var(--dark-white);
--c3: var(--yellow);  --c3t: var(--light-black);
```

Player colour convention:
- `c1` (Red) — audiobooks, hero player, default
- `c2` (Blue) — Narration voice demos
- `c3` (Yellow) — Commercial / Technical voice demos

### Typography

```css
--serif: 'Cormorant Garamond', Georgia, serif;
--sans:  'Jost', Helvetica, sans-serif;
```

Loaded from Google Fonts. Request weight range `0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600;1,700` for Cormorant.

| Role | Font | Size | Weight | Style | Tracking | Case |
|------|------|------|--------|-------|----------|------|
| Hero title | Cormorant | 128px / clamp(5–8rem) | 700 | italic | — | — |
| Page title | Cormorant | 128px / clamp(5–8rem) | 700 | italic | — | — |
| Section heading | Cormorant | 48px / clamp(2–3rem) | 400 | italic | — | — |
| Work item title | Cormorant | clamp(1.4–1.75rem) | 500 | — | — | — |
| Hero body | Cormorant | 24px | 300 | — | — | — |
| Nav links | Jost | 12.8px | 500 | — | 2.688px | UPPER |
| Work eyebrow (video/interactive) | Jost | 12px | 500 | — | 1.8px | UPPER |
| Work eyebrow (audiobook) | Jost | 10.7px | 300 | — | 0.643px | UPPER |
| Work subtitle / author | Jost | 12.8px | 300 | — | — | — |
| Body copy | Jost | 14.5px | 300 | — | — | — |
| Player label / UI label | Jost | 10.7px | 500 | — | 0.856px | UPPER |
| Footer copyright | Jost | 11.1px | 300 | — | — | — |
| Footer nav | Jost | 12.8px | 500 | — | 2.688px | UPPER |
| CTA button | Jost | 10.5px | 500 | — | 1.46px | UPPER |

### Spacing tokens

```css
--sp-sm:  8px;
--sp-md:  16px;
--sp-lg:  24px;
--sp-xl:  40px;
--sp-2xl: 64px;

/* Layout */
--text-desc-w: 520px;   /* Work Item/Copy max-width (Figma: Text Description width) */
```

---

## Layout rules

### Nav (all pages)
- Fixed top, height 128px, horizontal padding 64px
- Logo left (72×72px SVG badge), links centred, "Get in touch" pill right
- Links: HOME / WORK / LAURA / PRODUCTION / CONTACT
- Active link: full opacity + red underline (`--red`, 1px, `::after`)
- Inactive links: opacity 0.65, no underline
- Scrolled state: `rgba(33,30,26,0.92)` + `backdrop-filter: blur(14px)`
- "Get in touch" pill: 40px tall, pill-shaped, border `--cream-50`, hover fills `--dark-white`

### Footer (all pages)
- Height 128px, horizontal padding 64px
- Background: solid `--light-black` (no border, no blur)
- Left: bear-icon.png (24px) + copyright (Jost Light 11.1px, `--cream-50`)
- Right: nav links (Jost Medium 12.8px UPPER, track 2.688px, `--cream-50`, hover `--cream`)
- Active page link has red underline (`--red`, 1.5px, `::after`)

### Page layer stack (hero + content sections)

Wrap hero + main content (including CTA) in `.page-canvas`. Footer sits **outside** the canvas. Layer order bottom→top:

```html
<div class="page-canvas">            <!-- bg: --light-black, overflow: hidden -->
  <div class="page-photo"></div>     <!-- hero photo, absolute, hero height only -->
  <div class="page-vignette"></div>  <!-- gradient fade, hero height only -->
  <div class="page-blur"></div>      <!-- blurred bg, height: 200%, opacity: 0.30, will-change: transform -->

  <header class="…-hero">…</header>  <!-- z-index: 1, transparent bg -->
  <section class="…-section">…</section>
  <section class="cta-v2">…</section>
</div>
<footer class="footer">…</footer>
```

**Critical rules:**
- `.page-canvas` must have `overflow: hidden` — prevents blur from extending past the footer
- `.page-photo` and `.page-vignette` cover only the hero height (`100vh`) not full canvas
- `.page-blur` covers `height: 100%` of the canvas — **not 200%** (200% changes the cover scale and makes it look wrong)
- All sections inside canvas have `position: relative; z-index: 1` and **no background colour**
- The CTA section goes inside the canvas so the blur covers it
- Text content is always the top layer (z-index: 1 on all content sections)

**Vignette gradient — exact Figma `Layout/Hero-bg` values (same on all pages):**
```css
.page-vignette {
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0) 0%,
    rgba(0,0,0,0) 57.9%,
    var(--light-black) 98.33%
  );
}
```
Stays fully transparent until 57.9% down the frame, then fades to `--light-black` at 98.33%. Do not darken the middle — the photo should show clearly through most of the hero.

**Hero blur blob (content legibility)** — implemented as `::before` pseudo-element on the hero section. Pure CSS, no image. `z-index: -1` within the hero's stacking context (hero has `z-index: 1`) so it renders behind all text content but above the photo layers. Hero sections must have `overflow: hidden` to contain the blurred edges.

```css
/* Pattern — exact values vary per page */
.hero-section::before {
  content: '';
  position: absolute;
  z-index: -1;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.5);
  filter: blur(50px);          /* Laura uses blur(100px) */
  border-radius: 100px;        /* Laura uses 150px */
  width: 936px;
  height: 320px–416px;
  top: 50%;                    /* or fixed top value for home */
  left: 60px–120px;
  transform: translateY(-50%); /* omit if using fixed top */
}
```

Per-page blob values (from Figma, scaled to 1440px):
- Home: `blur(50px)`, `r=100px`, `936×416px`, `top: 180px; left: 100px`
- Work: `blur(50px)`, `r=100px`, `968×320px`, `top:50%; left:106px; transform:translateY(-50%)`
- Laura: `blur(100px)`, `r=150px`, `968×416px`, `top:50%; left:106px; transform:translateY(-50%)`

**Hero layout — all pages except home:**
- `min-height: 100vh`
- `align-items: flex-start`
- `overflow: hidden`
- Hero content: `max-width: 780px; margin: 0 auto; padding: 220px 64px 80px`
- Title pinned at `220px` from top (matches home's `padding-top: 220px`); body flows down from there
- The `min-height: 100vh` guarantees content sections never creep up regardless of how much hero body text there is

**Hero layout — home:**
- `min-height: 100vh`
- `align-items: flex-start`
- Hero content: `max-width: 1160px; padding-top: 220px; padding-bottom: 80px`

**Blur images per page** (`/assets/`) — exported as JPEGs from Figma "blured bg 2" component:
- Home: `moss-blur.jpg`
- Work: `forest-blur.jpg`
- Laura: `velvet-blur.jpg`
- Available but unassigned: `stream-blur.jpg`

The blur layer uses `mix-blend-mode: lighten; opacity: 0.3` (not a flat opacity). The JPEG has a gradient-to-black baked in on the text side; `mix-blend-mode: lighten` makes the black areas transparent so the full-colour photo shows through on the open side. Using JPEGs avoids needing PNG transparency.

**Parallax** — blur scrolls at 50% of page speed via `main.js`:
```javascript
// Targets all .page-blur elements on the current page
document.querySelectorAll('.page-blur').forEach(el => {
  el.style.transform = `translateY(${scrollY * 0.5}px)`;
});
```
Uses `requestAnimationFrame` with a ticking flag for performance. Called inside the existing scroll listener.

### Hairline dividers

- Only between items, never at top or bottom of a list
- Use adjacent-sibling pseudo-element for full-viewport width:

```css
.item + .item {
  position: relative;
}
.item + .item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 100vw;
  height: 1px;
  background: var(--cream-20);   /* rgba(246,235,218,0.2) */
  transform: translateX(-50%);
}
```

### Underlined links
All underlines use `--red`:
- Nav active: `::after` pseudo-element, `background: var(--red)`
- Footer active: `::after` pseudo-element, `background: var(--red)`
- Inline text links: `text-decoration-color: var(--red)`
- "See all work →" and similar section links: `text-decoration: underline; text-decoration-color: var(--red); text-underline-offset: 3px`

### Section separators — rules
- Hairlines only **between** work items (never at top or bottom of a list)
- **No separator before the CTA** — the CTA section has no `border-top`
- No separator between the last work item and the CTA
- The colour change from photo bg → dark is handled by the vignette; no hairline needed at section boundaries

---

## Work item components (reusable — defined in `main.css`)

All three component types use the same `.wi` wrapper and share `.wi-eyebrow`, `.wi-title`, `.wi-subtitle`, `.wi-body`, `.wi-player-row`. CSS lives in `main.css` under **V2 SHARED COMPONENTS**. Use these templates on every page that shows work/audio items — home, work, laura, production.

The container is `.wi-list` (max-width **780px**, padding 0 64px) — narrower column, consistent with all pages. `.wi-list--narrow` is also 780px and is used on the laura page sections. Use `<article class="wi">` for each item.

### Component 1 — Section/Video and Section/Interactive

Video thumbnail (274×191px) and body copy are **side-by-side** in a two-column row. "Watch on YouTube" link sits below the thumbnail inside col1.

```html
<article class="wi">
  <p class="wi-eyebrow reveal">Video</p>            <!-- Jost 500 12px UPPER track=1.8px --red -->
  <div class="wi-title-group reveal d1">
    <h2 class="wi-title">Title</h2>                 <!-- Cormorant 500 clamp(1.4–1.75rem) -->
    <p class="wi-subtitle">Subtitle</p>             <!-- Jost 300 12.8px -->
  </div>
  <div class="wi-media-row reveal d2">
    <!-- col1: 274px wide, pr-24px — thumbnail + YouTube link -->
    <div class="wi-video-col">
      <a class="wi-yt-thumb" href="…" target="_blank">
        <img src="thumbnail.jpg" alt="…">
        <span class="wi-yt-play">▶</span>
      </a>
      <a class="wi-yt-link" href="…">Watch on YouTube ↗</a>
    </div>
    <!-- col2: flex-1, pr-24px — body copy only -->
    <div class="wi-copy-col">
      <p class="wi-body">Body copy…</p>             <!-- Jost 300 14.5px -->
    </div>
  </div>
</article>
```

### Component 2 — Section/Audiobook with Cover

Title/subtitle are their **own row** above the media row. Streaming icons sit at the **bottom of col2** (below body copy), not alongside the cover.

```html
<article class="wi">
  <p class="wi-eyebrow wi-eyebrow--audio reveal">Immersive Audiobook</p>
  <!-- wi-eyebrow--audio: Jost 500 10.7px track=0.643px -->
  <div class="wi-title-group reveal d1">
    <h2 class="wi-title">Title</h2>
    <p class="wi-subtitle">Author</p>
  </div>
  <div class="wi-media-row reveal d2">
    <!-- col1: 173×173px cover, pr-24px -->
    <div class="wi-cover"><img src="cover.png" alt="…" width="173" height="173"></div>
    <!-- col2: flex-1, pr-24px — body copy top, streaming icons bottom -->
    <div class="wi-copy-col">
      <p class="wi-body">Body copy…</p>             <!-- Jost 300 14.5px, fills flex space -->
      <nav class="wi-streaming" aria-label="Listen on">
        <a class="wi-stream-icon" href="#" aria-label="Spotify">
          <img src="assets/icons/Spotify.svg" alt="" width="36" height="36">
        </a>
        <a class="wi-stream-icon" href="#" aria-label="Apple Books">
          <img src="assets/icons/Apple Books.svg" alt="" width="36" height="36">
        </a>
        <a class="wi-stream-icon" href="#" aria-label="Audible">
          <img src="assets/icons/Audible.svg" alt="" width="36" height="36">
        </a>
      </nav>
    </div>
  </div>
  <div class="wi-player-row reveal d3">
    <div class="wi-player">
      <div class="player player-wk" data-player="id" data-dur="35" data-color="c1"></div>
      <div class="wi-player-meta">
        <span class="wi-player-label">Sample</span>
        <a class="wi-player-dl" href="#" download>
          <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
          MP3
        </a>
      </div>
    </div>
  </div>
</article>
```

### Component 3 — Section/Audio no Image (Stack player)

No cover image. Used for voice demos (Laura page), radio/TV demos, etc.

```html
<article class="wi">
  <p class="wi-eyebrow wi-eyebrow--audio reveal">Narration</p>
  <!-- No .wi-header or .wi-cover -->
  <div class="wi-title-group reveal d1">
    <h2 class="wi-title">Track Title</h2>
    <p class="wi-subtitle">Warm, fun, knowing, quirky</p>  <!-- keywords / descriptor -->
  </div>
  <div class="wi-player-row reveal d2">
    <div class="wi-player">
      <div class="player player-wk" data-player="id" data-dur="35" data-color="c2"></div>
      <div class="wi-player-meta">
        <span class="wi-player-label">Track Title</span>
        <a class="wi-player-dl" href="#" download>
          <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
          MP3
        </a>
      </div>
    </div>
  </div>
</article>
```

**Player colour by category (Laura page):**
- `c2` (Blue/teal) — Narration demos
- `c1` (Red) — Audiobook demos
- `c3` (Yellow/amber) — Commercial, Technical demos

### CSS structure rationale

**Why `.wi-copy-col` has a fixed `height: 173px`**  
Matches the audiobook cover height so streaming icons can be pinned to the bottom with `margin-top: auto`. Video items use the same height for visual alignment with audiobooks — consistent across all `.wi-media-row` items on a page.

**How streaming icons pin to the bottom**  
`.wi-copy-col` is `display: flex; flex-direction: column`. `.wi-body` inside it gets `flex: 1`, consuming all spare vertical space. `.wi-streaming` then sits at the natural bottom of the column. The scoped rule `.wi-copy-col .wi-streaming { margin-top: auto }` reinforces this. The base `.wi-streaming` rule deliberately has no `margin-top: auto` so it doesn't break if ever used outside a flex column.

**Why `.wi-copy-col .wi-body` resets padding to 0**  
The base `.wi-body` rule has `padding: 8px 0` for Component 3 (audio no image), where there's no surrounding flex container. Inside `.wi-copy-col` the flex layout owns spacing, so padding is zeroed to avoid double gaps.

**Why `.wi-cover` and `.wi-video-col` use `margin-right` not `padding-right`**  
Padding would compress the image inside the element's box. Margin creates the gap between the image box and `.wi-copy-col`, keeping image dimensions exact.

**Why `.wi-body` uses `--text-desc-w` (520px) not 100%**  
Even when the copy column is wide, long lines hurt readability. 520px (~65–70 chars at 14.5px) is the Figma-specified "Text Description width" — apply it on every page using `.wi-body`.

**Dead classes to avoid reintroducing**  
`.wi-header`, `.wi-cover-info`, `.wi-video-row` were removed in the Figma V2 update. Do not use them. The replacement classes are `.wi-title-group`, `.wi-media-row`, `.wi-video-col`, `.wi-copy-col`.

---

## Scroll reveal

Elements animate in as they enter the viewport using `.reveal` + `.visible` driven by `IntersectionObserver` in `main.js`.

```css
/* main.css */
.reveal         { opacity: 0; transform: translateY(24px); transition: opacity 0.65s ease, transform 0.65s ease; }
.reveal.visible { opacity: 1; transform: none; }
.d1 { transition-delay: 0.08s; }
.d2 { transition-delay: 0.16s; }
.d3 { transition-delay: 0.24s; }
.d4 { transition-delay: 0.32s; }
```

**Pattern for work items** — stagger child elements, not the whole article:

```html
<article class="wi">
  <p class="wi-eyebrow reveal">…</p>             <!-- leads, no delay -->
  <div class="wi-title-group reveal d1">…</div>  <!-- +80ms -->
  <div class="wi-media-row reveal d2">…</div>    <!-- +160ms -->
  <div class="wi-player-row reveal d3">…</div>   <!-- +240ms (audiobook only) -->
</article>
```

**CTA** — title / body / button stagger with d1, d2.  
**Hero** — title `reveal`, body `reveal d1`, player `reveal d2`.  
**Do not** put `.reveal` on both a parent and its children — the parent's `opacity:0` hides children regardless of their own state.

---

## Audio players (`main.js`)

Initialised by `initPlayers()` on page load. All pages use circular players.

**Circular sizes:**
- `.player-lg` — 148px (hero). Renders label inside + time below. `flex-direction: column` on `.player-inner` required.
- `.player-wk` — 100px (work items, voice demos)
- `.player-md` — 76px (default)
- `.player-sm` — 64px

`data-color` accepts `c1` / `c2` / `c3` which resolve via CSS variables.

Only one player plays at a time.

---

## Assets

Photos used per page:
| File | Used on |
|------|---------|
| `hero-moss.jpg` | Home hero bg (`page-photo`) |
| `moss-blur.jpg` | Home blur layer (`page-blur`) |
| `forest.jpg` | Work hero bg (`page-photo`) |
| `forest-blur.jpg` | Work blur layer (`page-blur`) |
| `velvet.jpg` | Laura hero bg (`page-photo`) |
| `velvet-blur.jpg` | Laura blur layer (`page-blur`) |
| `stream-blur.jpg` | Available, unassigned |
| `VR Cover 3000x3000.png` | Velveteen Rabbit audiobook cover |
| `TTNBC Cover 3000x3000.jpg` | 'Twas the Night Before Christmas cover |
| `laura.jpeg` | Laura portrait (not currently in use) |
| `david.jpg` | David portrait (not currently in use) |
| `bear-icon.png` | Footer logo |
| `assets/icons/Spotify.svg` | Streaming icon |
| `assets/icons/Apple Books.svg` | Streaming icon |
| `assets/icons/Audible.svg` | Streaming icon |

---

## Laura page (`laura.html`)

Full V2 — implemented from Figma node `352:7144`.

**Sections in order:**
1. Hero — "Laura Cox" title + 3 short Cormorant Light 24px intro paragraphs
2. Voice Demos — 7 tracks, flat structure (see below)
3. Quote — Kevin Moss / Important Small Things
4. Credits — eyebrow + Cormorant prose credits list
5. About Laura — eyebrow + first-person bio (6 paragraphs)
6. CTA — "Want to make something together?" / "Book Laura"

**Voice Demos flat structure** (different from standard Component 3 — no `.wi` article per track):

```html
<section class="wi-section">
  <div class="wi-list--narrow">
    <h2 class="section-heading reveal">Voice Demos</h2>

    <p class="wi-eyebrow reveal">Narration</p>          <!-- category label, mt: var(--sp-xl) -->
    <div class="wi-player-row reveal d1">…</div>        <!-- Car Boot Kings, c2 -->
    <div class="wi-player-row reveal d2">…</div>        <!-- The Secret Life…, c2 -->

    <p class="wi-eyebrow reveal">Audiobook</p>
    <div class="wi-player-row reveal d1">…</div>        <!-- Tyrannosaurus Drip, c1 -->
    <div class="wi-player-row reveal d2">…</div>        <!-- 'Twas the Night…, c1 -->
    <div class="wi-player-row reveal d3">…</div>        <!-- The Velveteen Rabbit, c1 -->

    <p class="wi-eyebrow reveal">Technical</p>
    <div class="wi-player-row reveal d1">…</div>        <!-- Coronary Angioplasty, c3 -->

    <p class="wi-eyebrow reveal">Commercial</p>
    <div class="wi-player-row reveal d1">…</div>        <!-- Money Supermarket, c3 -->
  </div>
</section>
```

CSS rule that spaces categories: `.wi-list--narrow .wi-eyebrow:not(:first-of-type) { margin-top: var(--sp-xl); }`

**Long-copy body text** (Credits / About Laura sections):
```css
.laura-long-copy {
  font-family: var(--serif);
  font-weight: 300;
  font-size: 24px;
  line-height: 40px;
  color: var(--dark-white);
  margin: 0 0 var(--sp-xl);
}
```

---

## Figma workflow

**Source of truth:** Figma V2 file Finals section.

**Protocol for implementing a new page:**
1. `get_design_context` on the page node (one API call)
2. Parse locally with Python — extract element tree, font specs, dimensions, colours
3. Present spec table to user for confirmation before writing any code
4. Implement from confirmed spec only — no guessing

**Do not call Figma API** for values already confirmed in this spec.

---

## Under-construction pages

`about.html`, `contact.html`, `production.html` are minimal stubs. They share the same template:
- Dark bg (`--light-black`), nav, footer
- Cormorant italic large title
- "This page is on its way. Check back soon."
- "Back to home" `.btn-cta` button

---

## Preview

Use `preview_start` (name: `website`) to start the server.  
Do **not** use the in-app preview screenshot tool to verify scrolled content — it doesn't capture scrolled state reliably. Direct browser review at `http://localhost:8081` is the source of truth.
