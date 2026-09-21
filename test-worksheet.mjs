import { readFileSync } from "node:fs";
import {
  fieldsMatch,
  fieldsReady,
  multiplicationCarryStack,
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
  "124 × 26 writes each full partial: 744 and 248, then 3224 with sum carries",
);
assert(mulLines.some((field) => field.line === "partial-0"), "ones partial");
assert(mulLines.some((field) => field.line === "partial-1"), "tens partial");
assert(mulLines.some((field) => field.line === "total"), "product total");
assert(
  mulLines.some((field) => field.line === "total" && field.kind === "carry"),
  "final sum keeps carry boxes",
);
assert(
  mulLines.some((field) => field.line.startsWith("partial-") && field.kind === "carry"),
  "partials still keep carry boxes",
);
assert(
  multiplicationCarryStack(mulLines, 0).join(",") === "partial-0",
  "first carries sit above the top number",
);
assert(
  multiplicationCarryStack(mulLines).join(",") === "total,partial-0",
  "later carries stack above the first carry row",
);
assert(
  mulLines.filter((field) => field.line === "partial-1" && field.kind === "digit").every((field) => field.col < 3),
  "tens partial 248 starts at the tens, no shift zero",
);
assert(
  mulLines
    .filter((field) => field.line === "partial-0" && field.kind === "digit")
    .map((field) => field.answer)
    .join("") === "447",
  "124 × 6 is the full 744",
);

const fourteen = worksheetFields({ a: 14, b: 14, op: "mul", answer: 196, difficulty: "medium" });
assert(
  fourteen.map((field) => field.answer).join(",") === "6,1,5,4,1,6,9,1",
  "14 × 14 ones is 56, then 14 shifted, then 196",
);

const eleven = worksheetFields({ a: 11, b: 29, op: "mul", answer: 319, difficulty: "hard" });
assert(eleven.map((field) => field.answer).join(",") === "9,9,2,2,9,1,1,3", "11 × 29 is 99, then 22 shifted, then 319 with a sum carry");
assert(
  eleven.filter((field) => field.line === "partial-1").map((field) => field.answer).join(",") === "2,2",
  "tens of 11 × 29 is 22 shifted left, not 220",
);

const nineByThirteen = worksheetFields({ a: 9, b: 13, op: "mul", answer: 117, difficulty: "hard" });
assert(
  nineByThirteen.map((field) => `${field.kind}:${field.answer}`).join(",") ===
    "digit:7,digit:2,digit:9,digit:7,digit:1,carry:1,digit:1",
  "9 × 13 is the full 27, then 9 shifted, then 117 with a sum carry",
);
const onesPartial = nineByThirteen.filter((field) => field.line === "partial-0");
assert(
  onesPartial.map((field) => `${field.kind}:${field.answer}`).join(",") === "digit:7,digit:2",
  "9 × 3 is the full 27",
);
assert(onesPartial.find((field) => field.kind === "digit" && field.answer === 7)?.col === 2, "7 sits in the ones");
assert(onesPartial.find((field) => field.kind === "digit" && field.answer === 2)?.col === 1, "2 sits in the tens");
assert(
  nineByThirteen.filter((field) => field.line === "partial-1").map((field) => field.answer).join(",") === "9",
  "9 × 1 on the tens row is only 9, not 90",
);
assert(
  nineByThirteen.filter((field) => field.line === "partial-1").every((field) => field.col === 1),
  "the 9 sits in the tens column",
);

const twentySix = worksheetFields({ a: 26, b: 12, op: "mul", answer: 312, difficulty: "medium" });
assert(
  twentySix.map((field) => `${field.kind}:${field.answer}`).join(",") ===
    "digit:2,carry:1,digit:5,digit:6,digit:2,digit:2,digit:1,carry:1,digit:3",
  "26 × 12 ones is the full 52, then 26 shifted, then 312 with a sum carry",
);
const twentySixOnes = twentySix.filter((field) => field.line === "partial-0");
assert(
  twentySixOnes.map((field) => `${field.kind}:${field.answer}`).join(",") === "digit:2,carry:1,digit:5",
  "26 × 2 writes 52, adding the carry into the tens",
);
assert(twentySixOnes.find((field) => field.kind === "digit" && field.col === 2)?.answer === 2, "ones of 52");
assert(twentySixOnes.find((field) => field.kind === "carry")?.answer === 1, "tens of 12 stay a carry");
assert(twentySixOnes.find((field) => field.kind === "digit" && field.col === 1)?.answer === 5, "20 × 2 plus carry 1 is 5");

const seventeen = worksheetFields({ a: 17, b: 9, op: "mul", answer: 153, difficulty: "medium" });
assert(
  seventeen.map((field) => `${field.kind}:${field.answer}`).join(",") === "digit:3,carry:6,digit:5,digit:1",
  "17 × 9 final product adds the 6 carry: 153",
);

const twentyFour = worksheetFields({ a: 24, b: 8, op: "mul", answer: 192, difficulty: "hard" });
assert(
  twentyFour.map((field) => `${field.kind}:${field.answer}`).join(",") === "digit:2,carry:3,digit:9,digit:1",
  "24 × 8 is 192, not 162: ones 2, carry 3, tens 9, hundreds 1",
);
assert(
  twentyFour.filter((field) => field.kind === "digit").map((field) => field.answer).join("") === "291",
  "24 × 8 result digits are 2, 9, 1",
);

const seventeenByTwentyNine = worksheetFields({ a: 17, b: 29, op: "mul", answer: 493, difficulty: "hard" });
const seventeenOnes = seventeenByTwentyNine.filter((field) => field.line === "partial-0");
assert(
  seventeenOnes.map((field) => `${field.kind}:${field.answer}`).join(",") === "digit:3,carry:6,digit:5,digit:1",
  "17 × 29 ones is the full 153",
);
assert(seventeenOnes.find((field) => field.kind === "digit" && field.col === 2)?.answer === 3, "ones of 153");
assert(seventeenOnes.find((field) => field.kind === "carry")?.answer === 6, "tens of 63 stay a carry");
assert(seventeenOnes.find((field) => field.kind === "digit" && field.col === 1)?.answer === 5, "10 × 9 plus carry 6 is 5");
assert(seventeenOnes.find((field) => field.kind === "digit" && field.answer === 1)?.col === 0, "hundreds of 153");

const challengeLong = worksheetFields({ a: 324, b: 187, op: "mul", answer: 60588, difficulty: "hard" });
const challengeOnes = challengeLong.filter((field) => field.line === "partial-0");
assert(
  challengeOnes
    .filter((field) => field.kind === "digit")
    .sort((left, right) => left.col - right.col)
    .map((field) => field.answer)
    .join("") === "2268",
  "324 × 7 is the full 2268",
);
assert(
  challengeLong
    .filter((field) => field.line === "partial-1" && field.kind === "digit")
    .every((field) => field.col < 4),
  "324 × 8 is 2592 shifted left, no trailing zero",
);
assert(
  challengeLong.some((field) => field.line === "total" && field.kind === "carry"),
  "324 × 187 summation has carries",
);
assert(
  multiplicationCarryStack(challengeLong, 0).join(",") === "partial-0",
  "324 × 7 carries sit above the top number",
);
assert(
  multiplicationCarryStack(challengeLong, 1).join(",") === "partial-1,partial-0",
  "324 × 8 carries stack above the first carry row",
);
assert(
  multiplicationCarryStack(challengeLong).join(",") === "total,partial-1,partial-0",
  "summation carries sit above the earlier carry rows",
);

const shiftedCarry = worksheetFields({ a: 39, b: 26, op: "mul", answer: 1014, difficulty: "hard" });
const topThreeCol = planMultiplication(39, 26).top.indexOf("3");
assert(
  shiftedCarry.find((field) => field.line === "partial-1" && field.kind === "carry")?.col === topThreeCol,
  "39 × 2 carry stays above the 3 of 39, not shifted with the result",
);

const oneMul = worksheetFields({ a: 12, b: 4, op: "mul", answer: 48, difficulty: "medium" });
assert(oneMul.map((field) => field.answer).join(",") === "8,4", "12 × 4 ones then tens");
assert(oneMul.every((field) => field.unit === "cell"), "mul slots are single digits");

const pic = worksheetFields({ a: 2, b: 3, op: "mul", answer: 6, difficulty: "pictures" });
assert(pic.length === 1 && pic[0].answer === 6, "pictures stay one blank");

const addLine = worksheetFields({ a: 12, b: 42, op: "add", answer: 54, difficulty: "easy" });
assert(addLine.length === 1 && addLine[0].answer === 54, "easy addition is one flat answer");

const subLine = worksheetFields({ a: 42, b: 17, op: "sub", answer: 25, difficulty: "easy" });
assert(subLine.length === 1 && subLine[0].answer === 25, "easy subtraction is one flat answer");

const easyMulBlank = worksheetFields({ a: 5, b: 3, op: "mul", answer: 15, difficulty: "easy" });
assert(easyMulBlank.length === 1 && easyMulBlank[0].answer === 15, "easy multiplication is one flat answer");

const addCarryFields = worksheetFields({ a: 25, b: 17, op: "add", answer: 42, difficulty: "medium" });
assert(
  addCarryFields.map((field) => `${field.kind}:${field.answer}`).join(",") === "digit:2,carry:1,digit:4",
  "25 + 17 writes the ones, then the carry, then the tens",
);
assert(
  addCarryFields.filter((field) => field.kind === "digit").map((field) => field.col).join(",") === "1,0",
  "addition digits go from right to left",
);

const addPlain = worksheetFields({ a: 12, b: 42, op: "add", answer: 54, difficulty: "medium" });
assert(
  addPlain.map((field) => `${field.kind}:${field.answer}`).join(",") === "digit:4,digit:5",
  "12 + 42 has no carry and still fills ones then tens",
);

const addWideFields = worksheetFields({ a: 99, b: 3, op: "add", answer: 102, difficulty: "hard" });
assert(
  addWideFields.map((field) => `${field.kind}:${field.answer}`).join(",") === "digit:2,carry:1,digit:0,carry:1,digit:1",
  "99 + 3 carries into the tens and the hundreds",
);

const subBorrowFields = worksheetFields({ a: 42, b: 17, op: "sub", answer: 25, difficulty: "medium" });
assert(
  subBorrowFields.map((field) => `${field.kind}:${field.answer}`).join(",") === "carry:1,digit:5,digit:2",
  "42 − 17 marks the borrow, then the ones, then the tens",
);
assert(
  subBorrowFields.filter((field) => field.kind === "digit").map((field) => field.col).join(",") === "1,0",
  "subtraction digits go from right to left",
);

const subPlain = worksheetFields({ a: 42, b: 12, op: "sub", answer: 30, difficulty: "hard" });
assert(subPlain.map((field) => `${field.kind}:${field.answer}`).join(",") === "digit:0,digit:3", "42 − 12 fills ones then tens");

const wideBorrow = worksheetFields({ a: 200, b: 17, op: "sub", answer: 183, difficulty: "hard" });
assert(
  wideBorrow.map((field) => `${field.kind}:${field.answer}:${field.col}`).join(",") === "carry:1:2,digit:3:2,carry:1:1,digit:8:1,digit:1:0",
  "200 − 17 borrows from right to left",
);

const divLines = worksheetFields({ a: 13032, b: 24, op: "div", answer: 543, difficulty: "hard" });
assert(
  divLines.map((field) => `${field.kind}:${field.answer}`).join(",") ===
    "digit:5,product:1,product:2,product:0,remain:1,remain:0,bring:3,digit:4,product:9,product:6,remain:7,bring:2,digit:3,product:7,product:2,remain:0",
  "each quotient, multiply, subtract, and bring-down digit",
);
assert(divLines.every((field) => field.unit === "cell"), "div slots are single digits");
assert(divLines.some((field) => field.kind === "bring"), "bring-down is its own box");

const shortDiv = worksheetFields({ a: 20, b: 5, op: "div", answer: 4, difficulty: "medium" });
assert(shortDiv.map((field) => field.answer).join(",") === "4,2,0,0", "20 ÷ 5 fills quotient, product, remainder");

const easyDiv = worksheetFields({ a: 15, b: 3, op: "div", answer: 5, difficulty: "easy" });
assert(easyDiv.length === 1 && easyDiv[0].answer === 5, "easy division is one flat answer");

const twoTwentyFields = worksheetFields({ a: 220, b: 20, op: "div", answer: 11, difficulty: "hard" });
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
assert(worksheetSections(addLine).length === 1, "easy addition is one section");
assert(worksheetSections(addCarryFields).length === 1, "vertical addition stays one right-to-left section");
assert(worksheetSections(subBorrowFields).length === 1, "vertical subtraction stays one right-to-left section");

const fourteenFills = fourteen.map((field) => String(field.answer));
assert(fieldsReady(fourteenFills), "all mul cells filled");
assert(!fieldsReady(["6", "1", "", "5", "1", "6", "9", "1"]), "blank mul cell is not ready");
assert(fieldsMatch(fourteenFills, fourteen), "matching every mul digit and carry");
assert(!fieldsMatch(["6", "1", "5", "4", "1", "6", "9", "7"], fourteen), "final only is not enough");
const divFills = divLines.map((field) => String(field.answer));
assert(fieldsReady(divFills), "all div cells filled");
assert(!fieldsReady(divFills.map((value, index) => (index === 0 ? "" : value))), "blank quotient is not ready");
assert(fieldsMatch(divFills, divLines), "matching every div digit");
const wrongQuotient = [...divFills];
wrongQuotient[0] = "9";
assert(!fieldsMatch(wrongQuotient, divLines), "quotient only is not enough");

const hardMulSheet = worksheetFields({ a: 256, b: 7, op: "mul", answer: 1792, difficulty: "medium" });
assert(hardMulSheet.length > 1, "medium 3-digit × 1-digit has working slots");
const challengeMulSheet = worksheetFields({ a: 12345, b: 67, op: "mul", answer: 827115, difficulty: "hard" });
assert(challengeMulSheet.length > 1, "hard 5-digit × 2-digit has working slots");
const bigDiv = worksheetFields({ a: 1000000, b: 16, op: "div", answer: 62500, difficulty: "hard" });
assert(
  bigDiv.filter((field) => field.line === "quotient").length === 5,
  "7-digit ÷ 2-digit keeps a long-division quotient",
);

const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
assert(css.includes('font-family: "Caveat", "Segoe Script", "Apple Chancery", cursive'), "carry digits are cursive");
assert(css.includes("calc(var(--sheet-digit) / 1.5625)"), "carry digits are two sizes smaller");

console.log("worksheet checks passed");
