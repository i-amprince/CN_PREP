import { Card, useStepper, StepControls } from './common.jsx';

const T = { app: ['App', 'var(--l7)'], pres: ['TLS', 'var(--l6)'], tr: ['Transport', 'var(--l4)'], net: ['Network', 'var(--l3)'], dl: ['Data Link', 'var(--l2)'], ph: ['Physical', 'var(--l1)'] };

const N = [
  { k: 'pc', n: 'Your PC', s: '192.168.1.10', x: 50 },
  { k: 'sw', n: 'Switch / AP', s: 'L2', x: 150 },
  { k: 'hr', n: 'Home router', s: 'NAT · 49.x.x.x', x: 262 },
  { k: 'r1', n: 'ISP router', s: 'L3', x: 372 },
  { k: 'r2', n: 'Backbone', s: 'BGP', x: 472 },
  { k: 'lb', n: 'Google LB', s: '142.250.1.1', x: 580 },
  { k: 'sv', n: 'Server', s: 'backend', x: 672 },
];
const X = Object.fromEntries(N.map((n) => [n.k, n.x]));
const DNS = { x: 372, y: 36 };

const H = (smac, dmac, sip, dip, ttl, sp, dp) => ({ smac, dmac, sip, dip, ttl, sp, dp });
const STEPS = [
  { t: 'You type https://google.com', tags: ['app'], at: 'pc', d: 'The browser parses the URL: scheme https → TLS on port 443, host google.com. It needs the server\'s IP address first.' },
  { t: 'Check caches, then DNS', tags: ['app', 'tr'], at: 'dns', d: 'Browser cache → OS cache → resolver. On a miss the resolver walks root → .com TLD → google.com\'s authoritative server and returns 142.250.1.1 (over UDP 53; TCP also possible). The answer is cached for its TTL.' },
  { t: 'Is the destination local or remote?', tags: ['net'], at: 'pc', d: '192.168.1.10 AND 255.255.255.0 = 192.168.1.0, but 142.250.1.1 AND 255.255.255.0 = 142.250.1.0: different network. So the packet must go to the default gateway 192.168.1.1.', box: '192.168.1.10 /24 → net 192.168.1.0\n142.250.1.1  /24 → net 142.250.1.0  ≠  → remote → use gateway' },
  { t: 'ARP for the gateway\'s MAC (not Google\'s!)', tags: ['dl'], from: 'pc', at: 'hr', d: 'ARP request "Who has 192.168.1.1?" is broadcast to FF:FF:FF:FF:FF:FF; the router replies (unicast) "192.168.1.1 is at rr:01". MAC addresses only matter on the local link, so you never ARP for Google.', box: 'ARP request  (broadcast): Who has 192.168.1.1? Tell 192.168.1.10\nARP reply    (unicast)  : 192.168.1.1 is at rr:01' },
  { t: 'TCP 3-way handshake', tags: ['tr'], from: 'pc', at: 'lb', whole: true, d: 'SYN (Seq=100) → SYN+ACK (Seq=500, Ack=101) → ACK (Ack=501). Each of these segments makes the whole trip below, hop by hop. Now there is a reliable byte stream between your port 5000 and Google\'s port 443.', box: 'SYN       Seq=100\nSYN+ACK   Seq=500  Ack=101\nACK                Ack=501   → ESTABLISHED' },
  { t: 'TLS handshake', tags: ['pres'], from: 'pc', at: 'lb', whole: true, d: 'ClientHello (+ key share, SNI = google.com) → ServerHello + certificate + key share. The browser validates the certificate chain up to a trusted root CA and checks the name. Both sides derive symmetric session keys (ECDHE). Asymmetric crypto = authentication + key exchange; symmetric = the data.' },
  { t: 'Encrypted HTTP request', tags: ['app', 'pres'], at: 'pc', d: 'GET / HTTP/2, Host: google.com, cookies… The whole HTTP message is encrypted with the TLS session key (e.g. AES-GCM).', box: 'GET / HTTP/2\nHost: google.com\n→ TLS record: 17 03 03 00 4a 8f e2 … (encrypted)' },
  { t: 'Encapsulation', tags: ['tr', 'net', 'dl', 'ph'], at: 'pc', d: 'Going down the stack: TLS data → TCP segment (ports 5000 → 443) → IP packet (192.168.1.10 → 142.250.1.1, TTL 64) → Ethernet frame (aa:aa → rr:01, FCS) → bits on the wire or radio.', hdr: H('aa:aa (PC)', 'rr:01 (router)', '192.168.1.10', '142.250.1.1', 64, 5000, 443) },
  { t: 'Switch forwards by MAC', tags: ['dl'], from: 'pc', at: 'sw', d: 'The switch (or Wi-Fi AP) reads the destination MAC rr:01, looks it up in its MAC table and sends the frame out of the router\'s port only. It never looks at the IP.', hdr: H('aa:aa (PC)', 'rr:01 (router)', '192.168.1.10', '142.250.1.1', 64, 5000, 443) },
  { t: 'Router: new frame, MAC changes, IP stays, TTL − 1', tags: ['net', 'dl'], from: 'sw', at: 'hr', d: 'The home router strips the Ethernet header, does a longest-prefix match (only 0.0.0.0/0 matches → ISP), decrements TTL to 63, recomputes the IP checksum and builds a brand-new frame for the next link: both MACs change.', hdr: H('rr:02 (router WAN)', 'i1:a (ISP router)', '192.168.1.10', '142.250.1.1', 63, 5000, 443) },
  { t: 'NAT rewrites the source', tags: ['net', 'tr'], from: 'hr', at: 'r1', d: 'Private addresses can\'t travel on the Internet, so the router rewrites the source to its public IP and a free port (PAT) and records 192.168.1.10:5000 ↔ 49.x.x.x:30001 in its translation table.', hdr: H('rr:02 (router WAN)', 'i1:a (ISP router)', '49.x.x.x', '142.250.1.1', 63, 30001, 443) },
  { t: 'ISP and backbone routers → Google\'s load balancer', tags: ['net', 'app'], from: 'r1', at: 'lb', d: 'Each router repeats the trick: new MACs, same IPs, TTL − 1. BGP chose the path between autonomous systems. Google\'s frontend (an L7 load balancer / reverse proxy at an edge near you) terminates TLS and forwards the request to a healthy backend server, which may call other services and databases.', hdr: H('r2:b (backbone)', 'lb:01 (Google LB)', '49.x.x.x', '142.250.1.1', 61, 30001, 443) },
  { t: 'Response travels back', tags: ['tr', 'net'], from: 'lb', at: 'pc', back: true, d: 'HTTP/2 200 OK, encrypted, segmented and routed back the same way. Your router reverses NAT (49.x.x.x:30001 → 192.168.1.10:5000). TCP handles ordering, ACKs, retransmission, flow control (rwnd) and congestion control (cwnd).', hdr: H('rr:01 (router)', 'aa:aa (PC)', '142.250.1.1', '192.168.1.10', 58, 443, 5000) },
  { t: 'Browser decrypts, renders, fetches more', tags: ['app'], at: 'pc', d: 'Up the stack: Ethernet → IP → TCP → TLS decrypts → HTTP. The browser parses HTML into the DOM, CSS into the CSSOM, lays out and paints, then fetches CSS, JS, images, fonts and API calls, reusing the same connection (HTTP/2 multiplexing). With HTTP/3, steps 5–6 would be a single QUIC handshake over UDP.' },
];

const FIELDS = [['smac', 'Src MAC', 'dl'], ['dmac', 'Dst MAC', 'dl'], ['sip', 'Src IP', 'net'], ['dip', 'Dst IP', 'net'], ['ttl', 'TTL', 'net'], ['sp', 'Src port', 'tr'], ['dp', 'Dst port', 'tr']];

export function Journey() {
  const st = useStepper(STEPS.length, { interval: 3200 });
  const s = STEPS[st.i];
  const prevH = STEPS.slice(0, st.i).reverse().find((x) => x.hdr)?.hdr;
  const px = s.at === 'dns' ? DNS.x : X[s.at];
  const py = s.at === 'dns' ? DNS.y + 22 : 112;
  const lit = (k) => {
    if (s.whole) return k !== 'sv';
    if (!s.from) return k === s.at;
    const a = X[s.from]; const b = X[s.at];
    return X[k] >= Math.min(a, b) && X[k] <= Math.max(a, b);
  };
  return (
    <Card title="The journey of one request" tag="play the whole thing">
      <div className="svg-wrap">
        <svg viewBox="0 0 720 170" style={{ minWidth: 560 }} role="img" aria-label={`Step ${st.i + 1}: ${s.t}`}>
          <rect x={8} y={70} width={198} height={92} rx={10} fill="color-mix(in srgb,var(--l4) 7%,transparent)" stroke="var(--l4)" strokeDasharray="5 4" />
          <text x={16} y={156} className="svgmut" fontSize="10">home LAN 192.168.1.0/24</text>
          <rect x={530} y={70} width={182} height={92} rx={10} fill="color-mix(in srgb,var(--l7) 7%,transparent)" stroke="var(--l7)" strokeDasharray="5 4" />
          <text x={704} y={156} textAnchor="end" className="svgmut" fontSize="10">Google</text>
          <line x1={DNS.x} y1={DNS.y + 14} x2={X.r1} y2={96} stroke={s.at === 'dns' ? 'var(--l7)' : 'var(--line)'} strokeWidth="2" strokeDasharray="4 3" />
          <rect x={DNS.x - 54} y={DNS.y - 14} width={108} height={28} rx={7} fill={s.at === 'dns' ? 'var(--l7)' : 'var(--surface)'} stroke="var(--ink)" strokeWidth="1.2" />
          <text x={DNS.x} y={DNS.y + 4} textAnchor="middle" fontSize="10.5" fill={s.at === 'dns' ? 'var(--accent-ink)' : 'var(--ink)'}>DNS resolver</text>
          {N.slice(0, -1).map((n, i) => (
            <line key={n.k} x1={n.x} y1={112} x2={N[i + 1].x} y2={112} stroke={lit(n.k) && lit(N[i + 1].k) && (s.from || s.whole) ? 'var(--lc,var(--accent))' : 'var(--line)'} strokeWidth="3" />
          ))}
          {N.map((n) => (
            <g key={n.k}>
              <rect x={n.x - 40} y={96} width={80} height={32} rx={7} fill={lit(n.k) ? 'var(--ink)' : 'var(--surface)'} stroke="var(--ink)" strokeWidth="1.2" />
              <text x={n.x} y={110} textAnchor="middle" fontSize="10" fontWeight="600" fill={lit(n.k) ? 'var(--bg)' : 'var(--ink)'}>{n.n}</text>
              <text x={n.x} y={122} textAnchor="middle" fontSize="8.5" fill={lit(n.k) ? 'var(--bg)' : 'var(--muted)'}>{n.s}</text>
            </g>
          ))}
          <g className="moving" style={{ transform: `translate(${px}px, ${py - 30}px)` }}>
            <rect x={-15} y={-11} width={30} height={20} rx={4} fill="var(--warn)" stroke="var(--surface)" strokeWidth="2" />
            <text x={0} y={3} textAnchor="middle" fontSize="9" fill="var(--accent-ink)" fontWeight="700">{s.back ? '◀' : '▶'}</text>
          </g>
        </svg>
      </div>
      <div className="note-box" aria-live="polite">
        <b>{st.i + 1}. {s.t}</b>{' '}
        {s.tags.map((t) => <span key={t} className="tag-l" style={{ '--tc': T[t][1], marginRight: 4 }}>{T[t][0]}</span>)}
        <div style={{ marginTop: '.3rem' }}>{s.d}</div>
      </div>
      {s.box && <div className="out">{s.box}</div>}
      {s.hdr && (
        <div className="tbl"><table>
          <thead><tr>{FIELDS.map(([, h, l]) => <th key={h} style={{ borderTop: `3px solid ${T[l][1]}` }}>{h}</th>)}</tr></thead>
          <tbody><tr>{FIELDS.map(([k]) => <td key={k} className={'mono' + (prevH && prevH[k] !== s.hdr[k] ? ' chg' : '')}>{s.hdr[k]}</td>)}</tr></tbody>
        </table></div>
      )}
      <StepControls st={st} />
      <ol className="steps" style={{ marginTop: '.8rem' }}>
        {STEPS.map((x, i) => (
          <li key={i} className={i < st.i ? 'past' : i === st.i ? 'cur' : 'fut'} onClick={() => st.set(i)}>
            <div>
              <div className="st">{x.t} {x.tags.map((t) => <span key={t} className="tag" style={{ '--tc': T[t][1] }}>{T[t][0]}</span>)}</div>
              {i === st.i && <div className="sd">{x.d}</div>}
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
