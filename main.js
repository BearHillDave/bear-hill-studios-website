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
          <circle class="r-dot" cx="${svgSize/2}" cy="${svgSize/2 - ringR}" r="5" fill="${strokeColor}" opacity="0"/>
        </svg>
        <svg class="player-icon" viewBox="0 0 24 24" width="${isLg?30:isSm?16:22}" height="${isLg?30:isSm?16:22}" fill="var(--${colorVar}t)">
          <path d="M8 5v14l11-7z"/>
        </svg>
        ${(label && isLg) ? `<span class="player-inner-label" style="color:var(--${colorVar}t)">${label}</span>` : ''}
      </div>
      <span class="player-time${isDark?' player--dark':''}" style="${isDark?'color:oklch(55% 0.010 80)':''}">0:00 / ${fmtTime(dur)}</span>
    `;

    const cx = svgSize / 2;
    const state = { playing: false, time: 0, dur, interval: null, circ, cx };
    const inner = el.querySelector('.player-inner');
    const prog = el.querySelector('.r-prog');
    const dot = el.querySelector('.r-dot');
    const timeEl = el.querySelector('.player-time');
    const iconPath = el.querySelector('.player-icon path');

    inner.addEventListener('click', () => {
      if (state.playing) pausePlayer(state, inner, iconPath, dot);
      else playPlayer(state, inner, iconPath, prog, timeEl, dot);
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

function playPlayer(s, inner, iconPath, prog, timeEl, dot) {
  Object.values(players).forEach(p => { if (p !== s && p.playing) p.pauseFn && p.pauseFn(); });
  s.playing = true;
  iconPath.setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z');
  inner.style.transform = 'scale(1)';
  if (dot) dot.setAttribute('opacity', '1');
  s.interval = setInterval(() => {
    s.time += 0.04;
    if (s.time > s.dur) { s.time = 0; pausePlayer(s, inner, iconPath, dot); return; }
    const progress = s.time / s.dur;
    prog.style.strokeDashoffset = s.circ * (1 - progress);
    if (dot) dot.setAttribute('transform', `rotate(${progress * 360}, ${s.cx}, ${s.cx})`);
    if (timeEl) timeEl.textContent = `${fmtTime(Math.floor(s.time))} / ${fmtTime(s.dur)}`;
  }, 40);
  s.pauseFn = () => pausePlayer(s, inner, iconPath, dot);
}

function pausePlayer(s, inner, iconPath, dot) {
  s.playing = false;
  clearInterval(s.interval);
  iconPath.setAttribute('d', 'M8 5v14l11-7z');
  if (dot) dot.setAttribute('opacity', '0');
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

// =====================================================
// DEV TOOL — Floating palette editor
// =====================================================
(function initPaletteEditor() {
  const COLOURS = [
    { v: 'true-black', label: 'True Black', def: '#000000' },
    { v: 'black',      label: 'Black',      def: '#2C2823' },
    { v: 'tan',        label: 'Tan',        def: '#E9CC9C' },
    { v: 'cream',      label: 'Cream',      def: '#F6EBDA' },
    { v: 'yellow',     label: 'Yellow',     def: '#F5C800' },
    { v: 'red',        label: 'Red',        def: '#EE1111' },
    { v: 'cobalt',     label: 'Cobalt',     def: '#0055FF' },
  ];
  const KEY = 'bhs-palette';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch(e) {}

  // Apply saved overrides immediately on load
  COLOURS.forEach(c => {
    if (saved[c.v]) document.documentElement.style.setProperty(`--${c.v}`, saved[c.v]);
  });

  const style = document.createElement('style');
  style.textContent = `
    #pal {
      position: fixed; right: 0; top: 50%; transform: translateY(-50%);
      z-index: 9999; display: flex; align-items: stretch;
      font-family: 'Jost', sans-serif; font-size: 11px;
    }
    #pal-handle {
      background: #111; color: #888; padding: 12px 7px;
      cursor: pointer; border-radius: 6px 0 0 6px;
      writing-mode: vertical-rl; letter-spacing: 0.14em;
      font-size: 9px; text-transform: uppercase; user-select: none;
      display: flex; align-items: center; gap: 6px;
      border: 1px solid #222; border-right: none;
      transition: color 0.15s;
    }
    #pal-handle:hover { color: #fff; }
    #pal-body {
      background: #111; border: 1px solid #222;
      padding: 14px 12px; display: none; flex-direction: column;
      gap: 9px; min-width: 170px;
    }
    #pal.open #pal-body { display: flex; }
    #pal-top {
      display: flex; justify-content: space-between; align-items: center;
      padding-bottom: 8px; border-bottom: 1px solid #222; margin-bottom: 2px;
    }
    #pal-title {
      font-weight: 600; letter-spacing: 0.14em;
      text-transform: uppercase; font-size: 9px; color: #666;
    }
    #pal-reset {
      background: none; border: 1px solid #333; color: #555;
      padding: 3px 7px; font-size: 9px; cursor: pointer;
      letter-spacing: 0.08em; text-transform: uppercase;
      font-family: inherit; border-radius: 2px; transition: color 0.15s, border-color 0.15s;
    }
    #pal-reset:hover { color: #fff; border-color: #666; }
    .pal-row { display: flex; align-items: center; gap: 9px; }
    .pal-row input[type=color] {
      width: 30px; height: 20px; padding: 1px 2px;
      border: 1px solid #333; background: none;
      cursor: pointer; border-radius: 3px; flex-shrink: 0;
    }
    .pal-row label {
      cursor: pointer; letter-spacing: 0.06em; color: #999;
      font-size: 10px; user-select: none;
    }
    .pal-row label:hover { color: #fff; }
  `;
  document.head.appendChild(style);

  const el = document.createElement('div');
  el.id = 'pal';
  el.innerHTML = `
    <div id="pal-handle">Palette</div>
    <div id="pal-body">
      <div id="pal-top">
        <span id="pal-title">Palette</span>
        <button id="pal-reset">Reset</button>
      </div>
      ${COLOURS.map(c => `
        <div class="pal-row">
          <input type="color" id="pal-${c.v}" value="${saved[c.v] || c.def}">
          <label for="pal-${c.v}">${c.label}</label>
        </div>
      `).join('')}
    </div>
  `;
  document.body.appendChild(el);

  document.getElementById('pal-handle').addEventListener('click', () => el.classList.toggle('open'));

  COLOURS.forEach(c => {
    document.getElementById(`pal-${c.v}`).addEventListener('input', e => {
      document.documentElement.style.setProperty(`--${c.v}`, e.target.value);
      saved[c.v] = e.target.value;
      localStorage.setItem(KEY, JSON.stringify(saved));
    });
  });

  document.getElementById('pal-reset').addEventListener('click', () => {
    saved = {};
    localStorage.removeItem(KEY);
    COLOURS.forEach(c => {
      document.documentElement.style.removeProperty(`--${c.v}`);
      document.getElementById(`pal-${c.v}`).value = c.def;
    });
  });
}());
