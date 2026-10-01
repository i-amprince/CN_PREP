# CN Prep: Computer Networks, one packet at a time

**Live site:** https://i-amprince.github.io/CN_PREP/

## Why I built this

While preparing for campus placements, Computer Networks was the subject I kept struggling with.
My notes were spread across notebooks, PDFs, YouTube comments and random blog posts. Every time
an interviewer-style question came up ("What happens when you type google.com?", "Why is TCP's
handshake 3-way and not 2-way?", "Switch vs router?") I had to dig through five different places,
and half the diagrams were ASCII art that made sense only when I drew them.

The bigger problem: reading about CRC, subnetting or TCP congestion control never stuck.
I'd understand it, then forget the details a week later.

So I collected everything I could find (my own notes, textbook points, interview questions,
GATE-style formulas) and turned it into one website where I can **read, play with and test
myself on** every topic in one place.

## What's inside

- **21 chapters** covering the whole subject: basics, OSI/TCP-IP, Data Link, medium access,
  error detection, IP/ARP/NAT, subnetting, routing, TCP/UDP, handshake, sliding window,
  congestion control, termination, DNS/DHCP, HTTP, TLS, security, Wi-Fi, VPN, and the full
  "type google.com" journey.
- **51 interactive diagrams** instead of static pictures, for example:
  - a switch that learns MAC addresses as you send frames
  - CRC long division and Hamming code, every XOR step shown
  - subnet calculator, VLSM and IP fragmentation
  - TCP Tahoe vs Reno congestion window chart
  - step-by-step sequence diagrams for the handshake, DNS, DHCP, ARP and TLS
  - the whole google.com request animated hop by hop, with headers at each hop
- **Quick sheet** for every chapter, for last-minute revision.
- **212 flashcards and 146 quiz questions**, plus a Practice page that mixes them.
- **Cheat sheet** with all port numbers, formulas, every "X vs Y" comparison and 60+ interview Q&As.
- Search across all notes, Study/Quick mode, light and dark themes, progress tracking,
  works offline and on phones.

Anything I added beyond my original notes is marked with a **+ Added** tag, so I know what to
double-check.

## How I use it

1. **First pass:** Study mode, read the chapter and play with the diagrams.
2. **Lock it in:** flashcards, then the chapter quiz.
3. **Night before:** Quick mode (opens every chapter on its one-page sheet) + the cheat sheet.
4. **Random revision:** the Practice page gives a fresh 15-question mixed quiz each time.

## Tech

React + Vite, plain JavaScript, no backend. Progress and quiz scores are saved in the browser's
localStorage. Deployed on GitHub Pages through GitHub Actions.

## Run it locally

Needs Node.js 18 or newer.

```bash
git clone https://github.com/i-amprince/CN_PREP.git
cd CN_PREP
npm install
npm run dev          # http://localhost:5173
```

Production build: `npm run build` (output in `dist/`), then `npm run preview`.

## Project structure

```
content/          chapter notes as HTML (the source I edit)
scripts/          converts notes to components, checks the maths, checks coverage of my notes
src/chapters/     generated chapter components
src/components/   layout, chapter page, flashcards, quiz, practice, search
src/widgets/      interactive diagrams
src/data/         chapter list, flashcards and quizzes
src/lib/          networking maths (CRC, Hamming, subnetting, cwnd…)
```

To edit a chapter, change its file in `content/` and run `npm run content`.
`npm run verify` checks the calculators against known textbook answers, and
`npm run crosscheck` makes sure every point from my original notes still appears on the site.

## Contributing

Found a mistake, or have an interview question that should be here? Open an issue or a PR.
If this helps you prepare too, a ⭐ would be great.
