#!/usr/bin/env python3
"""Bear Hill Studios site audit — the mechanical, repeatable checks.

Static checks run against the source *.html files in the repo root.
Live checks (--live URL) fetch the deployed site for headers, redirects,
robots/sitemap and 404 handling.

Usage:
  python3 tools/site_audit.py                       # static only
  python3 tools/site_audit.py --live https://bearhillstudios.co.uk
  python3 tools/site_audit.py --live https://bearhillstudios.co.uk --out audits/2026-10-13-raw.md

Stdlib only — no install needed. Judgement checks (contrast, consent
behaviour in a real browser, mobile layout, copy) live in the
/site-audit skill, which runs this script first.
"""

import argparse
import os
import re
import sys
import urllib.error
import urllib.request
from collections import defaultdict
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse, unquote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CANONICAL_HOST = "bearhillstudios.co.uk"
LARGE_ASSET_BYTES = 500 * 1024
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
        "meta", "source", "track", "wbr"}

FAIL, WARN, INFO, PASS = "FAIL", "WARN", "INFO", "PASS"


class Findings:
    def __init__(self):
        self.items = defaultdict(list)  # section -> [(level, where, msg)]

    def add(self, section, level, where, msg):
        self.items[section].append((level, where, msg))

    def counts(self):
        c = defaultdict(int)
        for rows in self.items.values():
            for level, _, _ in rows:
                c[level] += 1
        return c


# ── HTML parsing ────────────────────────────────────────────────────────────

class Node:
    def __init__(self, tag, attrs, parent):
        self.tag = tag
        self.attrs = dict(attrs)
        self.parent = parent
        self.children = []
        self.text = []
        self.line = 0

    def all_text(self):
        out = list(self.text)
        for ch in self.children:
            out.append(ch.all_text())
        return " ".join(t for t in out if t).strip()

    def walk(self):
        yield self
        for ch in self.children:
            yield from ch.walk()


class TreeBuilder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("#root", [], None)
        self.cur = self.root
        self.raw_blocks = []  # (tag, type, text) for script/style

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.cur)
        n.line = self.getpos()[0]
        self.cur.children.append(n)
        if tag not in VOID:
            self.cur = n

    def handle_startendtag(self, tag, attrs):
        n = Node(tag, attrs, self.cur)
        n.line = self.getpos()[0]
        self.cur.children.append(n)

    def handle_endtag(self, tag):
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent
        if n is not self.root:
            self.cur = n.parent

    def handle_data(self, data):
        if self.cur.tag in ("script", "style"):
            self.raw_blocks.append((self.cur.tag, self.cur.attrs.get("type", ""), data))
        elif data.strip():
            self.cur.text.append(data.strip())


def parse(path):
    with open(path, encoding="utf-8") as f:
        src = f.read()
    tb = TreeBuilder()
    tb.feed(src)
    return tb.root, tb.raw_blocks, src


# ── helpers ─────────────────────────────────────────────────────────────────

def html_files():
    files = sorted(f for f in os.listdir(ROOT) if f.endswith(".html"))
    return files


def build_list():
    try:
        with open(os.path.join(ROOT, "build.js"), encoding="utf-8") as f:
            js = f.read()
        m = re.search(r"HTML_FILES\s*=\s*\[(.*?)\]", js, re.S)
        return set(re.findall(r'"([^"]+\.html)"', m.group(1))) if m else set()
    except OSError:
        return set()


def is_local_ref(url):
    if not url:
        return False
    p = urlparse(url)
    return not p.scheme and not url.startswith(("//", "#", "mailto:", "tel:", "javascript:", "data:"))


def local_exists(page, url):
    path = unquote(urlparse(url).path)
    if not path:
        return True
    target = os.path.normpath(os.path.join(ROOT, os.path.dirname(page), path.lstrip("/")))
    return os.path.exists(target)


def meta(nodes, **match):
    for n in nodes:
        if n.tag == "meta" and all(n.attrs.get(k) == v for k, v in match.items()):
            return n.attrs.get("content")
    return None


def accessible_name(n):
    if n.attrs.get("aria-label", "").strip() or n.attrs.get("aria-labelledby") or n.attrs.get("title"):
        return True
    if n.all_text():
        return True
    for d in n.walk():
        if d.tag == "img" and d.attrs.get("alt", "").strip():
            return True
        if d.tag == "svg" and (d.attrs.get("aria-label", "").strip() or any(c.tag == "title" for c in d.children)):
            return True
    return False


# ── static checks ───────────────────────────────────────────────────────────

def audit_page(page, F, seen_titles, seen_descs):
    root, raw_blocks, src = parse(os.path.join(ROOT, page))
    nodes = list(root.walk())

    # --- SEO / head ---
    S = "SEO & head"
    html = next((n for n in nodes if n.tag == "html"), None)
    lang = html.attrs.get("lang") if html else None
    if not lang:
        F.add(S, FAIL, page, "<html> has no lang attribute")
    elif lang.lower() != "en-gb":
        F.add(S, WARN, page, f'lang="{lang}" — UK site, consider "en-GB"')

    title_n = next((n for n in nodes if n.tag == "title"), None)
    title = title_n.all_text() if title_n else ""
    if not title:
        F.add(S, FAIL, page, "missing <title>")
    else:
        if not (10 <= len(title) <= 60):
            F.add(S, WARN, page, f"title length {len(title)} (aim 10–60): “{title}”")
        seen_titles[title].append(page)

    desc = meta(nodes, name="description")
    if not desc:
        F.add(S, FAIL, page, "missing meta description")
    else:
        if not (50 <= len(desc) <= 160):
            F.add(S, WARN, page, f"meta description length {len(desc)} (aim 50–160)")
        seen_descs[desc].append(page)

    if not meta(nodes, name="viewport"):
        F.add(S, FAIL, page, "missing viewport meta")

    canon = next((n.attrs.get("href") for n in nodes if n.tag == "link" and n.attrs.get("rel") == "canonical"), None)
    if not canon:
        F.add(S, WARN, page, "no <link rel=canonical> (Netlify subdomain can duplicate content)")
    elif CANONICAL_HOST not in canon:
        F.add(S, WARN, page, f"canonical points off-domain: {canon}")

    robots = meta(nodes, name="robots") or ""
    if "noindex" in robots:
        F.add(S, INFO, page, "page is noindex")

    if not any(n.tag == "script" and n.attrs.get("type") == "application/ld+json" for n in nodes):
        F.add(S, INFO, page, "no JSON-LD structured data")

    h1s = [n for n in nodes if n.tag == "h1"]
    if len(h1s) != 1:
        F.add(S, WARN, page, f"{len(h1s)} <h1> elements (expect exactly 1)")
    last = 0
    for n in nodes:
        if re.fullmatch(r"h[1-6]", n.tag):
            lvl = int(n.tag[1])
            if last and lvl > last + 1:
                F.add(S, WARN, f"{page}:{n.line}", f"heading jumps h{last} → h{lvl} (“{n.all_text()[:40]}”)")
            last = lvl

    # --- Social ---
    S = "Social sharing"
    for prop in ("og:title", "og:description", "og:image", "og:url", "og:type"):
        v = meta(nodes, property=prop)
        if not v:
            F.add(S, FAIL if prop in ("og:title", "og:image") else WARN, page, f"missing {prop}")
        elif prop in ("og:image", "og:url") and not v.startswith("https://"):
            F.add(S, FAIL, page, f"{prop} must be an absolute https URL: {v}")
        elif prop == "og:image" and is_local_ref(urlparse(v).path) and CANONICAL_HOST in v:
            if not local_exists(page, urlparse(v).path):
                F.add(S, FAIL, page, f"og:image file not found in repo: {v}")
    if not meta(nodes, name="twitter:card"):
        F.add(S, WARN, page, "missing twitter:card")

    # --- Branding ---
    S = "Icons & branding"
    rels = [n.attrs.get("rel", "") for n in nodes if n.tag == "link"]
    if not any("icon" == r or "icon" in r.split() for r in rels):
        F.add(S, FAIL, page, "no favicon link")
    if not any("apple-touch-icon" in r for r in rels):
        F.add(S, WARN, page, "no apple-touch-icon")
    if not meta(nodes, name="theme-color"):
        F.add(S, INFO, page, "no theme-color meta")

    # --- Accessibility ---
    S = "Accessibility"
    for n in nodes:
        where = f"{page}:{n.line}"
        if n.tag == "img":
            if "alt" not in n.attrs:
                F.add(S, FAIL, where, f"<img> missing alt: {n.attrs.get('src')}")
            if "width" not in n.attrs or "height" not in n.attrs:
                F.add("Performance", INFO, where, f"<img> without width/height (layout shift): {n.attrs.get('src')}")
        elif n.tag == "iframe" and not n.attrs.get("title"):
            F.add(S, FAIL, where, "<iframe> missing title")
        elif n.tag in ("a", "button") and not accessible_name(n):
            F.add(S, FAIL, where, f"<{n.tag}> has no accessible name ({n.attrs.get('class', '')})")
        elif n.tag in ("input", "select", "textarea") and n.attrs.get("type") not in ("hidden", "submit", "button"):
            fid = n.attrs.get("id")
            labelled = n.attrs.get("aria-label") or n.attrs.get("aria-labelledby")
            if fid and any(l.tag == "label" and l.attrs.get("for") == fid for l in nodes):
                labelled = True
            p = n.parent
            while p and not labelled:
                if p.tag == "label":
                    labelled = True
                p = p.parent
            if not labelled:
                F.add(S, FAIL, where, f"<{n.tag} name={n.attrs.get('name')}> has no label")
    if not any(n.tag == "a" and n.attrs.get("href", "").startswith("#") and
               re.search(r"skip", n.all_text(), re.I) for n in nodes):
        F.add(S, INFO, page, "no skip-to-content link")
    css_and_inline = "".join(t for tag, _, t in raw_blocks if tag == "style")
    if "prefers-reduced-motion" not in css_and_inline and not _main_css_has_reduced_motion():
        F.add(S, WARN, page, "no prefers-reduced-motion handling (reveal/parallax/scroll arrow)")

    # --- Links & references ---
    S = "Links & assets"
    for n in nodes:
        where = f"{page}:{n.line}"
        a = n.attrs
        if n.tag == "a":
            href = a.get("href")
            if href is None or href.strip() in ("", "#"):
                if "download" in a or n.parent and "wi-streaming" in (n.parent.attrs.get("class") or ""):
                    F.add(S, FAIL, where, f"placeholder link href=\"{href}\" ({a.get('aria-label') or n.all_text()[:30]})")
                else:
                    F.add(S, WARN, where, f"placeholder link href=\"{href}\" ({a.get('aria-label') or n.all_text()[:30]})")
            elif href.startswith("mailto:"):
                addr = href[7:].split("?")[0]
                if not addr.endswith("@" + CANONICAL_HOST):
                    F.add(S, WARN, where, f"email {addr} isn't on @{CANONICAL_HOST} — confirm it's real")
            if a.get("target") == "_blank" and "noopener" not in (a.get("rel") or "") and "noreferrer" not in (a.get("rel") or ""):
                F.add("Security", WARN, where, f"target=_blank without rel=noopener: {href}")
        for attr in ("href", "src", "data-src", "poster"):
            v = a.get(attr)
            if n.tag == "a" and attr == "href" and v and v.endswith(".html") is False and not is_local_ref(v):
                continue
            if v and is_local_ref(v) and not local_exists(page, v):
                F.add(S, FAIL, where, f"broken local {attr}: {v}")
        style = a.get("style") or ""
        for m in re.finditer(r"url\(['\"]?([^'\")]+)['\"]?\)", style):
            if is_local_ref(m.group(1)) and not local_exists(page, m.group(1)):
                F.add(S, FAIL, where, f"broken url() in style: {m.group(1)}")
        if n.tag == "iframe" and "youtube.com/embed" in (a.get("src") or ""):
            F.add("Privacy", WARN, where, "YouTube embed uses youtube.com (sets cookies pre-consent) — use youtube-nocookie.com or a click-to-load facade")

    # --- Scripts ---
    for n in nodes:
        if n.tag == "script" and (n.attrs.get("src") or "").endswith("main.js") and n.attrs.get("type") != "module":
            F.add("Links & assets", FAIL, f"{page}:{n.line}", 'main.js loaded without type="module" (players fall back to stubs)')

    # --- Privacy ---
    S = "Privacy"
    if re.search(r"googletagmanager\.com/gtag", src):
        F.add(S, FAIL, page, "gtag.js loaded directly in HTML — must only load after consent")
    if not re.search(r"privacy", src, re.I) and not _analytics_links_privacy():
        F.add(S, WARN, page, "no link mentioning a privacy policy")


def _analytics_links_privacy():
    # js/analytics.js injects the footer Privacy link on every page
    try:
        with open(os.path.join(ROOT, "js/analytics.js"), encoding="utf-8") as f:
            return "privacy.html" in f.read()
    except OSError:
        return False


_RM = None
def _main_css_has_reduced_motion():
    global _RM
    if _RM is None:
        try:
            with open(os.path.join(ROOT, "main.css"), encoding="utf-8") as f:
                _RM = "prefers-reduced-motion" in f.read()
        except OSError:
            _RM = False
    return _RM


def audit_site(F, pages):
    S = "Site files"
    for fname, level, why in (
        ("robots.txt", WARN, "crawler rules + sitemap pointer"),
        ("sitemap.xml", WARN, "helps Google find every page"),
        ("404.html", WARN, "Netlify serves this for missing pages"),
        ("site.webmanifest", INFO, "optional PWA/icon manifest"),
    ):
        if not os.path.exists(os.path.join(ROOT, fname)):
            F.add(S, level, fname, f"missing ({why})")

    built = build_list()
    for p in pages:
        if built and p not in built:
            F.add(S, FAIL, p, "not in build.js HTML_FILES — won't be minified into dist/")
    for extra in ("robots.txt", "sitemap.xml", "_headers", "_redirects", "site.webmanifest"):
        if os.path.exists(os.path.join(ROOT, extra)):
            with open(os.path.join(ROOT, "build.js"), encoding="utf-8") as f:
                if extra not in f.read():
                    F.add(S, FAIL, extra, "exists but build.js doesn't copy it into dist/")

    toml = ""
    try:
        with open(os.path.join(ROOT, "netlify.toml"), encoding="utf-8") as f:
            toml = f.read()
    except OSError:
        pass
    has_headers = "[[headers]]" in toml or os.path.exists(os.path.join(ROOT, "_headers"))
    if not has_headers:
        F.add("Security", WARN, "netlify.toml", "no [[headers]] block — no security or cache headers configured")

    S = "Performance"
    for dirpath, _, files in os.walk(os.path.join(ROOT, "assets")):
        for fn in files:
            fp = os.path.join(dirpath, fn)
            size = os.path.getsize(fp)
            rel = os.path.relpath(fp, ROOT)
            if size > LARGE_ASSET_BYTES and not fn.endswith(".mp3"):
                F.add(S, WARN, rel, f"{size/1024/1024:.1f} MB image/asset — resize/compress (WebP/AVIF)")
            elif fn.endswith(".mp3") and size > 3 * 1024 * 1024:
                F.add(S, INFO, rel, f"{size/1024/1024:.1f} MB audio — check bitrate / preload")

    # unused assets
    corpus = ""
    for p in pages:
        with open(os.path.join(ROOT, p), encoding="utf-8") as f:
            corpus += f.read()
    for extra in ("main.css", "main.js", "js/audio-player.js", "js/analytics.js", "site.webmanifest"):
        try:
            with open(os.path.join(ROOT, extra), encoding="utf-8") as f:
                corpus += f.read()
        except OSError:
            pass
    for dirpath, _, files in os.walk(os.path.join(ROOT, "assets")):
        for fn in files:
            if fn.startswith("."):
                continue
            if fn not in corpus and fn.replace(" ", "%20") not in corpus:
                F.add("Links & assets", INFO, os.path.relpath(os.path.join(dirpath, fn), ROOT),
                      "not referenced anywhere — still deployed; delete if unused")


# ── live checks ─────────────────────────────────────────────────────────────

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


def fetch(url, follow=True, method="GET"):
    opener = urllib.request.build_opener() if follow else urllib.request.build_opener(NoRedirect)
    req = urllib.request.Request(url, method=method, headers={"User-Agent": "BearHillSiteAudit/1.0"})
    try:
        r = opener.open(req, timeout=20)
        return r.status, dict((k.lower(), v) for k, v in r.headers.items()), r.read() if method == "GET" else b"", r.geturl()
    except urllib.error.HTTPError as e:
        return e.code, dict((k.lower(), v) for k, v in e.headers.items()), b"", url
    except Exception as e:  # noqa: BLE001
        return None, {}, str(e).encode(), url


def audit_live(F, base, pages):
    S = "Live site"
    base = base.rstrip("/") + "/"
    host = urlparse(base).netloc

    status, hdrs, _, _ = fetch(f"http://{host}/", follow=False)
    loc = hdrs.get("location", "")
    if status in (301, 302, 307, 308) and loc.startswith("https://"):
        F.add(S, PASS, "http→https", f"{status} → {loc}")
    else:
        F.add(S, FAIL, "http→https", f"http:// didn't redirect to https (status {status})")

    alt = f"https://www.{host}/" if not host.startswith("www.") else f"https://{host[4:]}/"
    status, hdrs, _, _ = fetch(alt, follow=False)
    F.add(S, PASS if status in (301, 308) else WARN, alt, f"status {status} → {hdrs.get('location', '-')}")

    status, hdrs, _, _ = fetch("https://bear-hill-studios-site.netlify.app/", follow=False)
    if status in (301, 308) and CANONICAL_HOST in hdrs.get("location", ""):
        F.add(S, PASS, "netlify.app subdomain", "redirects to primary domain")
    else:
        F.add(S, INFO, "netlify.app subdomain", f"serves content directly (status {status}) — canonical tags must cover this")

    status, hdrs, body, _ = fetch(base)
    if status != 200:
        F.add(S, FAIL, base, f"homepage status {status}")
        return
    want = {
        "strict-transport-security": FAIL,
        "x-content-type-options": WARN,
        "referrer-policy": WARN,
        "permissions-policy": INFO,
        "content-security-policy": INFO,
        "x-frame-options": INFO,
    }
    for h, level in want.items():
        if h in hdrs:
            F.add("Security", PASS, h, hdrs[h][:100])
        else:
            F.add("Security", level, h, "header not set on live site")

    for p in pages:
        url = urljoin(base, p if p != "index.html" else "")
        st, _, _, final = fetch(url, method="HEAD")
        if st != 200:
            F.add(S, FAIL, url, f"status {st}")

    for path, label in (("robots.txt", "robots.txt"), ("sitemap.xml", "sitemap.xml")):
        st, _, _, _ = fetch(urljoin(base, path), method="HEAD")
        F.add(S, PASS if st == 200 else WARN, label, f"status {st}")

    st, _, body, _ = fetch(urljoin(base, "this-page-does-not-exist-audit"))
    if st != 404:
        F.add(S, FAIL, "404 handling", f"missing page returned {st} (soft 404)")
    elif b"Bear Hill" not in body:
        F.add(S, WARN, "404 handling", "404 is Netlify's default page, not a branded one")
    else:
        F.add(S, PASS, "404 handling", "branded 404")

    st, hdrs, _, _ = fetch(urljoin(base, "main.css"), method="HEAD")
    F.add("Performance", INFO, "main.css cache-control", hdrs.get("cache-control", "(none)"))
    st, hdrs, _, _ = fetch(urljoin(base, "assets/bear-icon.png"), method="HEAD")
    F.add("Performance", INFO, "assets cache-control", hdrs.get("cache-control", "(none)"))

    # og:image reachable?
    root, _, _ = None, None, None
    try:
        root, _, _ = parse(os.path.join(ROOT, "index.html"))
        og = meta(list(root.walk()), property="og:image")
        if og:
            st, _, _, _ = fetch(og, method="HEAD")
            F.add("Social sharing", PASS if st == 200 else FAIL, "og:image (live)", f"{og} → {st}")
    except Exception:  # noqa: BLE001
        pass


# ── report ──────────────────────────────────────────────────────────────────

ORDER = ["SEO & head", "Social sharing", "Icons & branding", "Accessibility", "Links & assets",
         "Performance", "Privacy", "Security", "Site files", "Live site"]
LEVEL_ORDER = {FAIL: 0, WARN: 1, INFO: 2, PASS: 3}
ICON = {FAIL: "❌", WARN: "⚠️", INFO: "ℹ️", PASS: "✅"}


def render(F, pages, live):
    c = F.counts()
    out = ["# Site audit — automated checks", "",
           f"Pages: {', '.join(pages)}  ",
           f"Live: {live or '(not checked — pass --live URL)'}", "",
           f"**{c[FAIL]} fail · {c[WARN]} warn · {c[INFO]} info · {c[PASS]} pass**", ""]
    for section in ORDER + sorted(set(F.items) - set(ORDER)):
        rows = F.items.get(section)
        if not rows:
            continue
        rows.sort(key=lambda r: (LEVEL_ORDER[r[0]], r[1]))
        out.append(f"## {section}")
        out.append("")
        # Collapse identical messages across pages
        grouped = defaultdict(list)
        for level, where, msg in rows:
            grouped[(level, msg)].append(where)
        for (level, msg), wheres in sorted(grouped.items(), key=lambda kv: (LEVEL_ORDER[kv[0][0]], kv[1][0])):
            loc = ", ".join(wheres) if len(wheres) <= 4 else f"{', '.join(wheres[:4])} +{len(wheres)-4} more"
            out.append(f"- {ICON[level]} **{level}** `{loc}` — {msg}")
        out.append("")
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--live", help="base URL of deployed site, e.g. https://bearhillstudios.co.uk")
    ap.add_argument("--out", help="write markdown report to this path instead of stdout")
    args = ap.parse_args()

    F = Findings()
    pages = html_files()
    seen_titles, seen_descs = defaultdict(list), defaultdict(list)
    for p in pages:
        audit_page(p, F, seen_titles, seen_descs)
    for t, ps in seen_titles.items():
        if len(ps) > 1:
            F.add("SEO & head", FAIL, ", ".join(ps), f"duplicate <title> “{t}”")
    for d, ps in seen_descs.items():
        if len(ps) > 1:
            F.add("SEO & head", WARN, ", ".join(ps), "duplicate meta description")
    audit_site(F, pages)
    if args.live:
        audit_live(F, args.live, pages)

    report = render(F, pages, args.live)
    if args.out:
        os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(report + "\n")
        c = F.counts()
        print(f"Wrote {args.out} — {c[FAIL]} fail, {c[WARN]} warn, {c[INFO]} info, {c[PASS]} pass")
    else:
        print(report)


if __name__ == "__main__":
    sys.exit(main())
