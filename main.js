/* ===== TWEAK DEFAULTS ===== */
const TWEAK_DEFAULTS = { "theme": "c", "navDark": true };

/* ===== HELPERS ===== */
function fmtTime(s) { return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }

/* ===== AUDIO PLAYERS ===== */
const players = {};

function initPlayers() {
  document.querySelectorAll('[data-player]').forEach(el => {
    if (players[el.dataset.player]) return;
    if (el.dataset.style === 'bar') { renderBarPlayer(el); return; }
    const dur = parseInt(el.dataset.dur || 42);
    const label = el.dataset.label || '';
    const colorVar = el.dataset.color || 'c1';
    const isLg = el.classList.contains('player-lg');
    const isSm = el.classList.contains('player-sm');
    const size = isLg ? 148 : isSm ? 64 : 76;
    const r = size / 2;
    const ringR = r + 9;
    const svgSize = ringR * 2 + 6;
    const circ = +(2 * Math.PI * ringR).toFixed(2);
    const isDark = el.classList.contains('player--dark');
    const strokeColor = `var(--${colorVar})`;

    el.innerHTML = `
      <div class="player-inner" style="width:${size}px;height:${size}px;background:var(--${colorVar});color:var(--${colorVar}t)" role="button" tabindex="0" aria-label="Play audio sample">
        <svg class="player-ring" style="position:absolute;inset:${-(svgSize-size)/2}px;width:${svgSize}px;height:${svgSize}px;overflow:visible;pointer-events:none;" viewBox="0 0 ${svgSize} ${svgSize}">
          <circle class="r-bg" cx="${svgSize/2}" cy="${svgSize/2}" r="${ringR}" stroke="${strokeColor}"/>
          <circle class="r-prog" cx="${svgSize/2}" cy="${svgSize/2}" r="${ringR}" stroke="${strokeColor}"
            stroke-dasharray="${circ}" stroke-dashoffset="${circ}"
            transform="rotate(-90 ${svgSize/2} ${svgSize/2})"/>
        </svg>
        <svg class="player-icon" viewBox="0 0 24 24" width="${isLg?30:isSm?16:22}" height="${isLg?30:isSm?16:22}" fill="var(--${colorVar}t)">
          <path d="M8 5v14l11-7z"/>
        </svg>
        ${label ? `<span class="player-inner-label" style="color:var(--${colorVar}t)">${label}</span>` : ''}
      </div>
      <span class="player-time${isDark?' player--dark':''}" style="${isDark?'color:oklch(55% 0.010 80)':''}">0:00 / ${fmtTime(dur)}</span>
    `;

    const state = { playing: false, time: 0, dur, interval: null, circ };
    const inner = el.querySelector('.player-inner');
    const prog = el.querySelector('.r-prog');
    const timeEl = el.querySelector('.player-time');
    const iconPath = el.querySelector('.player-icon path');

    inner.addEventListener('click', () => {
      if (state.playing) pausePlayer(state, inner, iconPath);
      else playPlayer(state, inner, iconPath, prog, timeEl);
    });

    players[el.dataset.player] = state;
  });
}

function renderBarPlayer(el) {
  const dur = parseInt(el.dataset.dur || 60);
  const label = el.dataset.label || '';
  const id = el.dataset.player;
  const dark = el.dataset.dark === 'true';

  el.innerHTML = `
    <div class="ab-wrap${dark?' on-dark':''}">
      <button class="ab-btn" aria-label="Play ${label}">
        <svg viewBox="0 0 24 24" width="14" height="14"><path d="M8 5v14l11-7z"/></svg>
      </button>
      <div class="ab-track"><div class="ab-progress"></div></div>
      <span class="ab-time">0:00 / ${fmtTime(dur)}</span>
      ${label ? `<span class="ab-label">${label}</span>` : ''}
    </div>
  `;

  const state = { playing: false, time: 0, dur, interval: null };
  const btn = el.querySelector('.ab-btn');
  const prog = el.querySelector('.ab-progress');
  const timeEl = el.querySelector('.ab-time');
  const iconPath = el.querySelector('svg path');

  btn.addEventListener('click', () => {
    if (state.playing) {
      state.playing = false;
      clearInterval(state.interval);
      iconPath.setAttribute('d', 'M8 5v14l11-7z');
      state.pauseFn = null;
    } else {
      Object.values(players).forEach(p => p.pauseFn && p.pauseFn());
      state.playing = true;
      iconPath.setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z');
      state.interval = setInterval(() => {
        state.time++;
        if (state.time > state.dur) {
          state.time = 0; state.playing = false;
          clearInterval(state.interval);
          iconPath.setAttribute('d', 'M8 5v14l11-7z');
          prog.style.width = '0%';
          timeEl.textContent = `0:00 / ${fmtTime(state.dur)}`;
          return;
        }
        prog.style.width = (state.time / state.dur * 100) + '%';
        timeEl.textContent = `${fmtTime(state.time)} / ${fmtTime(state.dur)}`;
      }, 1000);
      state.pauseFn = () => {
        state.playing = false; clearInterval(state.interval);
        iconPath.setAttribute('d', 'M8 5v14l11-7z');
      };
    }
  });

  players[id] = state;
}

function playPlayer(s, inner, iconPath, prog, timeEl) {
  // Pause any other playing player first
  Object.values(players).forEach(p => {
    if (p !== s && p.playing) {
      p.pauseFn && p.pauseFn();
    }
  });
  s.playing = true;
  iconPath.setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z');
  inner.style.transform = 'scale(1)';
  s.interval = setInterval(() => {
    s.time++;
    if (s.time > s.dur) { s.time = 0; pausePlayer(s, inner, iconPath); return; }
    const offset = s.circ * (1 - s.time / s.dur);
    prog.style.strokeDashoffset = offset;
    const cur = fmtTime(s.time);
    const tot = fmtTime(s.dur);
    timeEl.textContent = `${cur} / ${tot}`;
  }, 1000);
  s.pauseFn = () => pausePlayer(s, inner, iconPath);
}

function pausePlayer(s, inner, iconPath) {
  s.playing = false;
  clearInterval(s.interval);
  iconPath.setAttribute('d', 'M8 5v14l11-7z');
}

/* ===== SCROLL REVEAL ===== */
let revealObserver;
function revealInViewport() {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92) el.classList.add('visible');
  });
}

function initReveals() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
  }
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
  // Fallback for sandboxed/restricted environments where IntersectionObserver doesn't fire
  setTimeout(revealInViewport, 100);
  setTimeout(revealInViewport, 600);
}

/* ===== NAV SCROLL ===== */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  revealInViewport();
}, { passive: true });

/* ===== INIT ===== */
function init() {
  document.documentElement.dataset.theme = TWEAK_DEFAULTS.theme;

  // Ken Burns on hero
  const heroBg = document.getElementById('hero-bg');
  if (heroBg) setTimeout(() => heroBg.classList.add('loaded'), 100);

  // Hero reveal on load
  setTimeout(() => {
    const hero = document.querySelector('.hero-content');
    if (hero) {
      hero.style.opacity = '0';
      hero.style.transform = 'translateY(30px)';
      hero.style.transition = 'opacity 1s var(--ease), transform 1s var(--ease)';
      setTimeout(() => { hero.style.opacity = '1'; hero.style.transform = 'none'; }, 200);
    }
  }, 50);

  initPlayers();
  initReveals();
}

// Script is at end of <body> so DOM is ready; DOMContentLoaded may have already fired
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
