// Search over chapter titles, h2/h3 headings (generated from the chapter HTML) and flashcards.
import headings from '../data/headings.json';
import { CHAPTERS, CH_BY_ID } from '../data/chapters.js';
import { QA } from '../data/qa/index.js';

const norm = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[_\-/]+/g, ' ');

export function buildIndex() {
  const items = [];
  for (const c of CHAPTERS) {
    items.push({ key: 'c-' + c.id, kind: 'chapter', w: 3, tnorm: norm(c.title + ' ' + c.short), title: c.title, ctx: `Chapter ${c.num} · ${c.lede}`, text: norm(c.title + ' ' + c.short + ' ' + c.lede), to: `/ch/${c.id}` });
  }
  for (const h of headings) {
    const c = CH_BY_ID[h.ch];
    if (!c) continue;
    items.push({ key: 'h-' + h.id, kind: 'heading', w: h.level === 2 ? 2 : 1.6, title: (h.num ? h.num + ' ' : '') + h.text, ctx: `${c.short} · notes`, text: norm(h.text), to: `/ch/${c.id}?tab=notes&h=${encodeURIComponent(h.id)}` });
  }
  for (const [id, qa] of Object.entries(QA)) {
    const c = CH_BY_ID[id];
    (qa.cards || []).forEach(([front, back], i) => {
      items.push({ key: `f-${id}-${i}`, kind: 'card', w: 1, title: front, ctx: `${c.short} · flashcard`, text: norm(front + ' ' + back), to: `/ch/${id}?tab=cards&card=${i}` });
    });
  }
  return items;
}

// Section body text is big, so it is loaded on first use and searched with a lower weight.
let bodyItems = null;
export async function loadBodyIndex() {
  if (bodyItems) return bodyItems;
  const mod = await import('../data/bodytext.json');
  const hById = Object.fromEntries(headings.map((h) => [h.id, h]));
  bodyItems = mod.default.map((b) => {
    const h = hById[b.id];
    const c = CH_BY_ID[b.ch];
    return { key: 't-' + b.id, kind: 'text', w: 0.9, hid: b.id, title: (h?.num ? h.num + ' ' : '') + (h?.text || ''), chShort: c.short, raw: b.t, text: norm(b.t), to: `/ch/${b.ch}?tab=notes&h=${encodeURIComponent(b.id)}` };
  });
  return bodyItems;
}

function snippet(raw, tok) {
  const i = norm(raw).indexOf(tok);
  if (i < 0) return raw.slice(0, 90);
  const a = Math.max(0, i - 40);
  return (a > 0 ? '…' : '') + raw.slice(a, i + 70).trim() + '…';
}

export function searchIndex(items, query) {
  const toks = norm(query).split(/\s+/).filter(Boolean);
  if (!toks.length) return [];
  const out = [];
  for (const it of items) {
    let score = 0;
    let ok = true;
    for (const t of toks) {
      const i = it.text.indexOf(t);
      if (i < 0) { ok = false; break; }
      // word-start matches score higher ("arp" should rank ARP above "sharp")
      score += (i === 0 || /\s|\(|\./.test(it.text[i - 1])) ? 2 : 1;
    }
    if (!ok) continue;
    if (it.text.startsWith(toks[0])) score += 1;
    // chapters rank high only when the title itself matches, not just the summary
    const w = it.kind === 'chapter' && !toks.every((t) => it.tnorm.includes(t)) ? 0.8 : it.w;
    out.push({ ...it, score: score * w - it.text.length / 400 });
  }
  out.sort((a, b) => b.score - a.score);
  // drop body-text hits whose section heading already matched
  const seen = new Set(out.filter((r) => r.kind === 'heading').map((r) => r.key.slice(2)));
  return out.filter((r) => r.kind !== 'text' || !seen.has(r.hid)).slice(0, 14)
    .map((r) => (r.kind === 'text' ? { ...r, ctx: `${r.chShort} · “${snippet(r.raw, toks[0])}”` } : r));
}
