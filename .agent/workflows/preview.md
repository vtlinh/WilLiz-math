---
description: Serve the site locally and check the problem generator
---

# Preview

1. From the repo root, run `python3 -m http.server 4173`.
2. Open `http://127.0.0.1:4173/` (or `http://localhost:4173/`).
3. Confirm setup, a practice answer, and results still work.
4. Run `node --experimental-default-type=module test-problems.mjs`, `node --experimental-default-type=module test-storage.mjs`, `node --experimental-default-type=module test-worksheet.mjs`, `node --experimental-default-type=module test-celebrate.mjs`, `node --experimental-default-type=module test-stars.mjs`, and `node --experimental-default-type=module test-scoring.mjs`.
5. Stop. Do not add a separate preview stack.
