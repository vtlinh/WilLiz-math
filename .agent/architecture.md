# Architecture

Static files at the repository root. The browser loads `index.html`, which pulls `styles.css` and `app.js` as an ES module.

```text
index.html          action bar, settings sheet, home / play / results
styles.css          layout and theme
app.js              round state and UI
storage.js          per-learner settings and bests
problems.js         generateProblem, parseAnswer
worksheet.js        long multiplication and long division layouts
celebrate.js        perfect-score confetti and fireworks
stars.js            quiz progress stars (one per 20% correct)
test-problems.mjs   Node checks for the generator
test-storage.mjs    Node checks for per-learner storage
test-worksheet.mjs  Node checks for worksheet layouts
test-celebrate.mjs  Node checks for when a perfect score celebrates
test-stars.mjs      Node checks for 20% progress stars
.github/workflows/pages.yml
```

## Runtime flow

1. `storage.js` reads `localStorage` key `williz-math-v1` and normalizes it to `{ lastLearner, people, bests }`.
2. Each person (Will, Liz, Guest) has their own mix: `ops`, `difficulty`, `mode`. Switching learners restores that mix immediately.
3. A legacy `settings` blob is migrated onto that learner once, then replaced by `people`.
4. Start creates a `round` and calls `generateProblem(ops, difficulty, lastKey)`.
5. Addition, subtraction, multiplication, and division are rendered by `worksheet.js`. Pictures difficulty uses the counting-object sheet instead.
6. Submit parses the input with `parseAnswer`. Practice retries on a miss; quiz and sprint advance after one try.
7. Quiz rounds paint a bottom star tray with `progressStars(correct, limit)` so a star animates in at each 20% correct.
8. Finish writes `bests[learner|mode|difficulty|ops]` when the correct-count improves.

## Problem rules

- Subtraction answers are never negative.
- Division is exact integer division; the divisor is never zero.
- Challenge multiplication uses larger factors; Easy stays in small whole numbers.

Keep generation in `problems.js` so `test-problems.mjs` can import it without the DOM.

## Hosting

GitHub Actions on `main` uploads the repo root as a Pages artifact. Relative asset paths are required so the project site works under `/WilLiz-math/`.
