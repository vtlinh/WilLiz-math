export const SYMBOLS = { add: "+", sub: "−", mul: "×", div: "÷" };

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(list) {
  return list[randInt(0, list.length - 1)];
}

export function numericDifficulty(difficulty) {
  return difficulty === "pictures" ? "easy" : difficulty;
}

export function playOps(ops, difficulty) {
  const list = Array.isArray(ops) ? ops : [];
  return difficulty === "pictures" ? list.filter((op) => op !== "div") : [...list];
}

export function generateProblem(ops, difficulty, previousKey = "") {
  const pool = playOps(ops, difficulty);
  if (!pool.length) {
    throw new Error("At least one operation is required");
  }

  const chosen = pick(pool);
  const level = numericDifficulty(difficulty);
  const pictures = difficulty === "pictures";
  let a;
  let b;
  let answer;

  const make = () => {
    if (chosen === "add") {
      const max = pictures ? 8 : { easy: 10, medium: 50, hard: 99, challenge: 999 }[level];
      const min = pictures ? 1 : { easy: 1, medium: 6, hard: 12, challenge: 80 }[level];
      a = randInt(min, max);
      b = randInt(min, max);
      answer = a + b;
    } else if (chosen === "sub") {
      const max = pictures ? 8 : { easy: 10, medium: 50, hard: 99, challenge: 999 }[level];
      a = randInt(pictures || level === "easy" ? 2 : 8, max);
      b = randInt(1, a);
      answer = a - b;
    } else if (chosen === "mul") {
      const max = pictures ? 4 : { easy: 5, medium: 12, hard: 20, challenge: 29 }[level];
      const min = pictures ? 1 : level === "challenge" ? 8 : 1;
      a = randInt(min, max);
      b = randInt(min, max);
      if (b > a) [a, b] = [b, a];
      answer = a * b;
    } else {
      const max = pictures ? 4 : { easy: 5, medium: 12, hard: 15, challenge: 20 }[level];
      b = randInt(2, Math.min(max, 9));
      answer = randInt(1, max);
      a = b * answer;
    }
  };

  for (let i = 0; i < 8; i += 1) {
    make();
    const key = `${a}${chosen}${b}`;
    if (key !== previousKey) break;
  }

  return {
    a,
    b,
    op: chosen,
    answer,
    difficulty,
    prompt: `${a} ${SYMBOLS[chosen]} ${b}`,
    key: `${a}${chosen}${b}`,
  };
}

export function parseAnswer(value) {
  const trimmed = String(value).trim();
  if (!trimmed || trimmed === "-" || trimmed === "−") return null;
  const normalized = Number(trimmed.replace("−", "-"));
  return Number.isInteger(normalized) ? normalized : null;
}
