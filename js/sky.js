/* ===== SKY — star field that wheels around a celestial pole as you scroll =====
   Any page with a <canvas class="sky-stars"> gets it (see main.css).

   One viewport-sized fixed canvas, redrawn on scroll: every star is stored
   once in pole-relative coordinates and the whole field is drawn through a
   single rotate() about the pole. Cheaper and crisper than moving DOM dots,
   and avoids the huge composited layer a rotating oversized SVG would need.

   The pole sits just off-screen to the right, above centre, so on screen the
   stars trace arcs rather than an obvious spin. Rotation is clockwise as you
   scroll down (set by DIRECTION). */

// Pole position as fractions of the canvas. The canvas is bottom-anchored at
// a constant (large-viewport) height, so y is effectively fixed relative to
// the window bottom and the footer hill: 0.1 = 90% of that height above it.
const POLE = {x: 1.1, y: 0.1};
const DEG_PER_SCREEN = 3.5; // rotation per viewport-height scrolled
const DIRECTION = 1; // 1 = clockwise as you scroll down, -1 = anticlockwise
const DENSITY = 1 / 3467; // stars per px² of sky
const SEED = 20261014; // fixed seed: the same sky on every visit

// Subtle star colours, weighted roughly like the real night sky: mostly
// white, then warm yellow-whites and cool blue-whites, a few orange and the
// odd reddish one. All kept pale so the field still reads as white.
const STAR_COLOURS = [
  ["#f9f4ec", 38], // --dark-white
  ["#fff3dc", 18], // yellow-white (G)
  ["#e4ebff", 16], // blue-white (A)
  ["#d4e0ff", 8], //  pale blue (B)
  ["#ffe4b8", 11], // pale gold (K)
  ["#ffd2a6", 7], //  orange (K/M)
  ["#ffbfa8", 2], //  reddish (M)
];
const COLOUR_TOTAL = STAR_COLOURS.reduce((t, [, w]) => t + w, 0);
const pickColour = (r) => {
  let n = r * COLOUR_TOTAL;
  for (const [c, w] of STAR_COLOURS) if ((n -= w) < 0) return c;
  return STAR_COLOURS[0][0];
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// Small deterministic PRNG (mulberry32) so the star field is stable
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function initSky() {
  const canvas = document.querySelector(".sky-stars");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W = 0;
  let H = 0;
  let pole = {x: 0, y: 0};
  let stars = [];
  let ticking = false;

  const rotationAt = (scrollY) =>
    reducedMotion.matches
      ? 0
      : (DIRECTION * (scrollY / H) * DEG_PER_SCREEN * Math.PI) / 180;

  // Geometry comes from the canvas's own CSS box, which main.css sizes to the
  // *large* viewport (100lvh). On mobile the browser toolbar showing/hiding
  // changes window.innerHeight and fires resize, but not this box — so the
  // pole, the rotation rate and the stars all stay put instead of jumping.
  const measure = () => [canvas.clientWidth, canvas.clientHeight];

  // Seed a full ring of sky around the pole: every star that could ever be
  // on screen at this canvas size, whatever the scroll. Nothing depends on
  // the page's length, so late layout changes (fonts, images) can't reshuffle
  // the sky. Off-screen stars are culled when drawing.
  function seed() {
    [W, H] = measure();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pole = {x: W * POLE.x, y: H * POLE.y};

    // Inner radius: distance from the pole to the nearest point of the
    // viewport (often on an edge, not a corner); outer: the farthest corner
    const nearX = Math.min(Math.max(pole.x, 0), W);
    const nearY = Math.min(Math.max(pole.y, 0), H);
    const rMin = Math.max(0, Math.hypot(nearX - pole.x, nearY - pole.y) - 40);
    const rMax =
      Math.max(
        ...[
          [0, 0],
          [W, 0],
          [0, H],
          [W, H],
        ].map(([x, y]) => Math.hypot(x - pole.x, y - pole.y)),
      ) + 40;

    const count = Math.round(Math.PI * (rMax * rMax - rMin * rMin) * DENSITY);
    const rand = rng(SEED);
    // Separate stream for colour, so positions match the uncoloured sky
    const randColour = rng(SEED + 1);

    stars = [];
    for (let i = 0; i < count; i++) {
      // Uniform over the ring's area
      const r = Math.sqrt(rand() * (rMax * rMax - rMin * rMin) + rMin * rMin);
      const a = rand() * Math.PI * 2;
      // Mostly faint pinpricks, a few brighter stars
      const mag = Math.pow(rand(), 3);
      stars.push({
        x: r * Math.cos(a),
        y: r * Math.sin(a),
        size: 0.35 + mag * 1.1,
        // Low floor: the faint majority sits around 0.1–0.2 opacity while
        // the few bright stars (mag near 1) still reach ~0.9
        alpha: 0.08 + mag * 0.82,
        colour: pickColour(randColour()),
      });
    }
  }

  function draw() {
    ticking = false;
    ctx.clearRect(0, 0, W, H);
    // Rotate each star about the pole by hand (one sin/cos per frame) so
    // stars outside the viewport can be skipped before any drawing
    const rot = rotationAt(window.scrollY);
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    for (const s of stars) {
      const x = pole.x + s.x * cos - s.y * sin;
      const y = pole.y + s.x * sin + s.y * cos;
      if (x < -2 || y < -2 || x > W + 2 || y > H + 2) continue;
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = s.colour;
      ctx.beginPath();
      ctx.arc(x, y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  const requestDraw = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(draw);
    }
  };

  // Until main.css applies, the canvas's box is just its own bitmap size
  // (300×150 by default). Seeding from that left a tiny bitmap that CSS then
  // stretched over the viewport — big, blurry stars on some first loads —
  // and resizing the bitmap to the box would feed back on itself. So only
  // seed once the stylesheet has positioned the canvas.
  const styled = () => getComputedStyle(canvas).position === "fixed";

  if (styled()) {
    seed();
    draw();
  }
  window.addEventListener("scroll", requestDraw, {passive: true});
  // Reseed whenever the canvas box itself changes (CSS arriving, window
  // width, desktop window resizes, rotation) — not for mobile toolbar
  // show/hide, which leaves this box alone
  new ResizeObserver(() => {
    if (!styled()) return;
    const [w, h] = measure();
    if (w !== W || h !== H) {
      seed();
      requestDraw();
    }
  }).observe(canvas);
  reducedMotion.addEventListener?.("change", requestDraw);
}
