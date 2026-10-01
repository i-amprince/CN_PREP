import { useState } from 'react';
import { Card, Tabs } from './common.jsx';

const Dev = ({ x, y, l, hl }) => (
  <g><rect x={x - 30} y={y - 13} width={60} height={26} rx={6} fill={hl ? 'var(--accent-soft)' : 'var(--surface)'} stroke={hl ? 'var(--accent)' : 'var(--ink)'} strokeWidth="1.4" /><text x={x} y={y + 4} textAnchor="middle" fontSize="10.5" fill="var(--ink)">{l}</text></g>
);
const Ap = ({ x, y, l = 'AP' }) => (
  <g><rect x={x - 32} y={y - 15} width={64} height={30} rx={7} fill="var(--ink)" /><text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--bg)">{l}</text></g>
);
const Radio = ({ a, b, on = true }) => <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={on ? 'var(--l2)' : 'var(--line)'} strokeWidth="2" strokeDasharray="3 4" />;

export function WlanModes() {
  const [t, setT] = useState('infra');
  const [pos, setPos] = useState(120);
  const ap1 = 150; const ap2 = 450;
  const assoc = Math.abs(pos - ap1) <= Math.abs(pos - ap2) ? 1 : 2;
  return (
    <Card title="Wi-Fi modes" tag="compare">
      <Tabs items={[['infra', 'Infrastructure (BSS)'], ['adhoc', 'Ad hoc (IBSS)'], ['ess', 'ESS + roaming']]} value={t} onChange={setT} />
      {t === 'infra' && (
        <>
          <svg viewBox="0 0 600 200" role="img" aria-label="Infrastructure mode">
            <circle cx={180} cy={100} r={92} fill="color-mix(in srgb,var(--l2) 7%,transparent)" stroke="var(--l2)" strokeDasharray="4 4" />
            {[[80, 45, 'Laptop'], [80, 155, 'Phone'], [265, 160, 'Tablet']].map(([x, y, l]) => <g key={l}><Radio a={[x, y]} b={[180, 100]} /><Dev x={x} y={y} l={l} /></g>)}
            <line x1={212} y1={100} x2={330} y2={100} stroke="var(--muted)" strokeWidth="3" /><line x1={390} y1={100} x2={450} y2={100} stroke="var(--muted)" strokeWidth="3" /><line x1={510} y1={100} x2={560} y2={100} stroke="var(--muted)" strokeWidth="3" />
            <Ap x={180} y={100} />
            <rect x={330} y={86} width={60} height={28} rx={6} fill="var(--surface)" stroke="var(--ink)" /><text x={360} y={104} textAnchor="middle" fontSize="10.5" fill="var(--ink)">Switch</text>
            <rect x={450} y={86} width={60} height={28} rx={6} fill="var(--surface)" stroke="var(--ink)" /><text x={480} y={104} textAnchor="middle" fontSize="10.5" fill="var(--ink)">Router</text>
            <text x={575} y={104} textAnchor="middle" fontSize="16">☁</text>
            <text x={180} y={20} textAnchor="middle" className="svgmut">SSID "Home" · BSSID = AP's MAC</text>
          </svg>
          <div className="note-box">Every frame goes <b>through the AP</b>, even between two laptops on the same Wi-Fi. The AP bridges to the wired LAN (Laptop/Phone → AP → Switch → Router → Internet). This is how almost every home, office and campus network works.</div>
        </>
      )}
      {t === 'adhoc' && (
        <>
          <svg viewBox="0 0 600 190" role="img" aria-label="Ad hoc mode">
            {[[[150, 50], [450, 50]], [[150, 50], [300, 150]], [[450, 50], [300, 150]]].map(([a, b], i) => <Radio key={i} a={a} b={b} />)}
            <Dev x={150} y={50} l="Laptop A" /><Dev x={450} y={50} l="Laptop B" /><Dev x={300} y={150} l="Phone C" />
          </svg>
          <div className="note-box">No AP: devices talk <b>directly</b> to each other (an Independent BSS). Quick file sharing or a temporary network; no wired uplink unless one device bridges. Wi-Fi Direct is the modern form.</div>
        </>
      )}
      {t === 'ess' && (
        <>
          <label style={{ display: 'flex' }}>Walk the laptop across campus <input type="range" min="40" max="560" value={pos} onChange={(e) => setPos(Number(e.target.value))} aria-label="laptop position" /></label>
          <svg viewBox="0 0 600 200" role="img" aria-label="Extended service set with roaming">
            <circle cx={ap1} cy={110} r={140} fill="color-mix(in srgb,var(--l2) 6%,transparent)" stroke="var(--l2)" strokeDasharray="4 4" />
            <circle cx={ap2} cy={110} r={140} fill="color-mix(in srgb,var(--l3) 6%,transparent)" stroke="var(--l3)" strokeDasharray="4 4" />
            <line x1={ap1} y1={25} x2={ap2} y2={25} stroke="var(--muted)" strokeWidth="3" /><line x1={ap1} y1={25} x2={ap1} y2={95} stroke="var(--muted)" strokeWidth="3" /><line x1={ap2} y1={25} x2={ap2} y2={95} stroke="var(--muted)" strokeWidth="3" />
            <rect x={270} y={12} width={60} height={26} rx={6} fill="var(--surface)" stroke="var(--ink)" /><text x={300} y={29} textAnchor="middle" fontSize="10" fill="var(--ink)">Switch</text>
            <text x={300} y={52} textAnchor="middle" className="svgmut">wired distribution system</text>
            <Ap x={ap1} y={110} l="AP 1" /><Ap x={ap2} y={110} l="AP 2" />
            <Radio a={[pos, 170]} b={[assoc === 1 ? ap1 : ap2, 125]} />
            <Dev x={pos} y={170} l="Laptop" hl />
          </svg>
          <div className="note-box">Both APs broadcast the <b>same SSID</b> ("CampusWiFi") but have different BSSIDs. Together they form an <b>ESS</b>. The laptop is associated with <b>AP {assoc}</b> (the stronger signal); move it and it <b>roams</b>, keeping its IP because the whole ESS is one Layer-2 network.</div>
        </>
      )}
    </Card>
  );
}

const BANDS = {
  '2.4': { r: 150, speed: 1, ch: '1, 6, 11 non-overlapping (20 MHz)', note: 'Best range and wall penetration, but slow and crowded: microwaves, Bluetooth and every neighbour share 3 usable channels.' },
  '5': { r: 105, speed: 2.5, ch: '~25 channels; bond to 40/80/160 MHz', note: 'Much faster and less crowded; shorter range. Some channels need DFS (must vacate if radar is detected).' },
  '6': { r: 75, speed: 3.5, ch: '59 × 20 MHz, up to 320 MHz wide (Wi-Fi 7)', note: 'Wi-Fi 6E/7 only: huge clean spectrum, fastest, shortest range. WPA3 mandatory.' },
};

export function WifiBands() {
  const [t, setT] = useState('ch');
  const [band, setBand] = useState('2.4');
  const [pick, setPick] = useState(6);
  const x = (c) => 40 + (c - 1) * 40;
  const overl = (a, b) => Math.abs(a - b) < 5;
  return (
    <Card title="Wi-Fi bands and channels" tag="explore">
      <Tabs items={[['ch', '2.4 GHz channel overlap'], ['range', 'Range vs speed']]} value={t} onChange={setT} />
      {t === 'ch' ? (
        <>
          <svg viewBox="0 0 560 170" role="img" aria-label="2.4 GHz channels 1 to 13 overlapping">
            <line x1={20} y1={140} x2={540} y2={140} stroke="var(--muted)" />
            {Array.from({ length: 13 }, (_, i) => i + 1).map((c) => {
              const good = [1, 6, 11].includes(c);
              const hit = c !== pick && overl(c, pick);
              return (
                <g key={c} onClick={() => setPick(c)} style={{ cursor: 'pointer' }}>
                  <path d={`M${x(c) - 88},140 Q${x(c)},${good ? 20 : 50} ${x(c) + 88},140`} fill={c === pick ? 'color-mix(in srgb,var(--accent) 22%,transparent)' : hit ? 'color-mix(in srgb,var(--bad) 10%,transparent)' : 'none'} stroke={c === pick ? 'var(--accent)' : hit ? 'var(--bad)' : good ? 'var(--good)' : 'var(--line)'} strokeWidth={c === pick || good ? 2.2 : 1.2} />
                  <text x={x(c)} y={158} textAnchor="middle" fontSize="11" fontWeight={good ? 700 : 400} fill={good ? 'var(--good)' : 'var(--ink)'}>{c}</text>
                </g>
              );
            })}
          </svg>
          <div className="note-box">Channels are only 5 MHz apart but each is ~20–22 MHz wide, so neighbours overlap. Channel <b>{pick}</b> interferes with {Array.from({ length: 13 }, (_, i) => i + 1).filter((c) => c !== pick && overl(c, pick)).join(', ')}. Only <b className="ok-t">1, 6 and 11</b> don't overlap each other, which is why every AP in a building should use one of those three. (Tap a channel.)</div>
        </>
      ) : (
        <>
          <div className="seg" role="group" aria-label="Band">{Object.keys(BANDS).map((b) => <button key={b} className={band === b ? 'on' : ''} onClick={() => setBand(b)}>{b} GHz</button>)}</div>
          <div className="two" style={{ alignItems: 'center', marginTop: '.5rem' }}>
            <svg viewBox="0 0 320 320" role="img" aria-label="Relative coverage of each band">
              {Object.entries(BANDS).map(([b, v]) => <circle key={b} cx={160} cy={160} r={v.r} fill={b === band ? 'color-mix(in srgb,var(--accent) 16%,transparent)' : 'none'} stroke={b === band ? 'var(--accent)' : 'var(--line)'} strokeWidth={b === band ? 2.5 : 1.4} strokeDasharray={b === band ? undefined : '4 4'} />)}
              {Object.entries(BANDS).map(([b, v]) => <text key={b} x={160} y={160 - v.r + 14} textAnchor="middle" fontSize="11" fill="var(--ink)">{b} GHz</text>)}
              <rect x={145} y={150} width={30} height={20} rx={4} fill="var(--ink)" /><text x={160} y={164} textAnchor="middle" fontSize="9" fill="var(--bg)">AP</text>
            </svg>
            <div>
              <div className="small">Relative speed</div>
              {Object.entries(BANDS).map(([b, v]) => <div key={b} style={{ display: 'flex', gap: '.5rem', alignItems: 'center', margin: '.3rem 0' }}><span className="mono small" style={{ width: '3.4rem' }}>{b} GHz</span><div className="meter" style={{ flex: 1 }}><i style={{ width: `${(v.speed / 3.5) * 100}%`, background: b === band ? 'var(--accent)' : 'var(--muted)' }} /></div></div>)}
              <div className="note-box"><b>{band} GHz:</b> {BANDS[band].ch}. {BANDS[band].note}</div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
