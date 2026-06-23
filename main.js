/* ===== TWEAK DEFAULTS ===== */
const TWEAK_DEFAULTS = {theme: "c", navDark: true};

/* ===== HELPERS ===== */
function fmtTime(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/* ===== AUDIO PLAYERS ===== */
const players = {};

function initPlayers() {
  document.querySelectorAll("[data-player]").forEach((el) => {
    if (players[el.dataset.player]) return;
    const dur = parseInt(el.dataset.dur || 42);
    const label = el.dataset.label || "";
    const colorVar = el.dataset.color || "c1";
    const isLg = el.classList.contains("player-lg");
    const isSm = el.classList.contains("player-sm");
    const isWk = el.classList.contains("player-wk");
    const size = isLg ? 148 : isSm ? 64 : isWk ? 100 : 76;
    const r = size / 2;
    const ringR = r + 9;
    const svgSize = ringR * 2 + 6;
    const circ = +(2 * Math.PI * ringR).toFixed(2);
    const isDark = el.classList.contains("player--dark");
    const strokeColor = `var(--${colorVar})`;

    el.innerHTML = `
      <div class="player-inner" style="width:${size}px;height:${size}px;background:var(--${colorVar});color:var(--${colorVar}t)" role="button" tabindex="0" aria-label="Play audio sample">
        <svg class="player-ring" style="position:absolute;inset:${-(svgSize - size) / 2}px;width:${svgSize}px;height:${svgSize}px;overflow:visible;pointer-events:none;" viewBox="0 0 ${svgSize} ${svgSize}">
          <circle class="r-bg" cx="${svgSize / 2}" cy="${svgSize / 2}" r="${ringR}" stroke="${strokeColor}"/>
          <circle class="r-prog" cx="${svgSize / 2}" cy="${svgSize / 2}" r="${ringR}" stroke="${strokeColor}"
            stroke-dasharray="${circ}" stroke-dashoffset="${circ}"
            transform="rotate(-90 ${svgSize / 2} ${svgSize / 2})"/>
          <circle class="r-dot" cx="${svgSize / 2}" cy="${svgSize / 2 - ringR}" r="5" fill="${strokeColor}" opacity="0"/>
        </svg>
        <svg class="player-icon" viewBox="0 0 24 24" width="${isLg ? 30 : isSm ? 16 : isWk ? 26 : 22}" height="${isLg ? 30 : isSm ? 16 : isWk ? 26 : 22}" fill="var(--${colorVar}t)">
          <path d="M8 5v14l11-7z"/>
        </svg>
        ${label && isLg ? `<span class="player-inner-label" style="color:var(--${colorVar}t)">${label}</span>` : ""}
      </div>
      <span class="player-time${isDark ? " player--dark" : ""}" style="${isDark ? "color:oklch(55% 0.010 80)" : ""}">0:00 / ${fmtTime(dur)}</span>
    `;

    // Set explicit width so layout containers (e.g. grid) allocate the full
    // outer-ring size rather than just the inner disc width.
    el.style.width = svgSize + "px";

    const cx = svgSize / 2;
    const state = {playing: false, time: 0, dur, interval: null, circ, cx};
    const inner = el.querySelector(".player-inner");
    const prog = el.querySelector(".r-prog");
    const dot = el.querySelector(".r-dot");
    const timeEl = el.querySelector(".player-time");
    const iconPath = el.querySelector(".player-icon path");

    inner.addEventListener("click", () => {
      if (state.playing) pausePlayer(state, inner, iconPath, dot);
      else playPlayer(state, inner, iconPath, prog, timeEl, dot);
    });

    players[el.dataset.player] = state;
  });
}

function playPlayer(s, inner, iconPath, prog, timeEl, dot) {
  Object.values(players).forEach((p) => {
    if (p !== s && p.playing) p.pauseFn && p.pauseFn();
  });
  s.playing = true;
  iconPath.setAttribute("d", "M6 19h4V5H6v14zm8-14v14h4V5h-4z");
  inner.style.transform = "scale(1)";
  if (dot) dot.setAttribute("opacity", "1");
  s.interval = setInterval(() => {
    s.time += 0.04;
    if (s.time > s.dur) {
      s.time = 0;
      pausePlayer(s, inner, iconPath, dot);
      return;
    }
    const progress = s.time / s.dur;
    prog.style.strokeDashoffset = s.circ * (1 - progress);
    if (dot)
      dot.setAttribute(
        "transform",
        `rotate(${progress * 360}, ${s.cx}, ${s.cx})`,
      );
    if (timeEl)
      timeEl.textContent = `${fmtTime(Math.floor(s.time))} / ${fmtTime(s.dur)}`;
  }, 40);
  s.pauseFn = () => pausePlayer(s, inner, iconPath, dot);
}

function pausePlayer(s, inner, iconPath, dot) {
  s.playing = false;
  clearInterval(s.interval);
  iconPath.setAttribute("d", "M8 5v14l11-7z");
  if (dot) dot.setAttribute("opacity", "0");
}

/* ===== SCROLL REVEAL ===== */
let revealObserver;
function revealInViewport() {
  document.querySelectorAll(".reveal:not(.visible)").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92) el.classList.add("visible");
  });
}

function initReveals() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            revealObserver.unobserve(e.target);
          }
        });
      },
      {threshold: 0.08},
    );
  }
  document
    .querySelectorAll(".reveal:not(.visible)")
    .forEach((el) => revealObserver.observe(el));
  // Fallback for sandboxed/restricted environments where IntersectionObserver doesn't fire
  setTimeout(revealInViewport, 100);
  setTimeout(revealInViewport, 600);
}

/* ===== PARALLAX — blur layer scrolls at 50% of page ===== */
let parallaxTicking = false;
function updateParallax() {
  const y = window.scrollY;
  document.querySelectorAll(".page-blur").forEach((el) => {
    el.style.transform = `translateY(${y * 0.5}px)`;
  });
  // Fade the scroll cue out as the user moves away from the top of the page
  const cue = document.querySelector(".hero-scroll");
  if (cue) cue.style.opacity = Math.max(0, 1 - y / (window.innerHeight * 0.5));
  parallaxTicking = false;
}

/* ===== NAV SCROLL ===== */
window.addEventListener(
  "scroll",
  () => {
    const nav = document.getElementById("nav");
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 40);
    revealInViewport();
    if (!parallaxTicking) {
      requestAnimationFrame(updateParallax);
      parallaxTicking = true;
    }
  },
  {passive: true},
);

/* ===== MOBILE NAV (hamburger) ===== */
function initNavToggle() {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (!nav || !toggle || !menu) return;
  const mobileMq = window.matchMedia("(max-width: 900px)");
  const setOpen = (open) => {
    nav.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
    // Closed mobile overlay is off-screen — keep its links out of the tab order.
    menu.inert = mobileMq.matches && !open;
    // While open, make the rest of the page inert so Tab stays inside the menu
    // and screen readers ignore the background behind the overlay.
    for (const el of document.body.children) {
      if (el !== nav) el.inert = open;
    }
    if (open) {
      const first = menu.querySelector("a");
      if (first) first.focus();
    }
  };
  toggle.addEventListener("click", () => {
    const willOpen = !nav.classList.contains("menu-open");
    setOpen(willOpen);
    if (!willOpen) toggle.focus();
  });
  menu
    .querySelectorAll("a")
    .forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("menu-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
  // Returning to the desktop nav resets to closed so the icon shows the
  // hamburger (not a stuck X), body scroll is unlocked, and inert is cleared.
  const syncToBreakpoint = () => {
    if (!mobileMq.matches) setOpen(false);
    else menu.inert = !nav.classList.contains("menu-open");
  };
  mobileMq.addEventListener("change", syncToBreakpoint);
  window.addEventListener("resize", syncToBreakpoint, {passive: true});
  // Initial state: closed mobile overlay starts inert; desktop nav stays interactive.
  menu.inert = mobileMq.matches;
}

/* ===== INIT ===== */
function init() {
  document.documentElement.dataset.theme = TWEAK_DEFAULTS.theme;

  initPlayers();
  initReveals();
  updateParallax();
  initNavToggle();
}

// Script is at end of <body> so DOM is ready; DOMContentLoaded may have already fired
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
