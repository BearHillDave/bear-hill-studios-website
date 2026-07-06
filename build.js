// Builds dist/ for deploy: minifies HTML/CSS/JS, copies everything else as-is.
// Source files (main.css, main.js, *.html) are the hand-edited originals and are untouched.
"use strict";

const fs = require("fs");
const path = require("path");
const CleanCSS = require("clean-css");
const { minify: minifyJS } = require("terser");
const { minify: minifyHTML } = require("html-minifier-terser");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");

const HTML_FILES = [
  "index.html",
  "work.html",
  "laura.html",
  "production.html",
  "about.html",
  "contact.html",
];

const COPY_ENTRIES = ["assets"];

function rmrf(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

async function minifyCSSFile(srcPath, destPath) {
  const input = fs.readFileSync(srcPath, "utf8");
  const output = new CleanCSS({ level: 2 }).minify(input);
  if (output.errors.length) {
    throw new Error(`clean-css errors in ${srcPath}:\n${output.errors.join("\n")}`);
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, output.styles);
}

async function minifyJSFile(srcPath, destPath, isModule) {
  const input = fs.readFileSync(srcPath, "utf8");
  const result = await minifyJS(input, { module: isModule });
  if (result.error) throw result.error;
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, result.code);
}

async function minifyHTMLFile(srcPath, destPath) {
  const input = fs.readFileSync(srcPath, "utf8");
  const output = await minifyHTML(input, {
    collapseWhitespace: true,
    conservativeCollapse: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true,
  });
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, output);
}

async function build() {
  rmrf(DIST);
  fs.mkdirSync(DIST, { recursive: true });

  for (const entry of COPY_ENTRIES) {
    copyRecursive(path.join(ROOT, entry), path.join(DIST, entry));
  }

  await minifyCSSFile(path.join(ROOT, "main.css"), path.join(DIST, "main.css"));
  await minifyJSFile(path.join(ROOT, "main.js"), path.join(DIST, "main.js"), true);
  await minifyJSFile(
    path.join(ROOT, "js", "audio-player.js"),
    path.join(DIST, "js", "audio-player.js"),
    true,
  );

  for (const file of HTML_FILES) {
    await minifyHTMLFile(path.join(ROOT, file), path.join(DIST, file));
  }

  console.log("Build complete -> dist/");
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
