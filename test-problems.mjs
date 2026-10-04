import { readFileSync } from "node:fs";
import { gcd, generateProblem, makeFractionProblem, operandsAllowed, parseAnswer, playOps, roundDifficulty } from "./problems.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function settingsHtml() {
  return readFileSync(new URL("./index.html", import.meta.url), "utf8");
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
      if (op === "add") {
        assert(problem.answer === problem.a + problem.b, "add");
        assert(problem.a >= 2 && problem.b >= 2, "addition is not +0 or +1");
      }
      if (op === "sub") {
        assert(problem.answer === problem.a - problem.b, "sub");
        assert(problem.answer >= 0, "sub non-negative");
        assert(problem.a !== problem.b, "subtraction is not X−X");
        assert(problem.b >= 2, "subtraction is not X−0 or X−1");
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
        if (difficulty === "easy" || difficulty === "pictures") {
          assert(problem.a >= 2 && problem.a <= 9 && problem.b >= 2 && problem.b <= 9, "easy and picture mul are 2-9 × 2-9");
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
        } else if (difficulty === "easy") {
          assert(problem.a >= 10 && problem.a <= 99, "easy dividend is 10-99");
          assert(problem.b >= 2 && problem.b <= 9, "easy divisor is 2-9");
          assert(problem.a !== problem.b, "easy division is not X÷X");
          assert(
            ![...String(problem.a)].every((digit) => digit === String(problem.b)),
            "easy division skips a dividend made of the divisor digit",
          );
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
          assert(problem.a >= 2 && problem.a <= 9 && problem.b >= 2 && problem.b <= 9, "picture mul is 2-9 × 2-9");
        }
      }
    }
  }
}

assert(playOps(["table"], "hard").join(",") === "table", "× table topic plays the grid only");
assert(playOps(["table"], "pictures").join(",") === "table", "× table ignores the difficulty");
assert(playOps(["add", "table"], "easy").join(",") === "table", "× table stands alone");
assert(roundDifficulty(["table"], "medium") === "table", "× table rounds use the grid level");
assert(roundDifficulty(["mul"], "medium") === "medium", "other topics keep their difficulty");
assert(playOps(["add", "div"], "pictures").join(",") === "add", "drop division in pictures");
assert(playOps(["div"], "pictures").length === 0, "pictures cannot be division-only");
assert(operandsAllowed("div", 22, 2) === false, "22 ÷ 2 is an obvious divide");
assert(operandsAllowed("div", 99, 9) === false, "99 ÷ 9 is an obvious divide");
assert(operandsAllowed("div", 15, 15) === false, "X ÷ X is not allowed");
assert(operandsAllowed("div", 15, 3) === true, "15 ÷ 3 is allowed");
assert(operandsAllowed("sub", 9, 9) === false, "X − X is not allowed");
assert(operandsAllowed("sub", 9, 1) === false, "X − 1 is not allowed");
assert(operandsAllowed("sub", 9, 0) === false, "X − 0 is not allowed");
assert(operandsAllowed("add", 9, 1) === false, "+ 1 is not allowed");
assert(operandsAllowed("add", 9, 0) === false, "+ 0 is not allowed");
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

for (const difficulty of ["easy", "medium", "hard"]) {
  for (let i = 0; i < 200; i += 1) {
    const problem = generateProblem(["frac"], difficulty);
    const [first, ...rest] = problem.terms;
    const blanks = problem.terms.filter((term) => term.blank);
    assert(problem.op === "frac" && problem.difficulty === difficulty, "fraction problem keeps its topic and level");
    assert(!first.blank, "the first fraction is always shown");
    assert(first.num < first.den, "fractions are proper");
    for (const term of problem.terms) {
      assert(term.num * first.den === term.den * first.num, `${problem.prompt} terms are equivalent`);
      assert(Number.isInteger(term.num) && term.num >= 1, "numerators are whole and positive");
    }
    assert(new Set(problem.terms.map((term) => term.den)).size === problem.terms.length, "no fraction repeats");
    assert(rest.every((term) => term.blank === "num" || term.blank === "den"), "every later fraction has one blank");
    assert(problem.answer === blanks[0][blanks[0].blank], "answer is the first blank");
    if (difficulty === "easy") {
      assert(problem.terms.length === 2, "easy fractions have one blank");
      assert(gcd(first.num, first.den) === 1, "easy starts in lowest terms");
      assert(first.den <= 9, "easy denominators stay 2-9");
    } else {
      assert(problem.terms.length === 3, `${difficulty} fractions have two blanks`);
      assert(problem.prompt.includes("A") && problem.prompt.includes("B"), "blanks are lettered A and B");
    }
    if (difficulty === "medium") {
      assert(gcd(first.num, first.den) === 1 && first.den <= 9, "medium starts from a simple fraction");
    }
    if (difficulty === "hard") {
      assert(gcd(first.num, first.den) > 1, "hard starts from an unreduced fraction");
      assert(rest.some((term) => term.den < first.den), "hard asks for a scaled-down fraction");
    }
  }
}
assert(playOps(["add", "frac"], "pictures").join(",") === "add", "drop fractions in pictures");
const fracPrompt = makeFractionProblem("medium").prompt;
assert(/^\d+\/\d+ = (\d+|A)\/(\d+|A) = (\d+|B)\/(\d+|B)$/.test(fracPrompt), `prompt reads like 5/6 = 15/A = B/24 (${fracPrompt})`);
assert(settingsHtml().includes('data-op="frac"'), "fractions chip is in settings");
assert(settingsHtml().includes("<legend>Topics</legend>"), "the chooser is called Topics");

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
assert(!settings.includes('data-difficulty="table"'), "× table is not a difficulty");
const tableChipAt = settings.indexOf('data-op="table"');
const mulChipAt = settings.indexOf('data-op="mul"');
assert(settings.indexOf('data-op="sub"') < tableChipAt && tableChipAt < mulChipAt, "× table topic sits right before ×");

console.log("problem generator checks passed");
