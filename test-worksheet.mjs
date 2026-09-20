import {
  fieldsMatch,
  fieldsReady,
  planAddition,
  planDivision,
  planMultiplication,
  planSubtraction,
  displayDigit,
  worksheetFields,
  worksheetSections,
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

const twoTwenty = planDivision(220, 20);
assert(twoTwenty.digits.join(",") === "2,2,0", "220 keeps the ones zero");
assert(twoTwenty.digits.map(displayDigit).join("") === "220", "rendered dividend stays 220");
assert(twoTwenty.quotient === 11, "220 ÷ 20 is 11");
assert(twoTwenty.steps.map((step) => step.q).join("") === "11", "220 ÷ 20 steps");
assert(twoTwenty.steps.at(-1).remainder === 0, "220 ÷ 20 is exact, no leftover remainder");
assert(displayDigit(0) === "0", "zero digit is visible");
assert(displayDigit("0") === "0", "zero string is visible");
assert(displayDigit("") === "", "empty stays empty");

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
    "digit:4,carry:2,digit:4,carry:1,digit:7,digit:8,digit:4,digit:2,digit:4,digit:2,carry:1,digit:2,carry:1,digit:3",
  "124 × 26 fills digits and carries RTL",
);
assert(mulLines.some((field) => field.line === "partial-0"), "ones partial");
assert(mulLines.some((field) => field.line === "partial-1"), "tens partial");
assert(mulLines.some((field) => field.line === "total"), "product total");
assert(
  mulLines.filter((field) => field.line === "partial-1" && field.kind === "digit").every((field) => field.col < 3),
  "tens partial 248 starts at the tens, no shift zero",
);

const fourteen = worksheetFields({ a: 14, b: 14, op: "mul", answer: 196, difficulty: "medium" });
assert(
  fourteen.map((field) => field.answer).join(",") === "6,1,5,4,1,6,9,1",
  "14 × 14 ones, carry, tens, both partials, and total",
);

const eleven = worksheetFields({ a: 11, b: 29, op: "mul", answer: 319, difficulty: "challenge" });
assert(eleven.map((field) => field.answer).join(",") === "9,9,2,2,9,1,1,3", "11 × 29 is 99, then 22 shifted, then 319");
assert(
  eleven.filter((field) => field.line === "partial-1").map((field) => field.answer).join(",") === "2,2",
  "tens of 11 × 29 is 22 shifted left, not 220",
);

const nineByThirteen = worksheetFields({ a: 9, b: 13, op: "mul", answer: 117, difficulty: "easy" });
assert(
  nineByThirteen.map((field) => `${field.kind}:${field.answer}`).join(",") ===
    "digit:7,carry:2,digit:9,digit:7,digit:1,carry:1,digit:1",
  "9 × 13 is 7 with carry 2, then 9 shifted, then 117",
);
const onesPartial = nineByThirteen.filter((field) => field.line === "partial-0");
assert(
  onesPartial.map((field) => `${field.kind}:${field.answer}`).join(",") === "digit:7,carry:2",
  "9 × 3 is 7 in the ones and 2 as a carry, not 27",
);
assert(onesPartial.find((field) => field.kind === "digit")?.col === 2, "7 sits in the ones result field");
assert(onesPartial.find((field) => field.kind === "carry")?.col === 1, "2 sits above the tens field");
assert(
  !onesPartial.some((field) => field.kind === "digit" && field.answer === 2),
  "leftover 2 is not a second result digit",
);
assert(
  nineByThirteen.filter((field) => field.line === "partial-1").map((field) => field.answer).join(",") === "9",
  "9 × 1 on the tens row is only 9, not 90",
);
assert(
  nineByThirteen.filter((field) => field.line === "partial-1").every((field) => field.col === 1),
  "the 9 sits in the tens column",
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

const twoTwentyFields = worksheetFields({ a: 220, b: 20, op: "div", answer: 11, difficulty: "challenge" });
assert(
  twoTwentyFields.map((field) => field.answer).join(",") === "1,2,0,2,0,1,2,0,0",
  "220 ÷ 20 fills 11, then 20 / 2↓0, then 20 / 0",
);
assert(
  twoTwentyFields.filter((field) => field.line === "quotient").map((field) => field.answer).join("") === "11",
  "220 ÷ 20 quotient digits are 11",
);
assert(
  fieldsMatch(
    twoTwentyFields.map((field) => String(field.answer)),
    twoTwentyFields,
  ),
  "a filled 220 ÷ 20 worksheet is correct",
);

const divSteps = worksheetSections(divLines);
assert(divSteps.length === 3, "13032 ÷ 24 has three working steps");
assert(
  divSteps[0].map((index) => divLines[index].answer).join(",") === "5,1,2,0,1,0,3",
  "first div step is one quotient digit plus that working",
);
assert(divSteps[0].filter((index) => divLines[index].line === "quotient").length === 1, "one quotient digit per step");

const mulSteps = worksheetSections(fourteen);
assert(mulSteps.length === 3, "14 × 14 is ones, tens, then total");
assert(worksheetSections(oneMul).length === 1, "single-digit mul is one section");
assert(worksheetSections(addLine).length === 1, "addition is one section");

const fourteenFills = fourteen.map((field) => String(field.answer));
assert(fieldsReady(fourteenFills), "all mul cells filled");
assert(!fieldsReady(["6", "1", "", "4", "1", "6", "9", "1"]), "blank mul cell is not ready");
assert(fieldsMatch(fourteenFills, fourteen), "matching every mul digit and carry");
assert(!fieldsMatch(["6", "1", "5", "4", "1", "6", "9", "7"], fourteen), "final only is not enough");
const divFills = divLines.map((field) => String(field.answer));
assert(fieldsReady(divFills), "all div cells filled");
assert(!fieldsReady(divFills.map((value, index) => (index === 0 ? "" : value))), "blank quotient is not ready");
assert(fieldsMatch(divFills, divLines), "matching every div digit");
const wrongQuotient = [...divFills];
wrongQuotient[0] = "9";
assert(!fieldsMatch(wrongQuotient, divLines), "quotient only is not enough");

console.log("worksheet checks passed");
