/* ===== SKY — star field that wheels around a celestial pole as you scroll =====
   Any page with a <canvas class="sky-stars"> gets it (see main.css).

   One viewport-sized fixed canvas, redrawn on scroll: every star is stored
   once in pole-relative coordinates and the whole field is drawn through a
   single rotate() about the pole. Cheaper and crisper than moving DOM dots,
   and avoids the huge composited layer a rotating oversized SVG would need.

   The pole sits just off-screen to the right, below centre, so on screen the
   stars trace arcs rather than an obvious spin. Rotation is anticlockwise, as the
   northern sky turns around Polaris. */

const POLE = {x: 1.1, y: 0.7}; // pole position as fractions of the viewport
const DEG_PER_SCREEN = 3.5; // rotation per viewport-height scrolled
const DENSITY = 1 / 5200; // stars per px² of sky
const SEED = 20261014; // fixed seed: the same sky on every visit

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
    reducedMotion.matches ? 0 : -((scrollY / H) * DEG_PER_SCREEN * Math.PI) / 180;

  // Seed only the sector of sky that can ever pass through the viewport:
  // the viewport's angular span as seen from the pole, widened by the most
  // the sky will turn over the page's full scroll.
  function seed() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pole = {x: W * POLE.x, y: H * POLE.y};

    const corners = [
      [0, 0],
      [W, 0],
      [0, H],
      [W, H],
    ].map(([x, y]) => [x - pole.x, y - pole.y]);
    const dists = corners.map(([x, y]) => Math.hypot(x, y));
    const angles = corners.map(([x, y]) => Math.atan2(y, x));
    const rMin = Math.max(0, Math.min(...dists) - 40);
    const rMax = Math.max(...dists) + 40;

    const maxScroll = Math.max(0, document.documentElement.scrollHeight - H);
    const maxTurn = Math.abs(rotationAt(maxScroll));
    // Sky turns anticlockwise (angle decreasing), so stars seen late in the
    // page start at larger angles — widen the sector on that side
    const aMin = Math.min(...angles) - 0.05;
    const aMax = Math.max(...angles) + maxTurn + 0.05;

    const area = ((aMax - aMin) / 2) * (rMax * rMax - rMin * rMin);
    const count = Math.round(area * DENSITY);
    const rand = rng(SEED);

    stars = [];
    for (let i = 0; i < count; i++) {
      // Uniform over the annular sector's area
      const r = Math.sqrt(rand() * (rMax * rMax - rMin * rMin) + rMin * rMin);
      const a = aMin + rand() * (aMax - aMin);
      // Mostly faint pinpricks, a few brighter stars
      const mag = Math.pow(rand(), 3);
      stars.push({
        x: r * Math.cos(a),
        y: r * Math.sin(a),
        size: 0.35 + mag * 1.1,
        // Low floor: the faint majority sits around 0.1–0.2 opacity while
        // the few bright stars (mag near 1) still reach ~0.9
        alpha: 0.08 + mag * 0.82,
      });
    }
  }

  function draw() {
    ticking = false;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    ctx.translate(pole.x, pole.y);
    ctx.rotate(rotationAt(window.scrollY));
    ctx.fillStyle = "#f9f4ec"; // --dark-white
    for (const s of stars) {
      ctx.globalAlpha = s.alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  const requestDraw = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(draw);
    }
  };

  seed();
  draw();
  window.addEventListener("scroll", requestDraw, {passive: true});
  window.addEventListener("resize", () => {
    seed();
    requestDraw();
  });
  // Page height can grow after load (fonts, images) — reseed so the sector
  // covers the full scroll
  window.addEventListener("load", () => {
    seed();
    requestDraw();
  });
  reducedMotion.addEventListener?.("change", requestDraw);
}
