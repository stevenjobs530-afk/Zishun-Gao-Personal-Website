# Zishun Gao Personal Website

A bilingual personal portfolio covering finance, economics, risk management,
data analysis, applied research, and responsible AI-assisted workflows.

**Live website:** <https://stevenjobs530-afk.github.io/Zishun-Gao-Personal-Website/>

## Prerequisites

- Node.js `>=22.13.0`

## Local development

```bash
npm install
npm run dev
npm run build
```

## Validation and static export

- `npm run lint`: run source checks
- `npm test`: build and run the rendered-route test suite
- `npm run build:github-pages`: create the repository-path static export
- `NEXT_PUBLIC_BASE_PATH= npm run build:static`: create a root-path static export suitable for a future CDN

The GitHub Pages deployment is built by the workflow in
`.github/workflows/deploy-pages.yml` and published from `dist/client`.

## Technology

Next.js, React, TypeScript, Sass, Motion, GSAP, vinext, and GitHub Actions.

## Access note

GitHub Pages is a best-effort public mirror. Availability and loading speed in
mainland China can vary with local network conditions. A separate CDN may be
added later without changing the portfolio's content.

## Rights

Copyright © Zishun Gao. All rights reserved. The repository is public for
portfolio review; no permission to reuse the code, writing, certificates,
images, or personal documents is granted.
