import { useEffect, useRef, useState } from 'react';
import { Card, Tabs, reducedMotion } from './common.jsx';
import { HeaderGrid } from './HeaderGrid.jsx';

/* ---------------- TCP + UDP headers ---------------- */
const TCP = [
  { k: 'sp', name: 'Source Port', bits: 16, c: 'var(--l4)', d: 'Sending process\'s port (usually a random ephemeral port 49152–65535 on clients).' },
  { k: 'dp', name: 'Destination Port', bits: 16, c: 'var(--l4)', d: 'Receiving process\'s port, e.g. 443. Used for demultiplexing.' },
  { k: 'seq', name: 'Sequence Number', bits: 32, c: 'var(--l3)', d: '32-bit number of the first data byte in this segment (or the ISN on a SYN). Counts bytes, wraps after 4 GB.' },
  { k: 'ack', name: 'Acknowledgement Number', bits: 32, c: 'var(--l3)', d: 'Next byte the sender of this segment expects to receive. Valid when the ACK flag is set (cumulative ACK).' },
  { k: 'off', name: 'Data Offset', short: 'Off', bits: 4, d: 'Header length in 4-byte words: 5–15 → 20–60 bytes.' },
  { k: 'res', name: 'Reserved', short: 'Rsv', bits: 4, c: 'var(--muted)', d: 'Reserved, must be zero.' },
  { k: 'cwr', name: 'CWR flag', short: 'C', bits: 1, c: 'var(--warn)', d: 'Congestion Window Reduced: sender tells the receiver it reacted to an ECN echo.' },
  { k: 'ece', name: 'ECE flag', short: 'E', bits: 1, c: 'var(--warn)', d: 'ECN-Echo: receiver tells the sender a router marked congestion (ECN).' },
  { k: 'urg', name: 'URG flag', short: 'U', bits: 1, c: 'var(--warn)', d: 'Urgent pointer field is valid. Rarely used.' },
  { k: 'ackf', name: 'ACK flag', short: 'A', bits: 1, c: 'var(--warn)', d: 'Acknowledgement number is valid. Set on every segment after the initial SYN.' },
  { k: 'psh', name: 'PSH flag', short: 'P', bits: 1, c: 'var(--warn)', d: 'Push: deliver the data to the application immediately instead of buffering.' },
  { k: 'rst', name: 'RST flag', short: 'R', bits: 1, c: 'var(--warn)', d: 'Reset: abort the connection immediately (closed port, error).' },
  { k: 'syn', name: 'SYN flag', short: 'S', bits: 1, c: 'var(--warn)', d: 'Synchronise sequence numbers: connection setup. Consumes one sequence number.' },
  { k: 'fin', name: 'FIN flag', short: 'F', bits: 1, c: 'var(--warn)', d: 'Finished sending: graceful close of one direction. Consumes one sequence number.' },
  { k: 'win', name: 'Window Size', bits: 16, c: 'var(--l7)', d: 'Receive window (rwnd): how many more bytes the receiver can accept. 16 bits = 65,535 max; the window-scale option multiplies it. This is flow control.' },
  { k: 'ck', name: 'Checksum', bits: 16, c: 'var(--bad)', d: 'Covers header + data + a pseudo-header (source/destination IP, protocol, length). Mandatory in TCP.' },
  { k: 'urp', name: 'Urgent Pointer', bits: 16, c: 'var(--muted)', d: 'Offset of the end of urgent data when URG is set.' },
  { k: 'opt', name: 'Options (0–40 B): MSS, window scale, SACK-permitted, timestamps', bits: 33, c: 'var(--muted)', d: 'Negotiated mostly in the SYN / SYN-ACK. MSS on Ethernet = 1460.' },
];
const UDP = [
  { k: 'sp', name: 'Source Port', bits: 16, c: 'var(--l4)', d: 'Sender\'s port (optional: may be 0 if no reply is expected).' },
  { k: 'dp', name: 'Destination Port', bits: 16, c: 'var(--l4)', d: 'Receiver\'s port: UDP demultiplexes on (destination IP, destination port) only.' },
  { k: 'len', name: 'Length', bits: 16, d: 'Header + data in bytes (minimum 8).' },
  { k: 'ck', name: 'Checksum', bits: 16, c: 'var(--bad)', d: 'Optional in IPv4 (0 = not used), mandatory in IPv6.' },
];

export function TcpHdr() {
  const [t, setT] = useState('tcp');
  return (
    <Card title="TCP vs UDP header" tag="click a field">
      <Tabs items={[['tcp', 'TCP header (20–60 B)'], ['udp', 'UDP header (8 B)']]} value={t} onChange={setT} />
      {t === 'tcp' ? <HeaderGrid key="t" fields={TCP} initial="seq" caption="TCP header" /> : <HeaderGrid key="u" fields={UDP} initial="len" caption="UDP header" />}
      <p className="muted small" style={{ margin: '.5rem 0 0' }}>{t === 'tcp' ? '5 rows of 32 bits = 20 bytes minimum, plus options.' : 'Just 2 rows of 32 bits = 8 bytes. No sequence numbers, no ACKs, no window.'}</p>
    </Card>
  );
}

/* ---------------- Multiplexing / demultiplexing ---------------- */
const APPS = [
  { name: 'Chrome', port: 52100, rport: 443, c: 'var(--l7)' },
  { name: 'Spotify', port: 53210, rport: 4070, c: 'var(--l4)' },
  { name: 'Discord', port: 50005, rport: 50002, c: 'var(--l3)' },
];
const Y = [45, 120, 195];
function pathFor(i, dir) {
  const out = [[95, Y[i]], [190, Y[i]], [250, 120], [500, 120]];
  return dir === 'out' ? out : [...out].reverse();
}
function along(pts, t) {
  const seg = pts.slice(1).map((p, k) => Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1]));
  const tot = seg.reduce((a, b) => a + b, 0);
  let d = t * tot;
  for (let k = 0; k < seg.length; k++) {
    if (d <= seg[k]) { const r = d / seg[k]; return [pts[k][0] + r * (pts[k + 1][0] - pts[k][0]), pts[k][1] + r * (pts[k + 1][1] - pts[k][1])]; }
    d -= seg[k];
  }
  return pts[pts.length - 1];
}

export function Mux() {
  const [dir, setDir] = useState('out');
  const [pk, setPk] = useState([]);
  const [run, setRun] = useState(!reducedMotion());
  const raf = useRef(0);
  const born = useRef(0);
  useEffect(() => {
    if (!run) return undefined;
    let list = [];
    let last = 0; let n = 0;
    const tick = (now) => {
      if (now - last > 520) { list.push({ id: born.current++, app: n % 3, t0: now }); last = now; n++; }
      list = list.filter((p) => now - p.t0 < 2600);
      setPk(list.map((p) => ({ ...p, t: (now - p.t0) / 2600 })));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [run, dir]);
  const out = dir === 'out';
  return (
    <Card title={out ? 'Multiplexing (sending)' : 'Demultiplexing (receiving)'} tag="ports in action">
      <Tabs items={[['out', 'Sender: mux'], ['in', 'Receiver: demux']]} value={dir} onChange={setDir} />
      <div className="svg-wrap">
        <svg viewBox="0 0 520 240" style={{ minWidth: 400 }} role="img" aria-label="Three apps sharing one network connection">
          {APPS.map((a, i) => (
            <g key={a.name}>
              <polyline points={pathFor(i, 'out').map((p) => p.join(',')).join(' ')} fill="none" stroke="var(--line)" strokeWidth="3" />
              <rect x={8} y={Y[i] - 20} width={88} height={40} rx={8} fill={`color-mix(in srgb, ${a.c} 18%, var(--surface))`} stroke={a.c} strokeWidth="2" />
              <text x={52} y={Y[i] - 2} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--ink)">{a.name}</text>
              <text x={52} y={Y[i] + 13} textAnchor="middle" className="svgmut" fontSize="10">port {a.port}</text>
            </g>
          ))}
          <rect x={222} y={78} width={58} height={84} rx={8} fill="var(--ink)" />
          <text x={251} y={112} textAnchor="middle" fill="var(--bg)" fontSize="11" fontWeight="600">TCP/</text>
          <text x={251} y={126} textAnchor="middle" fill="var(--bg)" fontSize="11" fontWeight="600">UDP</text>
          <text x={251} y={146} textAnchor="middle" fill="var(--bg)" fontSize="9.5">{out ? 'mux' : 'demux'}</text>
          <text x={500} y={108} textAnchor="end" className="svgmut">{out ? '→ one IP / network' : '← from the network'}</text>
          {pk.map((p) => {
            const [x, y] = along(pathFor(p.app, dir), p.t);
            return <g key={p.id}><circle cx={x} cy={y} r={7} fill={APPS[p.app].c} stroke="var(--surface)" strokeWidth="2" />{x > 290 && <text x={x} y={y - 11} textAnchor="middle" fontSize="9" fill="var(--ink)">{out ? APPS[p.app].rport : APPS[p.app].port}</text>}</g>;
          })}
        </svg>
      </div>
      <div className="note-box">
        {out ? <>Three apps send at once. Transport stamps each segment with its <b>source port</b> (and destination port) and hands them all to the single IP layer: <b>multiplexing</b>. Numbers above the dots = destination port.</>
          : <>Segments arrive mixed together. Transport reads each one's <b>destination port</b> (the number on the dot) and delivers it to the matching socket: <b>demultiplexing</b>. TCP matches the full 4-tuple; UDP just (dst IP, dst port).</>}
      </div>
      <div className="wg-ctl"><button className="btn sm" onClick={() => setRun((r) => !r)}>{run ? '❚❚ Pause' : '▶ Play'}</button></div>
    </Card>
  );
}

/* ---------------- Seq / ACK calculator ---------------- */
export function SeqCalc() {
  const [x, setX] = useState(1000);
  const [y, setY] = useState(5000);
  const [segs, setSegs] = useState('500, 300, 200');
  const [resp, setResp] = useState(1200);
  const list = segs.split(/[\s,]+/).filter(Boolean).map(Number);
  const ok = list.length && list.every((n) => Number.isInteger(n) && n > 0) && Number.isFinite(Number(x)) && Number.isFinite(Number(y)) && Number(resp) >= 0;
  const rows = [];
  if (ok) {
    let cs = Number(x); let ss = Number(y);
    rows.push({ d: 'C → S', f: 'SYN', seq: cs, ack: '—', len: '0 (+1)', n: 'SYN consumes 1' }); cs += 1;
    rows.push({ d: 'S → C', f: 'SYN, ACK', seq: ss, ack: cs, len: '0 (+1)', n: `Ack = ${cs - 1} + 1` }); ss += 1;
    rows.push({ d: 'C → S', f: 'ACK', seq: cs, ack: ss, len: 0, n: 'Pure ACK consumes 0' });
    for (const L of list) {
      rows.push({ d: 'C → S', f: 'PSH, ACK', seq: cs, ack: ss, len: L, n: `bytes ${cs} … ${cs + L - 1}`, data: true });
      cs += L;
      rows.push({ d: 'S → C', f: 'ACK', seq: ss, ack: cs, len: 0, n: `next byte expected = ${cs}` });
    }
    if (Number(resp) > 0) {
      const R = Number(resp);
      rows.push({ d: 'S → C', f: 'PSH, ACK', seq: ss, ack: cs, len: R, n: `server's bytes ${ss} … ${ss + R - 1}`, data: true });
      ss += R;
      rows.push({ d: 'C → S', f: 'ACK', seq: cs, ack: ss, len: 0, n: `next byte expected = ${ss}` });
    }
    rows.push({ d: 'C → S', f: 'FIN, ACK', seq: cs, ack: ss, len: '0 (+1)', n: 'FIN consumes 1' }); cs += 1;
    rows.push({ d: 'S → C', f: 'ACK', seq: ss, ack: cs, len: 0, n: `Ack = FIN seq + 1 = ${cs}` });
    rows.push({ d: 'S → C', f: 'FIN, ACK', seq: ss, ack: cs, len: '0 (+1)', n: 'Server closes its side' }); ss += 1;
    rows.push({ d: 'C → S', f: 'ACK', seq: cs, ack: ss, len: 0, n: 'Client → TIME_WAIT' });
  }
  return (
    <Card title="Sequence & ACK number calculator" tag="whole connection">
      <div className="row">
        <label>Client ISN <input type="number" value={x} onChange={(e) => setX(e.target.value)} /></label>
        <label>Server ISN <input type="number" value={y} onChange={(e) => setY(e.target.value)} /></label>
        <label>Client segment sizes <input type="text" value={segs} onChange={(e) => setSegs(e.target.value)} style={{ width: '9rem' }} /></label>
        <label>Server reply bytes <input type="number" min="0" value={resp} onChange={(e) => setResp(e.target.value)} /></label>
      </div>
      {!ok ? <p className="err">Enter whole numbers; segment sizes separated by commas.</p> : (
        <div className="tbl"><table>
          <thead><tr><th>#</th><th>Dir</th><th>Flags</th><th>Seq</th><th>Ack</th><th>Len</th><th>Why</th></tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={i} className={r.data ? 'hl' : ''}><td className="n">{i + 1}</td><td className="mono">{r.d}</td><td className="mono">{r.f}</td><td className="n">{r.seq}</td><td className="n">{r.ack}</td><td className="n">{r.len}</td><td className="small">{r.n}</td></tr>
          ))}</tbody>
        </table></div>
      )}
      <p className="muted small" style={{ margin: '.5rem 0 0' }}>Rules: next Seq = Seq + Len · ACK = next byte expected · SYN and FIN each consume one number · pure ACKs consume none.</p>
    </Card>
  );
}
