import { useMemo, useState } from 'react';
import { Card, KV, Tabs } from './common.jsx';
import { HeaderGrid } from './HeaderGrid.jsx';
import { parseCidr, subnetInfo, ipStr, toBin32, splitSubnets, fragment, maskOf } from '../lib/netmath.js';

/* ---------------- Subnet calculator ---------------- */
function BinRow({ n, prefix, label }) {
  const b = toBin32(n);
  return (
    <div className="row" style={{ gap: '.4rem', alignItems: 'center', flexWrap: 'nowrap' }}>
      <span className="muted small mono" style={{ width: '4.2rem', flex: 'none' }}>{label}</span>
      <div className="bits" style={{ gap: 2, flexWrap: 'nowrap' }}>
        {b.split('').map((bit, i) => (
          <span key={i} className={'bit ro' + (i < prefix ? ' net' : '')} style={{ width: '1.05rem', height: '1.6rem', fontSize: '.72rem', marginLeft: i && i % 8 === 0 ? 6 : 0 }}>{bit}</span>
        ))}
      </div>
    </div>
  );
}

export function SubnetCalc() {
  const [v, setV] = useState('192.168.10.77/26');
  const c = parseCidr(v);
  const s = c ? subnetInfo(c.ip, c.prefix) : null;
  return (
    <Card title="Subnet calculator" tag="type IP/prefix">
      <div className="row">
        <label>IP / prefix <input type="text" value={v} onChange={(e) => setV(e.target.value)} style={{ width: '12rem' }} aria-label="IP address with prefix" /></label>
        {['192.168.10.77/26', '10.20.30.40/12', '172.31.255.9/20', '200.1.2.3/30', '8.8.8.8/32'].map((p) => <button key={p} className="btn sm" onClick={() => setV(p)}>{p}</button>)}
      </div>
      {!s ? <p className="err">Format: a.b.c.d/n, e.g. 192.168.10.77/26.</p> : (
        <>
          <KV items={[
            ['Subnet mask', ipStr(s.mask)], ['Wildcard', ipStr(s.wild)], ['Network', `${ipStr(s.network)}/${c.prefix}`], ['Broadcast', c.prefix >= 31 ? '— (none)' : ipStr(s.broadcast)],
            ['First usable', ipStr(s.first)], ['Last usable', ipStr(s.last)], ['Total addresses', s.total.toLocaleString()], ['Usable hosts', `${s.usable.toLocaleString()}${c.prefix < 31 ? ' (2^' + (32 - c.prefix) + ' − 2)' : ''}`],
            ['Class (historic)', s.cls], ['Scope', s.scope], ['Block size', c.prefix >= 24 ? `${256 - (s.mask & 255)} (in the 4th octet)` : c.prefix >= 16 ? `${256 - ((s.mask >>> 8) & 255)} (3rd octet)` : c.prefix >= 8 ? `${256 - ((s.mask >>> 16) & 255)} (2nd octet)` : '—'],
          ]} />
          <div className="scroll" style={{ marginTop: '.8rem', display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
            <BinRow n={c.ip} prefix={c.prefix} label="IP" />
            <BinRow n={s.mask} prefix={c.prefix} label="Mask" />
            <BinRow n={s.network} prefix={c.prefix} label="Network" />
          </div>
          <div className="legend"><span><i style={{ background: 'color-mix(in srgb,var(--lc,var(--accent)) 40%,var(--bg))' }} />network bits ({c.prefix})</span><span><i style={{ background: 'var(--bg)', border: '1px solid var(--line)' }} />host bits ({32 - c.prefix})</span><span>Network = IP AND mask</span></div>
        </>
      )}
    </Card>
  );
}

/* ---------------- Subnet splitter + VLSM ---------------- */
function vlsm(base, prefix, needs) {
  const order = needs.map((n, i) => ({ n, i })).sort((a, b) => b.n - a.n);
  let ptr = base;
  const end = base + 2 ** (32 - prefix);
  const out = [];
  for (const { n, i } of order) {
    const size = 2 ** Math.ceil(Math.log2(n + 2));
    const p = 32 - Math.log2(size);
    if (ptr + size > end) return { error: `Not enough space for a ${n}-host subnet.` };
    out.push({ i, need: n, network: ptr, prefix: p, ...subnetInfo(ptr, p) });
    ptr += size;
  }
  return { out, used: ptr - base, total: end - base };
}

export function SubnetSplit() {
  const [mode, setMode] = useState('equal');
  const [base, setBase] = useState('192.168.1.0/24');
  const [count, setCount] = useState(4);
  const [needs, setNeeds] = useState('100, 50, 20, 2');
  const c = parseCidr(base);
  const eq = useMemo(() => (c && mode === 'equal' ? splitSubnets(c.ip, c.prefix, Math.max(1, Number(count) || 1)) : null), [base, count, mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const needList = needs.split(/[\s,]+/).filter(Boolean).map(Number);
  const vl = c && mode === 'vlsm' && needList.length && needList.every((n) => n > 0) ? vlsm((c.ip & maskOf(c.prefix)) >>> 0, c.prefix, needList) : null;
  return (
    <Card title="Subnet splitter" tag="equal or VLSM">
      <Tabs items={[['equal', 'Equal subnets'], ['vlsm', 'VLSM (by host needs)']]} value={mode} onChange={setMode} />
      <div className="row">
        <label>Base network <input type="text" value={base} onChange={(e) => setBase(e.target.value)} style={{ width: '11rem' }} /></label>
        {mode === 'equal'
          ? <label>Subnets needed <input type="number" min="1" max="1024" value={count} onChange={(e) => setCount(e.target.value)} /></label>
          : <label>Hosts per subnet <input type="text" value={needs} onChange={(e) => setNeeds(e.target.value)} style={{ width: '11rem' }} /></label>}
      </div>
      {!c && <p className="err">Base network format: a.b.c.d/n</p>}
      {mode === 'equal' && c && (!eq ? <p className="err">Too many subnets for this prefix.</p> : (
        <>
          <div className="note-box">Borrow <b>{eq.bits}</b> bit{eq.bits === 1 ? '' : 's'} (2^{eq.bits} = {2 ** eq.bits} ≥ {count}) → new prefix <b>/{eq.newPrefix}</b>, block size {eq.size}, {eq.newPrefix <= 30 ? `${eq.size - 2} usable hosts each` : 'point-to-point sizes'}.</div>
          <div className="tbl"><table>
            <thead><tr><th>#</th><th>Subnet</th><th>Usable range</th><th>Broadcast</th></tr></thead>
            <tbody>{eq.subnets.slice(0, 64).map((s) => (
              <tr key={s.i} className={s.used ? '' : 'dimrow'}><td className="n">{s.i + 1}</td><td className="mono">{ipStr(s.network)}/{s.prefix}</td><td className="mono">{ipStr(s.first)} – {ipStr(s.last)}</td><td className="mono">{ipStr(s.broadcast)}</td></tr>
            ))}</tbody>
          </table></div>
          {eq.subnets.length > 64 && <p className="muted small">Showing the first 64 of {eq.subnets.length}.</p>}
        </>
      ))}
      {mode === 'vlsm' && c && (vl?.error ? <p className="err">{vl.error}</p> : vl && (
        <>
          <div className="note-box">Largest first, each rounded up to a power of 2 (hosts + 2). Used {vl.used} of {vl.total} addresses.</div>
          <div className="tbl"><table>
            <thead><tr><th>Needs</th><th>Subnet</th><th>Usable</th><th>Range</th></tr></thead>
            <tbody>{vl.out.map((s) => (
              <tr key={s.i}><td className="n">{s.need}</td><td className="mono">{ipStr(s.network)}/{s.prefix}</td><td className="n">{s.usable}</td><td className="mono">{ipStr(s.first)} – {ipStr(s.last)}</td></tr>
            ))}</tbody>
          </table></div>
        </>
      ))}
    </Card>
  );
}

/* ---------------- IPv4 header ---------------- */
const V4 = [
  { k: 'ver', name: 'Version', short: 'Ver', bits: 4, d: '4 for IPv4 (6 for IPv6).' },
  { k: 'ihl', name: 'IHL', short: 'IHL', bits: 4, d: 'Internet Header Length in 4-byte words: 5 (20 B, no options) to 15 (60 B).' },
  { k: 'tos', name: 'DSCP / ECN', bits: 8, d: 'Type of Service: 6-bit DSCP for QoS priority (e.g. voice), 2-bit ECN for congestion marking instead of dropping.' },
  { k: 'len', name: 'Total Length', bits: 16, d: 'Header + data in bytes. 16 bits → maximum packet 65,535 bytes.' },
  { k: 'id', name: 'Identification', bits: 16, c: 'var(--warn)', d: 'Same value on every fragment of one original packet, so the destination can reassemble them.' },
  { k: 'flags', name: 'Flags', short: 'Flg', bits: 3, c: 'var(--warn)', d: 'Bit 0 reserved, DF (Don\'t Fragment), MF (More Fragments: 1 on all but the last fragment).' },
  { k: 'off', name: 'Fragment Offset', bits: 13, c: 'var(--warn)', d: 'Where this fragment\'s data starts in the original, in units of 8 bytes (13 bits × 8 covers 65,535).' },
  { k: 'ttl', name: 'TTL', bits: 8, c: 'var(--l7)', d: 'Time To Live: decremented at every router; 0 → drop + ICMP Time Exceeded. Stops routing loops. Typical start 64 / 128 / 255.' },
  { k: 'proto', name: 'Protocol', bits: 8, c: 'var(--l4)', d: 'What\'s inside: 1 = ICMP, 6 = TCP, 17 = UDP, 47 = GRE, 50 = ESP, 89 = OSPF.' },
  { k: 'ck', name: 'Header Checksum', bits: 16, c: 'var(--bad)', d: '16-bit 1\'s-complement checksum over the header only. Recomputed at every router because TTL changes. (IPv6 dropped it.)' },
  { k: 'src', name: 'Source IP Address', bits: 32, c: 'var(--l3)', d: '32-bit sender address. Stays the same end to end, except when NAT rewrites it.' },
  { k: 'dst', name: 'Destination IP Address', bits: 32, c: 'var(--l3)', d: '32-bit receiver address: what routers use for longest-prefix-match forwarding.' },
  { k: 'opt', name: 'Options (0–40 B) + padding', bits: 33, c: 'var(--muted)', d: 'Rarely used (record route, timestamps). Present only when IHL > 5.' },
];
export function Ipv4Hdr() {
  return <Card title="IPv4 header (20–60 bytes)" tag="click a field"><HeaderGrid fields={V4} initial="ttl" caption="IPv4 header fields" /></Card>;
}

/* ---------------- Fragmentation ---------------- */
export function Frag() {
  const [len, setLen] = useState(4000);
  const [mtu, setMtu] = useState(1500);
  const [df, setDf] = useState(false);
  const L = Number(len); const M = Number(mtu);
  const fr = fragment(L, M, 20);
  const blocked = df && L > M;
  const dataTotal = L - 20;
  return (
    <Card title="IPv4 fragmentation" tag="packet + MTU">
      <div className="row">
        <label>Packet total length (B) <input type="number" min="21" max="65535" value={len} onChange={(e) => setLen(e.target.value)} /></label>
        <label>Next-link MTU (B) <input type="number" min="68" max="9000" value={mtu} onChange={(e) => setMtu(e.target.value)} /></label>
        <label><input type="checkbox" checked={df} onChange={(e) => setDf(e.target.checked)} /> DF (Don't Fragment)</label>
        <button className="btn sm" onClick={() => { setLen(4000); setMtu(1500); setDf(false); }}>4000 / 1500</button>
        <button className="btn sm" onClick={() => { setLen(1500); setMtu(576); setDf(false); }}>1500 / 576</button>
      </div>
      {!fr ? <p className="err">Enter a length above 20 (header) and an MTU above 20.</p> : blocked ? (
        <div className="note-box" style={{ borderLeft: '4px solid var(--bad)' }}><b>Dropped.</b> The packet is bigger than the MTU and DF = 1, so the router discards it and returns <b>ICMP Destination Unreachable, code 4 "fragmentation needed"</b> with the MTU. This is how Path MTU Discovery works.</div>
      ) : (
        <>
          <p className="small" style={{ margin: '.7rem 0 .3rem' }}>Data = {L} − 20 header = <b>{dataTotal} B</b>. Max data per fragment = ⌊({M} − 20) / 8⌋ × 8 = <b>{Math.floor((M - 20) / 8) * 8} B</b> (must be a multiple of 8).</p>
          <div style={{ display: 'flex', gap: 3, margin: '.5rem 0' }}>
            {fr.map((f) => (
              <div key={f.i} style={{ flex: `${f.data} 1 0`, background: f.i % 2 ? 'var(--l3)' : 'color-mix(in srgb,var(--l3) 60%,var(--bg))', color: 'var(--accent-ink)', borderRadius: 6, padding: '.35rem .4rem', fontFamily: 'var(--f-mono)', fontSize: '.72rem', minWidth: '3rem', overflow: 'hidden', whiteSpace: 'nowrap' }}>#{f.i} · {f.data} B</div>
            ))}
          </div>
          <div className="tbl"><table>
            <thead><tr><th>Fragment</th><th>Total length</th><th>Data bytes</th><th>Data starts at byte</th><th>Offset field (÷8)</th><th>MF</th></tr></thead>
            <tbody>{fr.map((f) => (
              <tr key={f.i}><td className="n">{f.i}</td><td className="n">{f.total}</td><td className="n">{f.data}</td><td className="n">{f.offsetBytes}</td><td className="n"><b>{f.offset}</b></td><td className="n">{f.mf}</td></tr>
            ))}</tbody>
          </table></div>
          <div className="note-box">{fr.length === 1 ? 'Fits in the MTU: no fragmentation needed.' : <>All {fr.length} fragments carry the same Identification. Each gets its own 20-byte header (so {fr.length * 20} header bytes in total). MF = 1 except on the last. Only the <b>destination</b> reassembles; if any fragment is lost, the whole packet is lost.</>}</div>
        </>
      )}
    </Card>
  );
}
