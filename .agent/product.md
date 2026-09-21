# Product

WilLiz Math is a browser arithmetic studio for Will and Liz. It is a static site with no account system and no backend.

## Users

- **Will** and **Liz** are first-class learners.
- **Guest** is a third preset for anyone else.
- Each person’s last mix (operations, difficulty, mode, appearance) is remembered in `localStorage`, so switching learners does not ask them to set it up again. Dark mode is the default.
- Personal bests stay in that same browser store, keyed by person and mix.

## What a round is

On the home page the action bar keeps one avatar on the left, WilLiz Math immediately to its right, and a settings icon on the right. Tapping the avatar opens Will, Liz, or Guest. Settings replaces that chrome with ← and Settings in the same action bar. ← returns to the home page. The device or browser back button does the same from Settings or play. On the home page, back is swallowed so the app does not quit. Every mix change saves immediately; there is no Save or Done. The avatar and settings button do not appear during an exercise. Settings holds:

1. Operations: addition, subtraction, multiplication, division (at least one).
2. Difficulty: Pictures, Easy, Medium, Hard. Pictures uses only easy, countable numbers and shows kid-friendly drawings of fruit, toys, and school supplies to count. Pictures has no division.
3. Appearance: Dark (default) or Light.
4. Mode: Practice (unlimited, retry allowed), Quiz of 10, Quiz of 20, a 10-minute sprint, or a 30-minute sprint.

There is no Skip. Every mode stays on a problem until the answer is correct, then advances. A miss on that problem scores 0 even after they get it right.

There is no End round button. During an exercise the action bar has no avatar and no settings icon. ← always asks to confirm, then shows the results screen. Back while that dialog is open closes it and returns to the exercise. Practice also shows an X/Y score. The play screen does not repeat the learner/mode/difficulty line or a second correct count.

Answers are entered only with the on-screen keypad. Digit rows are **1–3**, then **4–6**, then **7–9**. The **Next** / **Submit** button sits below the keypad. Multi-step multiplication and division use **Next** to move to the next working section; the last section uses **Submit**. Multiplication is filled one digit at a time from right to left, including carries on the working rows. The final product is digits only. Each partial row is the full product of the top number times that bottom digit (`26 × 2` is `52`: write `2`, carry `1`, tens `5`). Add each carry into the next place so `24 × 8` is `192` and `9 × 3` is `27`. A tens partial is that full product shifted left — fill `9` for `9 × 1`, not `90`. Do not write placeholder zeros on the right. Long division fills one quotient digit at a time, then that step’s multiply, subtract, and bring-down boxes. Column totals are filled by line. Pictures keep one blank. There is no separate final-only answer box, and the keypad must not open a system keyboard.

The play equation is centered in the problem area. On a phone, home, settings, play, and results all fit on one screen. The page does not scroll.

Addition and subtraction are written as vertical column arithmetic. Multiplication is written as long multiplication with the larger factor on top and no extra `a × b =` line. Division is written as long division, with bring-down working and no times-table cheat. Medium division is a 3–5 digit dividend by a one-digit divisor 3–9. Hard division is a 4–7 digit dividend by a two-digit divisor. Medium multiplication is a 2–3 digit factor by a one-digit 3–9. Hard multiplication is a 3–5 digit factor by a 2–3 digit factor. Addition, subtraction, multiplication, and division never use 0 or 1 as an operand (`+ 1`, `− 0`, `× 1`, `÷ 1` are not generated). Worksheet misses do not rewrite the problem as `220 ÷ 20 = 11` in the feedback line.

## Non-goals

- No login, database, or analytics.
- No build step, bundler, or framework unless the product later requires it.
- No server-rendered pages. GitHub Pages must keep serving plain files from the repo root.

## Success

- A child can start a round in one screen and get immediate right/wrong feedback.
- A perfect score (100% correct, at least one answer) on Pictures, Medium, or Hard plays confetti and fireworks. Easy does not.
- A quiz earns a small star at the bottom of the play screen for each 20% of the round answered correctly, up to five.
- Unlimited practice and sprint award a star for each all-correct set of 10 problems, counted from the first problem. After 7 stars the tray switches to `X ★`.
- The same files work locally and at `https://vtlinh.github.io/WilLiz-math/` after Pages is enabled.
- Chrome can install the site as an app from the address bar or the browser menu.
