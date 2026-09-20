import { defaultMix, normalizeStore, personMix, writePersonMix } from "./storage.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const migrated = normalizeStore({
  settings: { learner: "Liz", ops: ["mul"], difficulty: "hard", mode: "quiz10" },
  bests: { "Liz|quiz10|hard|mul": 4 },
});
assert(migrated.lastLearner === "Liz", "migrate last learner");
assert(migrated.people.Liz.ops.join(",") === "mul", "migrate liz ops");
assert(migrated.people.Liz.difficulty === "hard", "migrate liz difficulty");
assert(migrated.bests["Liz|quiz10|hard|mul"] === 4, "keep bests");

const fresh = normalizeStore(null);
assert(fresh.lastLearner === "Will", "default learner");
assert(personMix(fresh, "Guest").ops.join(",") === defaultMix().ops.join(","), "unknown person defaults");

writePersonMix(fresh, "Will", { ops: ["add", "div"], difficulty: "medium", mode: "sprint" });
writePersonMix(fresh, "Liz", { ops: ["sub"], difficulty: "challenge", mode: "practice" });
assert(personMix(fresh, "Will").mode === "sprint", "will mix stays");
assert(personMix(fresh, "Liz").ops.join(",") === "sub", "liz mix stays");
assert(fresh.lastLearner === "Liz", "last writer is current learner");

const reloaded = normalizeStore(JSON.parse(JSON.stringify(fresh)));
assert(personMix(reloaded, "Will").difficulty === "medium", "round-trip will");
assert(personMix(reloaded, "Liz").difficulty === "challenge", "round-trip liz");

console.log("per-learner storage checks passed");
