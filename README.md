# Packet Notes: Computer Networks revision

A static React + Vite site for revising Computer Networks for placements and interviews:
21 chapters, 51 interactive diagrams, a quick sheet per chapter, 212 flashcards, 146 quiz
questions, a mixed Practice page, search, light/dark themes, and offline support.

## Run it locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev          # http://localhost:5173 (hot reload)
```

Production build:

```bash
npm run build        # outputs to dist/
npm run preview      # serves dist/ at http://localhost:4173
```

## Deploy for free

The build is plain static files and uses hash routing (`#/ch/osi`), so it works on any
static host without redirect rules.

| Host | Steps |
|---|---|
| **Netlify Drop** (fastest) | Run `npm run build`, open https://app.netlify.com/drop and drag the `dist` folder onto the page. |
| **Vercel** | Push the project to GitHub → vercel.com → *Add New Project* → import the repo. It detects Vite: build `npm run build`, output `dist`. |
| **GitHub Pages** | Push to a GitHub repo (branch `main`). In *Settings → Pages* set **Source: GitHub Actions**. The included `.github/workflows/deploy.yml` builds and publishes on every push. |
| **Cloudflare Pages** | Connect the repo; build command `npm run build`, output directory `dist`. |

`vite.config.js` uses `base: './'`, so the site also works from a sub-path such as
`username.github.io/repo-name/`.

## Editing content

- Chapter text lives in `content/*.html`, using the classes from the design system
  (`.co.key`, `.co.trap`, `.co.added`, `.tbl`, `.vs`, `.tree`, `.flow`…).
  `<div class="wg" data-wg="name"></div>` places an interactive widget.
- After editing, run `npm run content`. It regenerates `src/chapters/*.jsx` (text kept
  verbatim), the heading index and the full-text search index.
- Flashcards and quizzes are in `src/data/qa/*.js`.
- Widgets are in `src/widgets/`; their maths is in `src/lib/netmath.js`.

## Checks

```bash
npm run verify       # widget maths: CRC, Hamming, fragmentation, checksum, LPM, subnetting, cwnd…
npm run crosscheck   # every line of the original notes vs the site content
```

## Project layout

```
content/                 chapter HTML (source of truth for text)
scripts/                 convert-chapters, verify-widgets, crosscheck
src/chapters/            generated chapter components
src/components/          layout, chapter page, flashcards, quiz, practice, search bar
src/widgets/             interactive diagrams
src/data/                chapters/units metadata, flashcards & quizzes, search indexes
src/styles/design.css    design system from the handoff (tokens, components, themes)
public/sw.js             offline cache
packet-notes-handoff/    original handoff folder (reference only)
```

Progress (chapters done, best quiz scores), theme and Study/Quick mode are saved in your
browser's localStorage.
