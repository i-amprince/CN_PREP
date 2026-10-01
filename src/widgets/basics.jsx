import { useMemo, useState } from 'react';
import { Card, Tabs, KV } from './common.jsx';

const TOPO = {
  bus: { label: 'Bus', links: (n) => `1 backbone + ${n} drop cables`, ports: () => '1', spof: 'The backbone cable: one break splits or kills the network. All nodes share one collision domain.' },
  star: { label: 'Star', links: (n) => `${n}`, ports: (n) => `1 per host, ${n} on the hub/switch`, spof: 'The central hub/switch. A broken cable only affects its own host.' },
  ring: { label: 'Ring', links: (n) => `${n}`, ports: () => '2', spof: 'Any single break stops a simple ring (dual rings like FDDI survive one break). Token passing gives orderly access.' },
  mesh: { label: 'Mesh', links: (n) => `n(n−1)/2 = ${(n * (n - 1)) / 2}`, ports: (n) => `n−1 = ${n - 1}`, spof: 'None: every pair has a private link. Cost grows as n², so full mesh is only used for small cores (and WAN backbones use partial mesh).' },
  tree: { label: 'Tree', links: (n) => `n−1 = ${n - 1}`, ports: () => 'varies', spof: 'The root and every internal node: a failure cuts off the whole branch below it.' },
};

function layout(type, n) {
  const cx = 180; const cy = 125; const R = 92;
  const ring = Array.from({ length: n }, (_, i) => {
    const a = (-Math.PI / 2) + (i * 2 * Math.PI) / n;
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  });
  if (type === 'bus') {
    const pts = Array.from({ length: n }, (_, i) => ({ x: 40 + (i * 280) / Math.max(1, n - 1), y: i % 2 ? 190 : 60 }));
    return { pts, edges: pts.map((p, i) => [i, { x: p.x, y: cy }]), extra: <line x1={25} y1={cy} x2={335} y2={cy} stroke="var(--lc,var(--accent))" strokeWidth="5" strokeLinecap="round" /> };
  }
  if (type === 'star') return { pts: ring, edges: ring.map((_, i) => [i, { x: cx, y: cy }]), hub: { x: cx, y: cy } };
  if (type === 'ring') return { pts: ring, edges: ring.map((_, i) => [i, (i + 1) % n]) };
  if (type === 'mesh') {
    const e = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) e.push([i, j]);
    return { pts: ring, edges: e };
  }
  // tree (binary heap layout)
  const depth = Math.floor(Math.log2(n)) + 1;
  const pts = Array.from({ length: n }, (_, i) => {
    const lvl = Math.floor(Math.log2(i + 1));
    const idx = i + 1 - 2 ** lvl;
    const cnt = 2 ** lvl;
    return { x: 20 + ((idx + 0.5) * 320) / cnt, y: 30 + (lvl * 190) / Math.max(1, depth - 1) };
  });
  return { pts, edges: pts.slice(1).map((_, k) => [k + 1, Math.floor(k / 2)]) };
}

export function Topology() {
  const [type, setType] = useState('mesh');
  const [n, setN] = useState(6);
  const T = TOPO[type];
  const L = useMemo(() => layout(type, n), [type, n]);
  const pos = (e) => (typeof e === 'number' ? L.pts[e] : e);
  return (
    <Card title="Topologies" tag="pick one · drag n">
      <Tabs items={Object.entries(TOPO).map(([k, v]) => [k, v.label])} value={type} onChange={setType} />
      <div className="two" style={{ alignItems: 'center' }}>
        <svg viewBox="0 0 360 250" role="img" aria-label={`${T.label} topology with ${n} nodes`}>
          {L.extra}
          {L.edges.map(([a, b], k) => {
            const p = pos(a); const q = pos(b);
            return <line key={k} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="var(--muted)" strokeWidth={type === 'mesh' && n > 7 ? 1 : 1.6} opacity={type === 'mesh' ? 0.7 : 1} />;
          })}
          {L.hub && <g><rect x={L.hub.x - 26} y={L.hub.y - 14} width={52} height={28} rx={6} fill="var(--ink)" /><text x={L.hub.x} y={L.hub.y + 4} textAnchor="middle" fill="var(--bg)" fontSize="11">switch</text></g>}
          {L.pts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={14} fill="var(--surface)" stroke="var(--lc,var(--accent))" strokeWidth="2.5" />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="11" fill="var(--ink)">{String.fromCharCode(65 + i)}</text>
            </g>
          ))}
        </svg>
        <div>
          <label style={{ display: 'flex' }}>Nodes n = <b className="mono">{n}</b>
            <input type="range" min="3" max="10" value={n} onChange={(e) => setN(Number(e.target.value))} aria-label="number of nodes" />
          </label>
          <KV items={[['Links', T.links(n)], ['Ports per device', T.ports(n)]]} />
          <div className="note-box"><b>Single point of failure:</b> {T.spof}</div>
        </div>
      </div>
    </Card>
  );
}

const fmtT = (s) => {
  if (!isFinite(s)) return '—';
  if (s >= 1) return `${s.toPrecision(4)} s`;
  if (s >= 1e-3) return `${(s * 1e3).toPrecision(4)} ms`;
  if (s >= 1e-6) return `${(s * 1e6).toPrecision(4)} µs`;
  return `${(s * 1e9).toPrecision(4)} ns`;
};
const fmtBits = (b) => {
  if (b >= 8e6) return `${(b / 8e6).toPrecision(4)} MB (${(b / 1e6).toPrecision(4)} Mbit)`;
  if (b >= 8e3) return `${(b / 8e3).toPrecision(4)} KB (${(b / 1e3).toPrecision(4)} kbit)`;
  return `${b.toPrecision(4)} bits`;
};

export function Delay() {
  const [L, setL] = useState(1500);
  const [R, setR] = useState(10);
  const [d, setD] = useState(2000);
  const [v, setV] = useState(2e8);
  const r = useMemo(() => {
    const Tt = (Number(L) * 8) / (Number(R) * 1e6);
    const Tp = (Number(d) * 1000) / Number(v);
    const a = Tp / Tt;
    return { Tt, Tp, RTT: 2 * Tp, a, eta: 1 / (1 + 2 * a), bdp: Number(R) * 1e6 * 2 * Tp, win: 1 + 2 * a };
  }, [L, R, d, v]);
  const ok = [L, R, d, v].every((x) => Number(x) > 0);
  return (
    <Card title="Delay & efficiency calculator" tag="type numbers">
      <div className="row">
        <label>L (bytes) <input type="number" min="1" value={L} onChange={(e) => setL(e.target.value)} /></label>
        <label>R (Mbps) <input type="number" min="0.001" step="any" value={R} onChange={(e) => setR(e.target.value)} /></label>
        <label>d (km) <input type="number" min="0" step="any" value={d} onChange={(e) => setD(e.target.value)} /></label>
        <label>v <select value={v} onChange={(e) => setV(Number(e.target.value))}>
          <option value={2e8}>2×10⁸ m/s (cable / fibre)</option>
          <option value={3e8}>3×10⁸ m/s (vacuum / radio)</option>
        </select></label>
      </div>
      {ok ? (
        <>
          <KV items={[
            ['Tt = L/R', fmtT(r.Tt)], ['Tp = d/v', fmtT(r.Tp)], ['RTT ≈ 2·Tp', fmtT(r.RTT)], ['a = Tp/Tt', r.a.toPrecision(4)],
            ['Stop-and-wait η', `${(r.eta * 100).toPrecision(3)}%`], ['BDP = R × RTT', fmtBits(r.bdp)], ['Window for 100% (1+2a)', `${Math.ceil(r.win)} packets`],
          ]} />
          <div style={{ marginTop: '.8rem' }}>
            <div className="muted small mono" style={{ marginBottom: '.3rem' }}>One stop-and-wait cycle = Tt (sending) + 2·Tp (waiting for the ACK)</div>
            <div className="meter" style={{ height: 22 }}>
              <i style={{ width: `${Math.max(0.6, r.eta * 100)}%`, background: 'var(--l4)' }} />
            </div>
            <div className="legend"><span><i style={{ background: 'var(--l4)' }} />link busy (Tt)</span><span><i style={{ background: 'var(--surface-2)' }} />link idle, waiting (2·Tp)</span></div>
          </div>
        </>
      ) : <p className="err">Enter positive numbers.</p>}
      <div className="wg-ctl">
        <span className="muted small">Presets:</span>
        <button className="btn sm" onClick={() => { setL(1500); setR(10); setD(2000); setV(2e8); }}>Long link</button>
        <button className="btn sm" onClick={() => { setL(1000); setR(8); setD(2000); setV(2e8); }}>Tt = 1 ms, Tp = 10 ms</button>
        <button className="btn sm" onClick={() => { setL(1500); setR(1000); setD(0.1); setV(2e8); }}>LAN</button>
        <button className="btn sm" onClick={() => { setL(1500); setR(100); setD(36000); setV(3e8); }}>Satellite</button>
      </div>
    </Card>
  );
}
