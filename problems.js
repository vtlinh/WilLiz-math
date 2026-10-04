export const SYMBOLS = { add: "+", sub: "−", mul: "×", div: "÷", frac: "½" };
export const BLANK_LETTERS = ["A", "B"];

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(list) {
  return list[randInt(0, list.length - 1)];
}

function shuffled(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
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

export const PICTURELESS_OPS = ["div", "frac"];

export function numericDifficulty(difficulty) {
  return difficulty === "pictures" ? "easy" : difficulty;
}

export function tableTopic(ops) {
  return Array.isArray(ops) && ops.includes("table");
}

export function playOps(ops, difficulty) {
  const list = Array.isArray(ops) ? ops : [];
  if (tableTopic(list)) return ["table"];
  if (difficulty === "pictures") return list.filter((op) => !PICTURELESS_OPS.includes(op));
  return [...list];
}

export function roundDifficulty(ops, difficulty) {
  return tableTopic(ops) ? "table" : difficulty;
}

function repeatedDivisorDividend(dividend, divisor) {
  const digits = String(dividend);
  const mark = String(divisor);
  return mark.length === 1 && digits.length > 1 && [...digits].every((digit) => digit === mark);
}

export function operandsAllowed(op, a, b) {
  if (a < 2 || b < 2) return false;
  if (op === "sub" && a === b) return false;
  if (op === "div" && (a === b || repeatedDivisorDividend(a, b))) return false;
  return true;
}

function simplestFraction(maxDen) {
  for (;;) {
    const den = randInt(2, maxDen);
    const num = randInt(1, den - 1);
    if (gcd(num, den) === 1) return { num, den };
  }
}

function fractionScales(level) {
  if (level === "easy") return [1, randInt(2, 5)];
  if (level === "medium") return [1, ...shuffled([2, 3, 4, 5, 6]).slice(0, 2)];
  const start = randInt(2, 6);
  const down = randInt(1, start - 1);
  const other = pick([2, 3, 4, 5, 6, 7, 8, 9].filter((k) => k !== start && k !== down));
  return [start, ...shuffled([down, other])];
}

// Every term equals the first, so each blank is the other part times the same scale.
export function makeFractionProblem(difficulty) {
  const base = simplestFraction(difficulty === "hard" ? 12 : 9);
  const terms = fractionScales(difficulty).map((scale, index) => ({
    num: base.num * scale,
    den: base.den * scale,
    blank: index === 0 ? null : pick(["num", "den"]),
  }));
  let letter = 0;
  const text = terms.map((term) => {
    const name = term.blank ? BLANK_LETTERS[letter++] : "";
    const num = term.blank === "num" ? name : term.num;
    const den = term.blank === "den" ? name : term.den;
    return `${num}/${den}`;
  });
  const first = terms.find((term) => term.blank);
  return {
    op: "frac",
    difficulty,
    terms,
    a: terms[0].num,
    b: terms[0].den,
    answer: first[first.blank],
    prompt: text.join(" = "),
    key: `frac:${terms.map((term) => `${term.num}/${term.den}${term.blank ?? ""}`).join("=")}`,
  };
}

export function generateProblem(ops, difficulty, previousKey = "") {
  const pool = playOps(ops, difficulty);
  if (!pool.length) {
    throw new Error("At least one topic is required");
  }

  const chosen = pick(pool);
  const level = numericDifficulty(difficulty);
  if (chosen === "frac") {
    let problem = makeFractionProblem(level);
    for (let i = 0; i < 16 && problem.key === previousKey; i += 1) problem = makeFractionProblem(level);
    return problem;
  }
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
      b = randInt(2, a - 1);
      answer = a - b;
    } else if (chosen === "mul") {
      if (pictures || level === "easy") {
        a = randInt(2, 9);
        b = randInt(2, 9);
      } else if (level === "medium") {
        a = randDigits(2, 3);
        b = randInt(3, 9);
      } else if (level === "hard") {
        a = randDigits(3, 5);
        b = randDigits(2, 3);
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
      a = 15;
      b = 3;
      answer = 5;
      for (let n = 0; n < 30; n += 1) {
        b = randInt(2, 9);
        const minQ = Math.max(2, Math.ceil(10 / b));
        const maxQ = Math.floor(99 / b);
        answer = randInt(minQ, maxQ);
        a = b * answer;
        if (a >= 10 && a <= 99 && operandsAllowed("div", a, b)) break;
      }
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
