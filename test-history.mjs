import { HISTORY_LIMIT, normalizeHistory, reassignRun, recordRun, runMix, runWhen } from "./history.js";
import { normalizeStore, writePersonMix } from "./storage.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const base = Date.UTC(2026, 9, 4, 2, 58);
const run = (i, extra = {}) => ({
  id: `run-${i}`,
  at: base + i * 60_000,
  learner: "Will",
  mode: "quiz10",
  difficulty: "easy",
  ops: ["add", "sub"],
  correct: 9,
  answered: 10,
  timeMs: 24_000,
  bestStreak: 9,
  ...extra,
});

assert(normalizeHistory(null).length === 0, "no history yet");
assert(recordRun([], run(1, { answered: 0, correct: 0 })).length === 0, "a run with nothing solved is not stored");

let history = [];
for (let i = 1; i <= 25; i += 1) history = recordRun(history, run(i));
assert(HISTORY_LIMIT === 20 && history.length === 20, "only the last 20 runs are kept");
assert(history[0].id === "run-25" && history[19].id === "run-6", "newest first; the oldest five fall off");
assert(history.every((entry, i) => i === 0 || history[i - 1].at >= entry.at), "history is sorted by date");

const moved = reassignRun(history, "run-24", "Liz");
assert(moved.find((entry) => entry.id === "run-24").learner === "Liz", "a run can move to Liz");
assert(moved.filter((entry) => entry.learner === "Liz").length === 1, "only that run moves");
assert(reassignRun(history, "run-24", "Nobody").find((entry) => entry.id === "run-24").learner === "Will", "unknown names are ignored");

const cleaned = normalizeHistory([run(1, { correct: 14 }), run(1), { at: "soon", answered: 3 }, null]);
assert(cleaned.length === 1, "bad entries and duplicate ids are dropped");
assert(cleaned[0].correct === 10, "correct never exceeds answered");

assert(runMix(run(1)) === "Quiz · 10 · Easy · + −", `quiz mix reads clearly (${runMix(run(1))})`);
assert(runMix(run(1, { mode: "table", difficulty: "table", ops: ["table"] })) === "× table", "× table runs say × table");
assert(runMix(run(1, { mode: "sprint10", difficulty: "hard", ops: ["div"] })) === "Sprint · 10 min · Hard · ÷", "sprint mix");
const when = runWhen(base, "en-US");
assert(/Oct/.test(when) && /4/.test(when) && /\d:\d\d/.test(when), `date and time are shown (${when})`);

const store = normalizeStore({ storeVersion: 2, lastLearner: "Liz", history: [run(2), run(3)] });
assert(store.history.length === 2 && store.history[0].id === "run-3", "the store keeps history newest first");
writePersonMix(store, "Liz", { ops: ["mul"], difficulty: "medium", mode: "practice" });
const reloaded = normalizeStore(JSON.parse(JSON.stringify(store)));
assert(reloaded.history.length === 2, "saving a learner's mix keeps the history");
assert(normalizeStore(null).history.length === 0, "a fresh store has empty history");

console.log("run history checks passed");
