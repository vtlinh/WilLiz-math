export const SYMBOLS = { add: "+", sub: "−", mul: "×", div: "÷" };

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(list) {
  return list[randInt(0, list.length - 1)];
}

function digitsMin(count) {
  return count <= 1 ? 2 : 10 ** (count - 1);
}

function digitsMax(count) {
  return 10 ** count - 1;
}

function randDigits(minDigits, maxDigits) {
  const count = randInt(minDigits, maxDigits);
  return randInt(digitsMin(count), digitsMax(count));
}

function exactDividend(divisor, minDigits, maxDigits) {
  const minQ = Math.max(2, Math.ceil(digitsMin(minDigits) / divisor));
  const maxQ = Math.floor(digitsMax(maxDigits) / divisor);
  return randInt(minQ, maxQ);
}

export function numericDifficulty(difficulty) {
  return difficulty === "pictures" ? "easy" : difficulty;
}

export function playOps(ops, difficulty) {
  const list = Array.isArray(ops) ? ops : [];
  return difficulty === "pictures" ? list.filter((op) => op !== "div") : [...list];
}

export function operandsAllowed(op, a, b) {
  if (a < 2 || b < 2) return false;
  if (op === "div" && (b === 0 || b === 1)) return false;
  return true;
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
      const max = pictures ? 8 : { easy: 10, medium: 99, hard: 999 }[level];
      const min = pictures ? 2 : { easy: 2, medium: 12, hard: 80 }[level];
      a = randInt(min, max);
      b = randInt(min, max);
      answer = a + b;
    } else if (chosen === "sub") {
      const max = pictures ? 8 : { easy: 10, medium: 99, hard: 999 }[level];
      a = randInt(pictures || level === "easy" ? 4 : 8, max);
      b = randInt(2, a);
      answer = a - b;
    } else if (chosen === "mul") {
      if (pictures) {
        a = randInt(2, 4);
        b = randInt(2, 4);
      } else if (level === "medium") {
        a = randDigits(2, 3);
        b = randInt(3, 9);
      } else if (level === "hard") {
        a = randDigits(3, 5);
        b = randDigits(2, 3);
      } else {
        a = randInt(2, 5);
        b = randInt(2, 5);
      }
      if (b > a) [a, b] = [b, a];
      answer = a * b;
    } else if (pictures) {
      b = randInt(2, 4);
      answer = randInt(2, 4);
      a = b * answer;
    } else if (level === "medium") {
      b = randInt(3, 9);
      answer = exactDividend(b, 3, 5);
      a = b * answer;
    } else if (level === "hard") {
      b = randInt(10, 99);
      answer = exactDividend(b, 4, 7);
      a = b * answer;
    } else {
      b = randInt(2, 5);
      answer = randInt(2, 5);
      a = b * answer;
    }
  };

  for (let i = 0; i < 16; i += 1) {
    make();
    const key = `${a}${chosen}${b}`;
    if (operandsAllowed(chosen, a, b) && key !== previousKey) break;
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
