---
description: Arithmetic generation and scoring rules
activation: always_on
---

# Math problems

- Generate problems in `problems.js`. Keep `app.js` as UI and round state.
- `pictures` is a hardness setting that only generates easy, countable problems (add/sub up to 8, mul factors up to 4) and renders kid-friendly drawings of fruit, toys, and school supplies (pens, pencils, erasers, crayons) to count instead of the column/long worksheets. Pictures never includes division: `playOps` drops `div`, the ÷ chip is disabled, and `generateProblem` will not pick it.
- Addition is shown as vertical column addition: addends stacked, `+` on the left of the lower number, a rule, then the total. Do not show `a + b` as a single inline equation only.
- Subtraction is shown the same way, stacked with `−` on the left of the lower number. Do not show `a − b` as a single inline equation only.
- Multiplication is shown as long multiplication: stacked factors, a rule, partial products when the multiplier has more than one digit, then the total. Do not show `a × b` as a single inline equation only. Digits are filled one at a time from right to left: ones digit, then the tens carry, then the tens digit, and so on. Carry cells are fillable. A two-or-more-digit multiplier requires every partial product, every carry, and the total. Shifted partials skip the placeholder zeros: `11 × 2` is `22` moved one column left, not a fillable `220`. A one-digit multiplier fills the product digits and carries only.
- Division is shown as long division: the bracket, quotient, and subtract-and-bring-down working. Do not show a divisor times table, and do not show `a ÷ b` as a single inline equation only. Every required box is a single digit: each quotient digit, each multiply (divisor × quotient digit) digit, each subtract remainder digit, and each bring-down. The final quotient alone is not enough. Worksheet cells must show `0` (never treat it as empty), so `220 ÷ 20` stays `220`, not `22`. `220 ÷ 20` is `11`. Division stays exact; do not generate a remainder problem without a remainder field. A miss on a worksheet does not rewrite the problem as inline text (`Not quite. 220 ÷ 20 = 11`); reveal the filled sheet on a one-try miss, and in practice say try this step again.
- Addition and subtraction have one fillable line: the total. Pictures stay one blank. Addition and subtraction carries are shown only after reveal and are not filled.
- `worksheetFields(problem)` lists every slot the learner must fill. Multi-step multiplication and division are grouped by `worksheetSections`. The button is **Next** until the last section, then **Submit**. Next only advances when the current section is filled and correct. Division shows one quotient digit at a time, with that step’s multiply / subtract / bring-down. The keypad writes the active slot; tapping a slot selects it. Cell slots take one digit and then move to the next slot in the same section. The separate answer box stays hidden.
- Division must be exact. Subtraction must not produce a negative answer.
- `parseAnswer` accepts integers only, including a leading unicode minus (`−`).
- The play answer field is keypad-only: `readonly`, no system keyboard, and no typing into the field.
- Practice: stay on the problem until the answer is correct, then advance. A miss scores 0 for that problem even if they later get it right (`creditsAnswer`). Quiz and sprint: one try, then reveal and advance.
- Quiz progress stars use `progressStars(correct, limit)`: one star animates in for each 20% of the quiz answered correctly, up to five.
- Unlimited practice and sprint use `unlimitedStars(attempts)`: one star for each all-correct set of 10 problems, counted from the first problem. A retried miss is not totally correct. After 7 stars, show `X ★` instead of more icons.
- Do not skip uniqueness forever; avoiding the immediate previous prompt is enough.
- After changing generation, run `node --experimental-default-type=module test-problems.mjs`.
