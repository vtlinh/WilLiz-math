import { generateProblem, parseAnswer } from "./problems.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const ops = ["add", "sub", "mul", "div"];
const levels = ["easy", "medium", "hard", "challenge"];

for (const op of ops) {
  for (const difficulty of levels) {
    for (let i = 0; i < 80; i += 1) {
      const problem = generateProblem([op], difficulty);
      if (op === "add") assert(problem.answer === problem.a + problem.b, "add");
      if (op === "sub") {
        assert(problem.answer === problem.a - problem.b, "sub");
        assert(problem.answer >= 0, "sub non-negative");
      }
      if (op === "mul") assert(problem.answer === problem.a * problem.b, "mul");
      if (op === "div") {
        assert(problem.b !== 0, "div by zero");
        assert(problem.a / problem.b === problem.answer, "div exact");
        assert(Number.isInteger(problem.answer), "div integer");
      }
      assert(problem.prompt.includes(String(problem.a)), "prompt left");
    }
  }
}

assert(parseAnswer("") === null, "empty");
assert(parseAnswer("12") === 12, "int");
assert(parseAnswer("−3") === -3, "unicode minus");
assert(parseAnswer("1.5") === null, "reject decimal");

console.log("problem generator checks passed");
