import { generateProblem, parseAnswer } from "./problems.js";

const STORAGE_KEY = "williz-math-v1";

const els = {
  setup: document.getElementById("setup-screen"),
  play: document.getElementById("play-screen"),
  results: document.getElementById("results-screen"),
  learnerRow: document.getElementById("learner-row"),
  opRow: document.getElementById("op-row"),
  difficultyRow: document.getElementById("difficulty-row"),
  modeRow: document.getElementById("mode-row"),
  setupError: document.getElementById("setup-error"),
  startBtn: document.getElementById("start-btn"),
  playWho: document.getElementById("play-who"),
  playProgress: document.getElementById("play-progress"),
  problem: document.getElementById("problem"),
  form: document.getElementById("answer-form"),
  input: document.getElementById("answer-input"),
  feedback: document.getElementById("feedback"),
  keypad: document.getElementById("keypad"),
  skipBtn: document.getElementById("skip-btn"),
  endBtn: document.getElementById("end-btn"),
  headline: document.getElementById("results-headline"),
  statCorrect: document.getElementById("stat-correct"),
  statAccuracy: document.getElementById("stat-accuracy"),
  statStreak: document.getElementById("stat-streak"),
  statTime: document.getElementById("stat-time"),
  statBest: document.getElementById("stat-best"),
  againBtn: document.getElementById("again-btn"),
  setupBtn: document.getElementById("setup-btn"),
};

const settings = {
  learner: "Will",
  ops: ["add", "sub"],
  difficulty: "easy",
  mode: "practice",
};

let round = null;
let current = null;
let timerId = null;
let awaitingAdvance = false;

function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveStore(next) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode or a full store should not block a round.
  }
}

function restoreSettings() {
  const saved = loadStore().settings;
  if (!saved) return;
  if (saved.learner) settings.learner = saved.learner;
  if (Array.isArray(saved.ops)) settings.ops = saved.ops;
  if (saved.difficulty) settings.difficulty = saved.difficulty;
  if (saved.mode) settings.mode = saved.mode;
  syncSetupUi();
}

function syncSetupUi() {
  for (const button of els.learnerRow.querySelectorAll("[data-learner]")) {
    button.classList.toggle("is-selected", button.dataset.learner === settings.learner);
  }
  for (const button of els.opRow.querySelectorAll("[data-op]")) {
    const on = settings.ops.includes(button.dataset.op);
    button.classList.toggle("is-selected", on);
    button.setAttribute("aria-pressed", String(on));
  }
  for (const button of els.difficultyRow.querySelectorAll("[data-difficulty]")) {
    const on = button.dataset.difficulty === settings.difficulty;
    button.classList.toggle("is-selected", on);
    button.setAttribute("aria-checked", String(on));
  }
  for (const button of els.modeRow.querySelectorAll("[data-mode]")) {
    button.classList.toggle("is-selected", button.dataset.mode === settings.mode);
  }
}

function persistSettings() {
  const store = loadStore();
  store.settings = { ...settings };
  saveStore(store);
}

function showScreen(name) {
  els.setup.classList.toggle("hidden", name !== "setup");
  els.play.classList.toggle("hidden", name !== "play");
  els.results.classList.toggle("hidden", name !== "results");
}

function modeMeta(mode) {
  if (mode === "quiz10") return { label: "Quiz", limit: 10, timed: false, oneTry: true };
  if (mode === "quiz20") return { label: "Quiz", limit: 20, timed: false, oneTry: true };
  if (mode === "sprint") return { label: "Sprint", limit: null, timed: true, oneTry: true };
  return { label: "Practice", limit: null, timed: false, oneTry: false };
}

function formatTime(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return minutes ? `${minutes}:${seconds}` : `${total}s`;
}

function clearTimer() {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function startRound() {
  if (!settings.ops.length) {
    els.setupError.hidden = false;
    return;
  }
  els.setupError.hidden = true;
  persistSettings();
  clearTimer();

  const meta = modeMeta(settings.mode);
  round = {
    ...meta,
    startedAt: Date.now(),
    endsAt: meta.timed ? Date.now() + 60_000 : null,
    asked: 0,
    correct: 0,
    answered: 0,
    streak: 0,
    bestStreak: 0,
    lastKey: "",
  };

  els.playWho.textContent = `${settings.learner} · ${meta.label} · ${settings.difficulty}`;
  els.skipBtn.hidden = meta.oneTry;
  showScreen("play");
  nextProblem();

  if (meta.timed) {
    timerId = window.setInterval(updateProgress, 200);
  }
}

function nextProblem() {
  awaitingAdvance = false;
  current = generateProblem(settings.ops, settings.difficulty, round.lastKey);
  round.lastKey = current.key;
  round.asked += 1;
  els.problem.textContent = current.prompt;
  els.input.value = "";
  els.feedback.textContent = "";
  els.feedback.className = "feedback";
  els.input.focus();
  updateProgress();
}

function updateProgress() {
  if (!round) return;
  if (round.timed) {
    const remaining = round.endsAt - Date.now();
    els.playProgress.textContent = formatTime(remaining);
    if (remaining <= 0) {
      finishRound();
    }
    return;
  }
  if (round.limit) {
    els.playProgress.textContent = `${Math.min(round.asked, round.limit)} / ${round.limit}`;
    return;
  }
  els.playProgress.textContent = `${round.correct} correct`;
}

function mark(correct) {
  if (correct) {
    round.correct += 1;
    round.streak += 1;
    round.bestStreak = Math.max(round.bestStreak, round.streak);
    els.feedback.textContent = "Nice. That’s right.";
    els.feedback.className = "feedback is-good";
  } else {
    round.streak = 0;
    els.feedback.textContent = `Not quite. ${current.prompt} = ${current.answer}`;
    els.feedback.className = "feedback is-bad";
  }
}

function afterAnswer(correct) {
  round.answered += 1;
  mark(correct);
  updateProgress();

  const done = round.limit && round.answered >= round.limit;
  if (done) {
    window.setTimeout(finishRound, 700);
    return;
  }

  if (round.oneTry || correct) {
    awaitingAdvance = true;
    window.setTimeout(() => {
      if (round && awaitingAdvance) nextProblem();
    }, correct ? 550 : 900);
  }
}

function submitAnswer(event) {
  event.preventDefault();
  if (!round || awaitingAdvance) return;
  const value = parseAnswer(els.input.value);
  if (value === null) return;
  afterAnswer(value === current.answer);
}

function skipProblem() {
  if (!round || awaitingAdvance) return;
  round.streak = 0;
  nextProblem();
}

function bestKey() {
  return `${settings.learner}|${settings.mode}|${settings.difficulty}|${settings.ops.slice().sort().join(",")}`;
}

function finishRound() {
  if (!round) return;
  clearTimer();
  const elapsed = Date.now() - round.startedAt;
  const accuracy = round.answered ? Math.round((round.correct / round.answered) * 100) : 0;
  const store = loadStore();
  store.bests ??= {};
  const key = bestKey();
  const previous = store.bests[key] ?? 0;
  const improved = round.correct > previous;
  if (improved) store.bests[key] = round.correct;
  saveStore(store);

  const name = settings.learner;
  els.headline.textContent = round.correct
    ? `${name} banked ${round.correct} correct answer${round.correct === 1 ? "" : "s"}.`
    : `${name} is warmed up. Try one more pass.`;
  els.statCorrect.textContent = String(round.correct);
  els.statAccuracy.textContent = `${accuracy}%`;
  els.statStreak.textContent = String(round.bestStreak);
  els.statTime.textContent = round.timed ? "60s" : formatTime(elapsed);
  els.statBest.textContent = improved
    ? "New personal best for this mix."
    : previous
      ? `Personal best for this mix: ${previous}.`
      : "This mix now has a saved best.";
  round = null;
  showScreen("results");
}

function toggleOp(op) {
  if (settings.ops.includes(op)) {
    settings.ops = settings.ops.filter((item) => item !== op);
  } else {
    settings.ops = [...settings.ops, op];
  }
  syncSetupUi();
}

function pressKey(key) {
  if (key === "back") {
    els.input.value = els.input.value.slice(0, -1);
    return;
  }
  if (key === "-" || key === "−") {
    els.input.value = els.input.value.startsWith("-") ? els.input.value.slice(1) : `-${els.input.value}`;
    return;
  }
  els.input.value += key;
  els.input.focus();
}

els.learnerRow.addEventListener("click", (event) => {
  const button = event.target.closest("[data-learner]");
  if (!button) return;
  settings.learner = button.dataset.learner;
  syncSetupUi();
});

els.opRow.addEventListener("click", (event) => {
  const button = event.target.closest("[data-op]");
  if (!button) return;
  toggleOp(button.dataset.op);
});

els.difficultyRow.addEventListener("click", (event) => {
  const button = event.target.closest("[data-difficulty]");
  if (!button) return;
  settings.difficulty = button.dataset.difficulty;
  syncSetupUi();
});

els.modeRow.addEventListener("click", (event) => {
  const button = event.target.closest("[data-mode]");
  if (!button) return;
  settings.mode = button.dataset.mode;
  syncSetupUi();
});

els.startBtn.addEventListener("click", startRound);
els.form.addEventListener("submit", submitAnswer);
els.skipBtn.addEventListener("click", skipProblem);
els.endBtn.addEventListener("click", finishRound);
els.againBtn.addEventListener("click", startRound);
els.setupBtn.addEventListener("click", () => {
  clearTimer();
  round = null;
  showScreen("setup");
});
els.keypad.addEventListener("click", (event) => {
  const button = event.target.closest("[data-key]");
  if (!button) return;
  pressKey(button.dataset.key);
});

restoreSettings();
