---
description: Arithmetic generation and scoring rules
activation: always_on
---

# Math problems

- Generate problems in `problems.js`. Keep `app.js` as UI and round state.
- Addition is shown as vertical column addition: addends stacked, `+` on the left of the lower number, a rule, then the total. Do not show `a + b` as a single inline equation only.
- Multiplication is shown as long multiplication: stacked factors, a rule, partial products when the multiplier has more than one digit, then the total. Do not show `a × b` as a single inline equation only.
- Division is shown as long division: a 1–9 times table for the divisor on the left, and the bracket, quotient, subtract-and-bring-down working on the right. Do not show `a ÷ b` as a single inline equation only.
- Division must be exact. Subtraction must not produce a negative answer.
- `parseAnswer` accepts integers only, including a leading unicode minus (`−`).
- Practice: wrong answers stay on the same problem so the learner can retry. Quiz and sprint: one try, then reveal and advance.
- Do not skip uniqueness forever; avoiding the immediate previous prompt is enough.
- After changing generation, run `node --experimental-default-type=module test-problems.mjs`.
