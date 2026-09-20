export const SYMBOLS = { add: "+", sub: "−", mul: "×", div: "÷" };

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(list) {
  return list[randInt(0, list.length - 1)];
}

export function generateProblem(ops, difficulty, previousKey = "") {
  if (!ops.length) {
    throw new Error("At least one operation is required");
  }

  const chosen = pick(ops);
  let a;
  let b;
  let answer;

  const make = () => {
    if (chosen === "add") {
      const max = { easy: 10, medium: 50, hard: 99, challenge: 999 }[difficulty];
      const min = { easy: 1, medium: 6, hard: 12, challenge: 80 }[difficulty];
      a = randInt(min, max);
      b = randInt(min, max);
      answer = a + b;
    } else if (chosen === "sub") {
      const max = { easy: 10, medium: 50, hard: 99, challenge: 999 }[difficulty];
      a = randInt(difficulty === "easy" ? 2 : 8, max);
      b = randInt(1, a);
      answer = a - b;
    } else if (chosen === "mul") {
      const max = { easy: 5, medium: 12, hard: 20, challenge: 29 }[difficulty];
      const min = difficulty === "challenge" ? 8 : 1;
      a = randInt(min, max);
      b = randInt(min, max);
      answer = a * b;
    } else {
      const max = { easy: 5, medium: 12, hard: 15, challenge: 20 }[difficulty];
      b = randInt(2, max);
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
