# Start here

1. Unzip this folder somewhere, e.g. `~/projects/packet-notes-handoff`.
2. Open a terminal in an **empty project folder** (e.g. `~/projects/packet-notes`) and run `claude`.
3. Paste the prompt below. Change the path in the first line to wherever you unzipped this folder.

You don't need to paste your notes. They're already in `source-notes/original-notes.txt`.

---

## Prompt to paste into Claude Code

```
The handoff folder is at ~/projects/packet-notes-handoff. Read HANDOFF.md there completely
first, then source-notes/original-notes.txt and the files in content-draft/.

Build the Computer Networks revision website described in HANDOFF.md, in this folder,
using React + Vite + TypeScript as a static site. Follow its build order (section 9).

Rules:
- The chapter HTML in content-draft/ is final content: convert it into components, keep the
  wording, tables, callouts and "+ Added" tags. Don't summarise or drop anything.
- Keep the design system from content-draft/00_design-tokens-and-css.html (colours, fonts,
  components, light + dark).
- Write the 4 TODO chapters (wireless, vpn, journey, cheatsheet) as specified.
- Build every widget in section 6 and verify the test values given there.
- Every point in original-notes.txt must end up on the site. Do the cross-check in step 7
  and tell me if anything is missing.
- Make a plan with a task list first, then work through it. Run `npm run build` at the end
  and fix any errors. Tell me how to run it locally and how to deploy it free.
```

---

## Want MERN (login + progress sync across devices)?

After the static site works, send Claude Code:

```
Now add the optional MERN phase from HANDOFF.md section 3: an Express + MongoDB backend with
signup/login (JWT in an HttpOnly cookie) that syncs chapter progress, quiz best scores and
bookmarks. Keep all notes content static in the frontend. Fall back to localStorage when
logged out. Add a README with setup steps (MongoDB Atlas free tier) and deployment.
```
