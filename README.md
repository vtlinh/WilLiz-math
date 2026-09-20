# WilLiz Math

A static arithmetic practice studio for Will and Liz: addition, subtraction, multiplication, and division, with quiz and 60-second sprint modes.

The site is a plain HTML, CSS, and JavaScript app. It needs no build step and is meant to be hosted on [GitHub Pages](https://pages.github.com/).

## Live site

After Pages is enabled, the app is served at:

**https://vtlinh.github.io/WilLiz-math/**

## Use it

1. Tap the avatar on the left of the action bar to pick who is practicing.
2. Open the settings icon on the right to choose operations, difficulty, appearance, and mode. Dark mode is the default. Changes save as you tap; use ← to go back.
3. Start a practice, quiz, or 60-second sprint.
4. Fill every working line of the worksheet with the keypad (partial products, long-division steps, or the column total), then press **Submit**. There is no separate final-only box, and the keypad does not open a phone keyboard.

Each learner’s last mix and personal bests are stored in the browser, so Will and Liz keep their own operations, difficulty, appearance, and mode.

## Local preview

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

Problem generation can be checked with:

```bash
node --experimental-default-type=module test-problems.mjs
node --experimental-default-type=module test-storage.mjs
node --experimental-default-type=module test-worksheet.mjs
node --experimental-default-type=module test-pictures.mjs
node --experimental-default-type=module test-celebrate.mjs
node --experimental-default-type=module test-stars.mjs
node --experimental-default-type=module test-scoring.mjs
node --experimental-default-type=module test-pwa.mjs
```

## GitHub Pages

This repository deploys with GitHub Actions from `main` (see `.github/workflows/pages.yml`).

One-time setup in the GitHub repo:

1. Open **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Merge this app to `main`. The workflow publishes the site.

If you prefer branch publishing instead of Actions, set **Source** to **Deploy from a branch**, choose `main` and `/ (root)`, and save. The root `index.html` is already the homepage.

`.nojekyll` is included so GitHub Pages serves the files as a static site without Jekyll processing.

## Install as an app

On Chrome (phone or desktop), open the live site, then use **Install** in the address bar or the browser menu. That adds WilLiz Math as a standalone app.

## Agent context

Coding-agent instructions live in [`.agent/`](.agent/README.md). Start at [AGENTS.md](AGENTS.md).
