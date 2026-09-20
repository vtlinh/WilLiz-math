---
description: Merge the current branch to main after tests pass
---

# Ship to main

1. Run:

```bash
node --experimental-default-type=module test-problems.mjs
node --experimental-default-type=module test-storage.mjs
node --experimental-default-type=module test-worksheet.mjs
node --experimental-default-type=module test-celebrate.mjs
node --experimental-default-type=module test-stars.mjs
node --experimental-default-type=module test-scoring.mjs
```

2. If either command fails, stop and fix.
3. Fetch `origin/main`, merge the passing commits into `main`, and push `origin/main`.
4. GitHub Pages deploys from `main` via `.github/workflows/pages.yml`.
