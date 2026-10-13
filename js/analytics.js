// Google Analytics 4 behind a consent banner (UK GDPR / PECR).
// gtag.js is only fetched once the visitor has clicked Accept; until then no
// Google script loads and no cookies are set. The choice is kept in
// localStorage and can be changed via the "Cookies" link in the footer.

const GA_ID = "G-SQPBS6DBKL";
const STORAGE_KEY = "bhs-analytics-consent"; // "granted" | "denied"

let gaLoaded = false;

function readConsent() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveConsent(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* private mode etc. — banner just reappears next visit */
  }
}

// Skip analytics on local dev servers so testing doesn't pollute the data
function isLocalHost() {
  return /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
}

function loadGA() {
  if (gaLoaded || isLocalHost()) return;
  gaLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  // Consent Mode v2 — analytics allowed, advertising off
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
  gtag("js", new Date());
  gtag("config", GA_ID);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

// Withdrawing consent: tell GA to stop, and remove the _ga cookies it set
function revokeGA() {
  if (window.gtag) gtag("consent", "update", {analytics_storage: "denied"});
  const domain = location.hostname.replace(/^www\./, "");
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (name.startsWith("_ga")) {
      document.cookie = `${name}=; Max-Age=0; path=/`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}`;
    }
  });
}

function showBanner() {
  if (document.querySelector(".consent")) return;

  const banner = document.createElement("div");
  banner.className = "consent";
  banner.setAttribute("role", "region");
  banner.setAttribute("aria-label", "Cookie consent");
  banner.innerHTML = `
    <p class="consent-text">
      We'd like to use Google Analytics cookies to see how people find and use this site.
      Nothing is set unless you accept.
    </p>
    <div class="consent-actions">
      <button type="button" class="consent-btn" data-consent="denied">Decline</button>
      <button type="button" class="consent-btn consent-btn--accept" data-consent="granted">Accept</button>
    </div>`;

  banner.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-consent]");
    if (!btn) return;
    const value = btn.dataset.consent;
    saveConsent(value);
    if (value === "granted") loadGA();
    else revokeGA();
    banner.classList.remove("consent--visible");
    banner.addEventListener("transitionend", () => banner.remove(), {once: true});
  });

  document.body.appendChild(banner);
  requestAnimationFrame(() => banner.classList.add("consent--visible"));
}

function addFooterLink() {
  const copyright = document.querySelector(".footer-v2-copyright");
  if (!copyright) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "footer-v2-cookies";
  btn.textContent = "Cookies";
  btn.addEventListener("click", showBanner);
  copyright.after(btn);
}

export function initAnalytics() {
  addFooterLink();
  const consent = readConsent();
  if (consent === "granted") loadGA();
  else if (consent !== "denied") showBanner();
}
