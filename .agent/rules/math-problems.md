---
description: Arithmetic generation and scoring rules
activation: always_on
---

# Math problems

- Generate problems in `problems.js`. Keep `app.js` as UI and round state.
- Division must be exact. Subtraction must not produce a negative answer.
- `parseAnswer` accepts integers only, including a leading unicode minus (`−`).
- Practice: wrong answers stay on the same problem so the learner can retry. Quiz and sprint: one try, then reveal and advance.
- Do not skip uniqueness forever; avoiding the immediate previous prompt is enough.
- After changing generation, run `node --experimental-default-type=module test-problems.mjs`.
