import { useState } from 'react';
import { Card, LAYER_COLOR } from './common.jsx';

const LAYERS = [
  { n: 7, name: 'Application', job: 'Network services to applications. "What data?"', pdu: 'Data / message', addr: 'URL, domain name', dev: 'Gateway, L7 firewall (WAF), proxy, L7 load balancer', proto: 'HTTP, HTTPS, DNS, DHCP, FTP, SMTP, POP3, IMAP, SSH, SNMP', line: 'DNS and DHCP are application-layer protocols even though they help the network work.' },
  { n: 6, name: 'Presentation', job: 'Data format, encryption, compression: makes data readable by the other side.', pdu: 'Data', addr: 'none', dev: 'none (done in software)', proto: 'TLS/SSL (encryption), JPEG, MPEG, ASCII, UTF-8', line: 'TLS is usually placed here (or "between Transport and Application"); in TCP/IP it is part of Application.' },
  { n: 5, name: 'Session', job: 'Establish, manage and terminate sessions; dialog control and checkpoints.', pdu: 'Data', addr: 'none', dev: 'none', proto: 'RPC, NetBIOS, session management', line: 'Rarely a separate thing in practice; TCP/IP merges it into Application.' },
  { n: 4, name: 'Transport', job: 'Process-to-process delivery: ports, reliability, ordering, flow and congestion control, mux/demux.', pdu: 'Segment (TCP) / Datagram (UDP)', addr: 'Port number (16-bit)', dev: 'L4 load balancer, stateful firewall', proto: 'TCP, UDP, QUIC (on UDP)', line: 'IP gets data to the host; the port gets it to the right process.' },
  { n: 3, name: 'Network', job: 'Host-to-host delivery and routing across networks; logical addressing; fragmentation.', pdu: 'Packet', addr: 'IP address (32-bit v4, 128-bit v6)', dev: 'Router, Layer-3 switch', proto: 'IPv4, IPv6, ICMP, IPsec, OSPF, (ARP at "2.5")', line: 'Source/destination IP stay end-to-end (except NAT); TTL drops by 1 per router.' },
  { n: 2, name: 'Data Link', job: 'Node-to-node (one hop) delivery: framing, MAC addressing, error detection, medium access.', pdu: 'Frame', addr: 'MAC address (48-bit)', dev: 'Switch, bridge, access point, NIC', proto: 'Ethernet, Wi-Fi (802.11 MAC), PPP, 802.1Q VLAN, STP', line: 'MAC changes at every hop. Switch learns from SOURCE MAC, forwards on DESTINATION MAC.' },
  { n: 1, name: 'Physical', job: 'Send raw bits as electrical, optical or radio signals.', pdu: 'Bits / symbols', addr: 'none', dev: 'Hub, repeater, cables, modem, transceiver', proto: 'Ethernet PHY (Cat6, fibre), Wi-Fi radio, encodings (NRZ, Manchester)', line: 'A hub is a multi-port repeater: Layer 1, one collision domain.' },
];

export function Osi() {
  const [sel, setSel] = useState(4);
  const L = LAYERS[7 - sel];
  return (
    <Card title="OSI explorer" tag="click a layer">
      <div className="osi">
        <div className="osi-stack" role="listbox" aria-label="OSI layers">
          {LAYERS.map((l) => (
            <button key={l.n} role="option" aria-selected={sel === l.n} className={sel === l.n ? 'on' : ''} style={{ '--c': LAYER_COLOR[l.n] }} onClick={() => setSel(l.n)}>
              <span>{l.n} · {l.name}</span><small>{l.pdu.split(' ')[0]}</small>
            </button>
          ))}
        </div>
        <div className="osi-detail" aria-live="polite">
          <h4 style={{ color: LAYER_COLOR[L.n] }}>Layer {L.n}: {L.name}</h4>
          <dl>
            <dt>Job</dt><dd>{L.job}</dd>
            <dt>PDU</dt><dd>{L.pdu}</dd>
            <dt>Address</dt><dd>{L.addr}</dd>
            <dt>Devices</dt><dd>{L.dev}</dd>
            <dt>Protocols</dt><dd>{L.proto}</dd>
            <dt>Interview</dt><dd><strong>{L.line}</strong></dd>
          </dl>
        </div>
      </div>
    </Card>
  );
}

const MODELS = {
  4: [
    { name: 'Application', rows: [0, 2], c: 'var(--l7)' },
    { name: 'Transport', rows: [3, 3], c: 'var(--l4)' },
    { name: 'Internet', rows: [4, 4], c: 'var(--l3)' },
    { name: 'Network Access', rows: [5, 6], c: 'var(--l2)' },
  ],
  5: [
    { name: 'Application', rows: [0, 2], c: 'var(--l7)' },
    { name: 'Transport', rows: [3, 3], c: 'var(--l4)' },
    { name: 'Network', rows: [4, 4], c: 'var(--l3)' },
    { name: 'Data Link', rows: [5, 5], c: 'var(--l2)' },
    { name: 'Physical', rows: [6, 6], c: 'var(--l1)' },
  ],
};

export function OsiMap() {
  const [model, setModel] = useState(4);
  const [hover, setHover] = useState(null);
  const rowH = 42; const top = 30; const bh = 34;
  const W = 560; const H = top + 7 * rowH + 6;
  const lx = 10; const lw = 170; const rx = 380; const rw = 170;
  const groups = MODELS[model];
  const groupOf = (row) => groups.findIndex((g) => row >= g.rows[0] && row <= g.rows[1]);
  return (
    <Card title={`OSI (7) ↔ TCP/IP (${model}) mapping`} tag="hover to trace">
      <div className="tabs-mini">
        <button className={model === 4 ? 'on' : ''} onClick={() => setModel(4)}>TCP/IP 4-layer</button>
        <button className={model === 5 ? 'on' : ''} onClick={() => setModel(5)}>5-layer hybrid (textbooks)</button>
      </div>
      <div className="svg-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 420 }} role="img" aria-label="OSI to TCP/IP layer mapping">
          <text x={lx + lw / 2} y={18} textAnchor="middle" className="svgmut">OSI</text>
          <text x={rx + rw / 2} y={18} textAnchor="middle" className="svgmut">{model === 4 ? 'TCP/IP' : '5-layer'}</text>
          {LAYERS.map((l, row) => {
            const y = top + row * rowH;
            const g = groupOf(row);
            const G = groups[g];
            const gy = top + G.rows[0] * rowH;
            const gh = (G.rows[1] - G.rows[0]) * rowH + bh;
            const ty = gy + gh / 2;
            const on = hover == null || hover === g;
            return (
              <g key={l.n} opacity={on ? 1 : 0.25} onMouseEnter={() => setHover(g)} onMouseLeave={() => setHover(null)} onClick={() => setHover(hover === g ? null : g)} style={{ cursor: 'pointer', transition: 'opacity .2s' }}>
                <rect x={lx} y={y} width={lw} height={bh} rx={7} fill={LAYER_COLOR[l.n]} />
                <text x={lx + 12} y={y + 22} fill="var(--accent-ink)" fontSize="12.5" fontWeight="600">{l.n} {l.name}</text>
                <path d={`M${lx + lw},${y + bh / 2} C${(lx + lw + rx) / 2},${y + bh / 2} ${(lx + lw + rx) / 2},${ty} ${rx},${ty}`} fill="none" stroke={G.c} strokeWidth="2" />
                <circle cx={lx + lw} cy={y + bh / 2} r={3.5} fill={G.c} />
              </g>
            );
          })}
          {groups.map((G, g) => {
            const gy = top + G.rows[0] * rowH;
            const gh = (G.rows[1] - G.rows[0]) * rowH + bh;
            return (
              <g key={G.name} opacity={hover == null || hover === g ? 1 : 0.25} onMouseEnter={() => setHover(g)} onMouseLeave={() => setHover(null)} style={{ transition: 'opacity .2s' }}>
                <rect x={rx} y={gy} width={rw} height={gh} rx={8} fill={`color-mix(in srgb, ${G.c} 18%, var(--surface))`} stroke={G.c} strokeWidth="2" />
                <text x={rx + rw / 2} y={gy + gh / 2 + 5} textAnchor="middle" fill="var(--ink)" fontSize="13" fontWeight="600">{G.name}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="muted small" style={{ margin: '.4rem 0 0' }}>Application + Presentation + Session → Application · Transport → Transport · Network → Internet · Data Link + Physical → Network Access.</p>
    </Card>
  );
}
