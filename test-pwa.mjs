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
assert(!html.includes("End round"), "no end-round button");
assert(html.includes("session-back"), "action-bar back ends the round");
const actionBar = html.slice(html.indexOf('class="action-bar"'), html.indexOf("</header>"));
assert(actionBar.includes('id="setup-title"'), "Settings title lives in the action bar");
assert(!html.includes("settings-head"), "no second settings status bar");
assert(!html.includes("settings-back"), "settings uses the global back button");

const worksheet = readFileSync(new URL("./worksheet.js", import.meta.url), "utf8");
const mulRender = worksheet.slice(
  worksheet.indexOf("export function renderMultiplicationSheet"),
  worksheet.indexOf("export function planDivision"),
);
assert(!mulRender.includes("sheet-eq"), "multiplication has no horizontal a × b = line");
assert(!mulRender.includes(" × "), "multiplication does not repeat the equation above the stack");

const app = readFileSync(new URL("./app.js", import.meta.url), "utf8");
assert(app.includes("serviceWorker.register"), "register service worker");
assert(app.includes('if (screen === "settings") showScreen("setup")'), "settings back returns to home");
assert(app.includes("function leavePractice"), "practice back has a leave path");
assert(!app.includes('finishRound({ to: "setup" })'), "practice back shows results, not home");
assert(html.includes("See results"), "leave confirm opens results");
assert(html.indexOf('id="keypad"') < html.indexOf('id="submit-btn"'), "Submit sits below the keypad");
const keypad = html.slice(html.indexOf('id="keypad"'), html.indexOf("</div>", html.indexOf('id="keypad"')));
assert(
  keypad.indexOf('data-key="1"') < keypad.indexOf('data-key="4"') &&
    keypad.indexOf('data-key="4"') < keypad.indexOf('data-key="7"'),
  "numpad is 1–3, then 4–6, then 7–9",
);

console.log("pwa install checks passed");
