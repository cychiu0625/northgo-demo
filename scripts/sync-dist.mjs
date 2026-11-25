/**
 * Copy static site + admin into dist/ for Cloudflare Pages
 * (wrangler.toml pages_build_output_dir = "dist").
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const FILES = [
  "index.html",
  "about.html",
  "agency.html",
  "contact.html",
  "enquiry-briefing.html",
  "freight.html",
  "offices.html",
  "project.html",
  "services.html",
  "sitemap.html",
  "sitemap-tree.html",
  "warehouse.html",
  "robots.txt",
  "sitemap.xml",
  "VERSION"
];

const DIRS = ["admin", "content", "css", "img", "js"];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(rel) {
  const from = path.join(root, rel);
  const to = path.join(dist, rel);
  if (!fs.existsSync(from)) {
    console.warn("skip missing:", rel);
    return;
  }
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
}

function copyDir(rel) {
  const from = path.join(root, rel);
  if (!fs.existsSync(from)) {
    console.warn("skip missing dir:", rel);
    return;
  }
  const walk = (dir, base) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const relPath = path.join(base, name);
      if (fs.statSync(full).isDirectory()) walk(full, relPath);
      else {
        const to = path.join(dist, relPath);
        ensureDir(path.dirname(to));
        fs.copyFileSync(full, to);
      }
    }
  };
  walk(from, rel);
}

ensureDir(dist);
FILES.forEach(copyFile);
DIRS.forEach(copyDir);
console.log("synced static assets → dist/");
