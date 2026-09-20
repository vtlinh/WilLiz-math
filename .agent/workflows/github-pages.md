---
description: Publish WilLiz Math on GitHub Pages
---

# GitHub Pages

1. Keep the homepage at root `index.html`.
2. Keep `.github/workflows/pages.yml` deploying from `main`.
3. After merge, the public URL is `https://vtlinh.github.io/WilLiz-math/`.
4. If the site 404s, check repo **Settings → Pages**:
   - Preferred: **Source** = **GitHub Actions**.
   - Fallback: **Deploy from a branch**, `main`, `/ (root)`.
5. The site is a Chrome-installable app (`manifest.webmanifest` + `sw.js`). Keep those files at the repo root with relative URLs.
6. Do not add a custom domain unless Linh provides one.
7. Do not rewrite the workflow to build from `docs/` unless the site files move there.
