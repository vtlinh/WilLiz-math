import { shouldCelebrate } from "./celebrate.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(shouldCelebrate({ answered: 10, correct: 10, difficulty: "medium" }), "medium perfect");
assert(shouldCelebrate({ answered: 4, correct: 4, difficulty: "hard" }), "hard perfect");
assert(shouldCelebrate({ answered: 8, correct: 8, difficulty: "pictures" }), "pictures perfect");
assert(shouldCelebrate({ answered: 36, correct: 36, difficulty: "table" }), "perfect times table celebrates");
assert(!shouldCelebrate({ answered: 10, correct: 10, difficulty: "easy" }), "easy no party");
assert(!shouldCelebrate({ answered: 10, correct: 10, difficulty: "challenge" }), "removed challenge does not celebrate");
assert(shouldCelebrate({ answered: 10, correct: 9, difficulty: "hard" }), "90% celebrates");
assert(shouldCelebrate({ answered: 20, correct: 18, difficulty: "medium" }), "18 of 20 is 90%");
assert(shouldCelebrate({ answered: 36, correct: 33, difficulty: "table" }), "33 of 36 is above 90%");
assert(!shouldCelebrate({ answered: 20, correct: 17, difficulty: "medium" }), "85% does not celebrate");
assert(!shouldCelebrate({ answered: 36, correct: 32, difficulty: "table" }), "32 of 36 is under 90%");
assert(!shouldCelebrate({ answered: 10, correct: 9, difficulty: "easy" }), "easy still has no party");
assert(!shouldCelebrate({ answered: 0, correct: 0, difficulty: "hard" }), "empty round");

console.log("celebration checks passed");
