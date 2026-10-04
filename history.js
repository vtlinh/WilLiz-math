import { SYMBOLS } from "./problems.js";

export const HISTORY_LIMIT = 20;
export const LEARNERS = ["Will", "Liz", "Guest"];

const MODE_LABELS = {
  practice: "Practice",
  quiz10: "Quiz · 10",
  quiz20: "Quiz · 20",
  sprint10: "Sprint · 10 min",
  sprint30: "Sprint · 30 min",
};

function wholeAtLeast(value, min) {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) ? Math.max(min, number) : min;
}

function cleanRun(run) {
  if (!run || typeof run !== "object") return null;
  const at = Number(run.at);
  const answered = wholeAtLeast(run.answered, 0);
  if (!Number.isFinite(at) || answered < 1) return null;
  return {
    id: String(run.id || at),
    at,
    learner: typeof run.learner === "string" && run.learner ? run.learner : LEARNERS[0],
    mode: typeof run.mode === "string" ? run.mode : "practice",
    difficulty: typeof run.difficulty === "string" ? run.difficulty : "easy",
    ops: Array.isArray(run.ops) ? run.ops.filter((op) => typeof op === "string") : [],
    correct: Math.min(answered, wholeAtLeast(run.correct, 0)),
    answered,
    timeMs: wholeAtLeast(run.timeMs, 0),
    bestStreak: wholeAtLeast(run.bestStreak, 0),
  };
}

export function normalizeHistory(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  return list
    .map(cleanRun)
    .filter((run) => run && !seen.has(run.id) && seen.add(run.id))
    .sort((a, b) => b.at - a.at)
    .slice(0, HISTORY_LIMIT);
}

export function recordRun(history, run) {
  return normalizeHistory([run, ...normalizeHistory(history)]);
}

export function reassignRun(history, id, learner) {
  if (!LEARNERS.includes(learner)) return normalizeHistory(history);
  return normalizeHistory(history).map((run) => (run.id === id ? { ...run, learner } : run));
}

export function runWhen(at, locale) {
  return new Date(at).toLocaleString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function runMix(run) {
  if (run.difficulty === "table") return "× table";
  const level = run.difficulty.charAt(0).toUpperCase() + run.difficulty.slice(1);
  const ops = run.ops.map((op) => SYMBOLS[op] ?? op).join(" ");
  return [MODE_LABELS[run.mode] ?? run.mode, level, ops].filter(Boolean).join(" · ");
}
