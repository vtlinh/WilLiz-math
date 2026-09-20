---
description: Arithmetic generation and scoring rules
activation: always_on
---

# Math problems

- Generate problems in `problems.js`. Keep `app.js` as UI and round state.
- `pictures` is a hardness setting that only generates easy, countable problems (add/sub up to 8, mul/div factors up to 4) and renders objects to count instead of the column/long worksheets.
- Addition is shown as vertical column addition: addends stacked, `+` on the left of the lower number, a rule, then the total. Do not show `a + b` as a single inline equation only.
- Subtraction is shown the same way, stacked with `−` on the left of the lower number. Do not show `a − b` as a single inline equation only.
- Multiplication is shown as long multiplication: stacked factors, a rule, partial products when the multiplier has more than one digit, then the total. Do not show `a × b` as a single inline equation only.
- Division is shown as long division: a 1–9 times table for the divisor on the left, and the bracket, quotient, subtract-and-bring-down working on the right. Do not show `a ÷ b` as a single inline equation only.
- Division must be exact. Subtraction must not produce a negative answer.
- `parseAnswer` accepts integers only, including a leading unicode minus (`−`).
- Practice: wrong answers stay on the same problem so the learner can retry. Quiz and sprint: one try, then reveal and advance.
- Quiz progress stars use `progressStars(correct, limit)`: one star animates in for each 20% of the quiz answered correctly, up to five.
- Unlimited practice and sprint use `unlimitedStars(attempts)`: one star for each all-correct set of 10 problems, counted from the first problem. A retried miss is not totally correct. After 7 stars, show `X ★` instead of more icons.
- Do not skip uniqueness forever; avoiding the immediate previous prompt is enough.
- After changing generation, run `node --experimental-default-type=module test-problems.mjs`.
