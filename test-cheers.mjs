import { readFileSync } from "node:fs";
import { CHEER_STYLES, CORRECT_CHEERS, RESULT_CHEERS, cheerDeck, resultCheer, resultTier } from "./cheers.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(CORRECT_CHEERS.length === 50, "50 correct-answer cheers");
assert(new Set(CORRECT_CHEERS).size === 50, "every cheer is different");
assert(CORRECT_CHEERS.every((cheer) => cheer.length <= 20), "cheers fit on one feedback line");

const deck = cheerDeck();
const firstPass = Array.from({ length: 50 }, () => deck.next());
assert(new Set(firstPass).size === 50, "all 50 cheers show before any repeats");
let previous = firstPass.at(-1);
for (let i = 0; i < 2000; i += 1) {
  const cheer = deck.next();
  assert(cheer !== previous, "never the same cheer twice in a row");
  previous = cheer;
}

assert(resultTier({ answered: 10, correct: 10 }) === "perfect", "perfect tier");
assert(resultTier({ answered: 10, correct: 8 }) === "great", "80% is great");
assert(resultTier({ answered: 10, correct: 5 }) === "good", "50% is good");
assert(resultTier({ answered: 10, correct: 2 }) === "growing", "some correct is growing");
assert(resultTier({ answered: 10, correct: 0 }) === "warmup", "none correct is warm-up");
assert(resultTier({ answered: 0, correct: 0 }) === "warmup", "empty round is warm-up");

for (const [tier, options] of Object.entries(RESULT_CHEERS)) {
  assert(options.length >= 2, `${tier} has more than one style`);
  assert(new Set(options.map((option) => option.title)).size === options.length, `${tier} titles differ`);
  for (const option of options) {
    assert(CHEER_STYLES.includes(option.style), `${tier} uses a known style`);
    const line = option.line({ name: "Liz", correct: 1, answered: 1 });
    assert(line.includes("Liz"), `${tier} headline names the learner`);
    assert(!line.includes("1 correct answers"), `${tier} headline uses the singular`);
  }
}

const seen = new Set();
for (let i = 0; i < 4; i += 1) {
  seen.add(resultCheer({ name: "Will", answered: 10, correct: 10 }, () => i / 4).title);
}
assert(seen.size === RESULT_CHEERS.perfect.length, "a perfect round can end with each perfect style");
const pick = resultCheer({ name: "Will", answered: 10, correct: 9 }, () => 0.999);
assert(pick.tier === "great" && pick.headline.includes("Will"), "great headline names the learner");

const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
for (const style of CHEER_STYLES) {
  assert(css.includes(`[data-cheer="${style}"]`), `${style} has a results style`);
}

const sw = readFileSync(new URL("./sw.js", import.meta.url), "utf8");
assert(sw.includes('"./cheers.js"'), "service worker caches cheers.js");

console.log("cheer checks passed");
