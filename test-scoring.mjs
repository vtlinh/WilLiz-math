import { bestNote, creditsAnswer, formatCorrectCount, missMessage, resultsTimeMs } from "./scoring.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(formatCorrectCount(10, 11) === "10 / 11", "results correct is correct / answered");
assert(formatCorrectCount(10, 10) === "10 / 10", "perfect round is 10 / 10");
assert(formatCorrectCount(0, 0) === "0 / 0", "empty round is 0 / 0");
assert(creditsAnswer(true, false) === true, "first-try correct scores");
assert(creditsAnswer(true, true) === false, "correct after a miss scores 0");
assert(creditsAnswer(false, true) === false, "a miss scores 0");
assert(creditsAnswer(false, false) === false, "wrong first try scores 0");

const div220 = { op: "div", a: 220, b: 20, answer: 11, prompt: "220 ÷ 20" };
assert(missMessage(div220) === "Not quite.", "long division does not rewrite 220 ÷ 20 = 11");
assert(!missMessage(div220).includes("11"), "miss text does not claim a different quotient");
assert(
  missMessage({ op: "mul", a: 2, b: 3, answer: 6, prompt: "2 × 3", difficulty: "pictures" }) ===
    "Not quite. 2 × 3 = 6",
  "pictures still say the counted total",
);

assert(bestNote(true, 0) === "New personal best for this mix.", "a higher score is a new best");
assert(bestNote(false, 4) === "Personal best for this mix: 4.", "an unbeaten best stays visible");
assert(bestNote(false, 0) === "No personal best yet.", "a zero round does not claim a saved best");

const tenMinutes = 10 * 60_000;
assert(resultsTimeMs({ timed: false }, 12_400) === 12_400, "practice time is elapsed");
assert(resultsTimeMs({ timed: true, durationMs: tenMinutes }, 90_000) === 90_000, "leaving a sprint early shows time spent");
assert(resultsTimeMs({ timed: true, durationMs: tenMinutes }, tenMinutes + 800) === tenMinutes, "a finished sprint does not run past its length");

console.log("practice scoring checks passed");
