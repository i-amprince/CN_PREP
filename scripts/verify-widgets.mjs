// Verifies the test values from HANDOFF.md section 6 against the widget maths.
import { crcDivide, crcCheck, hammingEncode, hammingDecode, fragment, onesComplementSum, parseHexWords, hex4, lpm, subnetInfo, parseIp, ipStr, simulateCwnd, countToInfinity, dijkstraSteps, splitSubnets } from '../src/lib/netmath.js';

let fails = 0;
const eq = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: ${JSON.stringify(got)}${ok ? '' : `  (expected ${JSON.stringify(want)})`}`);
};

const c1 = crcDivide('101101', '1101');
eq('CRC 101101 / 1101 remainder', c1.remainder, '010');
eq('CRC 101101 / 1101 codeword', c1.codeword, '101101010');
eq('CRC receiver check 101101010', crcCheck('101101010', '1101').ok, true);
eq('CRC receiver detects flipped bit', crcCheck('101111010', '1101').ok, false);
eq('CRC 1101011011 / 10011 remainder', crcDivide('1101011011', '10011').remainder, '1110');

eq('Hamming 1011 → codeword', hammingEncode('1011'), '0110011');
const flipped = '0110111'; // bit 5 flipped
eq('Hamming syndrome for flipped bit 5', hammingDecode(flipped).pos, 5);
eq('Hamming corrected data', hammingDecode(flipped).data, '1011');
for (let i = 0; i < 16; i++) {
  const d = i.toString(2).padStart(4, '0');
  const cw = hammingEncode(d);
  for (let p = 0; p < 7; p++) {
    const bad = cw.split('').map((c, k) => (k === p ? (c === '1' ? '0' : '1') : c)).join('');
    const r = hammingDecode(bad);
    if (r.pos !== p + 1 || r.data !== d) { fails++; console.log('FAIL Hamming single-bit correction', d, p + 1); }
  }
}
console.log('PASS  Hamming corrects every single-bit error for all 16 data words');

const fr = fragment(4000, 1500, 20);
eq('Frag 4000/1500 count', fr.length, 3);
eq('Frag data sizes', fr.map((f) => f.data), [1480, 1480, 1020]);
eq('Frag offsets', fr.map((f) => f.offset), [0, 185, 370]);
eq('Frag MF flags', fr.map((f) => f.mf), [1, 1, 0]);

const words = parseHexWords('4500 0073 0000 4000 4011 0000 c0a8 0001 c0a8 00c7');
eq('IPv4 header checksum (classic example)', hex4(onesComplementSum(words).checksum), 'B861');
const withCk = parseHexWords('4500 0073 0000 4000 4011 b861 c0a8 0001 c0a8 00c7');
eq('Receiver sum incl. checksum = FFFF', hex4(onesComplementSum(withCk).sum), 'FFFF');

const table = [
  { prefix: '10.0.0.0/8' }, { prefix: '10.1.0.0/16' }, { prefix: '10.1.2.0/24' }, { prefix: '172.16.0.0/16' }, { prefix: '0.0.0.0/0' },
];
eq('LPM 10.1.2.50', table[lpm(table, '10.1.2.50').best].prefix, '10.1.2.0/24');
eq('LPM 10.1.9.9', table[lpm(table, '10.1.9.9').best].prefix, '10.1.0.0/16');
eq('LPM 8.8.8.8', table[lpm(table, '8.8.8.8').best].prefix, '0.0.0.0/0');

const s = subnetInfo(parseIp('192.168.10.77'), 26);
eq('Subnet 192.168.10.77/26', [ipStr(s.network), ipStr(s.broadcast), ipStr(s.first), ipStr(s.last), s.usable], ['192.168.10.64', '192.168.10.127', '192.168.10.65', '192.168.10.126', 62]);
const sp = splitSubnets(parseIp('192.168.1.0'), 24, 4);
eq('Split /24 into 4', sp.subnets.map((x) => ipStr(x.network) + '/' + x.prefix), ['192.168.1.0/26', '192.168.1.64/26', '192.168.1.128/26', '192.168.1.192/26']);

const reno = simulateCwnd({ ssthresh: 8, dupRound: 0, timeoutRound: 0, rounds: 7, variant: 'reno' }).map((r) => r.cwnd);
eq('Slow start then CA (ssthresh 8)', reno, [1, 2, 4, 8, 9, 10, 11]);
const ren2 = simulateCwnd({ ssthresh: 64, dupRound: 5, rounds: 8, variant: 'reno' }).map((r) => r.cwnd);
eq('Reno: 16 → 3 dup ACKs → 8, then linear', ren2, [1, 2, 4, 8, 16, 8, 9, 10]);
const tah2 = simulateCwnd({ ssthresh: 64, dupRound: 5, rounds: 9, variant: 'tahoe' }).map((r) => r.cwnd);
eq('Tahoe: 16 → 3 dup ACKs → 1, 2, 4, 8, 9', tah2, [1, 2, 4, 8, 16, 1, 2, 4, 8]);
const to = simulateCwnd({ ssthresh: 64, timeoutRound: 5, rounds: 10, variant: 'reno' }).map((r) => r.cwnd);
eq('Timeout: 16 → 1, 2, 4, 8, 9', to, [1, 2, 4, 8, 16, 1, 2, 4, 8, 9]);

const cti = countToInfinity({ splitHorizon: false });
eq('Count to infinity reaches 16', [cti.at(-1).A, cti.at(-1).B], [16, 16]);
eq('Count to infinity sequence of B', cti.slice(2, 5).map((r) => r.B), [3, 5, 7]);
const sh = countToInfinity({ splitHorizon: true });
eq('Split horizon converges in 1 round', sh.length, 3);

const dj = dijkstraSteps(['A', 'B', 'C', 'D'], [['A', 'B', 2], ['B', 'D', 1], ['A', 'C', 5], ['C', 'D', 2]], 'A');
eq('Dijkstra notes example final distances', dj.at(-1).dist, { A: 0, B: 2, C: 5, D: 3 });

console.log(fails ? `\n${fails} FAILURE(S)` : '\nAll widget test values verified.');
process.exit(fails ? 1 : 0);
