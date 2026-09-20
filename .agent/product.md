# Product

WilLiz Math is a browser arithmetic studio for Will and Liz. It is a static site with no account system and no backend.

## Users

- **Will** and **Liz** are first-class learners.
- **Guest** is a third preset for anyone else.
- Each person’s last mix (operations, difficulty, mode, appearance) is remembered in `localStorage`, so switching learners does not ask them to set it up again. Dark mode is the default.
- Personal bests stay in that same browser store, keyed by person and mix.

## What a round is

The top action bar keeps one avatar on the left and WilLiz Math immediately to its right. Tapping the avatar opens Will, Liz, or Guest. A settings icon on the right opens the Settings page, with ← back at the top. Every mix change saves immediately; there is no Save or Done. Settings holds:

1. Operations: addition, subtraction, multiplication, division (at least one).
2. Difficulty: Easy, Pictures, Medium, Hard, Challenge. Pictures uses only easy, countable numbers and shows kid-friendly drawings of fruit, toys, and school supplies to count.
3. Appearance: Dark (default) or Light.
4. Mode: Practice (unlimited, retry allowed), Quiz of 10, Quiz of 20, or a 60-second sprint.

There is no Skip. Practice stays on a problem until the answer is correct, then advances. A miss on that problem scores 0 even after they get it right. Quiz and sprint allow one try, then reveal and advance.

During practice the action bar is only ← back and an X/Y score. Leaving an unfinished or unlimited session asks for confirmation.

Answers are entered only with the on-screen keypad, on each working line of the worksheet (partial products, long-division steps, or the column total). Pictures keep one blank. There is no separate final-only answer box, and the keypad must not open a system keyboard. Submit counts only when every line is filled and correct.

On a phone, home, settings, play, and results all fit on one screen. The page does not scroll.

Addition and subtraction are written as vertical column arithmetic. Multiplication is written as long multiplication. Division is written as long division with a divisor times table and bring-down working.

## Non-goals

- No login, database, or analytics.
- No build step, bundler, or framework unless the product later requires it.
- No server-rendered pages. GitHub Pages must keep serving plain files from the repo root.

## Success

- A child can start a round in one screen and get immediate right/wrong feedback.
- A perfect score (100% correct, at least one answer) on Pictures, Hard, or Challenge plays confetti and fireworks. Easy and Medium do not.
- A quiz earns a small star at the bottom of the play screen for each 20% of the round answered correctly, up to five.
- Unlimited practice and sprint award a star for each all-correct set of 10 problems, counted from the first problem. After 7 stars the tray switches to `X ★`.
- The same files work locally and at `https://vtlinh.github.io/WilLiz-math/` after Pages is enabled.
- Chrome can install the site as an app from the address bar or the browser menu.
