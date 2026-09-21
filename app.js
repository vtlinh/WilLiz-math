import { generateProblem, playOps } from "./problems.js";
import { STORAGE_KEY, normalizeStore, normalizeTheme, personMix, writePersonMix } from "./storage.js";
import { fieldsMatch, fieldsReady, renderProblemView, worksheetFields, worksheetSections } from "./worksheet.js";
import { playCelebration, shouldCelebrate, stopCelebration } from "./celebrate.js";
import { compactStarCount, progressStars, unlimitedStars } from "./stars.js";
import { creditsAnswer, formatCorrectCount, missMessage } from "./scoring.js";

const els = {
  setup: document.getElementById("setup-screen"),
  play: document.getElementById("play-screen"),
  results: document.getElementById("results-screen"),
  learnerMenu: document.getElementById("learner-menu"),
  learnerBtn: document.getElementById("learner-btn"),
  learnerAvatar: document.getElementById("learner-avatar"),
  learnerPanel: document.getElementById("learner-panel"),
  opRow: document.getElementById("op-row"),
  difficultyRow: document.getElementById("difficulty-row"),
  modeRow: document.getElementById("mode-row"),
  themeRow: document.getElementById("theme-row"),
  setupError: document.getElementById("setup-error"),
  startBtn: document.getElementById("start-btn"),
  playMeta: document.getElementById("play-meta"),
  playWho: document.getElementById("play-who"),
  playProgress: document.getElementById("play-progress"),
  problem: document.getElementById("problem"),
  form: document.getElementById("answer-form"),
  input: document.getElementById("answer-input"),
  submitBtn: document.getElementById("submit-btn"),
  feedback: document.getElementById("feedback"),
  keypad: document.getElementById("keypad"),
  starRow: document.getElementById("star-row"),
  headline: document.getElementById("results-headline"),
  statCorrect: document.getElementById("stat-correct"),
  statAccuracy: document.getElementById("stat-accuracy"),
  statStreak: document.getElementById("stat-streak"),
  statTime: document.getElementById("stat-time"),
  statBest: document.getElementById("stat-best"),
  againBtn: document.getElementById("again-btn"),
  setupBtn: document.getElementById("setup-btn"),
  mixSummary: document.getElementById("mix-summary"),
  settings: document.getElementById("settings-screen"),
  settingsBtn: document.getElementById("settings-btn"),
  setupTitle: document.getElementById("setup-title"),
  actionHome: document.getElementById("action-home"),
  sessionBack: document.getElementById("session-back"),
  playStat: document.getElementById("play-stat"),
  leaveBackdrop: document.getElementById("leave-backdrop"),
  leaveDialog: document.getElementById("leave-dialog"),
  leaveStay: document.getElementById("leave-stay"),
  leaveConfirm: document.getElementById("leave-confirm"),
};

const settings = {
  learner: "Will",
  ops: ["add", "sub"],
  difficulty: "easy",
  mode: "practice",
  theme: "dark",
};

let round = null;
let current = null;
let timerId = null;
let awaitingAdvance = false;
let screen = "setup";

function loadStore() {
  try {
    return normalizeStore(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return normalizeStore(null);
  }
}

function saveStore(next) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode or a full store should not block a round.
  }
}

function applyMix(mix) {
  settings.ops = [...mix.ops];
  settings.difficulty = mix.difficulty;
  settings.mode = mix.mode;
  settings.theme = normalizeTheme(mix.theme);
}

function applyTheme() {
  document.documentElement.dataset.theme = settings.theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = settings.theme === "light" ? "#1d4336" : "#121816";
}

function restoreSettings() {
  const store = loadStore();
  settings.learner = store.lastLearner || "Will";
  applyMix(personMix(store, settings.learner));
  syncSetupUi();
}

function syncSetupUi() {
  els.learnerAvatar.textContent = settings.learner.slice(0, 1);
  els.learnerBtn.setAttribute("aria-label", `${settings.learner}, change who is practicing`);
  for (const button of els.learnerPanel.querySelectorAll("[data-learner]")) {
    button.classList.toggle("is-selected", button.dataset.learner === settings.learner);
  }
  for (const button of els.opRow.querySelectorAll("[data-op]")) {
    const blocked = settings.difficulty === "pictures" && button.dataset.op === "div";
    const on = !blocked && settings.ops.includes(button.dataset.op);
    button.disabled = blocked;
    button.classList.toggle("is-selected", on);
    button.setAttribute("aria-pressed", String(on));
    button.title = blocked ? "Pictures has no division" : "";
  }
  for (const button of els.difficultyRow.querySelectorAll("[data-difficulty]")) {
    const on = button.dataset.difficulty === settings.difficulty;
    button.classList.toggle("is-selected", on);
    button.setAttribute("aria-checked", String(on));
  }
  for (const button of els.modeRow.querySelectorAll("[data-mode]")) {
    button.classList.toggle("is-selected", button.dataset.mode === settings.mode);
  }
  for (const button of els.themeRow.querySelectorAll("[data-theme]")) {
    const on = button.dataset.theme === settings.theme;
    button.classList.toggle("is-selected", on);
    button.setAttribute("aria-checked", String(on));
  }
  applyTheme();
  const symbols = { add: "+", sub: "−", mul: "×", div: "÷" };
  const ops = playOps(settings.ops, settings.difficulty)
    .map((op) => symbols[op])
    .join(" ") || "no operations";
  els.mixSummary.textContent = `${settings.learner} · ${modeMeta(settings.mode).label} · ${settings.difficulty} · ${ops}`;
  if (settings.ops.length) els.setupError.hidden = true;
}

function persistSettings() {
  const store = loadStore();
  writePersonMix(store, settings.learner, settings);
  saveStore(store);
}

function selectLearner(name) {
  settings.learner = name;
  applyMix(personMix(loadStore(), name));
  persistSettings();
  syncSetupUi();
}

function setLearnerOpen(open) {
  els.learnerPanel.classList.toggle("hidden", !open);
  els.learnerPanel.hidden = !open;
  els.learnerBtn.classList.toggle("is-open", open);
  els.learnerBtn.setAttribute("aria-expanded", String(open));
}

function setSettingsOpen(open) {
  if (open) {
    setLearnerOpen(false);
    showScreen("settings");
    return;
  }
  if (screen !== "settings") return;
  if (history.state?.screen === "settings") {
    history.back();
    return;
  }
  showScreen("setup", { replace: true });
}

function isPracticePlay() {
  return screen === "play" && round?.mode === "practice";
}

function paintPlayStat() {
  if (!round) {
    els.playStat.textContent = "0/0";
    els.playStat.setAttribute("aria-label", "0 of 0 correct");
    return;
  }
  els.playStat.textContent = `${round.correct}/${round.asked}`;
  els.playStat.setAttribute("aria-label", `${round.correct} of ${round.asked} correct`);
}

function syncPlayChrome() {
  const play = screen === "play";
  const settingsPage = screen === "settings";
  const practice = isPracticePlay();
  const showBack = play || settingsPage;
  els.sessionBack.hidden = !showBack;
  els.sessionBack.classList.toggle("is-hidden", !showBack);
  els.sessionBack.tabIndex = showBack ? 0 : -1;
  els.sessionBack.setAttribute("aria-label", settingsPage ? "Back to home" : "Back");
  els.setupTitle.hidden = !settingsPage;
  els.actionHome.hidden = play || settingsPage;
  els.playStat.hidden = !practice;
  els.settingsBtn.hidden = play || settingsPage;
  els.settingsBtn.classList.toggle("is-open", settingsPage);
  els.settingsBtn.setAttribute("aria-expanded", String(settingsPage));
  els.playMeta.hidden = practice;
  if (play || settingsPage) setLearnerOpen(false);
  if (practice) paintPlayStat();
}

function leaveUrl() {
  return "./#play/leave";
}

function setLeaveOpen(open, { fromHistory = false } = {}) {
  const wasOpen = isLeaveOpen();
  els.leaveDialog.classList.toggle("hidden", !open);
  els.leaveBackdrop.classList.toggle("hidden", !open);
  els.leaveDialog.hidden = !open;
  els.leaveBackdrop.hidden = !open;
  document.body.classList.toggle("leave-open", open);
  if (fromHistory || wasOpen === open) return;
  if (open && !history.state?.leave) {
    history.pushState({ screen: "play", leave: true }, "", leaveUrl());
    return;
  }
  if (!open && history.state?.leave) {
    history.replaceState({ screen: "play", trap: false }, "", screenUrl("play"));
  }
}

function isLeaveOpen() {
  return !els.leaveDialog.hidden;
}

function paintScreen(name) {
  screen = name === "play" || name === "settings" || name === "results" ? name : "setup";
  els.setup.classList.toggle("hidden", screen !== "setup");
  els.play.classList.toggle("hidden", screen !== "play");
  els.results.classList.toggle("hidden", screen !== "results");
  els.settings.classList.toggle("hidden", screen !== "settings");
  document.body.classList.toggle("is-settings", screen === "settings");
  syncPlayChrome();
}

function screenUrl(name) {
  return name === "setup" ? "./#home" : `./#${name}`;
}

function homeTrapUrl() {
  return "./#home/stay";
}

function lockHomeHistory() {
  if (screen !== "setup") return;
  if (history.state?.trap) return;
  history.pushState({ screen: "setup", trap: true }, "", homeTrapUrl());
}

function showScreen(name, { replace = false } = {}) {
  paintScreen(name);
  const state = { screen, trap: false };
  const url = screenUrl(screen);
  if (replace) {
    history.replaceState(state, "", url);
    lockHomeHistory();
    return;
  }
  if (history.state?.screen !== screen) history.pushState(state, "", url);
  lockHomeHistory();
}

function handleHistoryPop() {
  if (isLeaveOpen()) {
    setLeaveOpen(false, { fromHistory: true });
    if (round) {
      if (history.state?.screen !== "play") showScreen("play");
      else paintScreen("play");
    }
    return;
  }
  const next = history.state?.screen === "play" && !round ? "setup" : history.state?.screen || "setup";
  if (screen === "play" && round && next !== "play") {
    showScreen("play");
    requestLeaveSession();
    return;
  }
  paintScreen(next);
  if (screen === "setup") lockHomeHistory();
}

function swallowHomeNavigate(event) {
  if (event.navigationType !== "traverse" || screen !== "setup" || !event.canIntercept) return;
  const destIndex = event.destination?.index;
  const here = window.navigation?.currentEntry?.index;
  if (typeof destIndex === "number" && typeof here === "number" && destIndex >= here) return;
  try {
    event.intercept({
      focusReset: "manual",
      scroll: "manual",
      handler() {
        lockHomeHistory();
      },
    });
  } catch {
    lockHomeHistory();
  }
}

function modeMeta(mode) {
  if (mode === "quiz10") return { label: "Quiz", limit: 10, timed: false };
  if (mode === "quiz20") return { label: "Quiz", limit: 20, timed: false };
  if (mode === "sprint10") return { label: "Sprint · 10", limit: null, timed: true, durationMs: 10 * 60_000 };
  if (mode === "sprint30") return { label: "Sprint · 30", limit: null, timed: true, durationMs: 30 * 60_000 };
  return { label: "Practice", limit: null, timed: false };
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
  const ops = playOps(settings.ops, settings.difficulty);
  if (!ops.length) {
    els.setupError.hidden = false;
    setSettingsOpen(true);
    return;
  }
  els.setupError.hidden = true;
  persistSettings();
  clearTimer();
  stopCelebration();
  setLearnerOpen(false);
  setSettingsOpen(false);

  const meta = modeMeta(settings.mode);
  round = {
    ...meta,
    learner: settings.learner,
    ops,
    difficulty: settings.difficulty,
    mode: settings.mode,
    startedAt: Date.now(),
    endsAt: meta.timed ? Date.now() + meta.durationMs : null,
    asked: 0,
    correct: 0,
    answered: 0,
    streak: 0,
    bestStreak: 0,
    lastKey: "",
    attempts: [],
  };

  els.playWho.textContent = `${round.learner} · ${meta.label} · ${round.difficulty}`;
  showScreen("play");
  paintStars();
  nextProblem();

  if (meta.timed) {
    timerId = window.setInterval(updateProgress, 200);
  }
}

function isLastSection() {
  return !current?.sections || current.section >= current.sections.length - 1;
}

function syncSubmitLabel() {
  els.submitBtn.textContent = isLastSection() ? "Submit" : "Next";
}

function paintProblem(reveal = false) {
  els.problem.replaceChildren(
    renderProblemView(current, {
      fills: current.fills,
      active: current.active,
      reveal,
      section: current.section ?? 0,
    }),
  );
  els.problem.classList.toggle("is-sheet", Boolean(current.op));
  els.form.classList.add("is-sheet-fill");
  els.input.hidden = true;
  syncSubmitLabel();
}

function nextProblem() {
  awaitingAdvance = false;
  current = generateProblem(round.ops, round.difficulty, round.lastKey);
  current.missed = false;
  current.fields = worksheetFields(current);
  current.fills = current.fields.map(() => "");
  current.sections = worksheetSections(current.fields);
  current.section = 0;
  current.active = current.sections[0]?.[0] ?? 0;
  round.lastKey = current.key;
  round.asked += 1;
  els.input.value = "";
  els.feedback.textContent = "";
  els.feedback.className = "feedback";
  paintProblem(false);
  updateProgress();
}

function paintStars() {
  const row = els.starRow;
  if (!round) {
    row.hidden = true;
    row.replaceChildren();
    delete row.dataset.stars;
    delete row.dataset.compact;
    return;
  }
  row.hidden = false;
  const want = round.limit
    ? progressStars(round.correct, round.limit)
    : unlimitedStars(round.attempts);
  const compact = !round.limit && compactStarCount(want);
  const prev = Number(row.dataset.stars || 0);
  const wasCompact = row.dataset.compact === "1";

  if (compact) {
    if (!wasCompact || prev !== want) {
      row.replaceChildren();
      const wrap = document.createElement("span");
      wrap.className = want > prev || !wasCompact ? "star-compact is-in" : "star-compact";
      const num = document.createElement("span");
      num.className = "star-count";
      num.textContent = String(want);
      const icon = document.createElement("span");
      icon.className = "star";
      icon.textContent = "★";
      icon.setAttribute("aria-hidden", "true");
      wrap.append(num, document.createTextNode(" "), icon);
      row.append(wrap);
    }
  } else {
    if (wasCompact || want < prev) {
      row.replaceChildren();
    }
    for (let i = row.querySelectorAll(".star").length; i < want; i += 1) {
      const star = document.createElement("span");
      star.className = "star is-in";
      star.textContent = "★";
      star.setAttribute("aria-hidden", "true");
      row.append(star);
    }
  }

  row.dataset.stars = String(want);
  row.dataset.compact = compact ? "1" : "0";
  row.setAttribute(
    "aria-label",
    compact ? `${want} stars` : `Correct progress: ${want} star${want === 1 ? "" : "s"}`,
  );
}

function updateProgress() {
  if (!round) return;
  paintStars();
  if (isPracticePlay()) {
    paintPlayStat();
    return;
  }
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
    if (creditsAnswer(true, current.missed)) {
      round.correct += 1;
      round.streak += 1;
      round.bestStreak = Math.max(round.bestStreak, round.streak);
    }
    els.feedback.textContent = "Nice. That’s right.";
    els.feedback.className = "feedback is-good";
    paintProblem(true);
  } else {
    round.streak = 0;
    els.feedback.textContent = missMessage(current);
    els.feedback.className = "feedback is-bad";
    paintProblem(true);
  }
}

function recordAttempt(correct) {
  if (round.limit) return;
  if (correct) {
    round.attempts.push(!current.missed);
    return;
  }
  current.missed = true;
}

function afterAnswer(correct) {
  round.answered += 1;
  recordAttempt(correct);
  mark(correct);
  updateProgress();
  if (isPracticePlay()) paintPlayStat();

  const done = round.limit && round.answered >= round.limit;
  if (done) {
    window.setTimeout(finishRound, 700);
    return;
  }

  if (correct) {
    awaitingAdvance = true;
    window.setTimeout(() => {
      if (round && awaitingAdvance) nextProblem();
    }, 550);
  }
}

function sectionSlice() {
  const indexes = current.sections[current.section] ?? [];
  return {
    indexes,
    fields: indexes.map((index) => current.fields[index]),
    fills: indexes.map((index) => current.fills[index]),
  };
}

function submitAnswer(event) {
  event.preventDefault();
  if (!round || awaitingAdvance) return;
  const slice = sectionSlice();
  if (!fieldsReady(slice.fills)) return;
  const ok = fieldsMatch(slice.fills, slice.fields);
  if (!ok) {
    current.missed = true;
    els.feedback.textContent = "Not quite. Try this step again.";
    els.feedback.className = "feedback is-bad";
    return;
  }
  if (!isLastSection()) {
    current.section += 1;
    current.active = current.sections[current.section][0];
    els.feedback.textContent = "";
    els.feedback.className = "feedback";
    paintProblem(false);
    return;
  }
  afterAnswer(true);
}

function bestKey() {
  const learner = round?.learner ?? settings.learner;
  const mode = round?.mode ?? settings.mode;
  const difficulty = round?.difficulty ?? settings.difficulty;
  const ops = round?.ops ?? settings.ops;
  return `${learner}|${mode}|${difficulty}|${ops.slice().sort().join(",")}`;
}

function requestLeaveSession() {
  if (screen !== "play" || !round) return;
  setLeaveOpen(true);
}

function leavePractice() {
  setLeaveOpen(false);
  if (!round) {
    showScreen("setup");
    return;
  }
  finishRound();
}

function finishRound({ to = "results" } = {}) {
  if (!round) return;
  clearTimer();
  const elapsed = Date.now() - round.startedAt;
  const accuracy = round.answered ? Math.round((round.correct / round.answered) * 100) : 0;
  const celebrate = shouldCelebrate({
    answered: round.answered,
    correct: round.correct,
    difficulty: round.difficulty,
  });
  const store = loadStore();
  store.bests ??= {};
  const key = bestKey();
  const previous = store.bests[key] ?? 0;
  const improved = round.correct > previous;
  if (improved) store.bests[key] = round.correct;
  saveStore(store);

  const name = round.learner;
  els.headline.textContent = round.correct
    ? `${name} banked ${round.correct} correct answer${round.correct === 1 ? "" : "s"}.`
    : `${name} is warmed up. Try one more pass.`;
  els.statCorrect.textContent = formatCorrectCount(round.correct, round.answered);
  els.statCorrect.setAttribute("aria-label", `${round.correct} of ${round.answered} correct`);
  els.statAccuracy.textContent = `${accuracy}%`;
  els.statStreak.textContent = String(round.bestStreak);
  els.statTime.textContent = round.timed ? formatTime(round.durationMs) : formatTime(elapsed);
  els.statBest.textContent = improved
    ? "New personal best for this mix."
    : previous
      ? `Personal best for this mix: ${previous}.`
      : "This mix now has a saved best.";
  round = null;
  showScreen(to);
  if (to === "results" && celebrate) playCelebration();
}

function toggleOp(op) {
  if (settings.difficulty === "pictures" && op === "div") return;
  if (settings.ops.includes(op)) {
    settings.ops = settings.ops.filter((item) => item !== op);
  } else {
    settings.ops = [...settings.ops, op];
  }
  persistSettings();
  syncSetupUi();
}

function setActiveSlot(index) {
  if (!current || awaitingAdvance) return;
  if (!Number.isInteger(index) || index < 0 || index >= current.fills.length) return;
  if ((current.fields[index]?.step ?? 0) !== current.section) return;
  current.active = index;
  paintProblem(false);
}

function pressKey(key) {
  if (!current || awaitingAdvance) return;
  const slot = current.active ?? 0;
  const field = current.fields[slot];
  if (field?.unit === "cell") {
    if (key === "back") {
      if (current.fills[slot]) {
        current.fills[slot] = "";
      } else if (slot > 0 && (current.fields[slot - 1]?.step ?? 0) === current.section) {
        current.active = slot - 1;
        current.fills[current.active] = "";
      }
    } else if (key !== "-" && key !== "−") {
      current.fills[slot] = key.slice(-1);
      if (
        slot + 1 < current.fills.length &&
        (current.fields[slot + 1]?.step ?? 0) === current.section
      ) {
        current.active = slot + 1;
      }
    }
    els.input.value = current.fills[current.active] ?? "";
    paintProblem(false);
    return;
  }
  let value = current.fills[slot] ?? "";
  if (key === "back") {
    value = value.slice(0, -1);
  } else if (key === "-" || key === "−") {
    value = value.startsWith("-") ? value.slice(1) : `-${value}`;
  } else {
    value += key;
  }
  current.fills[slot] = value;
  els.input.value = value;
  paintProblem(false);
}

els.learnerBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  setLearnerOpen(els.learnerPanel.hidden);
});
els.learnerPanel.addEventListener("click", (event) => {
  event.stopPropagation();
  const button = event.target.closest("[data-learner]");
  if (!button) return;
  selectLearner(button.dataset.learner);
  setLearnerOpen(false);
});
document.addEventListener("click", (event) => {
  if (!els.learnerMenu.contains(event.target)) setLearnerOpen(false);
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
  persistSettings();
  syncSetupUi();
});

els.modeRow.addEventListener("click", (event) => {
  const button = event.target.closest("[data-mode]");
  if (!button) return;
  settings.mode = button.dataset.mode;
  persistSettings();
  syncSetupUi();
});

els.themeRow.addEventListener("click", (event) => {
  const button = event.target.closest("[data-theme]");
  if (!button) return;
  settings.theme = normalizeTheme(button.dataset.theme);
  persistSettings();
  syncSetupUi();
});

els.settingsBtn.addEventListener("click", () => {
  setSettingsOpen(true);
});
els.sessionBack.addEventListener("click", () => {
  if (screen === "setup" || screen === "results") return;
  if (screen === "settings") {
    setSettingsOpen(false);
    return;
  }
  if (isLeaveOpen()) {
    setLeaveOpen(false);
    return;
  }
  requestLeaveSession();
});
els.leaveStay.addEventListener("click", () => setLeaveOpen(false));
els.leaveConfirm.addEventListener("click", leavePractice);
els.leaveBackdrop.addEventListener("click", () => setLeaveOpen(false));
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  setLearnerOpen(false);
  if (!els.leaveDialog.hidden) {
    setLeaveOpen(false);
    return;
  }
  if (screen === "play" && round) {
    requestLeaveSession();
    return;
  }
  setSettingsOpen(false);
});

els.startBtn.addEventListener("click", startRound);
els.input.addEventListener("pointerdown", (event) => {
  event.preventDefault();
});
els.input.addEventListener("focus", () => {
  els.input.blur();
});
els.input.addEventListener("beforeinput", (event) => {
  event.preventDefault();
});
els.form.addEventListener("submit", submitAnswer);
els.againBtn.addEventListener("click", startRound);
els.setupBtn.addEventListener("click", () => {
  stopCelebration();
  setSettingsOpen(true);
});
els.problem.addEventListener("click", (event) => {
  const slot = event.target.closest("[data-slot]");
  if (!slot) return;
  setActiveSlot(Number(slot.dataset.slot));
});
els.keypad.addEventListener("click", (event) => {
  const button = event.target.closest("[data-key]");
  if (!button) return;
  pressKey(button.dataset.key);
});

restoreSettings();
const launchScreen = location.hash === "#settings" ? "settings" : "setup";
showScreen(launchScreen, { replace: true });
window.addEventListener("popstate", handleHistoryPop);
window.addEventListener("pageshow", () => {
  if (screen === "setup") lockHomeHistory();
});
if (window.navigation?.addEventListener) {
  window.navigation.addEventListener("navigate", swallowHomeNavigate, { capture: true });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {
    // Installability still works after a later visit if registration fails once.
  });
}
