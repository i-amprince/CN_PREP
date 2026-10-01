import { useState } from 'react';
import { Card, useStepper, StepControls, Tabs } from './common.jsx';

const STEPS = [
  { at: 70, t: 'Host 10.0.1.5 in Office A sends a normal packet to 10.0.2.9 in Office B. Private addresses: they can\'t be routed on the Internet.', layers: ['inner'] },
  { at: 175, t: 'Gateway A encapsulates: the whole original packet becomes the payload of a NEW packet with an outer IP header (gateway A → gateway B).', layers: ['outer', 'tun', 'inner'] },
  { at: 340, t: 'Internet routers forward using only the OUTER header (203.0.113.1 → 198.51.100.7). They never look inside.', layers: ['outer', 'tun', 'inner'], net: true },
  { at: 505, t: 'Gateway B decapsulates: checks and strips the outer header (and decrypts, for IPsec).', layers: ['outer', 'tun', 'inner'], strip: true },
  { at: 610, t: 'The original packet is delivered inside Office B exactly as it was sent. To the two hosts it looks like one private network.', layers: ['inner'] },
];

export function Tunnel() {
  const [kind, setKind] = useState('ipsec');
  const st = useStepper(STEPS.length, { interval: 2200 });
  const s = STEPS[st.i];
  const enc = kind === 'ipsec' && s.layers.includes('outer');
  const sniff = s.net;
  return (
    <Card title="Tunneling: a packet inside a packet" tag="step through">
      <Tabs items={[['ipsec', 'IPsec ESP tunnel (encrypted)'], ['gre', 'GRE tunnel (no encryption)']]} value={kind} onChange={setKind} />
      <div className="svg-wrap">
        <svg viewBox="0 0 680 150" style={{ minWidth: 520 }} role="img" aria-label="Office A gateway, Internet, Office B gateway">
          <rect x={6} y={30} width={215} height={110} rx={12} fill="color-mix(in srgb,var(--l4) 7%,transparent)" stroke="var(--l4)" strokeDasharray="5 4" />
          <text x={14} y={48} className="svgmut">Office A 10.0.1.0/24</text>
          <rect x={459} y={30} width={215} height={110} rx={12} fill="color-mix(in srgb,var(--l4) 7%,transparent)" stroke="var(--l4)" strokeDasharray="5 4" />
          <text x={666} y={48} textAnchor="end" className="svgmut">Office B 10.0.2.0/24</text>
          <ellipse cx={340} cy={95} rx={110} ry={38} fill="color-mix(in srgb,var(--l3) 9%,transparent)" stroke="var(--l3)" />
          <text x={340} y={68} textAnchor="middle" className="svgmut">Internet (untrusted)</text>
          <rect x={175} y={84} width={330} height={22} rx={11} fill={kind === 'ipsec' ? 'color-mix(in srgb,var(--good) 22%,transparent)' : 'color-mix(in srgb,var(--warn) 22%,transparent)'} stroke={kind === 'ipsec' ? 'var(--good)' : 'var(--warn)'} strokeWidth="2" />
          <text x={340} y={99} textAnchor="middle" fontSize="10" fill="var(--ink)">{kind === 'ipsec' ? '🔒 tunnel' : 'tunnel (readable)'}</text>
          {[[70, 'Host 10.0.1.5'], [175, 'Gateway A'], [505, 'Gateway B'], [610, 'Host 10.0.2.9']].map(([x, l], i) => (
            <g key={l}>
              <rect x={x - 42} y={80} width={84} height={30} rx={7} fill={i === 1 || i === 2 ? 'var(--ink)' : 'var(--surface)'} stroke="var(--ink)" />
              <text x={x} y={99} textAnchor="middle" fontSize="10" fontWeight="600" fill={i === 1 || i === 2 ? 'var(--bg)' : 'var(--ink)'}>{l}</text>
            </g>
          ))}
          <g className="moving" style={{ transform: `translate(${s.at}px, 62px)` }}>
            <rect x={-18} y={-12} width={36} height={22} rx={4} fill="var(--warn)" stroke="var(--surface)" strokeWidth="2" />
            <text x={0} y={3} textAnchor="middle" fontSize="10">{enc ? '🔒' : '✉'}</text>
          </g>
          {sniff && <text x={340} y={140} textAnchor="middle" fontSize="10.5" fill="var(--ink)">An observer here sees: 203.0.113.1 → 198.51.100.7 {kind === 'ipsec' ? '+ encrypted bytes' : '+ the inner packet in plain text!'}</text>}
        </svg>
      </div>
      <div className="stack" style={{ marginTop: '.6rem' }}>
        <div className="small muted">What the packet looks like at this point:</div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', opacity: 1 }}>
          {s.layers.includes('outer') && <span className="nest" style={{ background: 'var(--l3)', color: 'var(--accent-ink)', textDecoration: s.strip ? 'line-through' : 'none' }}>Outer IP 203.0.113.1 → 198.51.100.7</span>}
          {s.layers.includes('tun') && <span className="nest" style={{ background: kind === 'ipsec' ? 'var(--good)' : 'var(--warn)', color: 'var(--accent-ink)', textDecoration: s.strip ? 'line-through' : 'none' }}>{kind === 'ipsec' ? 'ESP hdr (SPI, seq)' : 'GRE hdr (proto 47)'}</span>}
          <span className="nest" style={{ background: enc ? 'repeating-linear-gradient(45deg,var(--surface-2),var(--surface-2) 6px,var(--bg) 6px,var(--bg) 12px)' : 'color-mix(in srgb,var(--l4) 18%,var(--bg))' }}>
            {enc ? '🔒 encrypted: [IP 10.0.1.5 → 10.0.2.9][TCP][data]' : '[IP 10.0.1.5 → 10.0.2.9][TCP][data]'}
          </span>
          {s.layers.includes('outer') && kind === 'ipsec' && <span className="nest" style={{ background: 'var(--good-soft)' }}>ESP trailer + ICV</span>}
        </div>
      </div>
      <div className="note-box" aria-live="polite"><b>Step {st.i + 1}.</b> {s.t} {s.net && kind === 'gre' && <b className="bad-t">GRE only encapsulates, so anyone on the path can read the inner packet.</b>}</div>
      <StepControls st={st} />
    </Card>
  );
}

export function VpnTypes() {
  const [t, setT] = useState('remote');
  const [split, setSplit] = useState(false);
  return (
    <Card title="Remote-access vs site-to-site VPN" tag="compare">
      <Tabs items={[['remote', 'Remote access'], ['site', 'Site-to-site']]} value={t} onChange={setT} />
      {t === 'remote' ? (
        <>
          <label><input type="checkbox" checked={split} onChange={(e) => setSplit(e.target.checked)} /> Split tunneling</label>
          <svg viewBox="0 0 600 190" style={{ marginTop: '.4rem' }} role="img" aria-label="Remote access VPN">
            <rect x={20} y={70} width={110} height={40} rx={8} fill="var(--surface)" stroke="var(--ink)" /><text x={75} y={88} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--ink)">Employee laptop</text><text x={75} y={102} textAnchor="middle" fontSize="9" fill="var(--muted)">VPN client · café Wi-Fi</text>
            <path d="M130,90 C230,90 300,90 380,90" stroke="var(--good)" strokeWidth="10" fill="none" opacity=".35" />
            <path d="M130,90 C230,90 300,90 380,90" stroke="var(--good)" strokeWidth="2" fill="none" />
            <text x={255} y={80} textAnchor="middle" fontSize="10.5" fill="var(--ink)">🔒 encrypted tunnel over the Internet</text>
            <rect x={380} y={70} width={90} height={40} rx={8} fill="var(--ink)" /><text x={425} y={94} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--bg)">VPN gateway</text>
            <rect x={500} y={45} width={90} height={90} rx={10} fill="color-mix(in srgb,var(--l4) 10%,transparent)" stroke="var(--l4)" strokeDasharray="5 4" /><text x={545} y={88} textAnchor="middle" fontSize="10.5" fill="var(--ink)">Company</text><text x={545} y={102} textAnchor="middle" fontSize="10.5" fill="var(--ink)">network</text>
            <line x1={470} y1={90} x2={500} y2={90} stroke="var(--muted)" strokeWidth="2" />
            {split ? (
              <><path d="M110,110 C150,170 260,170 300,165" stroke="var(--warn)" strokeWidth="2" fill="none" strokeDasharray="5 4" /><rect x={300} y={150} width={110} height={30} rx={7} fill="var(--surface)" stroke="var(--ink)" /><text x={355} y={169} textAnchor="middle" fontSize="10.5" fill="var(--ink)">youtube.com</text><text x={190} y={176} fontSize="9.5" fill="var(--warn)">direct, not via VPN</text></>
            ) : <text x={255} y={140} textAnchor="middle" fontSize="10" fill="var(--muted)">Full tunnel: ALL traffic (even YouTube) goes through the company first</text>}
          </svg>
          <div className="note-box">One user's device runs a VPN client and joins the company network as if plugged in at the office. {split ? 'With split tunneling only company-bound traffic uses the tunnel; the rest goes straight out (saves bandwidth, but that traffic is unprotected by the company).' : 'Full tunnel: everything is inspected and protected by the company, at the cost of extra latency.'}</div>
        </>
      ) : (
        <>
          <svg viewBox="0 0 600 170" role="img" aria-label="Site-to-site VPN">
            {[[20, 'Office A (Delhi)'], [430, 'Office B (Bengaluru)']].map(([x, l]) => (
              <g key={l}><rect x={x} y={30} width={150} height={110} rx={12} fill="color-mix(in srgb,var(--l4) 8%,transparent)" stroke="var(--l4)" strokeDasharray="5 4" /><text x={x + 75} y={50} textAnchor="middle" fontSize="10.5" fill="var(--ink)">{l}</text>
                {[0, 1, 2].map((i) => <rect key={i} x={x + 14 + i * 44} y={110} width={34} height={20} rx={4} fill="var(--surface)" stroke="var(--muted)" />)}</g>
            ))}
            <rect x={130} y={70} width={70} height={30} rx={7} fill="var(--ink)" /><text x={165} y={89} textAnchor="middle" fontSize="10" fill="var(--bg)">Router/FW</text>
            <rect x={400} y={70} width={70} height={30} rx={7} fill="var(--ink)" /><text x={435} y={89} textAnchor="middle" fontSize="10" fill="var(--bg)">Router/FW</text>
            <path d="M200,85 L400,85" stroke="var(--good)" strokeWidth="10" opacity=".35" /><path d="M200,85 L400,85" stroke="var(--good)" strokeWidth="2" />
            <text x={300} y={75} textAnchor="middle" fontSize="10.5" fill="var(--ink)">🔒 IPsec tunnel mode, always on</text>
          </svg>
          <div className="note-box">Two gateways keep a permanent tunnel. Hosts need no VPN software: a PC in Office A just sends to 10.0.2.9 and its router encrypts and tunnels it. Typical protocol: IPsec in tunnel mode.</div>
        </>
      )}
    </Card>
  );
}
