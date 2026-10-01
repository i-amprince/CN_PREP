// One generic sequence-diagram component used for ARP, handshake, FIN, DNS, DHCP, TLS and RTS/CTS.
import { useId, useMemo, useState } from 'react';
import { Card, useStepper, StepControls } from './common.jsx';

export function SequenceDiagram({ title, tag = 'step through', lanes, msgs, intro, children }) {
  const st = useStepper(msgs.length + 1, { interval: 1700 });
  const uid = useId().replace(/:/g, '');
  const n = lanes.length;
  const gap = n <= 2 ? 380 : n === 3 ? 210 : n === 4 ? 150 : 128;
  const mx = 72;
  const W = mx * 2 + gap * (n - 1);
  const top = 92;
  const rowH = 44;
  const H = top + msgs.length * rowH + 24;
  const X = (k) => mx + k * gap;

  // lane states after applying the first i messages
  const states = useMemo(() => {
    const s = lanes.map((l) => l.init || '');
    for (let k = 0; k < st.i; k++) Object.entries(msgs[k].set || {}).forEach(([lane, v]) => { s[lane] = v; });
    return s;
  }, [lanes, msgs, st.i]);

  const cur = st.i > 0 ? msgs[st.i - 1] : null;

  return (
    <Card title={title} tag={tag}>
      {children}
      <div className="svg-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: Math.min(W, 560), maxWidth: Math.max(W * 1.12, 560), margin: '0 auto' }} role="img" aria-label={`${title} sequence diagram, step ${st.i} of ${msgs.length}`}>
          <defs>
            <marker id={`a${uid}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker>
            <marker id={`c${uid}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--lc,var(--accent))" /></marker>
          </defs>
          {lanes.map((l, k) => (
            <g key={k}>
              <rect x={X(k) - 62} y={6} width={124} height={30} rx={7} fill="var(--ink)" />
              <text x={X(k)} y={26} textAnchor="middle" fill="var(--bg)" fontSize="12.5" fontWeight="600">{l.name}</text>
              {l.sub && <text x={X(k)} y={50} textAnchor="middle" className="svgmut" fontSize="10">{l.sub}</text>}
              <line x1={X(k)} y1={top - 18} x2={X(k)} y2={H - 6} stroke="var(--line)" strokeWidth="2" strokeDasharray="4 4" />
              {states[k] && (
                <g>
                  <rect x={X(k) - 62} y={top - 34} width={124} height={20} rx={10} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1" />
                  <text x={X(k)} y={top - 20} textAnchor="middle" fontSize="10.5" fill="var(--ink)" fontWeight="600">{states[k]}</text>
                </g>
              )}
            </g>
          ))}
          {msgs.map((m, k) => {
            if (k >= st.i) return null;
            const y = top + k * rowH + 14;
            const isCur = k === st.i - 1;
            const col = isCur ? 'var(--lc,var(--accent))' : 'var(--muted)';
            const mk = isCur ? `url(#c${uid})` : `url(#a${uid})`;
            const targets = Array.isArray(m.to) ? m.to : [m.to];
            if (m.from === m.to) {
              return (
                <g key={k}>
                  <rect x={X(m.from) - 70} y={y - 6} width={140} height={26} rx={6} fill={isCur ? 'var(--warn-soft)' : 'var(--surface-2)'} stroke={isCur ? 'var(--warn)' : 'var(--line)'} />
                  <text x={X(m.from)} y={y + 11} textAnchor="middle" fontSize="11" fill="var(--ink)">{m.label}</text>
                </g>
              );
            }
            return (
              <g key={k}>
                {targets.map((t, j) => {
                  const x1 = X(m.from); const x2 = X(t);
                  const dir = Math.sign(x2 - x1);
                  return <line key={j} x1={x1 + dir * 4} y1={y} x2={x2 - dir * 4} y2={y + 14} stroke={col} strokeWidth={isCur ? 2.4 : 1.6} strokeDasharray={m.bcast ? '6 4' : m.data ? '2 3' : undefined} markerEnd={mk} />;
                })}
                {(() => {
                  const far = targets.reduce((a, t) => (Math.abs(X(t) - X(m.from)) > Math.abs(X(a) - X(m.from)) ? t : a), targets[0]);
                  const near = targets.reduce((a, t) => (Math.abs(X(t) - X(m.from)) < Math.abs(X(a) - X(m.from)) ? t : a), targets[0]);
                  const mid = (X(m.from) + X(targets.length > 1 ? near : far)) / 2;
                  return (
                    <text x={mid} y={y - 4} textAnchor="middle" fontSize="11.5" fill={isCur ? 'var(--ink)' : 'var(--muted)'} fontWeight={isCur ? 600 : 400}>
                      {m.label}{m.bcast ? '  (broadcast)' : ''}
                    </text>
                  );
                })()}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="note-box seq-note" aria-live="polite">
        {cur ? <><b>{st.i}. {cur.label}</b>{' '}{cur.note}</> : <><b>Start.</b> {intro}</>}
      </div>
      <StepControls st={st} label={`Message ${st.i} / ${msgs.length}`} />
    </Card>
  );
}

/* ---------------- configurations ---------------- */
function Handshake() {
  const [x, setX] = useState(100);
  const [y, setY] = useState(500);
  const xi = Number(x) || 0; const yi = Number(y) || 0;
  const msgs = [
    { from: 0, to: 1, label: `SYN, Seq=${xi}`, set: { 0: 'SYN-SENT', 1: 'SYN-RECEIVED' }, note: `Client: "I want to connect; my sequence numbers start at ${xi}." SYN flag = 1. The client moves CLOSED → SYN-SENT; the server, on receiving it, LISTEN → SYN-RECEIVED.` },
    { from: 1, to: 0, label: `SYN+ACK, Seq=${yi}, Ack=${xi + 1}`, set: { 0: 'ESTABLISHED' }, note: `Server: "Got your SYN (it consumed one number, so I expect ${xi + 1} next). My numbers start at ${yi}." The client now knows both directions work → ESTABLISHED.` },
    { from: 0, to: 1, label: `ACK, Seq=${xi + 1}, Ack=${yi + 1}`, set: { 1: 'ESTABLISHED' }, note: `Client: "Got your SYN, I expect ${yi + 1} next." This third message proves to the server that the client received the SYN-ACK. Server → ESTABLISHED. This ACK may already carry data.` },
    { from: 0, to: 1, label: `Data 100 B, Seq=${xi + 1}`, data: true, note: `Data transfer begins. The 100 bytes occupy sequence numbers ${xi + 1} … ${xi + 100}.` },
    { from: 1, to: 0, label: `ACK, Ack=${xi + 101}`, note: `ACK number = next byte expected = ${xi + 1} + 100 = ${xi + 101}. A pure ACK consumes no sequence number.` },
  ];
  return (
    <SequenceDiagram title="TCP 3-way handshake" lanes={[{ name: 'Client', init: 'CLOSED' }, { name: 'Server', init: 'LISTEN' }]} msgs={msgs}
      intro="The server has called listen() and waits in LISTEN. The client is CLOSED. Change the ISNs above and step through.">
      <div className="row" style={{ marginBottom: '.6rem' }}>
        <label>Client ISN x <input type="number" value={x} onChange={(e) => setX(e.target.value)} /></label>
        <label>Server ISN y <input type="number" value={y} onChange={(e) => setY(e.target.value)} /></label>
      </div>
    </SequenceDiagram>
  );
}

const CONFIGS = {
  rtscts: {
    title: 'RTS / CTS exchange',
    lanes: [{ name: 'A (sender)' }, { name: 'B (receiver/AP)' }, { name: 'C (hidden from A)' }],
    intro: 'A wants to send a large frame to B. C is out of A\'s range, so it can\'t hear A, but it can hear B.',
    msgs: [
      { from: 0, to: 1, label: 'RTS (duration)', note: 'A sends a short Request To Send carrying how long the whole exchange will take. C does not hear it.' },
      { from: 1, to: [0, 2], label: 'CTS (duration)', set: { 2: 'NAV set · silent' }, note: 'B answers Clear To Send. Everyone in B\'s range hears it, including the hidden node C, which sets its NAV timer and stays silent.' },
      { from: 0, to: 1, label: 'DATA', data: true, note: 'A sends the data frame. No collision at B, because C is deferring.' },
      { from: 1, to: 0, label: 'ACK', set: { 2: 'NAV expired' }, note: 'B acknowledges after a SIFS. The reserved period ends and C may contend for the channel again.' },
    ],
  },
  arp: {
    title: 'ARP request and reply',
    lanes: [{ name: 'A', sub: '192.168.1.10 · AA-AA', init: 'cache: miss' }, { name: 'B', sub: '192.168.1.20 · BB-BB' }, { name: 'C', sub: '192.168.1.30 · CC-CC' }],
    intro: 'A wants to send to 192.168.1.20 (same subnet). It knows B\'s IP but Ethernet needs B\'s MAC, and A\'s ARP cache has no entry.',
    msgs: [
      { from: 0, to: [1, 2], label: 'Who has 192.168.1.20?', bcast: true, set: { 1: 'caches A', 2: 'not me: drop' }, note: 'ARP Request sent to FF:FF:FF:FF:FF:FF (broadcast) because A doesn\'t know B\'s MAC. Every host on the LAN receives it. C ignores it; B recognises its IP (and caches A\'s IP→MAC from the request).' },
      { from: 1, to: 0, label: '192.168.1.20 is BB-BB', set: { 0: 'cache: .20 → BB-BB' }, note: 'ARP Reply is unicast: B now knows exactly who asked. A stores 192.168.1.20 → BB-BB in its ARP cache.' },
      { from: 0, to: 1, label: 'IP packet in frame to BB-BB', data: true, note: 'A can now build the Ethernet frame: Dst MAC = BB-BB, Src MAC = AA-AA, with the IP packet inside.' },
    ],
  },
  fin: {
    title: 'TCP 4-way termination',
    lanes: [{ name: 'Client (active)', init: 'ESTABLISHED' }, { name: 'Server (passive)', init: 'ESTABLISHED' }],
    intro: 'The client\'s application calls close(). It becomes the active closer.',
    msgs: [
      { from: 0, to: 1, label: 'FIN, Seq=5000', set: { 0: 'FIN-WAIT-1', 1: 'CLOSE-WAIT' }, note: 'Client: "I have no more data to send." FIN consumes one sequence number. Server enters CLOSE-WAIT (its app hasn\'t closed yet).' },
      { from: 1, to: 0, label: 'ACK, Ack=5001', set: { 0: 'FIN-WAIT-2' }, note: 'Server: "Got your FIN" (5000 + 1). The client → server direction is closed. This is a half-close.' },
      { from: 1, to: 0, label: 'DATA (still allowed)', data: true, note: 'TCP is full-duplex: the server can keep sending data until it sends its own FIN.' },
      { from: 1, to: 0, label: 'FIN, Seq=8000', set: { 1: 'LAST-ACK', 0: 'TIME-WAIT' }, note: 'Server\'s app calls close(): "I\'m also finished sending." Server → LAST-ACK.' },
      { from: 0, to: 1, label: 'ACK, Ack=8001', set: { 1: 'CLOSED' }, note: 'Final ACK. The server is CLOSED. The client stays in TIME_WAIT.' },
      { from: 0, to: 0, label: 'TIME_WAIT 2×MSL → CLOSED', set: { 0: 'CLOSED' }, note: 'The active closer waits 2 × MSL so delayed old segments die out and it can re-send the final ACK if the server\'s FIN is retransmitted. Then CLOSED.' },
    ],
  },
  dns: {
    title: 'DNS resolution walk',
    lanes: [{ name: 'Client' }, { name: 'Resolver', sub: 'ISP / 8.8.8.8' }, { name: 'Root' }, { name: 'TLD (.com)' }, { name: 'Authoritative', sub: 'ns1.google.com' }],
    intro: 'The browser, OS and resolver caches all missed. The client asks its recursive resolver.',
    msgs: [
      { from: 0, to: 1, label: 'A? google.com', note: 'Recursive query: "give me the final answer". UDP port 53.' },
      { from: 1, to: 2, label: 'A? google.com', note: 'The resolver starts at a root server (it knows their addresses from a built-in hints file).' },
      { from: 2, to: 1, label: 'Ask .com: a.gtld-servers.net', note: 'Iterative answer, a referral: "I don\'t know, but the .com TLD servers do."' },
      { from: 1, to: 3, label: 'A? google.com', note: 'Resolver follows the referral to a .com TLD server.' },
      { from: 3, to: 1, label: 'Ask ns1.google.com', note: 'Another referral: the NS records for google.com (plus their IPs as "glue").' },
      { from: 1, to: 4, label: 'A? google.com', note: 'Resolver asks Google\'s authoritative name server.' },
      { from: 4, to: 1, label: 'A 142.250.x.x, TTL 300', set: { 1: 'cached 300 s' }, note: 'The authoritative answer. The resolver caches it for the TTL (seconds).' },
      { from: 1, to: 0, label: 'google.com = 142.250.x.x', set: { 0: 'cached' }, note: 'Final answer back to the client, which also caches it. Next time: cache hit, no walk needed.' },
    ],
  },
  dhcp: {
    title: 'DHCP DORA',
    lanes: [{ name: 'Client', sub: 'no IP yet', init: 'INIT' }, { name: 'DHCP server', sub: '192.168.1.1' }],
    intro: 'A laptop joins the network with no IP address and no idea where the DHCP server is.',
    msgs: [
      { from: 0, to: 1, label: 'DISCOVER  0.0.0.0:68 → 255.255.255.255:67', bcast: true, set: { 0: 'SELECTING' }, note: 'Broadcast, because the client has no IP and doesn\'t know the server\'s IP. UDP, client port 68 → server port 67.' },
      { from: 1, to: 0, label: 'OFFER  192.168.1.20, lease 24 h', note: 'The server offers an address plus mask, gateway, DNS server and lease time.' },
      { from: 0, to: 1, label: 'REQUEST  "I want 192.168.1.20"', bcast: true, set: { 0: 'REQUESTING' }, note: 'Broadcast again, so any other server that made an offer knows it wasn\'t chosen.' },
      { from: 1, to: 0, label: 'ACK  config confirmed', set: { 0: 'BOUND' }, note: 'Server confirms. The client configures IP 192.168.1.20/24, gateway 192.168.1.1, DNS. It will renew at 50% of the lease (T1).' },
    ],
  },
  tls: {
    title: 'TLS 1.3 handshake (1-RTT)',
    lanes: [{ name: 'Client', init: 'TCP open' }, { name: 'Server', init: 'TCP open' }],
    intro: 'The TCP connection is already established. Now TLS 1.3 sets up encryption in one round trip.',
    msgs: [
      { from: 0, to: 1, label: 'ClientHello + key_share + SNI', set: { 0: 'WAIT_SERVER_HELLO' }, note: 'Supported TLS versions and cipher suites, a random nonce, the client\'s ephemeral (EC)DHE public value (key share), and SNI = google.com.' },
      { from: 1, to: 0, label: 'ServerHello + key_share', set: { 0: 'handshake keys', 1: 'handshake keys' }, note: 'Server picks the cipher suite and sends its own ephemeral public value. Both sides can now compute the same shared secret (Diffie-Hellman) and derive handshake keys. Everything after this is encrypted.' },
      { from: 1, to: 0, label: '{Certificate, CertVerify, Finished}', note: 'Encrypted: the certificate chain, a signature over the handshake with the server\'s private key (proves it owns the certificate), and a MAC over the whole handshake.' },
      { from: 0, to: 0, label: 'verify chain · SAN · dates', note: 'The client validates the certificate chain up to a trusted root CA, checks the name matches google.com, checks validity dates, and verifies the CertificateVerify signature.' },
      { from: 0, to: 1, label: '{Finished}', set: { 0: 'CONNECTED', 1: 'CONNECTED' }, note: 'Client confirms the handshake wasn\'t tampered with. Both derive the symmetric application traffic keys (e.g. AES-GCM).' },
      { from: 0, to: 1, label: '[GET / HTTP/2]', data: true, note: 'Application data, encrypted with the symmetric session key. Total: 1 RTT before the first request (TLS 1.2 needed 2).' },
      { from: 1, to: 0, label: '[HTTP/2 200 OK]', data: true, note: 'Encrypted response. With session resumption, a returning client can even send data in its first flight (0-RTT).' },
    ],
  },
};

export function SeqWidget({ which }) {
  if (which === 'handshake') return <Handshake />;
  const c = CONFIGS[which];
  if (!c) return <Card title={`Sequence “${which}”`} tag="missing"><p className="muted">Unknown sequence.</p></Card>;
  return <SequenceDiagram title={c.title} lanes={c.lanes} msgs={c.msgs} intro={c.intro} />;
}
