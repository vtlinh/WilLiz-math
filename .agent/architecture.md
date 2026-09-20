# Architecture

Static files at the repository root. The browser loads `index.html`, which pulls `styles.css` and `app.js` as an ES module.

```text
index.html          screens: setup, play, results
styles.css          layout and theme
app.js              round state, UI, localStorage
problems.js         generateProblem, parseAnswer
test-problems.mjs   Node checks for the generator
.github/workflows/pages.yml
```

## Runtime flow

1. `app.js` restores last settings from `localStorage` key `williz-math-v1`.
2. Setup writes `settings` (`learner`, `ops`, `difficulty`, `mode`).
3. Start creates a `round` and calls `generateProblem(ops, difficulty, lastKey)`.
4. Submit parses the input with `parseAnswer`. Practice retries on a miss; quiz and sprint advance after one try.
5. Finish writes `bests[learner|mode|difficulty|ops]` when the correct-count improves.

## Problem rules

- Subtraction answers are never negative.
- Division is exact integer division; the divisor is never zero.
- Challenge multiplication uses larger factors; Easy stays in small whole numbers.

Keep generation in `problems.js` so `test-problems.mjs` can import it without the DOM.

## Hosting

GitHub Actions on `main` uploads the repo root as a Pages artifact. Relative asset paths are required so the project site works under `/WilLiz-math/`.
