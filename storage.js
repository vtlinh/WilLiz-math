export const STORAGE_KEY = "williz-math-v1";
export const STORE_VERSION = 2;

const DIFFICULTIES = ["pictures", "easy", "medium", "hard"];

export const DEFAULT_MIX = {
  ops: ["add", "sub"],
  difficulty: "easy",
  mode: "practice",
  theme: "dark",
};

export function normalizeTheme(theme) {
  return theme === "light" ? "light" : "dark";
}

export function normalizeMode(mode) {
  if (mode === "sprint") return "sprint10";
  if (mode === "quiz10" || mode === "quiz20" || mode === "sprint10" || mode === "sprint30" || mode === "practice") {
    return mode;
  }
  return DEFAULT_MIX.mode;
}

export function normalizeDifficulty(difficulty, { migrateOld = false } = {}) {
  if (migrateOld) {
    if (difficulty === "challenge") return "hard";
    if (difficulty === "hard") return "medium";
    if (difficulty === "medium") return "easy";
  } else if (difficulty === "challenge") {
    return "hard";
  }
  return DIFFICULTIES.includes(difficulty) ? difficulty : DEFAULT_MIX.difficulty;
}

export function defaultMix() {
  return {
    ops: [...DEFAULT_MIX.ops],
    difficulty: DEFAULT_MIX.difficulty,
    mode: DEFAULT_MIX.mode,
    theme: DEFAULT_MIX.theme,
  };
}

function copyMix(mix, { migrateOld = false } = {}) {
  const source = mix && typeof mix === "object" ? mix : {};
  return {
    ops: Array.isArray(source.ops) ? [...source.ops] : [...DEFAULT_MIX.ops],
    difficulty: normalizeDifficulty(source.difficulty, { migrateOld }),
    mode: normalizeMode(source.mode),
    theme: normalizeTheme(source.theme),
  };
}

function migrateBestKey(key, migrateOld) {
  const parts = String(key).split("|");
  if (parts.length < 3) return key;
  parts[2] = normalizeDifficulty(parts[2], { migrateOld });
  return parts.join("|");
}

function migrateBests(bests, migrateOld) {
  const next = {};
  for (const [key, value] of Object.entries(bests)) {
    const dest = migrateBestKey(key, migrateOld);
    const score = Number(value) || 0;
    next[dest] = Math.max(next[dest] ?? 0, score);
  }
  return next;
}

export function emptyStore() {
  return {
    lastLearner: "Will",
    people: {},
    bests: {},
    storeVersion: STORE_VERSION,
  };
}

export function normalizeStore(raw) {
  const store = emptyStore();
  if (!raw || typeof raw !== "object") return store;

  const migrateOld = (Number(raw.storeVersion) || 1) < 2;

  if (raw.bests && typeof raw.bests === "object") {
    store.bests = migrateBests(raw.bests, migrateOld);
  }

  if (raw.settings && typeof raw.settings === "object") {
    const learner = raw.settings.learner || "Will";
    store.lastLearner = learner;
    store.people[learner] = copyMix(raw.settings, { migrateOld });
  }

  if (raw.people && typeof raw.people === "object") {
    for (const [name, mix] of Object.entries(raw.people)) {
      store.people[name] = copyMix(mix, { migrateOld });
    }
  }

  if (raw.lastLearner) store.lastLearner = raw.lastLearner;
  return store;
}

export function personMix(store, learner) {
  return copyMix(store.people?.[learner]);
}

export function writePersonMix(store, learner, mix) {
  store.lastLearner = learner;
  store.people[learner] = copyMix(mix);
  store.storeVersion = STORE_VERSION;
  return store;
}
