import { creditsAnswer, missMessage } from "./scoring.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

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

console.log("practice scoring checks passed");
