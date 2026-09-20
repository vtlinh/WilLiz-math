---
description: Merge passing work straight to main
activation: always_on
---

# Git

- After checks pass, merge the work into `main` and push `origin/main`. Do not leave a finished change sitting only on a feature branch.
- Required checks before that merge:

```bash
node --experimental-default-type=module test-problems.mjs
node --experimental-default-type=module test-storage.mjs
node --experimental-default-type=module test-worksheet.mjs
node --experimental-default-type=module test-celebrate.mjs
node --experimental-default-type=module test-stars.mjs
```

- If those pass and the change is UI-only, still merge. Full browser verification can follow when no more follow-ups are queued.
- If a check fails, fix it on the working branch and re-run. Do not push a failing `main`.
