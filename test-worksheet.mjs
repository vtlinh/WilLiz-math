import { planMultiplication } from "./worksheet.js";

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

console.log("multiplication worksheet checks passed");
