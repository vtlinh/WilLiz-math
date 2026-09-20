import {
  fieldsMatch,
  fieldsReady,
  planAddition,
  planDivision,
  planMultiplication,
  planSubtraction,
  worksheetFields,
} from "./worksheet.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const classic = planMultiplication(124, 26);
assert(classic.total === 3224, "124 × 26");
assert(classic.partials.map((row) => row.value).join(",") === "744,2480", "partials");
assert(classic.mulCarries.join(",") === ",1,2,", "carries above 124 for ×6");
assert(classic.top.join("") === "124", "top digits");
assert(classic.mul.join("") === "26", "multiplier digits");

const single = planMultiplication(12, 4);
assert(single.total === 48, "12 × 4");
assert(single.partials.length === 1, "one partial");
assert(single.partials[0].value === 48, "single partial is the product");

const square = planMultiplication(99, 99);
assert(square.total === 9801, "99 × 99");
assert(square.partials.map((row) => row.value).join(",") === "891,8910", "99 partials");

const easy = planMultiplication(4, 5);
assert(easy.total === 20, "4 × 5");
assert(easy.cols >= 2, "enough columns for 20");

const long = planDivision(13032, 24);
assert(long.quotient === 543, "13032 ÷ 24");
assert(long.steps.map((step) => step.q).join("") === "543", "quotient steps");
assert(long.steps[0].product === 120, "first subtract 120");
assert(long.steps[1].product === 96, "then 96");
assert(long.steps[2].product === 72, "then 72");
assert(long.steps.at(-1).remainder === 0, "exact remainder");
assert(!("table" in long), "no times-table cheat");
assert(long.quotientSlots.join("") === "543", "slots skip leading empties");

const short = planDivision(20, 5);
assert(short.quotient === 4, "20 ÷ 5");
assert(short.steps.length === 1, "one division step");

const twelve = planDivision(144, 12);
assert(twelve.quotient === 12, "144 ÷ 12");
assert(twelve.steps.map((step) => step.q).join("") === "12", "12 steps");

const addEasy = planAddition(12, 42);
assert(addEasy.total === 54, "12 + 42");
assert(addEasy.top.join("") === "12", "add top");
assert(addEasy.bottom.join("") === "42", "add bottom");
assert(addEasy.carries.every((c) => !c), "no carry");

const addCarry = planAddition(25, 17);
assert(addCarry.total === 42, "25 + 17");
assert(addCarry.carries.join(",") === "1,", "carry into tens");

const addWide = planAddition(99, 3);
assert(addWide.total === 102, "99 + 3");
assert(addWide.cols === 3, "sum needs 3 columns");

const subEasy = planSubtraction(42, 12);
assert(subEasy.total === 30, "42 − 12");
assert(subEasy.top.join("") === "42", "sub top");
assert(subEasy.bottom.join("") === "12", "sub bottom");
assert(subEasy.carries.every((c) => !c), "no borrow");

const subBorrow = planSubtraction(42, 17);
assert(subBorrow.total === 25, "42 − 17");
assert(subBorrow.carries.join(",") === ",1", "borrow in ones");

const subWide = planSubtraction(100, 1);
assert(subWide.total === 99, "100 − 1");
assert(subWide.cols === 3, "keep three columns");

const mulLines = worksheetFields({ a: 124, b: 26, op: "mul", answer: 3224, difficulty: "hard" });
assert(
  mulLines.map((field) => `${field.kind}:${field.answer}`).join(",") ===
    "digit:4,carry:2,digit:4,carry:1,digit:7,digit:0,digit:8,digit:4,digit:2,digit:4,digit:2,carry:1,digit:2,carry:1,digit:3",
  "124 × 26 fills digits and carries RTL",
);
assert(mulLines.some((field) => field.line === "partial-0"), "ones partial");
assert(mulLines.some((field) => field.line === "partial-1"), "tens partial");
assert(mulLines.some((field) => field.line === "total"), "product total");

const fourteen = worksheetFields({ a: 14, b: 14, op: "mul", answer: 196, difficulty: "medium" });
assert(
  fourteen.map((field) => field.answer).join(",") === "6,1,5,0,4,1,6,9,1",
  "14 × 14 ones, carry, tens, both partials, and total",
);

const oneMul = worksheetFields({ a: 12, b: 4, op: "mul", answer: 48, difficulty: "easy" });
assert(oneMul.map((field) => field.answer).join(",") === "8,4", "12 × 4 ones then tens");
assert(oneMul.every((field) => field.unit === "cell"), "mul slots are single digits");

const pic = worksheetFields({ a: 2, b: 3, op: "mul", answer: 6, difficulty: "pictures" });
assert(pic.length === 1 && pic[0].answer === 6, "pictures stay one blank");

const addLine = worksheetFields({ a: 12, b: 42, op: "add", answer: 54, difficulty: "easy" });
assert(addLine.length === 1 && addLine[0].answer === 54, "addition total");

const subLine = worksheetFields({ a: 42, b: 17, op: "sub", answer: 25, difficulty: "easy" });
assert(subLine.length === 1 && subLine[0].answer === 25, "subtraction total");

const divLines = worksheetFields({ a: 13032, b: 24, op: "div", answer: 543, difficulty: "hard" });
assert(
  divLines.map((field) => `${field.kind}:${field.answer}`).join(",") ===
    "digit:5,product:1,product:2,product:0,remain:1,remain:0,bring:3,digit:4,product:9,product:6,remain:7,bring:2,digit:3,product:7,product:2,remain:0",
  "each quotient, multiply, subtract, and bring-down digit",
);
assert(divLines.every((field) => field.unit === "cell"), "div slots are single digits");
assert(divLines.some((field) => field.kind === "bring"), "bring-down is its own box");

const shortDiv = worksheetFields({ a: 20, b: 5, op: "div", answer: 4, difficulty: "easy" });
assert(shortDiv.map((field) => field.answer).join(",") === "4,2,0,0", "20 ÷ 5 fills quotient, product, remainder");

const fourteenFills = fourteen.map((field) => String(field.answer));
assert(fieldsReady(fourteenFills), "all mul cells filled");
assert(!fieldsReady(["6", "1", "", "0", "4", "1", "6", "9", "1"]), "blank mul cell is not ready");
assert(fieldsMatch(fourteenFills, fourteen), "matching every mul digit and carry");
assert(!fieldsMatch(["6", "1", "5", "0", "4", "1", "6", "9", "7"], fourteen), "final only is not enough");
const divFills = divLines.map((field) => String(field.answer));
assert(fieldsReady(divFills), "all div cells filled");
assert(!fieldsReady(divFills.map((value, index) => (index === 0 ? "" : value))), "blank quotient is not ready");
assert(fieldsMatch(divFills, divLines), "matching every div digit");
const wrongQuotient = [...divFills];
wrongQuotient[0] = "9";
assert(!fieldsMatch(wrongQuotient, divLines), "quotient only is not enough");

console.log("worksheet checks passed");
