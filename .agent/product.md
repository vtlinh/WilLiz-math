# Product

WilLiz Math is a browser arithmetic studio for Will and Liz. It is a static site with no account system and no backend.

## Users

- **Will** and **Liz** are first-class learners.
- **Guest** is a third preset for anyone else.
- Settings and personal bests stay in that browser via `localStorage`.

## What a round is

A learner picks:

1. Operations: addition, subtraction, multiplication, division (at least one).
2. Difficulty: Easy, Medium, Hard, Challenge.
3. Mode: Practice (unlimited, retry allowed), Quiz of 10, Quiz of 20, or a 60-second sprint.

Practice allows Skip. Quiz and sprint hide Skip and allow one try per problem.

## Non-goals

- No login, database, or analytics.
- No build step, bundler, or framework unless the product later requires it.
- No server-rendered pages. GitHub Pages must keep serving plain files from the repo root.

## Success

- A child can start a round in one screen and get immediate right/wrong feedback.
- The same files work locally and at `https://vtlinh.github.io/WilLiz-math/` after Pages is enabled.
