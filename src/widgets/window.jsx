import { useState } from 'react';
import { Card, KV } from './common.jsx';

/* ---------------- Sliding window ---------------- */
const TOTAL = 16;
const SEG = 100;
const seqOf = (i) => 1000 + i * SEG;

export function SlideWin() {
  const [W, setW] = useState(4);
  const [base, setBase] = useState(0);
  const [next, setNext] = useState(0);
  const [msg, setMsg] = useState('Window = 4 segments (400 bytes). Press Send to put segments in flight.');
  const canSend = next < Math.min(base + W, TOTAL);
  const send = () => { if (!canSend) { setMsg('Window full: the sender must wait for an ACK before sending more.'); return; } setMsg(`Sent bytes ${seqOf(next)}–${seqOf(next) + SEG - 1}. In flight: ${(next + 1 - base) * SEG} B.`); setNext(next + 1); };
  const sendAll = () => { const to = Math.min(base + W, TOTAL); setMsg(`Sent everything the window allows (${(to - base) * SEG} B in flight).`); setNext(to); };
  const ack = () => { if (base >= next) { setMsg('Nothing in flight to acknowledge.'); return; } setMsg(`Receiver sends ACK = ${seqOf(base + 1)} ("send byte ${seqOf(base + 1)} next"). The window slides right by ${SEG} bytes.`); setBase(base + 1); };
  const reset = () => { setBase(0); setNext(0); setMsg('Reset.'); };
  const cls = (i) => (i < base ? 'acked' : i < next ? 'flight' : i < base + W ? 'usable' : '');
  const unit = 'calc(2.3rem + 3px)';
  return (
    <Card title="Sliding window" tag="send & ACK">
      <label style={{ display: 'flex' }}>Window size = <b className="mono">{W} segments ({W * SEG} B)</b>
        <input type="range" min="1" max="8" value={W} onChange={(e) => { setW(Number(e.target.value)); setNext((n) => Math.min(n, base + Number(e.target.value))); }} />
      </label>
      <div className="blocks" aria-label="byte stream">
        <div className="winbox" style={{ left: `calc(${base} * ${unit} - 3px)`, width: `calc(${Math.min(W, TOTAL - base)} * ${unit} + 3px)` }}><span>window [{seqOf(base)} – {seqOf(Math.min(base + W, TOTAL)) - 1}]</span></div>
        {Array.from({ length: TOTAL }, (_, i) => <div key={i} className={'blk ' + cls(i)} title={`bytes ${seqOf(i)}–${seqOf(i) + SEG - 1}`}>{seqOf(i)}</div>)}
      </div>
      <div className="legend"><span><i style={{ background: 'var(--good-soft)', border: '1px solid var(--good)' }} />sent &amp; ACKed</span><span><i style={{ background: 'var(--warn-soft)', border: '1px solid var(--warn)' }} />in flight (sent, not ACKed)</span><span><i style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }} />usable: may send now</span><span><i style={{ background: 'var(--bg)', border: '1px solid var(--line)' }} />not yet allowed</span></div>
      <div className="note-box" aria-live="polite">{msg}</div>
      <div className="wg-ctl">
        <button className="btn sm pri" onClick={send} disabled={next >= TOTAL}>Send 1 segment</button>
        <button className="btn sm" onClick={sendAll} disabled={!canSend}>Send whole window</button>
        <button className="btn sm" onClick={ack} disabled={base >= next}>Receive ACK</button>
        <button className="btn sm" onClick={reset}>Reset</button>
        <span className="muted small mono">in flight {(next - base) * SEG} B · usable {Math.max(0, Math.min(base + W, TOTAL) - next) * SEG} B</span>
      </div>
    </Card>
  );
}

/* ---------------- Effective window ---------------- */
export function EffWin() {
  const [rwnd, setR] = useState(10);
  const [cwnd, setC] = useState(6);
  const eff = Math.min(rwnd, cwnd);
  const lim = rwnd < cwnd ? 'receiver-limited (flow control)' : cwnd < rwnd ? 'network-limited (congestion control)' : 'both equal';
  const bar = (v, c) => <div className="meter"><i style={{ width: `${(v / 20) * 100}%`, background: c }} /></div>;
  return (
    <Card title="Effective window = min(rwnd, cwnd)" tag="drag the sliders">
      <div className="two">
        <div>
          <label style={{ display: 'flex' }}>rwnd (receiver advertises) <b className="mono">{rwnd} KB</b><input type="range" min="0" max="20" value={rwnd} onChange={(e) => setR(Number(e.target.value))} /></label>
          {bar(rwnd, 'var(--l3)')}
          <label style={{ display: 'flex', marginTop: '.6rem' }}>cwnd (sender's estimate of the network) <b className="mono">{cwnd} KB</b><input type="range" min="1" max="20" value={cwnd} onChange={(e) => setC(Number(e.target.value))} /></label>
          {bar(cwnd, 'var(--l7)')}
          <div style={{ marginTop: '.6rem' }}><span className="small">Effective window</span>{bar(eff, 'var(--l4)')}</div>
        </div>
        <div>
          <KV items={[['Effective window', `${eff} KB`], ['Limited by', lim]]} />
          <div className="note-box">
            {rwnd === 0 ? <><b>Zero window.</b> The receiver's buffer is full: the sender stops and starts the persist timer, sending small window probes.</>
              : rwnd < cwnd ? <>The <b>receiver</b> is the bottleneck: its buffer (rwnd) is smaller than what the network could take.</>
                : cwnd < rwnd ? <>The <b>network</b> is the bottleneck: congestion control (cwnd) holds the sender back even though the receiver has room.</>
                  : <>Both limits are equal.</>}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ---------------- Go-Back-N vs Selective Repeat ---------------- */
function build(kind, N, total, k) {
  const out = [];
  const firstEnd = Math.min(k + N - 1, total);
  for (let i = 1; i <= firstEnd; i++) out.push({ i, s: i < k ? 'ok' : i === k ? 'lost' : kind === 'gbn' ? 'disc' : 'buf' });
  if (kind === 'gbn') for (let i = k; i <= firstEnd; i++) out.push({ i, s: 're' });
  else out.push({ i: k, s: 're' });
  for (let i = firstEnd + 1; i <= total; i++) out.push({ i, s: 'ok' });
  return out;
}
const S_CLS = { ok: 'acked', lost: 'lost', disc: 'flight', buf: 'usable', re: 'acked re' };

export function GbnSr() {
  const [N, setN] = useState(4);
  const [total, setTotal] = useState(8);
  const [k, setK] = useState(3);
  const Ni = Math.max(1, Math.min(16, Number(N) || 1)); const Ti = Math.max(1, Math.min(24, Number(total) || 1)); const ki = Math.max(1, Math.min(Ti, Number(k) || 1));
  const gbn = build('gbn', Ni, Ti, ki);
  const sr = build('sr', Ni, Ti, ki);
  const Row = ({ label, list }) => (
    <div style={{ marginTop: '.7rem' }}>
      <div className="small"><b>{label}</b> · {list.length} transmissions ({list.length - Ti} extra)</div>
      <div className="blocks" style={{ padding: '.3rem 0' }}>
        {list.map((p, j) => <div key={j} className={'blk ' + S_CLS[p.s]} title={p.s}>{p.s === 'lost' ? `${p.i}✗` : p.i}</div>)}
      </div>
    </div>
  );
  return (
    <Card title="Go-Back-N vs Selective Repeat" tag="lose one packet">
      <div className="row">
        <label>Window N <input type="number" min="1" max="16" value={N} onChange={(e) => setN(e.target.value)} /></label>
        <label>Packets <input type="number" min="1" max="24" value={total} onChange={(e) => setTotal(e.target.value)} /></label>
        <label>Lost packet k <input type="number" min="1" max={Ti} value={k} onChange={(e) => setK(e.target.value)} /></label>
      </div>
      <Row label="Go-Back-N" list={gbn} />
      <Row label="Selective Repeat" list={sr} />
      <div className="legend"><span><i style={{ background: 'var(--bad-soft)', border: '1px solid var(--bad)' }} />lost</span><span><i style={{ background: 'var(--warn-soft)', border: '1px solid var(--warn)' }} />GBN: arrived but discarded (out of order)</span><span><i style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }} />SR: arrived and buffered</span><span><i style={{ background: 'var(--good-soft)', outline: '2px solid var(--bad)' }} />retransmission</span></div>
      <div className="note-box">Packet {ki} is lost. GBN's receiver throws away the {Math.min(Ni - 1, Ti - ki)} packet(s) after it, so the sender resends {ki}…{Math.min(ki + Ni - 1, Ti)}: <b>{gbn.length}</b> transmissions. SR buffers them and resends only {ki}: <b>{sr.length}</b>.</div>
    </Card>
  );
}
