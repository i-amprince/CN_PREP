import { useState } from 'react';
import { Card, useStepper, StepControls } from './common.jsx';
import { lpm, parseIp, parseCidr, maskOf, ipStr } from '../lib/netmath.js';

/* ---------------- NAT / PAT ---------------- */
const NAT_STEPS = [
  { where: 'lan', who: 'Laptop', src: '192.168.1.10:5000', dst: '142.250.1.1:443', rows: 0, hl: -1, t: 'Your laptop (private IP) opens a connection to Google. Source = 192.168.1.10:5000.' },
  { where: 'wan', who: 'Laptop', src: '49.x.x.x:30001', dst: '142.250.1.1:443', rows: 1, hl: 0, chg: 'src', t: 'The router rewrites the SOURCE to its public IP and a free port, and records the mapping in its translation table. Google never sees 192.168.1.10.' },
  { where: 'lan', who: 'Phone', src: '192.168.1.11:5000', dst: '142.250.1.1:443', rows: 1, hl: -1, t: 'Your phone also connects to Google, by coincidence from the same source port 5000.' },
  { where: 'wan', who: 'Phone', src: '49.x.x.x:30002', dst: '142.250.1.1:443', rows: 2, hl: 1, chg: 'src', t: 'Same public IP, different public port (30002). The PORT is what tells the two devices apart: this is PAT / NAT overload.' },
  { where: 'wan', who: 'Google', src: '142.250.1.1:443', dst: '49.x.x.x:30001', rows: 2, hl: 0, back: true, t: 'Google replies to 49.x.x.x:30001. The router looks up port 30001 in its table…' },
  { where: 'lan', who: 'Google', src: '142.250.1.1:443', dst: '192.168.1.10:5000', rows: 2, hl: 0, back: true, chg: 'dst', t: '…and rewrites the DESTINATION back to 192.168.1.10:5000, so the reply reaches the laptop.' },
  { where: 'wan', who: 'Stranger', src: '203.0.113.9:6000', dst: '49.x.x.x:40000', rows: 2, hl: -1, back: true, drop: true, t: 'An unsolicited packet arrives for port 40000. No table entry → dropped. That is why hosting a server behind NAT needs port forwarding.' },
];

export function Nat() {
  const st = useStepper(NAT_STEPS.length, { interval: 2000 });
  const s = NAT_STEPS[st.i];
  const table = [
    ['192.168.1.10:5000', '49.x.x.x:30001', '142.250.1.1:443'],
    ['192.168.1.11:5000', '49.x.x.x:30002', '142.250.1.1:443'],
  ].slice(0, s.rows);
  const px = s.where === 'lan' ? (s.back ? 70 : 150) : (s.back ? 420 : 340);
  return (
    <Card title="NAT / PAT translation" tag="step through">
      <div className="svg-wrap">
        <svg viewBox="0 0 520 170" style={{ minWidth: 420 }} role="img" aria-label="Private network, NAT router, Internet">
          <rect x={6} y={10} width={210} height={150} rx={12} fill="color-mix(in srgb,var(--l4) 8%,transparent)" stroke="var(--l4)" strokeDasharray="5 4" />
          <text x={16} y={30} className="svgmut">Private LAN 192.168.1.0/24</text>
          <rect x={304} y={10} width={210} height={150} rx={12} fill="color-mix(in srgb,var(--l3) 8%,transparent)" stroke="var(--l3)" strokeDasharray="5 4" />
          <text x={504} y={30} textAnchor="end" className="svgmut">Internet</text>
          <line x1={216} y1={95} x2={304} y2={95} stroke="var(--muted)" strokeWidth="3" />
          <rect x={222} y={70} width={76} height={50} rx={8} fill="var(--ink)" />
          <text x={260} y={92} textAnchor="middle" fill="var(--bg)" fontSize="12" fontWeight="600">NAT router</text>
          <text x={260} y={108} textAnchor="middle" fill="var(--bg)" fontSize="9.5">49.x.x.x</text>
          <text x={40} y={70} fontSize="11" fill="var(--ink)">Laptop .10</text>
          <text x={40} y={140} fontSize="11" fill="var(--ink)">Phone .11</text>
          <text x={470} y={70} textAnchor="end" fontSize="11" fill="var(--ink)">Google 142.250.1.1</text>
          <g className="moving" style={{ transform: `translate(${px - 64}px, 78px)` }}>
            <rect width={128} height={36} rx={6} fill={s.drop ? 'var(--bad-soft)' : 'var(--warn-soft)'} stroke={s.drop ? 'var(--bad)' : 'var(--warn)'} />
            <text x={6} y={14} fontSize="9.5" fill="var(--ink)" fontWeight={s.chg === 'src' ? 700 : 400}>src {s.src}</text>
            <text x={6} y={28} fontSize="9.5" fill="var(--ink)" fontWeight={s.chg === 'dst' ? 700 : 400}>dst {s.dst}</text>
          </g>
          {s.drop && <text x={420} y={140} textAnchor="middle" fill="var(--bad)" fontSize="12" fontWeight="700">✗ dropped</text>}
        </svg>
      </div>
      <div className="tbl">
        <table>
          <thead><tr><th>Inside (private)</th><th>Outside (public)</th><th>Remote</th></tr></thead>
          <tbody>
            {table.length === 0 && <tr><td colSpan={3} className="muted">Translation table is empty.</td></tr>}
            {table.map((r, i) => <tr key={i} className={s.hl === i ? 'hl' : ''}>{r.map((c, j) => <td key={j} className="mono">{c}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
      <div className="note-box" aria-live="polite"><b>Step {st.i + 1}.</b> {s.t}</div>
      <StepControls st={st} />
    </Card>
  );
}

/* ---------------- Hop by hop: MAC changes, IP stays ---------------- */
const NODES = ['Laptop', 'R1', 'R2', 'Server'];
function hopRows(nat) {
  const srcIp = '192.168.1.10';
  return [
    { link: 'Laptop → R1', sm: 'AA:01 (Laptop)', dm: 'R1:a (R1 eth0)', si: srcIp, di: '142.250.1.1', ttl: 64 },
    { link: 'R1 → R2', sm: 'R1:b (R1 eth1)', dm: 'R2:a (R2 eth0)', si: nat ? '49.x.x.x (NAT)' : srcIp, di: '142.250.1.1', ttl: 63 },
    { link: 'R2 → Server', sm: 'R2:b (R2 eth1)', dm: 'SV:01 (Server)', si: nat ? '49.x.x.x (NAT)' : srcIp, di: '142.250.1.1', ttl: 62 },
  ];
}
export function Hops() {
  const [nat, setNat] = useState(false);
  const st = useStepper(3, { interval: 1800 });
  const rows = hopRows(nat);
  const cols = [['sm', 'Src MAC'], ['dm', 'Dst MAC'], ['si', 'Src IP'], ['di', 'Dst IP'], ['ttl', 'TTL']];
  const xs = [50, 190, 330, 470];
  return (
    <Card title="Hop by hop: what changes?" tag="step through links">
      <div className="svg-wrap">
        <svg viewBox="0 0 520 90" style={{ minWidth: 420 }} role="img" aria-label="Laptop to R1 to R2 to Server">
          {xs.slice(0, 3).map((x, i) => <line key={i} x1={x} y1={45} x2={xs[i + 1]} y2={45} stroke={i === st.i ? 'var(--lc,var(--accent))' : 'var(--line)'} strokeWidth={i === st.i ? 4 : 3} />)}
          {NODES.map((n, i) => (
            <g key={n}>
              <rect x={xs[i] - 38} y={28} width={76} height={34} rx={8} fill={i === 0 || i === 3 ? 'var(--surface)' : 'var(--ink)'} stroke="var(--ink)" strokeWidth="1.5" />
              <text x={xs[i]} y={50} textAnchor="middle" fontSize="12" fontWeight="600" fill={i === 0 || i === 3 ? 'var(--ink)' : 'var(--bg)'}>{n}</text>
            </g>
          ))}
          <circle r={7} className="pkt moving" style={{ transform: `translate(${(xs[st.i] + xs[st.i + 1]) / 2}px, 45px)` }} />
          <text x={(xs[st.i] + xs[st.i + 1]) / 2} y={20} textAnchor="middle" className="svgmut">link {st.i + 1}</text>
        </svg>
      </div>
      <div className="tbl">
        <table>
          <thead><tr><th>Link</th>{cols.map(([, h]) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i === st.i ? 'hl' : i > st.i ? 'dimrow' : ''}>
                <td>{r.link}</td>
                {cols.map(([k]) => <td key={k} className={'mono' + (i > 0 && i <= st.i && r[k] !== rows[i - 1][k] ? ' chg' : '')}>{i > st.i ? '…' : r[k]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="note-box" aria-live="polite">
        {st.i === 0 && <>The laptop puts <b>R1's MAC</b> as destination (found by ARP for the gateway) but <b>the server's IP</b> as destination IP.</>}
        {st.i === 1 && <>R1 strips the old frame, does a longest-prefix lookup, decrements TTL and builds a <b>new frame</b>: both MACs change (highlighted). {nat ? <b>With NAT, R1 also rewrites the source IP.</b> : 'The IP addresses stay the same.'}</>}
        {st.i === 2 && <>Same again at R2: new MACs, TTL − 1, IPs unchanged{nat ? ' (still the NAT public address)' : ''}. The server sees Src IP = {rows[2].si}.</>}
      </div>
      <StepControls st={st} label={`Link ${st.i + 1} / 3`}>
        <label><input type="checkbox" checked={nat} onChange={(e) => setNat(e.target.checked)} /> NAT at R1</label>
      </StepControls>
    </Card>
  );
}

/* ---------------- Longest prefix match ---------------- */
const TABLE = [
  { prefix: '10.0.0.0/8', hop: 'Router A' },
  { prefix: '10.1.0.0/16', hop: 'Router B' },
  { prefix: '10.1.2.0/24', hop: 'Router C' },
  { prefix: '172.16.0.0/16', hop: 'Router D' },
  { prefix: '0.0.0.0/0', hop: 'ISP (default route)' },
];
export function Lpm() {
  const [ip, setIp] = useState('10.1.2.50');
  const r = lpm(TABLE, ip);
  const ipN = parseIp(ip);
  return (
    <Card title="Longest prefix match" tag="type a destination">
      <div className="row">
        <label>Destination IP <input type="text" value={ip} onChange={(e) => setIp(e.target.value)} style={{ width: '10rem' }} /></label>
        {['10.1.2.50', '10.1.9.9', '10.200.0.1', '172.16.5.5', '8.8.8.8'].map((p) => <button key={p} className="btn sm" onClick={() => setIp(p)}>{p}</button>)}
      </div>
      {!r ? <p className="err">Enter a valid IPv4 address.</p> : (
        <>
          <div className="tbl">
            <table>
              <thead><tr><th>Prefix</th><th>Next hop</th><th>Dest AND mask</th><th>Match?</th></tr></thead>
              <tbody>
                {r.rows.map((row, i) => {
                  const c = parseCidr(row.prefix);
                  return (
                    <tr key={row.prefix} className={i === r.best ? 'win' : row.match ? 'hl' : 'dimrow'}>
                      <td className="mono">{row.prefix}</td><td>{row.hop}</td>
                      <td className="mono">{ipStr((ipN & maskOf(c.prefix)) >>> 0)}/{c.prefix}</td>
                      <td>{row.match ? (i === r.best ? `✓ /${row.len} WINNER` : `✓ /${row.len}`) : '✗'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="note-box" aria-live="polite">
            {r.rows.filter((x) => x.match).length} entr{r.rows.filter((x) => x.match).length === 1 ? 'y matches' : 'ies match'}. The most specific (/{r.rows[r.best].len}) wins → forward to <b>{r.rows[r.best].hop}</b>.
            {r.rows[r.best].len === 0 && ' Nothing more specific matched, so the default route catches it.'}
          </div>
        </>
      )}
    </Card>
  );
}

/* ---------------- Traceroute ---------------- */
const PATH = [
  { name: 'You', ip: '192.168.1.10' },
  { name: 'Home router', ip: '192.168.1.1', rtt: '1.2 ms' },
  { name: 'ISP router', ip: '10.10.0.1', rtt: '8.5 ms' },
  { name: 'Backbone', ip: '72.14.215.85', rtt: '14.1 ms' },
  { name: 'google.com', ip: '142.250.1.1', rtt: '15.0 ms' },
];
export function Traceroute() {
  const st = useStepper(PATH.length, { interval: 1700 });
  const ttl = st.i; // probe ttl = step (0 = nothing sent)
  const xs = PATH.map((_, i) => 40 + i * 110);
  const lines = [];
  for (let t = 1; t <= ttl; t++) {
    const h = PATH[t];
    lines.push(`${String(t).padStart(2)}  ${h.ip.padEnd(15)} ${h.rtt}   ${t === PATH.length - 1 ? '← destination: Echo Reply / Port Unreachable' : '← ICMP Time Exceeded (type 11)'}`);
  }
  return (
    <Card title="How traceroute works" tag="send probes">
      <div className="svg-wrap">
        <svg viewBox="0 0 520 110" style={{ minWidth: 440 }} role="img" aria-label="Traceroute path">
          {xs.slice(0, -1).map((x, i) => <line key={i} x1={x} y1={50} x2={xs[i + 1]} y2={50} stroke={i < ttl ? 'var(--lc,var(--accent))' : 'var(--line)'} strokeWidth="3" />)}
          {PATH.map((p, i) => (
            <g key={i}>
              <circle cx={xs[i]} cy={50} r={16} fill={i === ttl && ttl > 0 ? 'var(--warn)' : i < ttl || i === 0 ? 'var(--ink)' : 'var(--surface)'} stroke="var(--ink)" strokeWidth="1.5" />
              <text x={xs[i]} y={55} textAnchor="middle" fontSize="11" fill={i <= ttl ? 'var(--bg)' : 'var(--ink)'}>{i === 0 ? '⌂' : i}</text>
              <text x={xs[i]} y={86} textAnchor="middle" fontSize="10" fill="var(--ink)">{p.name}</text>
              <text x={xs[i]} y={100} textAnchor="middle" className="svgmut" fontSize="9">{p.ip}</text>
            </g>
          ))}
          {ttl > 0 && <text x={xs[ttl]} y={22} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--warn)">{ttl === PATH.length - 1 ? 'reached!' : 'TTL → 0'}</text>}
        </svg>
      </div>
      <div className="out">{`$ traceroute google.com\n${lines.join('\n') || '(press Next to send the first probe with TTL = 1)'}`}</div>
      <div className="note-box" aria-live="polite">
        {ttl === 0 && 'Each probe is sent with a higher TTL. Every router decrements TTL; the router where it hits 0 drops the probe and reports back.'}
        {ttl > 0 && ttl < PATH.length - 1 && <>Probe with <b>TTL = {ttl}</b>: router {ttl} ({PATH[ttl].name}) decrements it to 0, drops it and replies <b>ICMP Time Exceeded</b>, revealing its IP and the round-trip time.</>}
        {ttl === PATH.length - 1 && <>Probe with <b>TTL = {ttl}</b> reaches the destination itself, which answers (ICMP Echo Reply for Windows tracert; ICMP Port Unreachable for Linux's UDP probes). Done.</>}
      </div>
      <StepControls st={st} label={`TTL = ${ttl}`} />
    </Card>
  );
}
