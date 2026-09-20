import { readFileSync } from "node:fs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const manifest = JSON.parse(readFileSync(new URL("./manifest.webmanifest", import.meta.url)));
assert(manifest.name === "WilLiz Math", "name");
assert(manifest.short_name, "short_name");
assert(manifest.start_url === "./", "relative start_url");
assert(manifest.scope === "./", "relative scope");
assert(manifest.display === "standalone", "standalone display");
assert(manifest.icons.some((icon) => icon.sizes === "192x192"), "192 icon");
assert(manifest.icons.some((icon) => icon.sizes === "512x512"), "512 icon");
assert(manifest.icons.every((icon) => !icon.src.startsWith("/")), "relative icon urls");

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
assert(html.includes('rel="manifest"'), "manifest link");
assert(html.includes("manifest.webmanifest"), "manifest href");

const app = readFileSync(new URL("./app.js", import.meta.url), "utf8");
assert(app.includes("serviceWorker.register"), "register service worker");

console.log("pwa install checks passed");
