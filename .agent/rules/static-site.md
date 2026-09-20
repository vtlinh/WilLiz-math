---
description: Keep WilLiz Math a static GitHub Pages site
activation: always_on
---

# Static site

- Ship HTML, CSS, and vanilla JS. Do not add a bundler, npm app, or server runtime unless Linh asks for one.
- Use relative URLs (`styles.css`, `./problems.js`). Never point assets at `/` as if the site were on a domain root.
- Leave `.nojekyll` in place.
- Keep Google Fonts optional; the layout must still work if the font request fails.
- Do not commit secrets. There is no API key in this project and none should be added for hosting.
