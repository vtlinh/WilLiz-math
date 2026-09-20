# WilLiz Math

A static arithmetic practice studio for Will and Liz: addition, subtraction, multiplication, and division, with quiz and 60-second sprint modes.

The site is a plain HTML, CSS, and JavaScript app. It needs no build step and is meant to be hosted on [GitHub Pages](https://pages.github.com/).

## Live site

After Pages is enabled, the app is served at:

**https://vtlinh.github.io/WilLiz-math/**

## Use it

1. Pick who is practicing.
2. Toggle the operations and a difficulty.
3. Choose Practice, a 10- or 20-question quiz, or a 60-second sprint.
4. Type an answer or use the keypad, then press **Check**.

Personal bests for each learner and mix are stored in the browser.

## Local preview

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

Problem generation can be checked with:

```bash
node --experimental-default-type=module test-problems.mjs
```

## GitHub Pages

This repository deploys with GitHub Actions from `main` (see `.github/workflows/pages.yml`).

One-time setup in the GitHub repo:

1. Open **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Merge this app to `main`. The workflow publishes the site.

If you prefer branch publishing instead of Actions, set **Source** to **Deploy from a branch**, choose `main` and `/ (root)`, and save. The root `index.html` is already the homepage.

`.nojekyll` is included so GitHub Pages serves the files as a static site without Jekyll processing.

## Agent context

Coding-agent instructions live in [`.agent/`](.agent/README.md). Start at [AGENTS.md](AGENTS.md).
