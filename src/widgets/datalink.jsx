import { useRef, useState } from 'react';
import { Card, Tabs, KV } from './common.jsx';

/* ---------------- MAC address anatomy ---------------- */
const KNOWN_OUI = { '00000C': 'Cisco', '005056': 'VMware', '080027': 'Oracle VirtualBox', '01005E': 'IPv4 multicast block', '333300': 'IPv6 multicast block' };

export function MacAddr() {
  const [v, setV] = useState('48:2A:E3:91:AB:10');
  const hex = v.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
  const valid = hex.length === 12 && /^[0-9A-F]{12}$/.test(hex) && v.replace(/[\s:.\-]/g, '').length === 12;
  const bytes = valid ? hex.match(/../g) : [];
  const b0 = valid ? parseInt(bytes[0], 16) : 0;
  const ig = b0 & 1; const ul = (b0 >> 1) & 1;
  const bcast = valid && hex === 'FFFFFFFFFFFF';
  const vendor = valid && (KNOWN_OUI[hex.slice(0, 6)] || (hex.startsWith('3333') ? 'IPv6 multicast block' : null));
  return (
    <Card title="MAC address anatomy" tag="type a MAC">
      <div className="row">
        <label>MAC <input type="text" value={v} onChange={(e) => setV(e.target.value)} style={{ width: '13rem' }} aria-label="MAC address" /></label>
        {['48:2A:E3:91:AB:10', 'FF:FF:FF:FF:FF:FF', '01:00:5E:00:00:FB', 'DA:A1:19:5C:2E:7B', '00:50:56:C0:00:08'].map((p) => (
          <button key={p} className="btn sm" onClick={() => setV(p)}>{p}</button>
        ))}
      </div>
      {!valid ? <p className="err">A MAC is 48 bits = 12 hex digits, e.g. 48:2A:E3:91:AB:10.</p> : (
        <>
          <div className="row" style={{ marginTop: '.8rem', gap: '.3rem' }}>
            {bytes.map((b, i) => (
              <span key={i} className="nest mono" style={{ background: i < 3 ? 'color-mix(in srgb,var(--l2) 20%,var(--bg))' : 'color-mix(in srgb,var(--l3) 16%,var(--bg))', fontSize: '1rem' }}>{b}</span>
            ))}
          </div>
          <div className="legend"><span><i style={{ background: 'color-mix(in srgb,var(--l2) 45%,var(--bg))' }} />OUI (vendor, 24 bits)</span><span><i style={{ background: 'color-mix(in srgb,var(--l3) 40%,var(--bg))' }} />NIC-specific (24 bits)</span></div>
          <div style={{ marginTop: '.8rem' }}>
            <div className="muted small mono">First byte {bytes[0]} in binary (bit 0 is the rightmost):</div>
            <div className="bits" style={{ marginTop: '.3rem' }}>
              {b0.toString(2).padStart(8, '0').split('').map((bit, k) => (
                <span key={k} className={'bit ro' + (k === 7 || k === 6 ? ' p' : '')}><small>{7 - k}</small>{bit}</span>
              ))}
            </div>
          </div>
          <KV items={[
            ['OUI', bytes.slice(0, 3).join(':') + (vendor ? ` (${vendor})` : '')],
            ['NIC part', bytes.slice(3).join(':')],
            ['Bit 0 (I/G)', bcast ? '1 → broadcast' : ig ? '1 → multicast/group' : '0 → unicast'],
            ['Bit 1 (U/L)', ul ? '1 → locally administered' : '0 → globally unique (burned-in)'],
          ]} />
          <div className="note-box">
            {bcast ? <><b>Broadcast.</b> Every host on the LAN accepts it: ARP requests and DHCP Discover use this.</>
              : ig ? <><b>Multicast.</b> Delivered to every host subscribed to the group (switches flood it unless they do IGMP snooping).</>
                : ul ? <><b>Locally administered unicast.</b> Typical of phones and laptops that randomise their Wi-Fi MAC for privacy, or of VMs.</>
                  : <><b>Globally unique unicast.</b> The vendor's OUI + a serial number burned into the NIC.</>}
          </div>
        </>
      )}
    </Card>
  );
}

/* ---------------- Ethernet frame ---------------- */
const FIELDS = (payload, tagged) => [
  { k: 'pre', name: 'Preamble', b: 7, c: 'var(--l1)', d: '7 bytes of 10101010 that let the receiver lock onto the clock. Not counted in the frame size.' },
  { k: 'sfd', name: 'SFD', b: 1, c: 'var(--l1)', d: 'Start Frame Delimiter 10101011: "the frame starts now".' },
  { k: 'dst', name: 'Dest MAC', b: 6, c: 'var(--l2)', d: 'Destination MAC comes first so a cut-through switch can start forwarding after reading just 6 bytes. FF:FF:FF:FF:FF:FF = broadcast.' },
  { k: 'src', name: 'Src MAC', b: 6, c: 'var(--l2)', d: 'Source MAC: what the switch learns from (MAC → incoming port).' },
  ...(tagged ? [{ k: 'tag', name: '802.1Q', b: 4, c: 'var(--warn)', d: 'VLAN tag: TPID 0x8100 + 3-bit priority + 12-bit VLAN ID (up to 4094 VLANs). Only on trunk links.' }] : []),
  { k: 'type', name: 'Type', b: 2, c: 'var(--l2)', d: 'EtherType: 0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6. (Values ≤ 1500 mean "length" in the old 802.3 format.)' },
  { k: 'data', name: `Payload ${Math.max(payload, 46)} B`, b: Math.max(payload, 46), c: 'var(--l3)', d: `The IP packet (46–1500 bytes; 1500 = MTU).${payload < 46 ? ` Your ${payload} B payload is padded with ${46 - payload} zero bytes to reach 46.` : ''}` },
  { k: 'fcs', name: 'FCS', b: 4, c: 'var(--bad)', d: 'Frame Check Sequence: CRC-32 over the frame. A mismatch → frame silently dropped (Ethernet never retransmits; TCP will).' },
];

export function EthFrame() {
  const [payload, setPayload] = useState(1500);
  const [tagged, setTagged] = useState(false);
  const [sel, setSel] = useState('dst');
  const fs = FIELDS(payload, tagged);
  const frame = 14 + (tagged ? 4 : 0) + Math.max(payload, 46) + 4;
  const wire = frame + 8 + 12;
  const f = fs.find((x) => x.k === sel) || fs[2];
  return (
    <Card title="Ethernet frame" tag="tap a field">
      <div className="row">
        <label>Payload <input type="range" min="1" max="1500" value={payload} onChange={(e) => setPayload(Number(e.target.value))} /> <b className="mono">{payload} B</b></label>
        <label><input type="checkbox" checked={tagged} onChange={(e) => setTagged(e.target.checked)} /> 802.1Q VLAN tag</label>
      </div>
      <div className="scroll" style={{ marginTop: '.7rem' }}>
        <div style={{ display: 'flex', gap: 2, minWidth: '34rem' }}>
          {fs.map((x) => (
            <button key={x.k} onClick={() => setSel(x.k)} title={x.name}
              style={{ flex: `${Math.sqrt(x.b)} 1 0`, minWidth: '3.1rem', border: sel === x.k ? '2px solid var(--ink)' : '1px solid transparent', borderRadius: 6, background: x.c, color: 'var(--accent-ink)', padding: '.5rem .2rem', cursor: 'pointer', fontFamily: 'var(--f-mono)', fontSize: '.7rem', lineHeight: 1.2 }}>
              {x.name}<br /><b>{x.b} B</b>
            </button>
          ))}
        </div>
      </div>
      <div className="note-box" aria-live="polite"><b>{f.name}.</b> {f.d}</div>
      <KV items={[['Frame size (dst MAC → FCS)', `${frame} B`], ['On the wire (+preamble, SFD, 12 B gap)', `${wire} B`], ['Payload efficiency', `${((payload / wire) * 100).toFixed(1)}%`], ['Overhead', `${14 + (tagged ? 4 : 0) + 4} B header + FCS`]]} />
      <p className="muted small" style={{ margin: '.5rem 0 0' }}>Bar widths grow with √bytes so the small header fields stay visible.</p>
    </Card>
  );
}

/* ---------------- Switch learning simulator ---------------- */
const HOSTS = [
  { id: 'A', mac: 'AA:AA', port: 1, x: 70, y: 60 },
  { id: 'B', mac: 'BB:BB', port: 2, x: 350, y: 60 },
  { id: 'C', mac: 'CC:CC', port: 3, x: 70, y: 240 },
  { id: 'D', mac: 'DD:DD', port: 4, x: 350, y: 240 },
];
const SW = { x: 210, y: 150 };
const hostByPort = (p) => HOSTS.find((h) => h.port === p);

export function SwitchSim() {
  const [src, setSrc] = useState('A');
  const [dst, setDst] = useState('B');
  const [hub, setHub] = useState(false);
  const [table, setTable] = useState({});
  const [dots, setDots] = useState([]);
  const [log, setLog] = useState('Pick a source and destination, then Send. The MAC table starts empty.');
  const [glow, setGlow] = useState({});
  const [fresh, setFresh] = useState(null);
  const busy = useRef(false);
  const seq = useRef(0);

  const raf2 = (f) => requestAnimationFrame(() => requestAnimationFrame(f));

  const send = () => {
    if (busy.current) return;
    if (src === dst) { setLog('Source and destination are the same host.'); return; }
    busy.current = true;
    const S = HOSTS.find((h) => h.id === src);
    const bcast = dst === '*';
    const D = HOSTS.find((h) => h.id === dst);
    const id = ++seq.current;
    let outs; let msg;
    const learnedBefore = table[S.mac];
    const newTable = hub ? table : { ...table, [S.mac]: S.port };
    if (hub) {
      outs = HOSTS.filter((h) => h.port !== S.port).map((h) => h.port);
      msg = `Hub: repeats the signal out of every other port (${outs.join(', ')}). No table, no learning, one collision domain.`;
    } else if (bcast) {
      outs = HOSTS.filter((h) => h.port !== S.port).map((h) => h.port);
      msg = `${learnedBefore ? '' : `Learned ${S.mac} → port ${S.port} (from the SOURCE MAC). `}Destination FF:FF:FF:FF:FF:FF is broadcast → flood out all ports except the incoming one (${outs.join(', ')}).`;
    } else if (newTable[D.mac] != null) {
      outs = newTable[D.mac] === S.port ? [] : [newTable[D.mac]];
      msg = `${learnedBefore ? '' : `Learned ${S.mac} → port ${S.port}. `}${D.mac} is in the table → forward only to port ${newTable[D.mac]}.`;
    } else {
      outs = HOSTS.filter((h) => h.port !== S.port).map((h) => h.port);
      msg = `${learnedBefore ? '' : `Learned ${S.mac} → port ${S.port} (from the SOURCE MAC). `}${D.mac} is unknown → flood out ports ${outs.join(', ')} (all except incoming port ${S.port}).`;
    }
    setLog(`Frame ${S.mac} → ${bcast ? 'FF:FF:FF:FF:FF:FF' : D.mac} arrives on port ${S.port}…`);
    setGlow({});
    setDots([{ id: `${id}s`, x: S.x, y: S.y }]);
    raf2(() => setDots([{ id: `${id}s`, x: SW.x, y: SW.y }]));
    setTimeout(() => {
      if (!hub && !learnedBefore) setFresh(S.mac);
      setTable(newTable);
      setLog(msg);
      setDots(outs.map((p) => ({ id: `${id}-${p}`, x: SW.x, y: SW.y })));
      raf2(() => setDots(outs.map((p) => ({ id: `${id}-${p}`, x: hostByPort(p).x, y: hostByPort(p).y }))));
    }, 760);
    setTimeout(() => {
      setDots([]);
      const g = {};
      outs.forEach((p) => { const h = hostByPort(p); g[h.id] = bcast || h.id === dst ? 'ok' : 'drop'; });
      setGlow(g);
      const dropped = Object.entries(g).filter(([, s]) => s === 'drop').map(([k]) => k);
      if (dropped.length) setLog((l) => `${l} Host${dropped.length > 1 ? 's' : ''} ${dropped.join(', ')} receive${dropped.length > 1 ? '' : 's'} it and discard${dropped.length > 1 ? '' : 's'} it (not ${dropped.length > 1 ? 'their' : 'its'} MAC).`);
      busy.current = false;
    }, 1560);
  };

  const rows = Object.entries(table);
  return (
    <Card title={hub ? 'Hub simulator' : 'Switch learning simulator'} tag="send frames">
      <div className="row">
        <label>From <select value={src} onChange={(e) => setSrc(e.target.value)}>{HOSTS.map((h) => <option key={h.id} value={h.id}>{h.id} ({h.mac})</option>)}</select></label>
        <label>To <select value={dst} onChange={(e) => setDst(e.target.value)}>{HOSTS.map((h) => <option key={h.id} value={h.id}>{h.id} ({h.mac})</option>)}<option value="*">Broadcast (FF:FF…)</option></select></label>
        <button className="btn sm pri" onClick={send}>Send frame</button>
        <label><input type="checkbox" checked={hub} onChange={(e) => { setHub(e.target.checked); setGlow({}); }} /> Hub mode</label>
        <button className="btn sm" onClick={() => { setTable({}); setGlow({}); setFresh(null); setLog('MAC table cleared (as if entries aged out after 300 s).'); }}>Clear table</button>
      </div>
      <div className="two" style={{ marginTop: '.7rem', alignItems: 'start' }}>
        <svg viewBox="0 0 420 300" role="img" aria-label="Four hosts connected to a switch">
          {HOSTS.map((h) => <line key={h.id} x1={h.x} y1={h.y} x2={SW.x} y2={SW.y} stroke="var(--line)" strokeWidth="3" />)}
          {HOSTS.map((h) => {
            const mx = (h.x + SW.x) / 2; const my = (h.y + SW.y) / 2;
            return <text key={h.id} x={mx + (h.x < SW.x ? -6 : 6)} y={my - 8} textAnchor="middle" className="svgmut">port {h.port}</text>;
          })}
          <rect x={SW.x - 46} y={SW.y - 22} width={92} height={44} rx={8} fill="var(--ink)" />
          <text x={SW.x} y={SW.y + 5} textAnchor="middle" fill="var(--bg)" fontSize="13" fontWeight="600">{hub ? 'HUB' : 'SWITCH'}</text>
          {HOSTS.map((h) => (
            <g key={h.id}>
              <rect x={h.x - 34} y={h.y - 24} width={68} height={48} rx={8} fill={glow[h.id] === 'ok' ? 'var(--good-soft)' : glow[h.id] === 'drop' ? 'var(--surface-2)' : 'var(--surface)'} stroke={glow[h.id] === 'ok' ? 'var(--good)' : h.id === src ? 'var(--accent)' : 'var(--line)'} strokeWidth="2" />
              <text x={h.x} y={h.y - 3} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--ink)">{h.id}</text>
              <text x={h.x} y={h.y + 14} textAnchor="middle" className="svgmut">{h.mac}</text>
              {glow[h.id] && <text x={h.x} y={h.y + (h.y < SW.y ? -30 : 40)} textAnchor="middle" fontSize="11" fill={glow[h.id] === 'ok' ? 'var(--good)' : 'var(--muted)'}>{glow[h.id] === 'ok' ? 'accepted ✓' : 'discarded'}</text>}
            </g>
          ))}
          {dots.map((d) => <circle key={d.id} r={8} className="pkt moving" style={{ transform: `translate(${d.x}px, ${d.y}px)` }} />)}
        </svg>
        <div>
          <div className="tbl" style={{ marginTop: 0 }}>
            <table>
              <thead><tr><th>MAC address</th><th>Port</th></tr></thead>
              <tbody>
                {hub ? <tr><td colSpan={2} className="muted">A hub has no MAC table.</td></tr>
                  : rows.length === 0 ? <tr><td colSpan={2} className="muted">(empty)</td></tr>
                    : rows.map(([mac, port]) => <tr key={mac} className={fresh === mac ? 'hl' : ''}><td className="mono">{mac}</td><td className="n">{port}</td></tr>)}
              </tbody>
            </table>
          </div>
          <div className="note-box" aria-live="polite">{log}</div>
        </div>
      </div>
      <p className="muted small" style={{ margin: '.5rem 0 0' }}>Try: A → B (flood), B → A (forward only), A → B again (forward only). Then switch to hub mode.</p>
    </Card>
  );
}

/* ---------------- Collision vs broadcast domains ---------------- */
const PC = ({ x, y, label }) => (
  <g><rect x={x - 18} y={y - 12} width={36} height={24} rx={4} fill="var(--surface)" stroke="var(--muted)" strokeWidth="1.5" /><text x={x} y={y + 4} textAnchor="middle" fontSize="10" fill="var(--ink)">{label}</text></g>
);
const Box = ({ x, y, label, w = 64 }) => (
  <g><rect x={x - w / 2} y={y - 15} width={w} height={30} rx={6} fill="var(--ink)" /><text x={x} y={y + 4} textAnchor="middle" fontSize="11" fill="var(--bg)" fontWeight="600">{label}</text></g>
);
const Coll = ({ cx, cy, rx, ry, rot = 0 }) => <ellipse cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${rot} ${cx} ${cy})`} fill="color-mix(in srgb,var(--warn) 16%,transparent)" stroke="var(--warn)" strokeWidth="1.8" strokeDasharray="5 4" />;
const Bc = ({ x, y, w, h }) => <rect x={x} y={y} width={w} height={h} rx={14} fill="color-mix(in srgb,var(--l3) 9%,transparent)" stroke="var(--l3)" strokeWidth="2" />;

function linkColl(a, b) {
  const cx = (a.x + b.x) / 2; const cy = (a.y + b.y) / 2;
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const rot = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  return <Coll key={`${a.x}${a.y}${b.x}${b.y}`} cx={cx} cy={cy} rx={len / 2 + 14} ry={20} rot={rot} />;
}

const SCEN = {
  hub: {
    label: 'Hub', coll: 1, bc: 1,
    text: 'A hub repeats every bit to every port: all four PCs share ONE collision domain and ONE broadcast domain.',
    draw: (showC, showB) => {
      const H = { x: 230, y: 115 }; const P = [{ x: 90, y: 50 }, { x: 370, y: 50 }, { x: 90, y: 180 }, { x: 370, y: 180 }];
      return (<>
        {showB && <Bc x={40} y={18} w={380} h={196} />}
        {showC && <Coll cx={230} cy={115} rx={185} ry={92} />}
        {P.map((p, i) => <line key={i} x1={p.x} y1={p.y} x2={H.x} y2={H.y} stroke="var(--muted)" strokeWidth="2" />)}
        <Box {...H} label="HUB" />{P.map((p, i) => <PC key={i} {...p} label={`PC${i + 1}`} />)}
      </>);
    },
  },
  switch: {
    label: 'Switch', coll: 4, bc: 1,
    text: 'Each switch port is its own collision domain (4 here; with full duplex there are no collisions at all), but a broadcast still reaches every port: ONE broadcast domain.',
    draw: (showC, showB) => {
      const S = { x: 230, y: 115 }; const P = [{ x: 90, y: 50 }, { x: 370, y: 50 }, { x: 90, y: 180 }, { x: 370, y: 180 }];
      return (<>
        {showB && <Bc x={40} y={18} w={380} h={196} />}
        {showC && P.map((p) => linkColl(p, S))}
        {P.map((p, i) => <line key={i} x1={p.x} y1={p.y} x2={S.x} y2={S.y} stroke="var(--muted)" strokeWidth="2" />)}
        <Box {...S} label="SWITCH" w={74} />{P.map((p, i) => <PC key={i} {...p} label={`PC${i + 1}`} />)}
      </>);
    },
  },
  router: {
    label: 'Router', coll: 6, bc: 2,
    text: 'The router doesn\'t forward broadcasts, so each side is its own broadcast domain (2). Collision domains = one per switch port in use and per router port (6).',
    draw: (showC, showB) => {
      const R = { x: 230, y: 40 }; const S1 = { x: 120, y: 125 }; const S2 = { x: 340, y: 125 };
      const P = [{ x: 60, y: 200 }, { x: 180, y: 200 }, { x: 280, y: 200 }, { x: 400, y: 200 }];
      return (<>
        {showB && <><Bc x={18} y={88} w={210} h={136} /><Bc x={232} y={88} w={210} h={136} /></>}
        {showC && [linkColl(R, S1), linkColl(R, S2), linkColl(S1, P[0]), linkColl(S1, P[1]), linkColl(S2, P[2]), linkColl(S2, P[3])]}
        {[[R, S1], [R, S2], [S1, P[0]], [S1, P[1]], [S2, P[2]], [S2, P[3]]].map(([a, b], i) => <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--muted)" strokeWidth="2" />)}
        <Box {...R} label="ROUTER" w={76} /><Box {...S1} label="SW 1" /><Box {...S2} label="SW 2" />
        {P.map((p, i) => <PC key={i} {...p} label={`PC${i + 1}`} />)}
      </>);
    },
  },
  exam: {
    label: 'Exam question', coll: 3, bc: 1,
    text: '2 hubs (PCs on each) → switch → router. Collision domains: hub 1 + everything on it (1), hub 2 (1), switch–router link (1) = 3. Broadcast domains on this side of the router = 1.',
    draw: (showC, showB) => {
      const R = { x: 230, y: 32 }; const S = { x: 230, y: 92 }; const H1 = { x: 120, y: 150 }; const H2 = { x: 340, y: 150 };
      const P = [{ x: 50, y: 205 }, { x: 120, y: 210 }, { x: 190, y: 205 }, { x: 270, y: 205 }, { x: 340, y: 210 }, { x: 410, y: 205 }];
      return (<>
        {showB && <Bc x={18} y={70} w={424} h={162} />}
        {showC && <><Coll cx={120} cy={178} rx={100} ry={52} /><Coll cx={340} cy={178} rx={100} ry={52} />{linkColl(S, R)}</>}
        {[[R, S], [S, H1], [S, H2], [H1, P[0]], [H1, P[1]], [H1, P[2]], [H2, P[3]], [H2, P[4]], [H2, P[5]]].map(([a, b], i) => <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--muted)" strokeWidth="2" />)}
        <Box {...R} label="ROUTER" w={76} /><Box {...S} label="SWITCH" w={74} /><Box {...H1} label="HUB 1" /><Box {...H2} label="HUB 2" />
        {P.map((p, i) => <PC key={i} {...p} label={`PC${i + 1}`} />)}
      </>);
    },
  },
};

export function Domains() {
  const [k, setK] = useState('hub');
  const [showC, setShowC] = useState(true);
  const [showB, setShowB] = useState(true);
  const S = SCEN[k];
  return (
    <Card title="Collision domains vs broadcast domains" tag="compare">
      <Tabs items={Object.entries(SCEN).map(([key, v]) => [key, v.label])} value={k} onChange={setK} />
      <div className="row">
        <label><input type="checkbox" checked={showC} onChange={(e) => setShowC(e.target.checked)} /> <span style={{ color: 'var(--warn)' }}>collision domains (dashed)</span></label>
        <label><input type="checkbox" checked={showB} onChange={(e) => setShowB(e.target.checked)} /> <span style={{ color: 'var(--l3)' }}>broadcast domains (solid)</span></label>
      </div>
      <svg viewBox="0 0 460 240" style={{ marginTop: '.5rem' }} role="img" aria-label={`${S.label}: ${S.coll} collision domains, ${S.bc} broadcast domains`}>{S.draw(showC, showB)}</svg>
      <KV items={[['Collision domains', S.coll], ['Broadcast domains', S.bc]]} />
      <div className="note-box">{S.text}</div>
    </Card>
  );
}
