import { useMemo, useState } from 'react';
import { Card, useStepper, StepControls, Tabs } from './common.jsx';
import { countToInfinity, dijkstraSteps } from '../lib/netmath.js';

const f = (d) => (d >= 16 ? '∞ (16)' : d);

export function CountToInfinity() {
  const [sh, setSh] = useState(false);
  const rows = useMemo(() => countToInfinity({ splitHorizon: sh }), [sh]);
  const st = useStepper(rows.length, { interval: 900 });
  const r = rows[st.i];
  const failed = st.i >= 1;
  const P = { A: 70, B: 230, C: 390 };
  return (
    <Card title="Count to infinity" tag="step through rounds">
      <div className="svg-wrap">
        <svg viewBox="0 0 460 100" style={{ minWidth: 360 }} role="img" aria-label="Routers A, B, C in a line">
          <line x1={P.A} y1={45} x2={P.B} y2={45} stroke="var(--muted)" strokeWidth="3" />
          <line x1={P.B} y1={45} x2={P.C} y2={45} stroke={failed ? 'var(--bad)' : 'var(--muted)'} strokeWidth="3" strokeDasharray={failed ? '6 5' : undefined} />
          {failed && <text x={(P.B + P.C) / 2} y={52} textAnchor="middle" fontSize="22" fill="var(--bad)" fontWeight="700">✕</text>}
          {Object.entries(P).map(([k, x]) => (
            <g key={k}>
              <circle cx={x} cy={45} r={20} fill={k === 'C' && failed ? 'var(--surface-2)' : 'var(--ink)'} />
              <text x={x} y={50} textAnchor="middle" fontSize="14" fontWeight="700" fill={k === 'C' && failed ? 'var(--muted)' : 'var(--bg)'}>{k}</text>
            </g>
          ))}
          <text x={P.A} y={88} textAnchor="middle" fontSize="11.5" fill="var(--ink)">A→C: {f(r.A)} {r.viaA !== '—' ? `via ${r.viaA}` : ''}</text>
          <text x={P.B} y={88} textAnchor="middle" fontSize="11.5" fill="var(--ink)">B→C: {f(r.B)} {r.viaB !== '—' ? `via ${r.viaB}` : ''}</text>
        </svg>
      </div>
      <div className="tbl" style={{ maxHeight: '15rem', overflowY: 'auto' }}>
        <table>
          <thead><tr><th>Round</th><th>A's distance to C</th><th>B's distance to C</th></tr></thead>
          <tbody>
            {rows.slice(0, st.i + 1).map((x) => (
              <tr key={x.round} className={x.round === r.round ? 'hl' : ''}>
                <td className="n">{x.round}</td><td className="mono">{f(x.A)} {x.viaA !== '—' ? `via ${x.viaA}` : 'unreachable'}</td><td className="mono">{f(x.B)} {x.viaB !== '—' ? `via ${x.viaB}` : 'unreachable'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="note-box" aria-live="polite"><b>Round {r.round}.</b> {r.note}</div>
      <StepControls st={st} label={`Round ${r.round}`}>
        <label><input type="checkbox" checked={sh} onChange={(e) => { setSh(e.target.checked); st.set(0); }} /> Split horizon / poison reverse</label>
      </StepControls>
    </Card>
  );
}

const GRAPHS = {
  six: {
    label: '6-node graph',
    pos: { A: [50, 120], B: [170, 40], C: [170, 200], D: [320, 40], E: [320, 200], F: [440, 120] },
    edges: [['A', 'B', 4], ['A', 'C', 2], ['B', 'C', 1], ['B', 'D', 5], ['C', 'D', 8], ['C', 'E', 10], ['D', 'E', 2], ['D', 'F', 6], ['E', 'F', 2]],
  },
  notes: {
    label: 'Your notes\' example',
    pos: { A: [120, 50], B: [360, 50], C: [120, 200], D: [360, 200] },
    edges: [['A', 'B', 2], ['B', 'D', 1], ['A', 'C', 5], ['C', 'D', 2]],
  },
};

export function Dijkstra() {
  const [g, setG] = useState('six');
  const G = GRAPHS[g];
  const nodes = Object.keys(G.pos);
  const steps = useMemo(() => dijkstraSteps(nodes, G.edges, 'A'), [g]); // eslint-disable-line react-hooks/exhaustive-deps
  const st = useStepper(steps.length, { interval: 1500 });
  const s = steps[Math.min(st.i, steps.length - 1)];
  const done = st.i === steps.length - 1;
  const treeEdge = (a, b) => s.visited.includes(a) && s.visited.includes(b) && (s.prev[a] === b || s.prev[b] === a);
  return (
    <Card title="Dijkstra's shortest paths from A" tag="step through">
      <Tabs items={Object.entries(GRAPHS).map(([k, v]) => [k, v.label])} value={g} onChange={(k) => { setG(k); st.set(0); }} />
      <div className="two" style={{ alignItems: 'start' }}>
        <svg viewBox="0 0 490 240" role="img" aria-label="Weighted graph">
          {G.edges.map(([a, b, w]) => {
            const [x1, y1] = G.pos[a]; const [x2, y2] = G.pos[b];
            const t = treeEdge(a, b);
            const relax = s.cur && ((a === s.cur && s.relaxed.includes(b)) || (b === s.cur && s.relaxed.includes(a)));
            return (
              <g key={a + b}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={t ? 'var(--good)' : relax ? 'var(--warn)' : 'var(--line)'} strokeWidth={t ? 5 : relax ? 4 : 2.5} />
                <rect x={(x1 + x2) / 2 - 11} y={(y1 + y2) / 2 - 10} width={22} height={18} rx={4} fill="var(--surface)" />
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 4} textAnchor="middle" fontSize="12" fill="var(--ink)" fontWeight="600">{w}</text>
              </g>
            );
          })}
          {nodes.map((n) => {
            const [x, y] = G.pos[n];
            const isCur = n === s.cur; const vis = s.visited.includes(n);
            return (
              <g key={n}>
                <circle cx={x} cy={y} r={20} fill={isCur ? 'var(--accent)' : vis ? 'var(--good)' : 'var(--surface)'} stroke="var(--ink)" strokeWidth="1.5" />
                <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill={isCur || vis ? 'var(--accent-ink)' : 'var(--ink)'}>{n}</text>
                <text x={x} y={y - 26} textAnchor="middle" fontSize="11" fill="var(--muted)">{s.dist[n] === Infinity ? '∞' : s.dist[n]}</text>
              </g>
            );
          })}
        </svg>
        <div className="tbl" style={{ marginTop: 0 }}>
          <table>
            <thead><tr><th>Node</th><th>Dist</th><th>Prev</th><th>Done</th></tr></thead>
            <tbody>{nodes.map((n) => (
              <tr key={n} className={n === s.cur ? 'hl' : ''}><td>{n}</td><td className={'n' + (s.relaxed.includes(n) ? ' chg' : '')}>{s.dist[n] === Infinity ? '∞' : s.dist[n]}</td><td className="mono">{s.prev[n] || '—'}</td><td>{s.visited.includes(n) ? '✓' : ''}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <div className="note-box" aria-live="polite">
        {s.note}
        {done && <> <b>Done.</b> Green edges form the shortest-path tree: {nodes.filter((n) => n !== 'A').map((n) => { const p = []; let x = n; while (x) { p.unshift(x); x = s.prev[x]; } return `${p.join('→')} (${s.dist[n]})`; }).join(', ')}.</>}
      </div>
      <StepControls st={st} />
    </Card>
  );
}
