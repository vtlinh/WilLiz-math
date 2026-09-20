import { compactStarCount, progressStars, unlimitedStars } from "./stars.js";

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

const nine = Array(9).fill(true);
const ten = Array(10).fill(true);
const twenty = Array(20).fill(true);
const seventy = Array(70).fill(true);
const eighty = Array(80).fill(true);

assert(unlimitedStars([]) === 0, "no attempts");
assert(unlimitedStars(nine) === 0, "nine clean is not a set");
assert(unlimitedStars(ten) === 1, "first ten all correct");
assert(unlimitedStars([...ten, false]) === 1, "partial second set");
assert(unlimitedStars([...nine, false, ...ten]) === 1, "miss in 1-10, clean 11-20");
assert(unlimitedStars(twenty) === 2, "two clean sets");
assert(unlimitedStars(seventy) === 7, "seven stars");
assert(unlimitedStars(eighty) === 8, "eight stars");
assert(unlimitedStars(Array(10).fill(false)) === 0, "ten misses");

assert(compactStarCount(7) === false, "seven stay as icons");
assert(compactStarCount(8) === true, "eight compact");
assert(compactStarCount(0) === false, "none compact");

console.log("progress star checks passed");
