export const STORAGE_KEY = "williz-math-v1";

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

export function defaultMix() {
  return {
    ops: [...DEFAULT_MIX.ops],
    difficulty: DEFAULT_MIX.difficulty,
    mode: DEFAULT_MIX.mode,
    theme: DEFAULT_MIX.theme,
  };
}

function copyMix(mix) {
  const source = mix && typeof mix === "object" ? mix : {};
  return {
    ops: Array.isArray(source.ops) ? [...source.ops] : [...DEFAULT_MIX.ops],
    difficulty: source.difficulty || DEFAULT_MIX.difficulty,
    mode: normalizeMode(source.mode),
    theme: normalizeTheme(source.theme),
  };
}

export function emptyStore() {
  return {
    lastLearner: "Will",
    people: {},
    bests: {},
  };
}

export function normalizeStore(raw) {
  const store = emptyStore();
  if (!raw || typeof raw !== "object") return store;

  if (raw.bests && typeof raw.bests === "object") {
    store.bests = { ...raw.bests };
  }

  if (raw.settings && typeof raw.settings === "object") {
    const learner = raw.settings.learner || "Will";
    store.lastLearner = learner;
    store.people[learner] = copyMix(raw.settings);
  }

  if (raw.people && typeof raw.people === "object") {
    for (const [name, mix] of Object.entries(raw.people)) {
      store.people[name] = copyMix(mix);
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
  return store;
}
