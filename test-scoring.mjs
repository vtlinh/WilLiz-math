import { creditsAnswer } from "./scoring.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(creditsAnswer(true, false) === true, "first-try correct scores");
assert(creditsAnswer(true, true) === false, "correct after a miss scores 0");
assert(creditsAnswer(false, true) === false, "a miss scores 0");
assert(creditsAnswer(false, false) === false, "wrong first try scores 0");

console.log("practice scoring checks passed");
