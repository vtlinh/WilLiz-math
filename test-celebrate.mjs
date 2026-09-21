import { shouldCelebrate } from "./celebrate.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(shouldCelebrate({ answered: 10, correct: 10, difficulty: "medium" }), "medium perfect");
assert(shouldCelebrate({ answered: 4, correct: 4, difficulty: "hard" }), "hard perfect");
assert(shouldCelebrate({ answered: 8, correct: 8, difficulty: "pictures" }), "pictures perfect");
assert(!shouldCelebrate({ answered: 10, correct: 10, difficulty: "easy" }), "easy no party");
assert(!shouldCelebrate({ answered: 10, correct: 10, difficulty: "challenge" }), "removed challenge does not celebrate");
assert(!shouldCelebrate({ answered: 10, correct: 9, difficulty: "hard" }), "not 100%");
assert(!shouldCelebrate({ answered: 0, correct: 0, difficulty: "hard" }), "empty round");

console.log("celebration checks passed");
