/* ===== DEV PANEL — per-page vignette / blur-layer tuning (design-experiments branch only) =====

  Floating overlay for live-tweaking .page-vignette and .page-blur without
  touching CSS. Values are per-page (keyed by pathname), persisted in
  localStorage, and applied as inline custom properties on .page-canvas:

    --blur-opacity      (.page-blur opacity)
    --blur-blend        (.page-blur mix-blend-mode)
    --vignette-opacity  (.page-vignette opacity)
    --vignette-start    (.page-vignette gradient start stop, %)
    --vignette-end      (.page-vignette gradient end stop, %)

  Not linked from any page on main — only added to pages on this branch.
*/

const BLEND_MODES = [
  "normal", "multiply", "screen", "overlay", "darken", "lighten",
  "color-dodge", "color-burn", "hard-light", "soft-light",
  "difference", "exclusion", "hue", "saturation", "color", "luminosity",
];

function init() {
  const canvas = document.querySelector(".page-canvas");
  if (!canvas) return;

  const blurEl = canvas.querySelector(".page-blur");
  const vignetteEl = canvas.querySelector(".page-vignette");
  const storageKey = `bhs-dev-panel:${location.pathname}`;

  const defaults = {
    blurOpacity: blurEl ? parseFloat(getComputedStyle(blurEl).opacity) : 0.3,
    blurBlend: blurEl ? getComputedStyle(blurEl).mixBlendMode : "lighten",
    vignetteOpacity: vignetteEl ? parseFloat(getComputedStyle(vignetteEl).opacity) : 1,
    vignetteStart: 57.9,
    vignetteEnd: 98.33,
  };

  let state = { ...defaults };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (saved) state = { ...state, ...saved };
  } catch {}

  // Applied directly to the target elements (not via --custom-properties on
  // .page-canvas) — some preview/automation browsers only resolve var()
  // once at initial parse and don't reactively recompute style when a JS
  // -mutated custom property changes later. Direct inline styles always win.
  function apply() {
    if (blurEl) {
      blurEl.style.opacity = state.blurOpacity;
      blurEl.style.mixBlendMode = state.blurBlend;
    }
    if (vignetteEl) {
      vignetteEl.style.opacity = state.vignetteOpacity;
      vignetteEl.style.background =
        `radial-gradient(126.05% 53.24% at 65.5% 59.66%, rgba(33, 30, 26, 0) 0%, rgba(33, 30, 26, 0.42) 100%),` +
        `linear-gradient(180deg, rgba(0, 0, 0, 0) ${state.vignetteStart}%, #211e1a ${state.vignetteEnd}%)`;
    }
  }

  function persist() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  apply();

  // ── UI ──
  const style = document.createElement("style");
  style.textContent = `
    #dev-panel-toggle {
      position: fixed; z-index: 9999; top: 16px; right: 16px;
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(33,30,26,0.9); border: 1px solid rgba(246,235,218,0.3);
      color: #f6ebda; font: 16px/1 sans-serif; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(6px);
    }
    #dev-panel {
      position: fixed; z-index: 9999; top: 64px; right: 16px; width: 280px;
      background: rgba(20,18,15,0.92); border: 1px solid rgba(246,235,218,0.2);
      border-radius: 10px; padding: 16px; backdrop-filter: blur(10px);
      font: 12px/1.4 -apple-system, sans-serif; color: #f6ebda;
      display: none; max-height: calc(100vh - 96px); overflow-y: auto;
    }
    #dev-panel.open { display: block; }
    #dev-panel h4 { margin: 0 0 10px; font-size: 11px; letter-spacing: 0.06em;
      text-transform: uppercase; color: rgba(246,235,218,0.55); }
    #dev-panel label { display: block; margin: 12px 0 4px; color: rgba(246,235,218,0.8); }
    #dev-panel .row { display: flex; justify-content: space-between; align-items: baseline; }
    #dev-panel .row span { color: rgba(246,235,218,0.5); font-variant-numeric: tabular-nums; }
    #dev-panel input[type="range"] { width: 100%; accent-color: #cf2a0a; }
    #dev-panel select {
      width: 100%; background: rgba(246,235,218,0.08); color: #f6ebda;
      border: 1px solid rgba(246,235,218,0.25); border-radius: 4px; padding: 4px 6px;
    }
    #dev-panel .btns { display: flex; gap: 8px; margin-top: 16px; }
    #dev-panel button {
      flex: 1; padding: 6px 8px; border-radius: 6px; cursor: pointer;
      border: 1px solid rgba(246,235,218,0.25); background: rgba(246,235,218,0.08);
      color: #f6ebda; font: inherit;
    }
    #dev-panel button:hover { background: rgba(246,235,218,0.18); }
    #dev-panel textarea {
      width: 100%; margin-top: 10px; height: 110px; resize: vertical;
      background: rgba(0,0,0,0.4); color: #f6ebda; border: 1px solid rgba(246,235,218,0.2);
      border-radius: 6px; padding: 8px; font: 11px/1.5 ui-monospace, monospace;
      display: none;
    }
    #dev-panel textarea.open { display: block; }
  `;
  document.head.appendChild(style);

  const toggle = document.createElement("button");
  toggle.id = "dev-panel-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-label", "Toggle vignette/blur dev panel");
  toggle.textContent = "⚙";
  document.body.appendChild(toggle);

  const panel = document.createElement("div");
  panel.id = "dev-panel";
  panel.innerHTML = `
    <h4>${location.pathname.replace(/^\//, "") || "index.html"}</h4>

    <label class="row">Blur opacity <span data-out="blurOpacity"></span></label>
    <input type="range" min="0" max="1" step="0.01" data-key="blurOpacity">

    <label>Blur blend mode</label>
    <select data-key="blurBlend">
      ${BLEND_MODES.map(m => `<option value="${m}">${m}</option>`).join("")}
    </select>

    <label class="row">Vignette opacity <span data-out="vignetteOpacity"></span></label>
    <input type="range" min="0" max="1" step="0.01" data-key="vignetteOpacity">

    <label class="row">Vignette start <span data-out="vignetteStart"></span></label>
    <input type="range" min="0" max="100" step="0.1" data-key="vignetteStart">

    <label class="row">Vignette end <span data-out="vignetteEnd"></span></label>
    <input type="range" min="0" max="100" step="0.1" data-key="vignetteEnd">

    <div class="btns">
      <button type="button" data-action="copy">Copy values</button>
      <button type="button" data-action="reset">Reset</button>
    </div>
    <textarea readonly data-out="copy"></textarea>
  `;
  document.body.appendChild(panel);

  toggle.addEventListener("click", () => panel.classList.toggle("open"));

  function syncInputs() {
    panel.querySelectorAll("[data-key]").forEach(el => {
      const key = el.dataset.key;
      el.value = state[key];
      const out = panel.querySelector(`[data-out="${key}"]`);
      if (out) out.textContent = typeof state[key] === "number" ? state[key] : "";
    });
  }
  syncInputs();

  panel.querySelectorAll("[data-key]").forEach(el => {
    el.addEventListener("input", () => {
      const key = el.dataset.key;
      const raw = el.value;
      state[key] = (el.tagName === "SELECT") ? raw : parseFloat(raw);
      const out = panel.querySelector(`[data-out="${key}"]`);
      if (out) out.textContent = state[key];
      apply();
      persist();
    });
  });

  panel.querySelector('[data-action="reset"]').addEventListener("click", () => {
    state = { ...defaults };
    localStorage.removeItem(storageKey);
    apply();
    syncInputs();
  });

  panel.querySelector('[data-action="copy"]').addEventListener("click", () => {
    // Plain properties, ready to paste into a page-scoped <style> block —
    // matches how the Work page's own hard-light override is written.
    const css = [
      `/* ${location.pathname.replace(/^\//, "") || "index.html"} — paste into this page's <style> block */`,
      `.page-blur {`,
      `  opacity: ${state.blurOpacity};`,
      `  mix-blend-mode: ${state.blurBlend};`,
      `}`,
      `.page-vignette {`,
      `  opacity: ${state.vignetteOpacity};`,
      `  background:`,
      `    radial-gradient(126.05% 53.24% at 65.5% 59.66%, rgba(33, 30, 26, 0) 0%, rgba(33, 30, 26, 0.42) 100%),`,
      `    linear-gradient(180deg, rgba(0, 0, 0, 0) ${state.vignetteStart}%, #211e1a ${state.vignetteEnd}%);`,
      `}`,
    ].join("\n");

    const out = panel.querySelector('[data-out="copy"]');
    out.value = css;
    out.classList.add("open");
    out.select();

    console.log(css);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(css).catch(() => {});
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
