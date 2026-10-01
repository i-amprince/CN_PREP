// Converts the chapter HTML in content/*.html into React components (src/chapters/<id>.jsx)
// and writes a heading index for search (src/data/headings.json).
//
// The HTML in content/ is the source of truth for chapter text. Text is emitted verbatim
// (string literals where JSX would otherwise change whitespace or choke on { } < > &),
// so nothing is reworded. `<div class="wg" data-wg="x">` placeholders become <W name="x" />.
//
// Run: npm run content
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, NodeType } from 'node-html-parser';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');
const outDir = join(root, 'src', 'chapters');
mkdirSync(outDir, { recursive: true });

const VOID = new Set(['br', 'hr', 'img', 'input', 'wbr']);
const NO_WS = new Set(['table', 'thead', 'tbody', 'tfoot', 'tr', 'ul', 'ol', 'dl', 'colgroup']);
const INLINE_TAGS = new Set(['p', 'li', 'td', 'th', 'h1', 'h2', 'h3', 'h4', 'h5', 'span', 'strong', 'em', 'b', 'i', 'code', 'a', 'label', 'summary', 'small', 'mark', 'kbd', 'sub', 'sup', 'pre', 'dt', 'dd']);
const ATTR = { class: 'className', for: 'htmlFor', colspan: 'colSpan', rowspan: 'rowSpan', tabindex: 'tabIndex', open: 'open' };

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
const lit = (s) => '{' + JSON.stringify(s) + '}';
const safeRaw = (s) => !/[{}<>&\n\r]/.test(s) && s.length > 0;

function styleObj(css) {
  const parts = css.split(';').map((p) => p.trim()).filter(Boolean).map((p) => {
    const i = p.indexOf(':');
    const k = p.slice(0, i).trim();
    const v = p.slice(i + 1).trim();
    const key = k.startsWith('--') ? JSON.stringify(k) : k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return `${key}: ${JSON.stringify(v)}`;
  });
  return `{{ ${parts.join(', ')} }}`;
}

function attrs(el) {
  const out = [];
  for (const [k, v] of Object.entries(el.attributes)) {
    if (k === 'hidden') continue;
    if (k === 'style') { out.push(`style=${styleObj(v)}`); continue; }
    const name = ATTR[k] || k;
    if (v === '' && (k === 'open')) { out.push(name); continue; }
    out.push(`${name}=${JSON.stringify(v)}`);
  }
  return out.length ? ' ' + out.join(' ') : '';
}

function textOf(node) {
  return node.childNodes.map((c) => (c.nodeType === NodeType.TEXT_NODE ? c.text : c.rawTagName ? textOf(c) : '')).join('');
}

// like textOf, but block-level children are separated by spaces (for the search index)
const BLOCKS = new Set(['li', 'p', 'td', 'th', 'tr', 'div', 'span', 'h3', 'h4', 'pre', 'summary', 'details', 'section', 'ul', 'ol']);
function textSpaced(node) {
  return node.childNodes.map((c) => (c.nodeType === NodeType.TEXT_NODE ? c.text : c.rawTagName ? (BLOCKS.has(c.rawTagName.toLowerCase()) ? ' ' + textSpaced(c) + ' ' : textSpaced(c)) : '')).join('');
}

function isInline(el) {
  const tag = (el.rawTagName || '').toLowerCase();
  if (INLINE_TAGS.has(tag)) return true;
  return el.childNodes.some((c) => c.nodeType === NodeType.TEXT_NODE && c.text.trim());
}

let headings = [];
const bodies = [];
let chId = '';
const widgetsUsed = new Set();

function emit(node, depth, inline) {
  const pad = inline ? '' : '  '.repeat(depth);
  if (node.nodeType === NodeType.TEXT_NODE) {
    const t = node.text;
    if (!inline) {
      if (!t.trim()) return t.includes('\n') ? '' : pad + lit(t);
      return pad + lit(t);
    }
    return safeRaw(t) ? t : lit(t);
  }
  if (node.nodeType !== NodeType.ELEMENT_NODE) return '';
  const tag = node.rawTagName.toLowerCase();

  if (tag === 'div' && (node.getAttribute('class') || '').split(/\s+/).includes('wg') && node.getAttribute('data-wg')) {
    const name = node.getAttribute('data-wg');
    widgetsUsed.add(name);
    return pad + `<W name=${JSON.stringify(name)} />`;
  }

  // heading index (+ ids for h3 so search can jump to them)
  if (tag === 'h2' || tag === 'h3') {
    let id = node.getAttribute('id');
    const clone = parse(node.toString());
    clone.querySelectorAll('.num, .add').forEach((n) => n.remove());
    const text = textOf(clone).replace(/\s+/g, ' ').trim();
    const numEl = node.querySelector('.num');
    if (!id) { id = `${chId}-${slug(text)}`; node.setAttribute('id', id); }
    headings.push({ ch: chId, id, level: tag === 'h2' ? 2 : 3, text, num: numEl ? numEl.text.trim() : '' });
  }

  if (VOID.has(tag)) return pad + `<${tag}${attrs(node)} />`;
  const kidsInline = inline || isInline(node);
  const kids = node.childNodes.filter((c) => !(NO_WS.has(tag) && c.nodeType === NodeType.TEXT_NODE && !c.text.trim()));
  if (kidsInline) {
    const inner = kids.map((c) => emit(c, 0, true)).join('');
    return pad + `<${tag}${attrs(node)}>${inner}</${tag}>`;
  }
  const inner = kids.map((c) => emit(c, depth + 1, false)).filter(Boolean).join('\n');
  return pad + `<${tag}${attrs(node)}>\n${inner}\n${pad}</${tag}>`;
}

function emitPane(pane) {
  if (!pane) return '      {null}';
  const kids = pane.childNodes.map((c) => emit(c, 3, false)).filter(Boolean);
  return kids.join('\n');
}

const files = readdirSync(contentDir).filter((f) => /^\d+_ch_.*\.html$/.test(f)).sort();
const ids = [];
for (const f of files) {
  const html = readFileSync(join(contentDir, f), 'utf8');
  const doc = parse(html, { comment: false, blockTextElements: { script: true, style: true } });
  for (const art of doc.querySelectorAll('article.ch')) {
    chId = art.getAttribute('data-ch');
    const notes = art.querySelector('.pane.notes');
    const quick = art.querySelector('.pane.quick-sheet');
    if (notes) {
      for (const sec of notes.querySelectorAll('section')) {
        const h2 = sec.querySelector('h2');
        if (!h2) continue;
        const clone = parse(sec.toString());
        clone.querySelectorAll('h2').forEach((n) => n.remove());
        bodies.push({ ch: chId, id: h2.getAttribute('id'), t: textSpaced(clone).replace(/\s+/g, ' ').trim() });
      }
    }
    const notesJsx = emitPane(notes);
    const quickJsx = emitPane(quick);
    const src = `// AUTO-GENERATED from content/${f} by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run \`npm run content\` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
${notesJsx}
    </>
  );
}

export function Quick() {
  return (
    <>
${quickJsx}
    </>
  );
}
`;
    writeFileSync(join(outDir, `${chId}.jsx`), src);
    ids.push(chId);
  }
}

writeFileSync(join(outDir, 'index.js'), `// AUTO-GENERATED by scripts/convert-chapters.mjs
export const chapterModules = {
${ids.map((id) => `  ${JSON.stringify(id)}: () => import('./${id}.jsx'),`).join('\n')}
};
`);
writeFileSync(join(root, 'src', 'data', 'headings.json'), JSON.stringify(headings, null, 0));
writeFileSync(join(root, 'src', 'data', 'bodytext.json'), JSON.stringify(bodies, null, 0));
console.log(`Converted ${ids.length} chapters: ${ids.join(', ')}`);
console.log(`Headings indexed: ${headings.length}`);
console.log(`Widgets referenced (${widgetsUsed.size}): ${[...widgetsUsed].sort().join(', ')}`);
