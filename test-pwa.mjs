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

const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
const app = readFileSync(new URL("./app.js", import.meta.url), "utf8");
assert(app.includes("serviceWorker.register"), "register service worker");
assert(app.includes("history.back()"), "settings back uses browser history");
assert(app.includes("function lockHomeHistory"), "home back is swallowed so the app does not quit");
assert(app.includes("handleHistoryPop"), "system back is wired to in-app screens");
const popHandler = app.slice(app.indexOf("function handleHistoryPop"), app.indexOf("function modeMeta"));
assert(popHandler.includes("lockHomeHistory()"), "home trap is re-armed after a pop");
assert(!popHandler.includes("setTimeout"), "home does not stack extra trap entries after pop");
assert(!app.includes("function armHomeHistory"), "home does not stack multiple trap entries");
assert(css.includes(".icon-btn.is-hidden"), "home hides the session back control");
assert(css.includes("#difficulty-row"), "difficulty row can wrap so Challenge is not clipped");
assert(!css.includes("repeat(5, minmax(0, 1fr))"), "difficulty is not forced into five clipped columns");
assert(app.includes("function leavePractice"), "practice back has a leave path");
assert(!app.includes('finishRound({ to: "setup" })'), "practice back shows results, not home");
const leaveFn = app.slice(app.indexOf("function requestLeaveSession"), app.indexOf("function leavePractice"));
assert(leaveFn.includes("setLeaveOpen(true)"), "play back always opens a confirm dialog");
assert(!leaveFn.includes("finishRound"), "play back does not skip the confirm dialog");
assert(html.includes('data-mode="sprint10"'), "10 minute sprint mode");
assert(html.includes('data-mode="sprint30"'), "30 minute sprint mode");
assert(!html.includes("60s sprint"), "60s sprint is gone");
assert(app.includes("durationMs: 10 * 60_000"), "10 min sprint lasts 10 minutes");
assert(app.includes("durationMs: 30 * 60_000"), "30 min sprint lasts 30 minutes");
assert(app.includes("Try this step again."), "a miss stays on the problem");
assert(!app.includes("afterAnswer(false)"), "a miss does not skip to the next question");
assert(html.includes("Leave this round?"), "leave confirm is not practice-only");
assert(html.includes("See results"), "leave confirm opens results");
assert(html.indexOf('id="keypad"') < html.indexOf('id="submit-btn"'), "Submit sits below the keypad");
const keypad = html.slice(html.indexOf('id="keypad"'), html.indexOf("</div>", html.indexOf('id="keypad"')));
assert(
  keypad.indexOf('data-key="1"') < keypad.indexOf('data-key="4"') &&
    keypad.indexOf('data-key="4"') < keypad.indexOf('data-key="7"'),
  "numpad is 1–3, then 4–6, then 7–9",
);

console.log("pwa install checks passed");
