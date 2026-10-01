// Pure networking maths used by the widgets. No React here, so scripts/verify-widgets.mjs can test it in Node.

/* ---------------- CRC (modulo-2 long division) ---------------- */
// Returns { remainder, codeword, steps: [{ pos, dividendBits, xorWith, result }] , padded }
export function crcDivide(data, gen) {
  if (!/^[01]+$/.test(data) || !/^1[01]*$/.test(gen) || gen.length < 2) return null;
  const r = gen.length - 1;
  const padded = data + '0'.repeat(r);
  const bits = padded.split('').map(Number);
  const g = gen.split('').map(Number);
  const steps = [];
  for (let i = 0; i <= bits.length - g.length; i++) {
    if (bits[i] === 0) continue;
    const before = bits.slice(i, i + g.length).join('');
    for (let j = 0; j < g.length; j++) bits[i + j] ^= g[j];
    steps.push({ pos: i, before, after: bits.slice(i, i + g.length).join(''), snapshot: bits.join('') });
  }
  const remainder = bits.slice(bits.length - r).join('');
  return { r, padded, remainder, codeword: data + remainder, steps };
}

// Receiver side: divide the whole codeword, remainder all zeros = OK
export function crcCheck(codeword, gen) {
  if (!/^[01]+$/.test(codeword)) return null;
  const g = gen.split('').map(Number);
  const bits = codeword.split('').map(Number);
  for (let i = 0; i <= bits.length - g.length; i++) {
    if (bits[i] === 0) continue;
    for (let j = 0; j < g.length; j++) bits[i + j] ^= g[j];
  }
  const rem = bits.slice(bits.length - (g.length - 1)).join('');
  return { remainder: rem, ok: !rem.includes('1') };
}

/* ---------------- Hamming(7,4) ---------------- */
// positions 1..7 = P1 P2 D1 P4 D2 D3 D4 (even parity)
export function hammingEncode(d) {
  const [d1, d2, d3, d4] = d.split('').map(Number);
  const p1 = d1 ^ d2 ^ d4;   // covers 1,3,5,7
  const p2 = d1 ^ d3 ^ d4;   // covers 2,3,6,7
  const p4 = d2 ^ d3 ^ d4;   // covers 4,5,6,7
  return [p1, p2, d1, p4, d2, d3, d4].join('');
}
export function hammingSyndrome(code) {
  const b = [0, ...code.split('').map(Number)]; // 1-indexed
  const s1 = b[1] ^ b[3] ^ b[5] ^ b[7];
  const s2 = b[2] ^ b[3] ^ b[6] ^ b[7];
  const s4 = b[4] ^ b[5] ^ b[6] ^ b[7];
  return { s1, s2, s4, pos: s4 * 4 + s2 * 2 + s1 };
}
export function hammingDecode(code) {
  const { pos } = hammingSyndrome(code);
  const fixed = pos ? code.split('').map((c, i) => (i === pos - 1 ? (c === '1' ? '0' : '1') : c)).join('') : code;
  return { pos, fixed, data: fixed[2] + fixed[4] + fixed[5] + fixed[6] };
}

/* ---------------- Internet checksum (16-bit 1's complement) ---------------- */
export function onesComplementSum(words) {
  const steps = [];
  let sum = 0;
  for (const w of words) {
    const raw = sum + w;
    const carry = raw > 0xffff;
    sum = (raw & 0xffff) + (carry ? 1 : 0);
    steps.push({ add: w, raw, carry, sum });
  }
  return { sum, steps, checksum: (~sum) & 0xffff };
}
export const parseHexWords = (s) => {
  const parts = s.trim().split(/[\s,]+/).filter(Boolean);
  if (!parts.length || parts.some((p) => !/^[0-9a-fA-F]{1,4}$/.test(p))) return null;
  return parts.map((p) => parseInt(p, 16));
};
export const hex4 = (n) => n.toString(16).toUpperCase().padStart(4, '0');

/* ---------------- IPv4 ---------------- */
export function parseIp(s) {
  const m = String(s).trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return null;
  const o = m.slice(1).map(Number);
  if (o.some((x) => x > 255)) return null;
  return ((o[0] << 24) >>> 0) + (o[1] << 16) + (o[2] << 8) + o[3];
}
export const ipStr = (n) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join('.');
export const maskOf = (p) => (p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0);
export const toBin32 = (n) => (n >>> 0).toString(2).padStart(32, '0');

export function parseCidr(s) {
  const m = String(s).trim().match(/^([\d.]+)\s*\/\s*(\d{1,2})$/);
  if (!m) return null;
  const ip = parseIp(m[1]);
  const p = Number(m[2]);
  if (ip == null || p > 32) return null;
  return { ip, prefix: p };
}

export function ipClass(ip) {
  const a = ip >>> 24;
  if (a === 0) return 'A (0.x reserved "this network")';
  if (a === 127) return 'Loopback (127/8, technically class A)';
  if (a < 128) return 'A';
  if (a < 192) return 'B';
  if (a < 224) return 'C';
  if (a < 240) return 'D (multicast)';
  return 'E (reserved)';
}
const inNet = (ip, net, p) => ((ip & maskOf(p)) >>> 0) === ((net & maskOf(p)) >>> 0);
export function ipScope(ip) {
  const R = [
    ['10.0.0.0', 8, 'Private (RFC 1918)'], ['172.16.0.0', 12, 'Private (RFC 1918)'], ['192.168.0.0', 16, 'Private (RFC 1918)'],
    ['127.0.0.0', 8, 'Loopback'], ['169.254.0.0', 16, 'Link-local / APIPA'], ['100.64.0.0', 10, 'Carrier-grade NAT (shared)'],
    ['224.0.0.0', 4, 'Multicast'], ['240.0.0.0', 4, 'Reserved'], ['0.0.0.0', 8, '"This network"'],
  ];
  for (const [n, p, label] of R) if (inNet(ip, parseIp(n), p)) return label;
  return 'Public';
}

export function subnetInfo(ip, prefix) {
  const mask = maskOf(prefix);
  const wild = (~mask) >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | wild) >>> 0;
  const total = 2 ** (32 - prefix);
  let first; let last; let usable;
  if (prefix === 32) { first = last = network; usable = 1; }
  else if (prefix === 31) { first = network; last = broadcast; usable = 2; }
  else { first = network + 1; last = broadcast - 1; usable = total - 2; }
  return { mask, wild, network, broadcast, first, last, total, usable, cls: ipClass(ip), scope: ipScope(ip) };
}

export function splitSubnets(network, prefix, count) {
  const bits = Math.ceil(Math.log2(Math.max(1, count)));
  const np = prefix + bits;
  if (np > 32) return null;
  const size = 2 ** (32 - np);
  const base = (network & maskOf(prefix)) >>> 0;
  const out = [];
  for (let i = 0; i < 2 ** bits; i++) {
    const n = base + i * size;
    const info = subnetInfo(n, np);
    out.push({ i, network: n, prefix: np, ...info, used: i < count });
  }
  return { bits, newPrefix: np, size, subnets: out };
}

/* ---------------- Fragmentation ---------------- */
// totalLen = full IP packet size incl. header; returns fragments with data length, offset (÷8), MF
export function fragment(totalLen, mtu, hdr = 20) {
  const data = totalLen - hdr;
  if (data <= 0 || mtu <= hdr) return null;
  if (totalLen <= mtu) return [{ i: 1, data, total: totalLen, offsetBytes: 0, offset: 0, mf: 0 }];
  const per = Math.floor((mtu - hdr) / 8) * 8;
  if (per <= 0) return null;
  const frags = [];
  let off = 0;
  while (off < data) {
    const len = Math.min(per, data - off);
    const last = off + len >= data;
    frags.push({ i: frags.length + 1, data: len, total: len + hdr, offsetBytes: off, offset: off / 8, mf: last ? 0 : 1 });
    off += len;
  }
  return frags;
}

/* ---------------- Longest prefix match ---------------- */
export function lpm(table, ipStrIn) {
  const ip = parseIp(ipStrIn);
  if (ip == null) return null;
  const rows = table.map((r) => {
    const c = parseCidr(r.prefix);
    return { ...r, len: c.prefix, match: inNet(ip, c.ip, c.prefix) };
  });
  let best = null;
  rows.forEach((r, i) => { if (r.match && (best == null || r.len > rows[best].len)) best = i; });
  return { rows, best };
}

/* ---------------- TCP congestion (Tahoe / Reno, per-RTT model) ---------------- */
// rounds are 1-indexed; an event "at round k" is detected in round k and changes cwnd for round k+1
export function simulateCwnd({ ssthresh = 16, dupRound = 0, timeoutRound = 0, rounds = 24, variant = 'reno' }) {
  let cwnd = 1;
  let ss = ssthresh;
  const out = [];
  for (let r = 1; r <= rounds; r++) {
    const phase = cwnd < ss ? 'Slow start' : 'Congestion avoidance';
    let event = null;
    if (r === dupRound) event = '3 dup ACKs';
    else if (r === timeoutRound) event = 'Timeout';
    out.push({ round: r, cwnd, ssthresh: ss, phase, event });
    if (event === '3 dup ACKs') {
      ss = Math.max(Math.floor(cwnd / 2), 2);
      cwnd = variant === 'tahoe' ? 1 : ss;
    } else if (event === 'Timeout') {
      ss = Math.max(Math.floor(cwnd / 2), 2);
      cwnd = 1;
    } else if (cwnd < ss) {
      cwnd = Math.min(cwnd * 2, ss);
    } else {
      cwnd += 1;
    }
  }
  return out;
}

/* ---------------- Dijkstra (step recorder) ---------------- */
export function dijkstraSteps(nodes, edges, src) {
  const adj = Object.fromEntries(nodes.map((n) => [n, []]));
  edges.forEach(([a, b, w]) => { adj[a].push([b, w]); adj[b].push([a, w]); });
  const dist = Object.fromEntries(nodes.map((n) => [n, Infinity]));
  const prev = Object.fromEntries(nodes.map((n) => [n, null]));
  dist[src] = 0;
  const visited = new Set();
  const steps = [{ cur: null, dist: { ...dist }, prev: { ...prev }, visited: [], relaxed: [], note: `Start: ${src} = 0, every other node = ∞.` }];
  while (visited.size < nodes.length) {
    let u = null;
    for (const n of nodes) if (!visited.has(n) && (u == null || dist[n] < dist[u])) u = n;
    if (u == null || dist[u] === Infinity) break;
    visited.add(u);
    const relaxed = [];
    for (const [v, w] of adj[u]) {
      if (visited.has(v)) continue;
      if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = u; relaxed.push(v); }
    }
    steps.push({
      cur: u, dist: { ...dist }, prev: { ...prev }, visited: [...visited], relaxed,
      note: `Pick ${u} (closest unvisited, ${dist[u]}). ` + (relaxed.length ? `Relax: ${relaxed.map((v) => `${v} = ${dist[v]} via ${u}`).join(', ')}.` : 'No neighbour improves.'),
    });
  }
  return steps;
}

/* ---------------- Count to infinity (A — B — C, the B–C link fails) ---------------- */
// Textbook (asynchronous) presentation: each round B processes A's advert, then A processes B's.
export function countToInfinity({ splitHorizon = false, infinity = 16, maxRounds = 20 }) {
  let A = 2; let viaA = 'B';
  let B = 1; let viaB = 'C';
  const f = (d) => (d >= infinity ? '∞' : String(d));
  const rows = [{ round: 0, A, B, viaA, viaB, note: 'Before failure: B reaches C directly (cost 1); A reaches C via B (cost 2).' }];
  B = infinity; viaB = '—';
  rows.push({ round: 1, A, B, viaA, viaB, note: 'The B–C link fails. B marks C unreachable (∞), but A still has its old route "C in 2 via B".' });
  for (let r = 2; r <= maxRounds; r++) {
    const notes = [];
    // 1) A advertises to B
    const advA = splitHorizon && viaA === 'B' ? null : A;
    if (advA == null) notes.push('Split horizon: A learned its C route from B, so it does not advertise it back to B.');
    else if (viaB === 'A' || B >= infinity) {
      const nb = Math.min(infinity, advA + 1);
      notes.push(nb < infinity ? `A says "C in ${f(advA)}". B believes it: B = ${f(advA)} + 1 = ${nb} via A.` : 'A advertises ∞; B stays ∞.');
      B = nb; viaB = nb < infinity ? 'A' : '—';
    }
    // 2) B advertises to A
    const advB = splitHorizon && viaB === 'A' ? null : B;
    if (viaA === 'B' && advB != null) {
      const na = Math.min(infinity, advB + 1);
      notes.push(na < infinity ? `B says "C in ${f(advB)}". A's route is via B, so A must accept: A = ${na}.` : 'B advertises ∞. A\'s route was via B, so A marks C unreachable.');
      A = na; viaA = na < infinity ? 'B' : '—';
    }
    rows.push({ round: r, A, B, viaA, viaB, note: notes.join(' ') });
    if (A >= infinity && B >= infinity) {
      rows[rows.length - 1].note += splitHorizon ? ' Converged immediately.' : ` Both reach ${infinity} = infinity (RIP) after ${r} rounds.`;
      break;
    }
  }
  return rows;
}
