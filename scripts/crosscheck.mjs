// Cross-check: is every point of the original notes findable on the site?
// For each line of original-notes.txt, find the site section (notes section, quick sheet,
// widget text or flashcard set) containing the most of its key terms. Lines whose best
// coverage is under the threshold are printed for manual review.
// Run: npm run crosscheck  [-- --all]
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const NOTES = join(root, 'packet-notes-handoff', 'packet-notes-handoff', 'source-notes', 'original-notes.txt');
const THRESHOLD = 0.7;

const STOP = new Set(('a an the and or but if of to in on at by for with from as is are was were be been being it its this that these those there here we you your our i me my they them their he she his her do does did done can could should would may might must will shall not no yes so than then too very also just only into onto about over under up down out more most less least such each every any all some other another same own both either neither one two three first second next last via per what which who whom whose when where why how let lets let\'s don\'t doesn\'t isn\'t aren\'t can\'t won\'t it\'s that\'s you\'re we\'ll we\'ve i\'m ll ve re s t d m important very common remember note notes example examples suppose think simply simple usually generally commonly typically basically conceptually mainly roughly approximately like now still even already well good better best placement placements interview interviews question questions concept concepts things thing way ways something someone keep need needs needed using use used uses get gets got make makes made see seen say said tell tells know knows known want wants').split(/\s+/));

const norm = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9'./+#:-]+/g, ' ');
// British → American spelling and light stemming, so "neighbour"/"neighbors" match "neighbor"
const US = (t) => t.replace(/our$/, 'or').replace(/ours$/, 'ors').replace(/is(e|ed|es|ing|ation)$/, 'iz$1').replace(/yse$/, 'yze');
const stem = (t) => (/^[a-z]+$/.test(t) && t.length > 4 ? t.replace(/(ing|ed|es|s)$/, '') : t);
const split = (t) => (t.includes('/') && !/\d/.test(t) ? t.split('/') : [t]);
const toks = (s) => [...new Set(norm(s).split(/\s+/).map((t) => t.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '')).flatMap(split).filter((t) => t && t.length > 1 && !STOP.has(t)).map((t) => stem(US(t))))];

// ---------- site corpus ----------
const sections = [];
// HTML → text with a space between every element (so table cells don't glue together)
const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&nbsp;': ' ', '&quot;': '"', '&#39;': "'" };
const textOf = (n) => n.toString().replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, (e) => ENT[e] || ' ').replace(/\s+/g, ' ');
for (const f of readdirSync(join(root, 'content')).filter((x) => x.endsWith('.html'))) {
  const doc = parse(readFileSync(join(root, 'content', f), 'utf8'));
  for (const art of doc.querySelectorAll('article.ch')) {
    const ch = art.getAttribute('data-ch');
    const notes = art.querySelector('.pane.notes');
    if (notes) {
      notes.querySelectorAll('section').forEach((s) => sections.push({ where: `${ch} › ${s.querySelector('h2')?.text.replace(/\s+/g, ' ').trim()}`, text: textOf(s) }));
      sections.push({ where: `${ch} › (whole chapter)`, text: textOf(notes) });
    }
    const q = art.querySelector('.pane.quick-sheet');
    if (q) sections.push({ where: `${ch} › quick sheet`, text: textOf(q) });
  }
}
for (const f of readdirSync(join(root, 'src', 'widgets'))) {
  const src = readFileSync(join(root, 'src', 'widgets', f), 'utf8');
  const strings = [...src.matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`|>([^<>{}]+)</g)].map((m) => m[1] || m[2] || m[3] || m[4] || '').join(' ');
  sections.push({ where: `widget ${f}`, text: strings });
}
for (const f of readdirSync(join(root, 'src', 'data', 'qa')).filter((x) => x !== 'index.js')) {
  sections.push({ where: `flashcards/quiz ${f}`, text: readFileSync(join(root, 'src', 'data', 'qa', f), 'utf8') });
}
const secToks = sections.map((s) => ({ ...s, set: new Set(toks(s.text)) }));

// ---------- notes lines ----------
const lines = readFileSync(NOTES, 'utf8').split(/\r?\n/);
const report = [];
let checked = 0;
lines.forEach((line, i) => {
  const t = toks(line);
  if (!t.length) return; // blank, arrows, ASCII art only
  checked++;
  let best = { cov: -1 };
  for (const s of secToks) {
    const hit = t.filter((x) => s.set.has(x)).length;
    const cov = hit / t.length;
    if (cov > best.cov) best = { cov, where: s.where, miss: t.filter((x) => !s.set.has(x)) };
    if (cov === 1) break;
  }
  if (best.cov < THRESHOLD || process.argv.includes('--all')) report.push({ n: i + 1, line: line.trim(), ...best });
});

console.log(`Checked ${checked} content lines of original-notes.txt against ${sections.length} site sections.`);
console.log(`Lines below ${THRESHOLD * 100}% key-term coverage in any single section: ${report.filter((r) => r.cov < THRESHOLD).length}\n`);
for (const r of report) console.log(`L${String(r.n).padStart(4)} ${(r.cov * 100).toFixed(0).padStart(3)}%  ${r.line.slice(0, 90)}\n        best: ${r.where} · missing: ${r.miss.join(', ')}`);
