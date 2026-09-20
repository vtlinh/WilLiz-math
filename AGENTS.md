# AGENTS

WilLiz Math is a static arithmetic practice site for GitHub Pages.

Before changing behavior or deploy setup, read `.agent/README.md` and the files it lists.

- Product: `.agent/product.md`
- Code map: `.agent/architecture.md`
- Rules: `.agent/rules/`
- Repeatable steps: `.agent/workflows/`

Preview: `python3 -m http.server 4173`

Checks:

```bash
node --experimental-default-type=module test-problems.mjs
node --experimental-default-type=module test-storage.mjs
node --experimental-default-type=module test-worksheet.mjs
node --experimental-default-type=module test-celebrate.mjs
node --experimental-default-type=module test-stars.mjs
```

After those pass, merge the commits into `main` and push. See `.agent/rules/git.md`.
