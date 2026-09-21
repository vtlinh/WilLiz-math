import {
  STORE_VERSION,
  defaultMix,
  normalizeDifficulty,
  normalizeMode,
  normalizeStore,
  personMix,
  writePersonMix,
} from "./storage.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(normalizeDifficulty("challenge") === "hard", "challenge label is now hard");
assert(normalizeDifficulty("hard") === "hard", "current hard stays hard");
assert(normalizeDifficulty("hard", { migrateOld: true }) === "medium", "old hard becomes medium");
assert(normalizeDifficulty("medium", { migrateOld: true }) === "easy", "old medium is removed");
assert(normalizeDifficulty("challenge", { migrateOld: true }) === "hard", "old challenge becomes hard");

const migrated = normalizeStore({
  settings: { learner: "Liz", ops: ["mul"], difficulty: "hard", mode: "quiz10" },
  bests: { "Liz|quiz10|hard|mul": 4, "Liz|quiz10|challenge|mul": 7 },
});
assert(migrated.lastLearner === "Liz", "migrate last learner");
assert(migrated.people.Liz.ops.join(",") === "mul", "migrate liz ops");
assert(migrated.people.Liz.difficulty === "medium", "old hard becomes medium");
assert(migrated.bests["Liz|quiz10|medium|mul"] === 4, "old hard best moves to medium");
assert(migrated.bests["Liz|quiz10|hard|mul"] === 7, "old challenge best moves to hard");
assert(migrated.storeVersion === STORE_VERSION, "store version is current");

const fresh = normalizeStore(null);
assert(fresh.lastLearner === "Will", "default learner");
assert(personMix(fresh, "Guest").ops.join(",") === defaultMix().ops.join(","), "unknown person defaults");
assert(personMix(fresh, "Guest").theme === "dark", "default theme is dark");
assert(migrated.people.Liz.theme === "dark", "legacy mix gets dark");

assert(normalizeMode("sprint") === "sprint10", "legacy 60s sprint becomes 10 min");
writePersonMix(fresh, "Will", { ops: ["add", "div"], difficulty: "medium", mode: "sprint", theme: "light" });
writePersonMix(fresh, "Liz", { ops: ["sub"], difficulty: "challenge", mode: "practice" });
assert(personMix(fresh, "Will").mode === "sprint10", "will mix stays as 10 min sprint");
assert(personMix(fresh, "Will").theme === "light", "will light theme");
assert(personMix(fresh, "Liz").ops.join(",") === "sub", "liz mix stays");
assert(personMix(fresh, "Liz").theme === "dark", "liz keeps default dark");
assert(personMix(fresh, "Liz").difficulty === "hard", "written challenge becomes hard");
assert(fresh.lastLearner === "Liz", "last writer is current learner");

const reloaded = normalizeStore(JSON.parse(JSON.stringify(fresh)));
assert(personMix(reloaded, "Will").mode === "sprint10", "round-trip will sprint");
assert(personMix(reloaded, "Will").difficulty === "medium", "round-trip will");
assert(personMix(reloaded, "Will").theme === "light", "round-trip will theme");
assert(personMix(reloaded, "Liz").difficulty === "hard", "round-trip liz");

const currentHard = normalizeStore({
  storeVersion: 2,
  lastLearner: "Will",
  people: { Will: { ops: ["mul"], difficulty: "hard", mode: "practice", theme: "dark" } },
  bests: { "Will|practice|hard|mul": 3 },
});
assert(currentHard.people.Will.difficulty === "hard", "version 2 hard is not remapped");
assert(currentHard.bests["Will|practice|hard|mul"] === 3, "version 2 hard bests stay");

console.log("per-learner storage checks passed");
