import { planAddition, planDivision, planMultiplication, planSubtraction } from "./worksheet.js";

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
assert(long.table[4].value === 120, "5 × 24 table");
assert(long.quotientSlots.join("") === "543", "slots skip leading empties");

const short = planDivision(20, 5);
assert(short.quotient === 4, "20 ÷ 5");
assert(short.steps.length === 1, "one division step");
assert(short.table[0].value === 5, "1 × 5");

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

console.log("worksheet checks passed");
