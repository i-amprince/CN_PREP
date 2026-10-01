import { useEffect, useState } from 'react';
import { Card, Tabs } from './common.jsx';

const S = {
  closed: { n: 'CLOSED', x: 320, y: 30, d: 'No connection. The starting (and ending) point.' },
  listen: { n: 'LISTEN', x: 525, y: 105, d: 'Server called listen(): waiting for a SYN on its port.' },
  synsent: { n: 'SYN-SENT', x: 115, y: 105, d: 'Client sent SYN (connect()) and waits for SYN+ACK.' },
  synrcvd: { n: 'SYN-RECEIVED', x: 525, y: 185, d: 'Server got a SYN and replied SYN+ACK; waits for the final ACK. A SYN flood leaves thousands of these half-open entries.' },
  est: { n: 'ESTABLISHED', x: 320, y: 255, d: 'Connection open; data flows both ways. Most sockets live here.' },
  fw1: { n: 'FIN-WAIT-1', x: 115, y: 335, d: 'Active closer sent FIN; waits for its ACK (or for the peer\'s FIN).' },
  cw: { n: 'CLOSE-WAIT', x: 525, y: 335, d: 'Passive side got FIN and ACKed it; waits for its own application to call close(). Many sockets stuck here = an app that never closes them (a bug).' },
  fw2: { n: 'FIN-WAIT-2', x: 115, y: 415, d: 'Our FIN was ACKed (half-closed). We can still receive data until the peer sends its FIN.' },
  closing: { n: 'CLOSING', x: 320, y: 415, d: 'Rare: both sides sent FIN at the same time (simultaneous close). Waiting for the ACK of our FIN.' },
  lastack: { n: 'LAST-ACK', x: 525, y: 415, d: 'Passive side sent its FIN; waits for the final ACK, then CLOSED.' },
  tw: { n: 'TIME-WAIT', x: 115, y: 495, d: 'Active closer waits 2 × MSL: delayed old segments die out and the final ACK can be re-sent if the peer retransmits its FIN.' },
  closed2: { n: 'CLOSED', x: 395, y: 495, d: 'Connection fully closed; resources released.' },
};
const E = [
  ['closed', 'listen', 'passive open'],
  ['closed', 'synsent', 'active open / SYN'],
  ['listen', 'synrcvd', 'rcv SYN / SYN+ACK'],
  ['synsent', 'est', 'rcv SYN+ACK / ACK'],
  ['synrcvd', 'est', 'rcv ACK'],
  ['est', 'fw1', 'close / FIN'],
  ['est', 'cw', 'rcv FIN / ACK'],
  ['fw1', 'fw2', 'rcv ACK'],
  ['fw1', 'closing', 'rcv FIN / ACK'],
  ['closing', 'tw', 'rcv ACK'],
  ['fw2', 'tw', 'rcv FIN / ACK'],
  ['cw', 'lastack', 'close / FIN'],
  ['lastack', 'closed2', 'rcv ACK'],
  ['tw', 'closed2', '2MSL timeout'],
];
const PATHS = {
  client: { label: 'Client: active open + active close', seq: ['closed', 'synsent', 'est', 'fw1', 'fw2', 'tw', 'closed2'] },
  server: { label: 'Server: passive open + passive close', seq: ['closed', 'listen', 'synrcvd', 'est', 'cw', 'lastack', 'closed2'] },
  simul: { label: 'Simultaneous close', seq: ['est', 'fw1', 'closing', 'tw', 'closed2'] },
};
const BW = 124; const BH = 32;
function clip(a, b) {
  const dx = b.x - a.x; const dy = b.y - a.y;
  const t = Math.min(dx ? (BW / 2 + 3) / Math.abs(dx) : Infinity, dy ? (BH / 2 + 3) / Math.abs(dy) : Infinity);
  return [a.x + dx * t, a.y + dy * t, b.x - dx * t, b.y - dy * t];
}

export function TcpStates() {
  const [path, setPath] = useState('client');
  const [sel, setSel] = useState('est');
  const [k, setK] = useState(-1);
  const seq = PATHS[path].seq;
  useEffect(() => {
    if (k < 0) return undefined;
    if (k >= seq.length) { setK(-1); return undefined; }
    setSel(seq[k]);
    const t = setTimeout(() => setK(k + 1), 1100);
    return () => clearTimeout(t);
  }, [k, seq]);
  const onPath = (a, b) => { const i = seq.indexOf(a); return i >= 0 && seq[i + 1] === b; };
  return (
    <Card title="TCP state machine" tag="click a state">
      <Tabs items={Object.entries(PATHS).map(([key, v]) => [key, v.label])} value={path} onChange={(p) => { setPath(p); setK(-1); }} />
      <div className="svg-wrap">
        <svg viewBox="0 0 640 520" style={{ minWidth: 470 }} role="img" aria-label="TCP state transition diagram">
          <defs>
            <marker id="tsA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker>
            <marker id="tsB" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--lc,var(--accent))" /></marker>
          </defs>
          {E.map(([a, b, l]) => {
            const [x1, y1, x2, y2] = clip(S[a], S[b]);
            const on = onPath(a, b);
            const mx = (x1 + x2) / 2; const my = (y1 + y2) / 2;
            return (
              <g key={a + b}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={on ? 'var(--lc,var(--accent))' : 'var(--line)'} strokeWidth={on ? 2.6 : 1.6} markerEnd={on ? 'url(#tsB)' : 'url(#tsA)'} />
                <rect x={mx - l.length * 3.05} y={my - 9} width={l.length * 6.1} height={15} rx={3} fill="var(--surface)" opacity=".92" />
                <text x={mx} y={my + 2} textAnchor="middle" fontSize="10" fill={on ? 'var(--ink)' : 'var(--muted)'}>{l}</text>
              </g>
            );
          })}
          {Object.entries(S).map(([key, s]) => {
            const inPath = seq.includes(key);
            const isSel = sel === key;
            return (
              <g key={key} onClick={() => { setSel(key); setK(-1); }} style={{ cursor: 'pointer' }} role="button" aria-label={s.n}>
                <rect x={s.x - BW / 2} y={s.y - BH / 2} width={BW} height={BH} rx={8} fill={isSel ? 'var(--lc,var(--accent))' : inPath ? 'color-mix(in srgb,var(--lc,var(--accent)) 16%,var(--surface))' : 'var(--surface)'} stroke={inPath || isSel ? 'var(--lc,var(--accent))' : 'var(--line)'} strokeWidth="1.8" />
                <text x={s.x} y={s.y + 4} textAnchor="middle" fontSize="11.5" fontWeight="600" fill={isSel ? 'var(--accent-ink)' : 'var(--ink)'}>{s.n}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="note-box" aria-live="polite"><b>{S[sel].n}.</b> {S[sel].d}</div>
      <div className="wg-ctl">
        <button className="btn sm pri" onClick={() => setK(0)}>▶ Walk this path</button>
        <span className="muted small">{seq.map((s) => S[s].n).join(' → ')}</span>
      </div>
    </Card>
  );
}
