/* ===== CIRCULAR AUDIO PLAYER (reusable, skinnable) =====

  Required:
    data-player="unique-id"      — unique per page

  Audio:
    data-src="path/to/file.mp3"  — omit for a silent stub (ring still animates)
    data-dur="35"                — display duration in seconds; auto-updated
                                   from audio metadata once loaded

  Appearance:
    data-color="c1|c2|c3"        — resolves to --c1/--c2/--c3 CSS vars
    class "player--dark"         — muted time-readout colour for light copy on photos

  Size (one class):
    .player-lg   148px   icon 30px   (shows label inside by default)
    .player-wk   100px   icon 26px
    .player-md    76px   icon 22px   (default)
    .player-sm    64px   icon 16px

  Feature flags (all on by default):
    data-label="Text"            — text rendered inside the button
    data-label-show="true|false" — force label on/off regardless of size
    data-ring="false"            — hide progress ring; icon-only mode
    data-time="false"            — hide "0:00 / 1:23" readout
*/

const SIZE_MAP = {
  "player-lg": { size: 148, icon: 30 },
  "player-wk": { size: 100, icon: 26 },
  "player-md": { size: 76,  icon: 22 },
  "player-sm": { size: 64,  icon: 16 },
};
const DEFAULT_SIZE  = { size: 76, icon: 22 };
const DEFAULT_DUR   = 42;

const registry = {}; // id → state

function fmtTime(s) {
  s = Math.max(0, Math.floor(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function readOptions(el) {
  const sizeKey = Object.keys(SIZE_MAP).find(c => el.classList.contains(c));
  const { size, icon } = sizeKey ? SIZE_MAP[sizeKey] : DEFAULT_SIZE;
  const label = el.dataset.label || "";
  const labelShow = el.dataset.labelShow != null
    ? el.dataset.labelShow !== "false"
    : sizeKey === "player-lg";

  return {
    size, icon,
    color:     el.dataset.color || "c1",
    dark:      el.classList.contains("player--dark"),
    duration:  parseInt(el.dataset.dur || DEFAULT_DUR, 10),
    src:       el.dataset.src || null,
    label,
    showLabel: labelShow && !!label,
    showRing:  el.dataset.ring !== "false",
    showTime:  el.dataset.time !== "false",
  };
}

function render(el, opts) {
  const r       = opts.size / 2;
  const ringR   = r + 9;
  const svgSize = ringR * 2 + 6;
  const circ    = +(2 * Math.PI * ringR).toFixed(2);
  const stroke  = `var(--${opts.color})`;
  const mid     = svgSize / 2;

  el.innerHTML = `
    <div class="player-inner"
      style="width:${opts.size}px;height:${opts.size}px;background:var(--${opts.color});color:var(--${opts.color}t)"
      role="button" tabindex="0" aria-label="Play audio sample">
      ${opts.showRing ? `
        <svg class="player-ring"
          style="position:absolute;inset:${-(svgSize - opts.size) / 2}px;width:${svgSize}px;height:${svgSize}px;overflow:visible;pointer-events:none;"
          viewBox="0 0 ${svgSize} ${svgSize}">
          <circle class="r-bg"   cx="${mid}" cy="${mid}" r="${ringR}" stroke="${stroke}"/>
          <circle class="r-prog" cx="${mid}" cy="${mid}" r="${ringR}" stroke="${stroke}"
            stroke-dasharray="${circ}" stroke-dashoffset="${circ}"
            transform="rotate(-90 ${mid} ${mid})"/>
          <circle class="r-dot"  cx="${mid}" cy="${mid - ringR}" r="5" fill="${stroke}" opacity="0"/>
        </svg>` : ""}
      <svg class="player-icon" viewBox="0 0 24 24"
        width="${opts.icon}" height="${opts.icon}" fill="var(--${opts.color}t)">
        <path d="M8 5v14l11-7z"/>
      </svg>
      ${opts.showLabel
        ? `<span class="player-inner-label" style="color:var(--${opts.color}t)">${opts.label}</span>`
        : ""}
    </div>
    ${opts.showTime
      ? `<span class="player-time${opts.dark ? " player--dark" : ""}">0:00 / ${fmtTime(opts.duration)}</span>`
      : ""}
  `;

  // Give the wrapper an explicit width so flex/grid parents allocate enough space
  el.style.width = (opts.showRing ? svgSize : opts.size) + "px";

  return { cx: mid, circ };
}

function createPlayer(el) {
  const opts          = readOptions(el);
  const { cx, circ }  = render(el, opts);

  const inner    = el.querySelector(".player-inner");
  const prog     = el.querySelector(".r-prog");
  const dot      = el.querySelector(".r-dot");
  const timeEl   = el.querySelector(".player-time");
  const iconPath = el.querySelector(".player-icon path");

  const audio = opts.src ? new Audio(opts.src) : null;

  const s = {
    playing:  false,
    dur:      opts.duration,
    circ, cx,
    audio,
    // Stub-mode only (no src)
    time:     0,
    interval: null,
    pauseFn:  null,
  };

  if (audio) {
    audio.preload = "metadata";

    audio.addEventListener("loadedmetadata", () => {
      if (isFinite(audio.duration)) {
        s.dur = audio.duration;
        if (timeEl && !s.playing) {
          timeEl.textContent = `0:00 / ${fmtTime(s.dur)}`;
        }
      }
    });

    audio.addEventListener("timeupdate", () => {
      if (!s.playing) return;
      const t = audio.currentTime;
      const progress = t / s.dur;
      if (prog)  prog.style.strokeDashoffset = circ * (1 - progress);
      if (dot)   dot.setAttribute("transform", `rotate(${progress * 360}, ${cx}, ${cx})`);
      if (timeEl) timeEl.textContent = `${fmtTime(t)} / ${fmtTime(s.dur)}`;
    });

    audio.addEventListener("ended", () => {
      audio.currentTime = 0;
      pause(s, iconPath, dot, prog, timeEl);
    });
  }

  s.pauseFn = () => pause(s, iconPath, dot, prog, timeEl);

  inner.addEventListener("click", () => {
    if (s.playing) pause(s, iconPath, dot, prog, timeEl);
    else           play(s, iconPath, dot, prog, timeEl);
  });

  inner.addEventListener("keydown", e => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      inner.click();
    }
  });

  return s;
}

function play(s, iconPath, dot, prog, timeEl) {
  // Stop any other playing player first
  Object.values(registry).forEach(p => {
    if (p !== s && p.playing && p.pauseFn) p.pauseFn();
  });

  s.playing = true;
  iconPath.setAttribute("d", "M6 19h4V5H6v14zm8-14v14h4V5h-4z");
  if (dot) dot.setAttribute("opacity", "1");

  if (s.audio) {
    s.audio.play().catch(() => {
      // Playback blocked (no interaction, missing file, etc.) — reset UI
      pause(s, iconPath, dot, prog, timeEl);
    });
  } else {
    // Stub: animate ring without real audio
    s.interval = setInterval(() => {
      s.time += 0.04;
      if (s.time >= s.dur) {
        s.time = 0;
        pause(s, iconPath, dot, prog, timeEl);
        return;
      }
      const progress = s.time / s.dur;
      if (prog)  prog.style.strokeDashoffset = s.circ * (1 - progress);
      if (dot)   dot.setAttribute("transform", `rotate(${progress * 360}, ${s.cx}, ${s.cx})`);
      if (timeEl) timeEl.textContent = `${fmtTime(Math.floor(s.time))} / ${fmtTime(s.dur)}`;
    }, 40);
  }
}

function pause(s, iconPath, dot, prog, timeEl) {
  s.playing = false;
  iconPath.setAttribute("d", "M8 5v14l11-7z");
  if (dot) dot.setAttribute("opacity", "0");
  if (s.audio) {
    s.audio.pause();
  } else {
    clearInterval(s.interval);
  }
}

export function initPlayers(root = document) {
  root.querySelectorAll("[data-player]").forEach(el => {
    const id = el.dataset.player;
    if (registry[id]) return;
    registry[id] = createPlayer(el);
  });
}
