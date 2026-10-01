import { useMemo, useState } from 'react';
import { Card, useStepper, StepControls, KV } from './common.jsx';
import { crcDivide, crcCheck, hammingEncode, hammingSyndrome, hammingDecode, onesComplementSum, parseHexWords, hex4 } from '../lib/netmath.js';

const flipAt = (s, i) => s.slice(0, i) + (s[i] === '1' ? '0' : '1') + s.slice(i + 1);

/* ---------------- Parity ---------------- */
export function Parity() {
  const [data, setData] = useState('1011001');
  const [even, setEven] = useState(true);
  const [flips, setFlips] = useState(new Set());
  const valid = /^[01]{1,24}$/.test(data);
  const ones = valid ? data.split('').filter((b) => b === '1').length : 0;
  const pbit = even ? ones % 2 : 1 - (ones % 2);
  const sent = data + pbit;
  const recv = sent.split('').map((b, i) => (flips.has(i) ? (b === '1' ? '0' : '1') : b)).join('');
  const rOnes = recv.split('').filter((b) => b === '1').length;
  const passes = even ? rOnes % 2 === 0 : rOnes % 2 === 1;
  const toggle = (i) => setFlips((f) => { const g = new Set(f); if (g.has(i)) g.delete(i); else g.add(i); return g; });
  return (
    <Card title="Parity bit" tag="flip bits">
      <div className="row">
        <label>Data bits <input type="text" value={data} onChange={(e) => { setData(e.target.value.trim()); setFlips(new Set()); }} style={{ width: '11rem' }} /></label>
        <div className="seg" role="group" aria-label="Parity type">
          <button className={even ? 'on' : ''} onClick={() => setEven(true)}>Even</button>
          <button className={!even ? 'on' : ''} onClick={() => setEven(false)}>Odd</button>
        </div>
      </div>
      {!valid ? <p className="err">Type 1–24 bits (0s and 1s).</p> : (
        <>
          <p className="small" style={{ margin: '.7rem 0 .3rem' }}>Data has <b>{ones}</b> ones → {even ? 'even' : 'odd'} parity bit = <b>{pbit}</b>. Sent codeword (click bits to corrupt them in transit):</p>
          <div className="bits">
            {recv.split('').map((b, i) => (
              <button key={i} className={'bit' + (i === sent.length - 1 ? ' p' : '') + (flips.has(i) ? ' flipped' : '')} onClick={() => toggle(i)} aria-label={`bit ${i + 1}${flips.has(i) ? ', flipped' : ''}`}>{b}</button>
            ))}
          </div>
          <KV items={[['Bits flipped', flips.size], ['1s received', rOnes], ['Receiver says', passes ? 'parity OK' : 'ERROR detected']]} />
          <div className="note-box" aria-live="polite">
            {flips.size === 0 ? 'No errors. Flip one bit to see detection, then flip a second one.'
              : !passes ? <><b className="ok-t">Detected.</b> An odd number of flips ({flips.size}) changes the parity.</>
                : <><b className="bad-t">Missed!</b> {flips.size} flips is an even number, so the count of 1s keeps its parity and the receiver thinks the data is fine. Parity can't catch an even number of errors.</>}
          </div>
        </>
      )}
    </Card>
  );
}

/* ---------------- Internet checksum ---------------- */
const SAMPLE = '4500 0073 0000 4000 4011 0000 c0a8 0001 c0a8 00c7';
export function Checksum() {
  const [txt, setTxt] = useState(SAMPLE);
  const [corrupt, setCorrupt] = useState('none');
  const words = parseHexWords(txt);
  const res = useMemo(() => (words ? onesComplementSum(words) : null), [txt]); // eslint-disable-line react-hooks/exhaustive-deps
  let rxWords = words ? [...words, res.checksum] : [];
  if (words && corrupt === 'flip') rxWords = rxWords.map((w, i) => (i === 1 ? w ^ 0x0004 : w));
  if (words && corrupt === 'swap' && words.length > 2) rxWords = rxWords.map((w, i) => (i === 0 ? rxWords[1] : i === 1 ? rxWords[0] : w));
  const rx = words ? onesComplementSum(rxWords) : null;
  return (
    <Card title="Internet checksum (16-bit 1's complement)" tag="sender + receiver">
      <label style={{ display: 'block' }}>16-bit words in hex (an IPv4 header with its checksum field = 0000):
        <input type="text" value={txt} onChange={(e) => setTxt(e.target.value)} style={{ width: '100%', marginTop: '.3rem' }} aria-label="hex words" />
      </label>
      {!words ? <p className="err">Enter hex words of up to 4 digits, separated by spaces.</p> : (
        <>
          <div className="out">{['  word    running sum', ...res.steps.map((s) => `+ ${hex4(s.add)}  = ${s.raw > 0xffff ? `${s.raw.toString(16).toUpperCase()} → wrap carry → ` : ''}${hex4(s.sum)}`), `sum = ${hex4(res.sum)}  →  complement  →  checksum = ${hex4(res.checksum)}`].join('\n')}</div>
          <div className="row" style={{ marginTop: '.7rem' }}>
            <span className="small muted">Receiver test:</span>
            <div className="seg" role="group" aria-label="Corruption">
              <button className={corrupt === 'none' ? 'on' : ''} onClick={() => setCorrupt('none')}>Clean</button>
              <button className={corrupt === 'flip' ? 'on' : ''} onClick={() => setCorrupt('flip')}>Flip a bit in word 2</button>
              <button className={corrupt === 'swap' ? 'on' : ''} onClick={() => setCorrupt('swap')}>Swap words 1 and 2</button>
            </div>
          </div>
          <div className="note-box" aria-live="polite">
            Receiver adds all words <b>including</b> the checksum: sum = <b className="mono">{hex4(rx.sum)}</b>.{' '}
            {rx.sum === 0xffff ? (corrupt === 'swap'
              ? <><b className="bad-t">Looks OK, but the data was reordered!</b> Addition is commutative, so the checksum can't see swapped words. CRC would catch this.</>
              : <><b className="ok-t">All 1s (FFFF) → no error detected.</b></>)
              : <><b className="bad-t">Not FFFF → error detected</b>, the packet is discarded.</>}
          </div>
        </>
      )}
    </Card>
  );
}

/* ---------------- CRC ---------------- */
export function Crc() {
  const [data, setData] = useState('101101');
  const [gen, setGen] = useState('1101');
  const res = useMemo(() => crcDivide(data.trim(), gen.trim()), [data, gen]);
  const st = useStepper(res ? res.steps.length + 1 : 1, { interval: 1100 });
  const [flip, setFlip] = useState(null);
  const shown = res ? res.steps.slice(0, st.i) : [];
  const rx = res ? (flip == null ? res.codeword : flipAt(res.codeword, flip)) : '';
  const chk = res ? crcCheck(rx, gen.trim()) : null;
  return (
    <Card title="CRC long division (XOR)" tag="step through">
      <div className="row">
        <label>Data <input type="text" value={data} onChange={(e) => { setData(e.target.value); setFlip(null); st.set(0); }} style={{ width: '11rem' }} /></label>
        <label>Generator <input type="text" value={gen} onChange={(e) => { setGen(e.target.value); setFlip(null); st.set(0); }} style={{ width: '7rem' }} /></label>
        {[['101101', '1101'], ['1101011011', '10011'], ['11010011101100', '1011']].map(([d, g]) => (
          <button key={d} className="btn sm" onClick={() => { setData(d); setGen(g); setFlip(null); st.set(0); }}>{d} / {g}</button>
        ))}
      </div>
      {!res ? <p className="err">Data must be bits; the generator must start with 1 and have at least 2 bits.</p> : (
        <>
          <p className="small" style={{ margin: '.7rem 0 .4rem' }}>Generator degree r = <b>{res.r}</b> → append {res.r} zeros: <code>{res.padded}</code></p>
          <div className="out divline" aria-live="polite">
            <div>{'   '}{res.padded}</div>
            {shown.map((s, k) => {
              return (
                <div key={k}>
                  <div><span className="g">{'⊕ ' + ' '.repeat(s.pos + 1)}{gen}</span><span className="x">{'   '}← XOR at bit {s.pos + 1} (leading 1)</span></div>
                  <div>{'   '}<span className="x">{'─'.repeat(res.padded.length)}</span></div>
                  <div>{'   '}{s.snapshot.slice(0, s.pos)}<span className={k === shown.length - 1 ? 'g' : ''}>{s.snapshot.slice(s.pos, s.pos + gen.length)}</span>{s.snapshot.slice(s.pos + gen.length)}</div>
                </div>
              );
            })}
            {st.atEnd && <div className="r">{'   '}remainder = last {res.r} bits = {res.remainder}</div>}
          </div>
          <StepControls st={st} label={`XOR ${st.i} / ${res.steps.length}`}>
            <button className="btn sm" onClick={() => st.set(res.steps.length)}>Show all</button>
          </StepControls>
          {st.atEnd && (
            <>
              <KV items={[['Remainder (CRC)', res.remainder], ['Transmit data + CRC', res.codeword]]} />
              <p className="small" style={{ margin: '.8rem 0 .3rem' }}>Receiver divides what it got by the same generator. Click a bit to corrupt it:</p>
              <div className="bits">
                {rx.split('').map((b, i) => (
                  <button key={i} className={'bit' + (i >= data.length ? ' p' : '') + (flip === i ? ' flipped' : '')} onClick={() => setFlip(flip === i ? null : i)}>{b}</button>
                ))}
              </div>
              <div className="note-box">Remainder at receiver = <b className="mono">{chk.remainder}</b> → {chk.ok ? <b className="ok-t">0 → accept (likely no error)</b> : <b className="bad-t">non-zero → error detected, frame dropped</b>}</div>
            </>
          )}
        </>
      )}
    </Card>
  );
}

/* ---------------- Hamming(7,4) ---------------- */
const LBL = ['P1', 'P2', 'D1', 'P4', 'D2', 'D3', 'D4'];
export function Hamming() {
  const [d, setD] = useState('1011');
  const [flips, setFlips] = useState(new Set());
  const valid = /^[01]{4}$/.test(d);
  const code = valid ? hammingEncode(d) : '0000000';
  const recv = code.split('').map((b, i) => (flips.has(i) ? (b === '1' ? '0' : '1') : b)).join('');
  const syn = hammingSyndrome(recv);
  const dec = hammingDecode(recv);
  const toggle = (i) => setFlips((f) => { const g = new Set(f); if (g.has(i)) g.delete(i); else g.add(i); return g; });
  const b = [0, ...recv.split('').map(Number)];
  return (
    <Card title="Hamming(7,4) encoder and corrector" tag="click a bit to corrupt">
      <div className="row">
        <label>4 data bits <input type="text" value={d} onChange={(e) => { setD(e.target.value.trim()); setFlips(new Set()); }} style={{ width: '6rem' }} /></label>
        <button className="btn sm" onClick={() => { setD('1011'); setFlips(new Set()); }}>1011</button>
        <button className="btn sm" onClick={() => setFlips(new Set())}>Clear errors</button>
      </div>
      {!valid ? <p className="err">Enter exactly 4 bits.</p> : (
        <>
          <p className="small" style={{ margin: '.7rem 0 .3rem' }}>Codeword for {d}: <b className="mono">{code}</b> (positions 1–7 = P1 P2 D1 P4 D2 D3 D4, even parity)</p>
          <div className="bits">
            {recv.split('').map((bit, i) => (
              <button key={i} className={'bit' + (LBL[i][0] === 'P' ? ' p' : '') + (flips.has(i) ? ' flipped' : '') + (flips.size === 1 && dec.pos === i + 1 ? ' fixed' : '')} onClick={() => toggle(i)} aria-label={`position ${i + 1} ${LBL[i]}`} style={{ width: '2.6rem' }}>
                <small>{i + 1}·{LBL[i]}</small>{bit}
              </button>
            ))}
          </div>
          <div className="out">{[
            `check 1 (positions 1,3,5,7): ${b[1]}⊕${b[3]}⊕${b[5]}⊕${b[7]} = ${syn.s1}`,
            `check 2 (positions 2,3,6,7): ${b[2]}⊕${b[3]}⊕${b[6]}⊕${b[7]} = ${syn.s2}`,
            `check 4 (positions 4,5,6,7): ${b[4]}⊕${b[5]}⊕${b[6]}⊕${b[7]} = ${syn.s4}`,
            `syndrome (c4 c2 c1) = ${syn.s4}${syn.s2}${syn.s1}₂ = ${syn.pos}`,
          ].join('\n')}</div>
          <div className="note-box" aria-live="polite">
            {flips.size === 0 && <>Syndrome 0 → no error. Click any bit above to flip it.</>}
            {flips.size === 1 && <><b className="ok-t">Syndrome {syn.pos} → bit {syn.pos} ({LBL[syn.pos - 1]}) is wrong.</b> Flip it back → {dec.fixed} → data <b>{dec.data}</b> {dec.data === d ? '✓ recovered' : ''}</>}
            {flips.size >= 2 && <><b className="bad-t">{flips.size} errors.</b> Syndrome {syn.pos}{syn.pos ? ` points at bit ${syn.pos}, which "corrects" the wrong bit (decoded ${dec.data}, sent ${d})` : ' looks clean'}. Hamming(7,4) only corrects 1 error; add an overall parity bit (SECDED) to at least detect 2.</>}
          </div>
        </>
      )}
    </Card>
  );
}
