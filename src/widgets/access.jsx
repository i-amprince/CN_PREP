import { useState } from 'react';
import { Card, useStepper, StepControls, Tabs } from './common.jsx';

/* ---------------- Binary exponential backoff ---------------- */
export function Backoff() {
  const [n, setN] = useState(1);
  const [rolls, setRolls] = useState([]);
  const k = Math.min(n, 10);
  const max = 2 ** k - 1;
  const abort = n >= 16;
  const roll = () => {
    if (abort) return;
    const a = Math.floor(Math.random() * (max + 1));
    const b = Math.floor(Math.random() * (max + 1));
    setRolls((r) => [{ n, a, b }, ...r].slice(0, 6));
  };
  const last = rolls[0] && rolls[0].n === n ? rolls[0] : null;
  return (
    <Card title="Binary exponential backoff" tag="roll the dice">
      <label style={{ display: 'flex' }}>Collision number n = <b className="mono">{n}</b>
        <input type="range" min="1" max="16" value={n} onChange={(e) => setN(Number(e.target.value))} aria-label="collision number" />
      </label>
      {abort ? (
        <div className="note-box" style={{ borderLeft: '4px solid var(--bad)' }}><b>16 attempts failed → abort.</b> The NIC gives up on this frame and reports an error to the layer above (excessive collisions).</div>
      ) : (
        <>
          <div className="kv">
            <div><small>Range of K</small><b>0 … 2^{k} − 1 = 0 … {max}</b></div>
            <div><small>Choices</small><b>{max + 1}</b></div>
            <div><small>Max wait</small><b>{(max * 51.2).toLocaleString(undefined, { maximumFractionDigits: 1 })} µs</b></div>
            <div><small>P(same K again)</small><b>1 / {max + 1} = {(100 / (max + 1)).toPrecision(3)}%</b></div>
          </div>
          {max < 64 && (
            <div className="k-grid" aria-hidden="true">
              {Array.from({ length: max + 1 }, (_, i) => <span key={i} className={last && (last.a === i || last.b === i) ? 'on' : ''}>{i}</span>)}
            </div>
          )}
          <div className="wg-ctl">
            <button className="btn sm pri" onClick={roll}>Roll K for stations A and B</button>
            <button className="btn sm" onClick={() => { setN((x) => Math.min(16, x + 1)); }}>They collided again → n + 1</button>
            <button className="btn sm" onClick={() => { setN(1); setRolls([]); }}>Reset</button>
          </div>
          {last && (
            <div className="note-box" aria-live="polite">
              A picks K = <b>{last.a}</b> → waits {(last.a * 51.2).toFixed(1)} µs · B picks K = <b>{last.b}</b> → waits {(last.b * 51.2).toFixed(1)} µs.{' '}
              {last.a === last.b ? <b className="bad-t">Same K: they collide again!</b> : <b className="ok-t">Different K: the station with the smaller K goes first; the other senses busy and defers.</b>}
            </div>
          )}
        </>
      )}
      <p className="muted small" style={{ margin: '.5rem 0 0' }}>Slot time = 512 bit-times = 51.2 µs at 10 Mbps. The range stops growing after n = 10 (0 … 1023).</p>
    </Card>
  );
}

/* ---------------- Hidden terminal ---------------- */
const PLAIN = [
  { t: 'A and C both have a frame for B.', a: false, c: false, b: '' },
  { t: 'A senses the channel. C is out of A\'s range, so A hears nothing: "channel is free". A starts sending.', a: true, c: false, b: '' },
  { t: 'C senses the channel. It can\'t hear A either: "channel is free". C starts sending too.', a: true, c: true, b: '' },
  { t: 'Both signals reach B at the same time → collision at B. Neither A nor C can tell (they can\'t hear each other). They only notice when no ACK arrives.', a: true, c: true, b: 'collision' },
];
const RTS = [
  { t: 'A and C both have a frame for B. This time RTS/CTS is used.', a: false, c: false, b: '' },
  { t: 'A sends a short RTS (with the duration of the exchange). C can\'t hear it.', a: 'RTS', c: false, b: '' },
  { t: 'B replies CTS. B\'s range covers BOTH A and C. C hears the CTS, sets its NAV and stays silent.', a: false, c: 'NAV', b: 'CTS' },
  { t: 'A sends the data. C is deferring, so there is no collision at B.', a: 'DATA', c: 'NAV', b: '' },
  { t: 'B sends the ACK. When the NAV expires, C may contend for the channel.', a: false, c: false, b: 'ACK' },
];

export function Hidden() {
  const [mode, setMode] = useState('plain');
  const steps = mode === 'plain' ? PLAIN : RTS;
  const st = useStepper(steps.length, { interval: 1800 });
  const s = steps[Math.min(st.i, steps.length - 1)];
  const A = { x: 80, y: 120 }; const B = { x: 230, y: 120 }; const C = { x: 380, y: 120 };
  const r = 175;
  const node = (p, label, active, txt) => (
    <g>
      <circle cx={p.x} cy={p.y} r={24} fill={active ? 'var(--accent)' : 'var(--surface)'} stroke="var(--ink)" strokeWidth="2" />
      <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill={active ? 'var(--accent-ink)' : 'var(--ink)'}>{label}</text>
      {txt && <text x={p.x} y={p.y + 46} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--ink)">{txt}</text>}
    </g>
  );
  const sending = (from, to, label) => (
    <g>
      <line x1={from.x + Math.sign(to.x - from.x) * 26} y1={from.y - 8} x2={to.x - Math.sign(to.x - from.x) * 28} y2={to.y - 8} stroke="var(--lc,var(--accent))" strokeWidth="3" markerEnd="url(#hidArr)" />
      <text x={(from.x + to.x) / 2} y={from.y - 16} textAnchor="middle" fontSize="11" fill="var(--ink)">{label}</text>
    </g>
  );
  return (
    <Card title="Hidden terminal problem" tag="step through">
      <Tabs items={[['plain', 'Without RTS/CTS'], ['rts', 'With RTS/CTS']]} value={mode} onChange={(m) => { setMode(m); st.set(0); }} />
      <div className="svg-wrap">
        <svg viewBox="0 0 460 240" style={{ minWidth: 340 }} role="img" aria-label="Nodes A, B and C with radio ranges">
          <defs><marker id="hidArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--lc,var(--accent))" /></marker></defs>
          <circle cx={A.x} cy={A.y} r={r} fill="color-mix(in srgb,var(--l3) 7%,transparent)" stroke="var(--l3)" strokeDasharray="5 4" opacity={s.a ? 1 : 0.45} />
          <circle cx={C.x} cy={C.y} r={r} fill="color-mix(in srgb,var(--l7) 7%,transparent)" stroke="var(--l7)" strokeDasharray="5 4" opacity={s.c ? 1 : 0.45} />
          {s.b === 'CTS' && <circle cx={B.x} cy={B.y} r={r} fill="color-mix(in srgb,var(--good) 10%,transparent)" stroke="var(--good)" strokeWidth="2" />}
          <text x={22} y={20} className="svgmut">A's range</text>
          <text x={438} y={20} textAnchor="end" className="svgmut">C's range</text>
          {mode === 'plain' && s.a && sending(A, B, 'DATA')}
          {mode === 'plain' && s.c && sending(C, B, 'DATA')}
          {mode === 'rts' && (s.a === 'RTS' || s.a === 'DATA') && sending(A, B, s.a)}
          {mode === 'rts' && (s.b === 'CTS' || s.b === 'ACK') && <>{sending(B, A, s.b)}{s.b === 'CTS' && sending(B, C, 'CTS')}</>}
          {node(A, 'A', !!s.a && s.a !== false)}
          {node(B, 'B', false, s.b === 'collision' ? '💥 COLLISION' : '')}
          {node(C, 'C', mode === 'plain' && s.c, s.c === 'NAV' ? 'NAV: silent' : '')}
        </svg>
      </div>
      <div className="note-box" aria-live="polite"><b>Step {st.i + 1}.</b> {s.t}</div>
      <StepControls st={st} />
    </Card>
  );
}
