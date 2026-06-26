import {initPlayers} from "./js/audio-player.js";

/* ===== TWEAK DEFAULTS ===== */
const TWEAK_DEFAULTS = {theme: "c", navDark: true};

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

/* ===== DOWNLOAD BUTTONS ===== */
function initDownloads() {
  document.querySelectorAll(".wi-player-dl").forEach(link => {
    const src = link.closest(".wi-player")?.querySelector("[data-src]")?.dataset.src;
    if (src) {
      link.href = src;
      link.download = src.split("/").pop();
    } else {
      link.hidden = true;
    }
  });
}

/* ===== INIT ===== */
function init() {
  document.documentElement.dataset.theme = TWEAK_DEFAULTS.theme;

  initPlayers();
  initDownloads();
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
