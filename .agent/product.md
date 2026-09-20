# Product

WilLiz Math is a browser arithmetic studio for Will and Liz. It is a static site with no account system and no backend.

## Users

- **Will** and **Liz** are first-class learners.
- **Guest** is a third preset for anyone else.
- Each person’s last mix (operations, difficulty, mode) is remembered in `localStorage`, so switching learners does not ask them to set it up again.
- Personal bests stay in that same browser store, keyed by person and mix.

## What a round is

The top action bar keeps account picking on the left (Will, Liz, Guest) and a settings icon on the right. Settings holds:

1. Operations: addition, subtraction, multiplication, division (at least one).
2. Difficulty: Easy, Pictures, Medium, Hard, Challenge. Pictures uses only easy, countable numbers and shows objects to count.
3. Mode: Practice (unlimited, retry allowed), Quiz of 10, Quiz of 20, or a 60-second sprint.

There is no Skip. Practice allows a retry on the same problem. Quiz and sprint allow one try, then reveal and advance.

Addition and subtraction are written as vertical column arithmetic. Multiplication is written as long multiplication. Division is written as long division with a divisor times table and bring-down working.

## Non-goals

- No login, database, or analytics.
- No build step, bundler, or framework unless the product later requires it.
- No server-rendered pages. GitHub Pages must keep serving plain files from the repo root.

## Success

- A child can start a round in one screen and get immediate right/wrong feedback.
- The same files work locally and at `https://vtlinh.github.io/WilLiz-math/` after Pages is enabled.
