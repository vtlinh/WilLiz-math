import { progressStars } from "./stars.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(progressStars(0, 10) === 0, "none yet");
assert(progressStars(1, 10) === 0, "10% is not a star");
assert(progressStars(2, 10) === 1, "20% of a 10-quiz");
assert(progressStars(4, 10) === 2, "40%");
assert(progressStars(10, 10) === 5, "perfect 10");
assert(progressStars(4, 20) === 1, "20% of a 20-quiz");
assert(progressStars(20, 20) === 5, "perfect 20");
assert(progressStars(3, 0) === 0, "no total");

console.log("progress star checks passed");
