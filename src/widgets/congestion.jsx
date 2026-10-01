import { useMemo, useState } from 'react';
import { Card } from './common.jsx';
import { simulateCwnd } from '../lib/netmath.js';

const W = 640; const H = 320; const M = { l: 44, r: 16, t: 18, b: 40 };

export function Cwnd() {
  const [ss0, setSs0] = useState(16);
  const [dup, setDup] = useState(10);
  const [to, setTo] = useState(18);
  const [R, setR] = useState(26);
  const [showT, setShowT] = useState(true);
  const [showR, setShowR] = useState(true);
  const [hover, setHover] = useState(null);
  const [table, setTable] = useState(false);

  const p = { ssthresh: Math.max(2, Number(ss0) || 2), dupRound: Number(dup) || 0, timeoutRound: Number(to) || 0, rounds: Math.max(4, Math.min(60, Number(R) || 4)) };
  const tahoe = useMemo(() => simulateCwnd({ ...p, variant: 'tahoe' }), [p.ssthresh, p.dupRound, p.timeoutRound, p.rounds]); // eslint-disable-line react-hooks/exhaustive-deps
  const reno = useMemo(() => simulateCwnd({ ...p, variant: 'reno' }), [p.ssthresh, p.dupRound, p.timeoutRound, p.rounds]); // eslint-disable-line react-hooks/exhaustive-deps
  const maxY = Math.max(...tahoe.map((r) => Math.max(r.cwnd, r.ssthresh)), ...reno.map((r) => Math.max(r.cwnd, r.ssthresh))) * 1.08;
  const x = (r) => M.l + ((r - 1) / (p.rounds - 1)) * (W - M.l - M.r);
  const y = (v) => H - M.b - (v / maxY) * (H - M.t - M.b);
  const line = (rows, key) => rows.map((r, i) => `${i ? 'L' : 'M'}${x(r.round).toFixed(1)},${y(r[key]).toFixed(1)}`).join(' ');
  const stepLine = (rows) => rows.map((r, i) => `${i ? 'L' : 'M'}${x(r.round).toFixed(1)},${y(r.ssthresh).toFixed(1)}${i < rows.length - 1 ? ` L${x(r.round + 1).toFixed(1)},${y(r.ssthresh).toFixed(1)}` : ''}`).join(' ');
  const yTicks = [];
  const step = maxY > 40 ? 10 : maxY > 20 ? 5 : 2;
  for (let v = 0; v <= maxY; v += step) yTicks.push(v);
  const h = hover != null ? { t: tahoe[hover - 1], r: reno[hover - 1] } : null;

  return (
    <Card title="cwnd over time: Tahoe vs Reno" tag="key widget">
      <div className="row">
        <label>Initial ssthresh <input type="number" min="2" max="64" value={ss0} onChange={(e) => setSs0(e.target.value)} /></label>
        <label>3 dup ACKs at round <input type="number" min="0" max="60" value={dup} onChange={(e) => setDup(e.target.value)} /></label>
        <label>Timeout at round <input type="number" min="0" max="60" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        <label>Rounds <input type="number" min="4" max="60" value={R} onChange={(e) => setR(e.target.value)} /></label>
      </div>
      <div className="row" style={{ marginTop: '.4rem' }}>
        <label><input type="checkbox" checked={showT} onChange={(e) => setShowT(e.target.checked)} /> <b style={{ color: 'var(--l3)' }}>Tahoe</b></label>
        <label><input type="checkbox" checked={showR} onChange={(e) => setShowR(e.target.checked)} /> <b style={{ color: 'var(--l7)' }}>Reno</b></label>
        <span className="muted small">Set a round to 0 to switch that event off.</span>
      </div>
      <div className="svg-wrap" style={{ marginTop: '.5rem' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 480 }} role="img" aria-label="Congestion window per round for TCP Tahoe and Reno" onMouseLeave={() => setHover(null)}>
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={M.l} x2={W - M.r} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth="1" opacity=".6" />
              <text x={M.l - 8} y={y(v) + 4} textAnchor="end" className="svgmut">{v}</text>
            </g>
          ))}
          {tahoe.map((r) => (r.round % (p.rounds > 30 ? 5 : 2) === 1 || p.rounds <= 16) && <text key={r.round} x={x(r.round)} y={H - M.b + 16} textAnchor="middle" className="svgmut">{r.round}</text>)}
          <text x={(W + M.l) / 2} y={H - 6} textAnchor="middle" className="svgmut">transmission round (RTT)</text>
          <text x={12} y={M.t + 4} className="svgmut">cwnd (MSS)</text>
          {[[p.dupRound, '3 dup ACKs'], [p.timeoutRound, 'timeout']].map(([r, lbl]) => r > 0 && r <= p.rounds && (
            <g key={lbl}>
              <line x1={x(r)} x2={x(r)} y1={M.t} y2={H - M.b} stroke="var(--bad)" strokeDasharray="3 3" />
              <text x={x(r) + 4} y={M.t + 10} fontSize="11" fill="var(--bad)" fontWeight="600">{lbl}</text>
            </g>
          ))}
          {showT && <path d={stepLine(tahoe)} fill="none" stroke="var(--l3)" strokeWidth="1.4" strokeDasharray="6 4" opacity=".8" />}
          {showR && <path d={stepLine(reno)} fill="none" stroke="var(--l7)" strokeWidth="1.4" strokeDasharray="6 4" opacity=".8" />}
          {showT && <path d={line(tahoe, 'cwnd')} fill="none" stroke="var(--l3)" strokeWidth="2.6" />}
          {showR && <path d={line(reno, 'cwnd')} fill="none" stroke="var(--l7)" strokeWidth="2.6" />}
          {showT && tahoe.map((r) => <circle key={'t' + r.round} cx={x(r.round)} cy={y(r.cwnd)} r={hover === r.round ? 5 : 3} fill="var(--l3)" />)}
          {showR && reno.map((r) => <circle key={'r' + r.round} cx={x(r.round)} cy={y(r.cwnd)} r={hover === r.round ? 5 : 3} fill="var(--l7)" />)}
          {hover && <line x1={x(hover)} x2={x(hover)} y1={M.t} y2={H - M.b} stroke="var(--ink)" opacity=".35" />}
          {tahoe.map((r) => {
            const w = (W - M.l - M.r) / (p.rounds - 1);
            return <rect key={'h' + r.round} x={x(r.round) - w / 2} y={M.t} width={w} height={H - M.t - M.b} fill="transparent" onMouseEnter={() => setHover(r.round)} onClick={() => setHover(r.round)} />;
          })}
        </svg>
      </div>
      <div className="legend"><span><i style={{ background: 'var(--l3)' }} />Tahoe cwnd</span><span><i style={{ background: 'var(--l7)' }} />Reno cwnd</span><span>dashed = ssthresh</span></div>
      <div className="chart-tip note-box" aria-live="polite">
        {h ? <>
          <b>Round {hover}.</b> Tahoe cwnd = {h.t.cwnd} ({h.t.phase}, ssthresh {h.t.ssthresh}) · Reno cwnd = {h.r.cwnd} ({h.r.phase}, ssthresh {h.r.ssthresh})
          {h.t.event && <> · <b className="bad-t">{h.t.event}</b>{tahoe[hover] ? <> → next round: Tahoe cwnd {tahoe[hover].cwnd} (ssthresh {tahoe[hover].ssthresh}), Reno cwnd {reno[hover].cwnd} (ssthresh {reno[hover].ssthresh})</> : null}</>}
        </> : 'Hover or tap the chart to read any round. Slow start doubles cwnd (capped at ssthresh), congestion avoidance adds 1 per round.'}
      </div>
      <div className="wg-ctl">
        <button className="btn sm" onClick={() => { setSs0(16); setDup(10); setTo(18); setR(26); }}>Default scenario</button>
        <button className="btn sm" onClick={() => { setSs0(64); setDup(5); setTo(0); setR(14); }}>Notes example: 16 → 3 dup ACKs</button>
        <button className="btn sm" onClick={() => { setSs0(64); setDup(0); setTo(5); setR(14); }}>Notes example: 16 → timeout</button>
        <button className="btn sm" onClick={() => setTable((t) => !t)}>{table ? 'Hide' : 'Show'} table</button>
      </div>
      {table && (
        <div className="tbl" style={{ maxHeight: '18rem', overflowY: 'auto' }}><table>
          <thead><tr><th>Round</th><th>Tahoe cwnd</th><th>Tahoe ssthresh</th><th>Reno cwnd</th><th>Reno ssthresh</th><th>Event</th></tr></thead>
          <tbody>{tahoe.map((r, i) => <tr key={r.round} className={r.event ? 'hl' : ''}><td className="n">{r.round}</td><td className="n">{r.cwnd}</td><td className="n">{r.ssthresh}</td><td className="n">{reno[i].cwnd}</td><td className="n">{reno[i].ssthresh}</td><td>{r.event || ''}</td></tr>)}</tbody>
        </table></div>
      )}
      <p className="muted small" style={{ margin: '.5rem 0 0' }}>Rules: start cwnd = 1. Slow start doubles (capped at ssthresh); congestion avoidance +1. 3 dup ACKs → ssthresh = max(⌊cwnd/2⌋, 2), Tahoe cwnd = 1, Reno cwnd = ssthresh. Timeout → ssthresh = max(⌊cwnd/2⌋, 2), cwnd = 1. The event takes effect in the next round.</p>
    </Card>
  );
}
