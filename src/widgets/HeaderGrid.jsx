import { useState } from 'react';

// 32-bit-wide protocol header grid. fields: [{ k, name, short?, bits, c?, d }]
export function HeaderGrid({ fields, initial, caption }) {
  const [sel, setSel] = useState(initial || fields[0].k);
  const f = fields.find((x) => x.k === sel) || fields[0];
  const ruler = Array.from({ length: 32 }, (_, i) => i);
  return (
    <div>
      <div className="scroll">
        <div className="hdr-grid" role="group" aria-label={caption}>
          {ruler.map((i) => <div key={'r' + i} className="ruler">{i % 8 === 0 || i === 31 ? i : ''}</div>)}
          {fields.map((x) => (
            <button key={x.k} className={sel === x.k ? 'on' : ''} style={{ gridColumn: `span ${Math.min(32, x.bits)}`, '--fc': x.c || 'var(--lc,var(--accent))' }} onClick={() => setSel(x.k)} title={`${x.name} (${x.bits === 33 ? 'variable' : x.bits + ' bits'})`} aria-pressed={sel === x.k}>
              {x.bits <= 2 ? (x.short || x.name[0]) : x.short && x.bits < 8 ? x.short : x.name}
              {x.bits >= 8 && <><br /><span style={{ opacity: 0.7 }}>{x.bits === 33 ? 'var' : x.bits}</span></>}
            </button>
          ))}
        </div>
      </div>
      <div className="note-box" aria-live="polite"><b>{f.name}</b> <span className="pill">{f.bits === 33 ? 'variable' : `${f.bits} bit${f.bits > 1 ? 's' : ''}`}</span> {f.d}</div>
    </div>
  );
}
