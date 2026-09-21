import { readFileSync } from "node:fs";
import { generateProblem, operandsAllowed, parseAnswer, playOps } from "./problems.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const ops = ["add", "sub", "mul", "div"];
const levels = ["pictures", "easy", "medium", "hard"];

for (const op of ops) {
  for (const difficulty of levels) {
    if (difficulty === "pictures" && op === "div") continue;
    for (let i = 0; i < 80; i += 1) {
      const problem = generateProblem([op], difficulty);
      assert(operandsAllowed(problem.op, problem.a, problem.b), "no 0 or 1 operands");
      assert(problem.a !== 0 && problem.a !== 1, "left operand is not 0 or 1");
      assert(problem.b !== 0 && problem.b !== 1, "right operand is not 0 or 1");
      if (op === "add") assert(problem.answer === problem.a + problem.b, "add");
      if (op === "sub") {
        assert(problem.answer === problem.a - problem.b, "sub");
        assert(problem.answer >= 0, "sub non-negative");
      }
      if (op === "mul") {
        assert(problem.answer === problem.a * problem.b, "mul");
        assert(problem.a >= problem.b, "larger factor on top");
        const topDigits = String(problem.a).length;
        const botDigits = String(problem.b).length;
        if (difficulty === "medium") {
          assert(topDigits >= 2 && topDigits <= 3, "medium mul is 2-3 digits on top");
          assert(botDigits === 1 && problem.b >= 3 && problem.b <= 9, "medium mul by 3-9");
        }
        if (difficulty === "hard") {
          assert(topDigits >= 3 && topDigits <= 5, "hard mul is 3-5 digits on top");
          assert(botDigits >= 2 && botDigits <= 3, "hard mul by 2-3 digits");
        }
      }
      if (op === "div") {
        assert(problem.b !== 0, "div by zero");
        assert(problem.a / problem.b === problem.answer, "div exact");
        assert(Number.isInteger(problem.answer), "div integer");
        const dividendDigits = String(problem.a).length;
        if (difficulty === "medium") {
          assert(dividendDigits >= 3 && dividendDigits <= 5, "medium div is 3-5 digit dividend");
          assert(problem.b >= 3 && problem.b <= 9, "medium div by 3-9");
        } else if (difficulty === "hard") {
          assert(dividendDigits >= 4 && dividendDigits <= 7, "hard div is 4-7 digit dividend");
          assert(problem.b >= 10 && problem.b <= 99, "hard two-digit divisor");
        } else {
          assert(problem.b >= 2 && problem.b <= 9, "one-digit divisor");
        }
      }
      assert(problem.prompt.includes(String(problem.a)), "prompt left");
      assert(problem.difficulty === difficulty, "keep difficulty");
      if (difficulty === "pictures") {
        assert(problem.op !== "div", "pictures never divide");
        if (op === "add" || op === "sub") {
          assert(problem.a <= 8 && problem.b <= 8, "picture add/sub stay small");
        } else {
          assert(problem.a <= 16 && problem.b <= 4, "picture mul stay countable");
        }
      }
    }
  }
}

assert(playOps(["add", "div"], "pictures").join(",") === "add", "drop division in pictures");
assert(playOps(["div"], "pictures").length === 0, "pictures cannot be division-only");
assert(playOps(["add", "div"], "easy").join(",") === "add,div", "other levels keep division");
for (let i = 0; i < 40; i += 1) {
  const problem = generateProblem(["add", "div"], "pictures");
  assert(problem.op === "add", "pictures mix skips division");
}
let threw = false;
try {
  generateProblem(["div"], "pictures");
} catch {
  threw = true;
}
assert(threw, "pictures + only division is invalid");

assert(parseAnswer("") === null, "empty");
assert(parseAnswer("12") === 12, "int");
assert(parseAnswer("−3") === -3, "unicode minus");
assert(parseAnswer("1.5") === null, "reject decimal");

const settings = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const picturesAt = settings.indexOf('data-difficulty="pictures"');
const easyAt = settings.indexOf('data-difficulty="easy"');
const mediumAt = settings.indexOf('data-difficulty="medium"');
const hardAt = settings.indexOf('data-difficulty="hard"');
assert(picturesAt !== -1 && picturesAt < easyAt, "pictures hardness comes before easy");
assert(easyAt < mediumAt && mediumAt < hardAt, "easy, medium, then hard");
assert(!settings.includes('data-difficulty="challenge"'), "challenge difficulty is gone");

console.log("problem generator checks passed");
