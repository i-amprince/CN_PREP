import { useState } from 'react';
import { Card, Tabs, KV } from './common.jsx';

/* ---------------- HTTP status codes ---------------- */
const CODES = [
  [100, 'Continue', 'Server got the headers; client may send the (large) body. Used with Expect: 100-continue.'],
  [101, 'Switching Protocols', 'Server agrees to change protocol, e.g. HTTP → WebSocket after an Upgrade header.'],
  [200, 'OK', 'Success. GET returns the resource; POST returns the result.'],
  [201, 'Created', 'A new resource was created (typical reply to POST); the Location header points to it.'],
  [202, 'Accepted', 'Request accepted for processing later (async jobs). Not finished yet.'],
  [204, 'No Content', 'Success with no body: common for DELETE or PUT.'],
  [206, 'Partial Content', 'Only the requested byte Range is returned: resumable downloads, video seeking.'],
  [301, 'Moved Permanently', 'Resource moved for good; browsers and search engines update links. May change POST to GET.'],
  [302, 'Found (temporary redirect)', 'Temporarily elsewhere; keep using the old URL. May change POST to GET.'],
  [304, 'Not Modified', 'Cache validation: your cached copy (ETag / Last-Modified) is still fresh, so no body is sent.'],
  [307, 'Temporary Redirect', 'Like 302 but the method and body must NOT change (POST stays POST).'],
  [308, 'Permanent Redirect', 'Like 301 but the method must not change.'],
  [400, 'Bad Request', 'Malformed request: invalid JSON, missing fields, bad syntax.'],
  [401, 'Unauthorized', 'Authentication missing or failed: "Who are you?" Comes with WWW-Authenticate.'],
  [403, 'Forbidden', 'Authenticated (or not needed), but not allowed: "I know who you are, but you can\'t do this."'],
  [404, 'Not Found', 'No resource at this URL (also used to hide resources from unauthorised users).'],
  [405, 'Method Not Allowed', 'The URL exists but not for this method (e.g. DELETE on a read-only resource). Allow header lists valid ones.'],
  [409, 'Conflict', 'Request conflicts with current state: duplicate username, edit conflict, version mismatch.'],
  [413, 'Content Too Large', 'Request body exceeds the server\'s limit (e.g. upload too big).'],
  [422, 'Unprocessable Content', 'Syntax OK but semantically invalid (validation errors). Common in REST APIs.'],
  [429, 'Too Many Requests', 'Rate limited. Retry-After says when to try again.'],
  [500, 'Internal Server Error', 'Generic server-side failure: an unhandled exception, a bug.'],
  [502, 'Bad Gateway', 'A proxy / load balancer got an invalid response from the upstream (backend crashed or refused).'],
  [503, 'Service Unavailable', 'Server overloaded or down for maintenance; often temporary, may include Retry-After.'],
  [504, 'Gateway Timeout', 'The proxy waited too long for the upstream server to answer.'],
];
const GROUPS = [
  [1, 'Informational', 'var(--l1)'], [2, 'Success', 'var(--good)'], [3, 'Redirection', 'var(--l3)'], [4, 'Client error', 'var(--warn)'], [5, 'Server error', 'var(--bad)'],
];

export function StatusCodes() {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(404);
  const qq = q.trim().toLowerCase();
  const list = CODES.filter(([c, n, d]) => !qq || String(c).startsWith(qq) || n.toLowerCase().includes(qq) || d.toLowerCase().includes(qq));
  const cur = CODES.find((c) => c[0] === sel);
  return (
    <Card title="HTTP status code explorer" tag="search · tap">
      <input type="text" placeholder="Search: 30, redirect, cache, auth, proxy…" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: '100%' }} aria-label="Search status codes" />
      {cur && <div className="note-box" aria-live="polite"><b className="mono">{cur[0]} {cur[1]}.</b> {cur[2]}</div>}
      {GROUPS.map(([g, name, c]) => {
        const items = list.filter(([code]) => Math.floor(code / 100) === g);
        if (!items.length) return null;
        return (
          <div key={g}>
            <div className="grp-h">{g}xx · {name}</div>
            <div className="codes">
              {items.map(([code, n]) => <button key={code} className={sel === code ? 'on' : ''} style={{ '--cc': c }} onClick={() => setSel(code)}><b>{code}</b>{n}</button>)}
            </div>
          </div>
        );
      })}
      {list.length === 0 && <p className="muted">No codes match.</p>}
    </Card>
  );
}

/* ---------------- Diffie-Hellman ---------------- */
const modPow = (b, e, m) => { let r = 1n; let x = BigInt(b) % BigInt(m); let k = BigInt(e); const M = BigInt(m); while (k > 0n) { if (k & 1n) r = (r * x) % M; x = (x * x) % M; k >>= 1n; } return Number(r); };
const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };

export function DiffieHellman() {
  const [p, setP] = useState(23);
  const [g, setG] = useState(5);
  const [a, setA] = useState(6);
  const [b, setB] = useState(15);
  const P = Number(p); const Gn = Number(g); const An = Number(a); const Bn = Number(b);
  const ok = isPrime(P) && P < 100000 && Gn > 1 && Gn < P && An > 0 && Bn > 0;
  const A = ok ? modPow(Gn, An, P) : 0;
  const B = ok ? modPow(Gn, Bn, P) : 0;
  const s1 = ok ? modPow(B, An, P) : 0;
  const s2 = ok ? modPow(A, Bn, P) : 0;
  return (
    <Card title="Diffie-Hellman playground" tag="pick secrets">
      <div className="row">
        <label>Public prime p <input type="number" value={p} onChange={(e) => setP(e.target.value)} /></label>
        <label>Public base g <input type="number" value={g} onChange={(e) => setG(e.target.value)} /></label>
        <label>Client secret a <input type="number" min="1" value={a} onChange={(e) => setA(e.target.value)} /></label>
        <label>Server secret b <input type="number" min="1" value={b} onChange={(e) => setB(e.target.value)} /></label>
        <button className="btn sm" onClick={() => { setA(2 + Math.floor(Math.random() * (P - 3))); setB(2 + Math.floor(Math.random() * (P - 3))); }} disabled={!isPrime(P)}>Random secrets</button>
      </div>
      {!ok ? <p className="err">p must be a prime (try 23, 47, 97, 7919) and 1 &lt; g &lt; p; secrets must be positive.</p> : (
        <>
          <div className="two" style={{ marginTop: '.8rem' }}>
            <div className="nest" style={{ background: 'color-mix(in srgb,var(--l3) 10%,var(--bg))' }}>
              <b>Client</b><br />secret a = {An}<br />sends A = g^a mod p = {Gn}^{An} mod {P} = <b>{A}</b><br />computes B^a mod p = {B}^{An} mod {P} = <b className="ok-t">{s1}</b>
            </div>
            <div className="nest" style={{ background: 'color-mix(in srgb,var(--l7) 10%,var(--bg))' }}>
              <b>Server</b><br />secret b = {Bn}<br />sends B = g^b mod p = {Gn}^{Bn} mod {P} = <b>{B}</b><br />computes A^b mod p = {A}^{Bn} mod {P} = <b className="ok-t">{s2}</b>
            </div>
          </div>
          <KV items={[['Eavesdropper sees', `p = ${P}, g = ${Gn}, A = ${A}, B = ${B}`], ['Shared secret', s1 === s2 ? `${s1} on both sides ✓` : 'mismatch?!'], ['Eve would need', 'a or b: the discrete logarithm problem']]} />
          <div className="note-box">Both sides get g^(ab) mod p = {s1} without ever sending it. With a 2048-bit p (or an elliptic curve in ECDHE), recovering a from A is infeasible. TLS 1.3 generates fresh a and b for every session (ephemeral) → forward secrecy. Without certificates, though, a man-in-the-middle could run DH separately with each side.</div>
        </>
      )}
    </Card>
  );
}

/* ---------------- Proxy / reverse proxy / LB / CDN ---------------- */
const Box = ({ x, y, w = 96, h = 34, label, sub, fill = 'var(--surface)', hl }) => (
  <g>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={7} fill={hl ? 'var(--accent)' : fill} stroke={hl ? 'var(--accent)' : 'var(--ink)'} strokeWidth="1.5" />
    <text x={x} y={y + (sub ? -1 : 4)} textAnchor="middle" fontSize="11" fontWeight="600" fill={hl || fill === 'var(--ink)' ? 'var(--accent-ink)' : 'var(--ink)'}>{label}</text>
    {sub && <text x={x} y={y + 11} textAnchor="middle" fontSize="9" fill={hl || fill === 'var(--ink)' ? 'var(--accent-ink)' : 'var(--muted)'}>{sub}</text>}
  </g>
);
const Ln = ({ a, b, hl }) => <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={hl ? 'var(--accent)' : 'var(--line)'} strokeWidth={hl ? 3 : 2} />;

function Forward() {
  return (
    <>
      <svg viewBox="0 0 560 220" role="img" aria-label="Forward proxy">
        <rect x={8} y={10} width={250} height={200} rx={12} fill="color-mix(in srgb,var(--l4) 7%,transparent)" stroke="var(--l4)" strokeDasharray="5 4" />
        <text x={18} y={28} className="svgmut">Office / school network</text>
        {[60, 110, 160].map((y, i) => <g key={i}><Ln a={[70, y]} b={[200, 110]} /><Box x={60} y={y} w={74} label={`Client ${i + 1}`} /></g>)}
        <Ln a={[200, 110]} b={[460, 55]} /><Ln a={[200, 110]} b={[460, 165]} />
        <Box x={200} y={110} w={100} label="Forward proxy" sub="filter · cache" fill="var(--ink)" />
        <Box x={470} y={55} w={110} label="youtube.com" />
        <Box x={470} y={165} w={110} label="example.com" />
        <text x={330} y={100} textAnchor="middle" className="svgmut">src IP = proxy's</text>
      </svg>
      <div className="note-box"><b>Forward proxy</b> acts for the <b>clients</b>. Websites see the proxy's IP, not yours. Used for content filtering, caching, logging and controlling outbound access (corporate / campus networks), or getting around geo-blocks.</div>
    </>
  );
}

const BACKENDS = ['App 1', 'App 2', 'App 3'];
function Reverse() {
  const [algo, setAlgo] = useState('rr');
  const [n, setN] = useState(0);
  const [conns, setConns] = useState([2, 0, 1]);
  const [last, setLast] = useState(null);
  const [client, setClient] = useState(0);
  const send = () => {
    let pick;
    if (algo === 'rr') pick = n % 3;
    else if (algo === 'lc') pick = conns.indexOf(Math.min(...conns));
    else pick = [0, 2, 1][client];
    setN(n + 1);
    setConns((c) => c.map((v, i) => (i === pick ? v + 1 : v)));
    setLast(pick);
  };
  return (
    <>
      <div className="row" style={{ marginBottom: '.4rem' }}>
        <label>Algorithm <select value={algo} onChange={(e) => { setAlgo(e.target.value); setLast(null); }}>
          <option value="rr">Round robin</option><option value="lc">Least connections</option><option value="ih">IP hash (sticky)</option>
        </select></label>
        {algo === 'ih' && <label>Client <select value={client} onChange={(e) => setClient(Number(e.target.value))}><option value={0}>203.0.113.5</option><option value={1}>198.51.100.7</option><option value={2}>192.0.2.44</option></select></label>}
        <button className="btn sm pri" onClick={send}>Send request</button>
        <button className="btn sm" onClick={() => { setN(0); setConns([2, 0, 1]); setLast(null); }}>Reset</button>
      </div>
      <svg viewBox="0 0 560 220" role="img" aria-label="Reverse proxy and load balancer">
        <rect x={300} y={10} width={250} height={200} rx={12} fill="color-mix(in srgb,var(--l3) 7%,transparent)" stroke="var(--l3)" strokeDasharray="5 4" />
        <text x={540} y={28} textAnchor="end" className="svgmut">Data centre (private)</text>
        <Ln a={[70, 110]} b={[250, 110]} hl={last != null} />
        <Box x={60} y={110} w={90} label="Clients" sub="internet" />
        {BACKENDS.map((b, i) => <g key={b}><Ln a={[250, 110]} b={[470, 50 + i * 60]} hl={last === i} /><Box x={470} y={50 + i * 60} w={110} label={b} sub={`${conns[i]} active conns`} hl={last === i} /></g>)}
        <Box x={250} y={110} w={116} label="Reverse proxy / LB" sub="TLS termination" fill="var(--ink)" />
      </svg>
      <div className="note-box"><b>Reverse proxy</b> acts for the <b>servers</b>: clients only ever see one address. It load-balances, terminates TLS, caches and compresses, and hides the backends (Nginx, HAProxy, AWS ALB). {last != null && <> Last request → <b>{BACKENDS[last]}</b> ({algo === 'rr' ? 'next in turn' : algo === 'lc' ? 'fewest active connections' : 'hash of the client IP: same client, same server'}).</>}</div>
    </>
  );
}

const USERS = [{ n: 'Mumbai user', edge: 0 }, { n: 'Delhi user', edge: 0 }, { n: 'London user', edge: 1 }];
function Cdn() {
  const [cache, setCache] = useState([false, false]);
  const [ev, setEv] = useState(null);
  const req = (u) => {
    const e = USERS[u].edge;
    const hit = cache[e];
    setEv({ u, e, hit });
    if (!hit) setCache((c) => c.map((v, i) => (i === e ? true : v)));
  };
  const edges = [{ n: 'Edge Mumbai', x: 250, y: 60 }, { n: 'Edge London', x: 250, y: 165 }];
  return (
    <>
      <div className="row" style={{ marginBottom: '.4rem' }}>
        {USERS.map((u, i) => <button key={u.n} className="btn sm" onClick={() => req(i)}>Request from {u.n}</button>)}
        <button className="btn sm" onClick={() => { setCache([false, false]); setEv(null); }}>Purge caches</button>
      </div>
      <svg viewBox="0 0 560 220" role="img" aria-label="Content delivery network">
        {USERS.map((u, i) => {
          const y = [40, 85, 175][i];
          return <g key={u.n}><Ln a={[70, y]} b={[edges[u.edge].x, edges[u.edge].y]} hl={ev && ev.u === i} /><Box x={60} y={y} w={96} label={u.n} /></g>;
        })}
        {edges.map((e, i) => <g key={e.n}><Ln a={[e.x, e.y]} b={[470, 112]} hl={ev && ev.e === i && !ev.hit} /><Box x={e.x} y={e.y} w={110} label={e.n} sub={cache[i] ? 'cached ✓' : 'empty'} fill={cache[i] ? 'var(--good-soft)' : 'var(--surface)'} /></g>)}
        <Box x={470} y={112} w={110} label="Origin server" sub="(far away)" fill="var(--ink)" />
      </svg>
      <div className="note-box">{!ev ? <>A <b>CDN</b> caches content on <b>edge servers</b> near users (DNS or anycast sends you to the nearest). Press a button.</> : ev.hit ? <><b className="ok-t">Cache hit</b> at {edges[ev.e].n}: served locally in a few ms; the origin isn't touched.</> : <><b className="bad-t">Cache miss</b> at {edges[ev.e].n}: it fetches from the origin once, stores a copy (respecting Cache-Control), then serves it. The next nearby user gets a hit.</>}</div>
    </>
  );
}

export function Proxy() {
  const [t, setT] = useState('fwd');
  return (
    <Card title="Forward proxy vs reverse proxy / load balancer vs CDN" tag="compare">
      <Tabs items={[['fwd', 'Forward proxy'], ['rev', 'Reverse proxy + LB'], ['cdn', 'CDN']]} value={t} onChange={setT} />
      {t === 'fwd' && <Forward />}
      {t === 'rev' && <Reverse />}
      {t === 'cdn' && <Cdn />}
    </Card>
  );
}
