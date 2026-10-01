// AUTO-GENERATED from content/11_ch_datalink_access_errors.html by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run `npm run content` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
      <section>
        <h2 id="err-vs"><span className="num">4.1</span>Error detection vs error correction</h2>
        <p>When data travels through a network, bits can get corrupted: sender sends <code>10110101</code>, receiver gets <code>10100101</code>.</p>
        <div className="vs">
          <div><h4>Detection</h4>Receiver knows "something is wrong", but not what the correct data was. Fix = ask again (retransmission).</div>
          <div><h4>Correction</h4>Receiver knows something is wrong <strong>and</strong> can recover the correct data (forward error correction, FEC).</div>
        </div>
        <p><span className="add">+ Added</span> <strong>Single-bit error</strong>: one bit flipped. <strong>Burst error</strong>: several consecutive bits corrupted (length = first to last corrupted bit). Bursts are more common in real links, which is why CRC matters.</p>
      </section>
      <section>
        <h2 id="err-parity"><span className="num">4.2</span>Parity bit</h2>
        <p>The simplest error detection technique: add one extra bit so the number of 1s is <strong>even</strong> (even parity) or <strong>odd</strong> (odd parity).</p>
        <p>Example: data <code>1011001</code> has four 1s. With even parity, append 0 → <code>10110010</code>, total still even.</p>
        <W name="parity" />
        <div className="co trap">
          <span className="lb">Problem</span>
          <p>Parity detects any <strong>odd</strong> number of bit errors, but if <strong>two</strong> bits flip the count stays even and the error is missed. <span className="add">+ Added</span> 2-D parity (row + column parity) can detect more patterns and even correct a single-bit error.</p>
        </div>
      </section>
      <section>
        <h2 id="err-checksum"><span className="num">4.3</span>Checksum</h2>
        <div className="flow">
          <span>Divide data into fixed-size words (16-bit for the Internet checksum)</span>
          <span>Add them with 1's complement arithmetic (wrap carries around)</span>
          <span>Complement the result → checksum</span>
          <span>Receiver adds everything including checksum → all 1s (complement = 0) means OK</span>
        </div>
        <p>If the result doesn't match: error detected. Checksum is for <strong>detection, not correction</strong>. <span className="add">+ Added</span> The 16-bit Internet checksum is used in the <strong>IPv4 header, TCP, UDP and ICMP</strong>. It is weaker than CRC (misses reordered words, for example) but cheap in software.</p>
        <W name="checksum" />
      </section>
      <section>
        <h2 id="err-crc"><span className="num">4.4</span>CRC: Cyclic Redundancy Check</h2>
        <p>Very important for placements. CRC uses <strong>polynomial (modulo-2) division</strong>, which is just XOR without carries.</p>
        <div className="vs">
          <div>
            <h4>Sender</h4>
            <ol>
              <li>Generator has degree r (r+1 bits)</li>
              <li>Append r zeros to the data</li>
              <li>Divide by the generator using XOR</li>
              <li>Remainder (r bits) = CRC</li>
              <li>Transmit data + CRC</li>
            </ol>
          </div>
          <div>
            <h4>Receiver</h4>
            <ol>
              <li>Divide received data + CRC by the same generator</li>
              <li>Remainder = 0 → likely no error</li>
              <li>Remainder ≠ 0 → error</li>
            </ol>
          </div>
        </div>
        <p>Worked example: data <code>101101</code>, generator <code>1101</code> (degree 3). Append 3 zeros → <code>101101000</code>, divide → remainder <strong><code>010</code></strong>. Transmit <strong><code>101101010</code></strong>. Try your own below; every XOR step is shown.</p>
        <W name="crc" />
        <p><strong>Why CRC is popular:</strong> it detects all single-bit errors, all double-bit errors (with a good generator), all odd numbers of errors (if the generator has factor x+1), and <strong>all burst errors of length ≤ r</strong>. Ethernet's FCS is CRC-32.</p>
      </section>
      <section>
        <h2 id="err-hamming"><span className="num">4.5</span>Hamming code: error correction</h2>
        <p>Hamming code can detect and correct certain bit errors. Basic Hamming code <strong>corrects 1-bit errors</strong> and (with an extra overall parity bit, SECDED) <strong>detects 2-bit errors</strong>.</p>
        <p>Parity bits sit at positions that are <strong>powers of 2</strong>: 1, 2, 4, 8, 16… For Hamming(7,4): <code>P1 P2 D1 P4 D2 D3 D4</code>.</p>
        <ul>
          <li>P1 checks positions with bit 0 set: 1, 3, 5, 7</li>
          <li>P2 checks positions with bit 1 set: 2, 3, 6, 7</li>
          <li>P4 checks positions with bit 2 set: 4, 5, 6, 7</li>
        </ul>
        <p>At the receiver, recomputing the checks gives a <strong>syndrome</strong>. The syndrome, read as a binary number, <strong>is the position of the wrong bit</strong>. Example: syndrome = 101₂ = 5 → bit 5 is wrong → flip bit 5. Encode 4 bits below, then click any bit to corrupt it.</p>
        <W name="hamming" />
        <div className="co formula">
          <span className="lb">Formulas <span className="add">+ Added</span></span>
          <span className="fx">Parity bits r for m data bits: 2^r ≥ m + r + 1</span>
          <span className="fx">To detect d errors: d_min ≥ d + 1</span>
          <span className="fx">To correct t errors: d_min ≥ 2t + 1</span>
          <p style={{ margin: ".3rem 0 0", fontSize: ".9rem" }}>Hamming distance = number of positions where two codewords differ (XOR, count 1s). Example m = 7 → r = 4 (2⁴ = 16 ≥ 12).</p>
        </div>
      </section>
      <section>
        <h2 id="err-summary"><span className="num">4.6</span>Detection vs correction summary</h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Technique</th>
                <th>Purpose</th>
                <th>Where used</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Parity</td>
                <td>Simple detection</td>
                <td>Serial links, memory</td>
              </tr>
              <tr>
                <td>Checksum</td>
                <td>Detection</td>
                <td>IP header, TCP, UDP, ICMP</td>
              </tr>
              <tr>
                <td>CRC</td>
                <td>Strong detection (polynomial / XOR division)</td>
                <td>Ethernet FCS, Wi-Fi, storage</td>
              </tr>
              <tr>
                <td>Hamming code</td>
                <td>Correction (parity bits + syndrome)</td>
                <td>ECC memory</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export function Quick() {
  return (
    <>
      <div className="quick-grid">
        <div>
          <h4>Detection</h4>
          <ul>
            <li>Parity → misses even # of errors</li>
            <li>Checksum → 1's complement sum, IP/TCP/UDP</li>
            <li>CRC → XOR division, append r zeros, Ethernet FCS</li>
            <li>CRC catches all bursts ≤ r</li>
          </ul>
        </div>
        <div>
          <h4>Correction</h4>
          <ul>
            <li>Hamming: parity at 1, 2, 4, 8…</li>
            <li>Syndrome = position of bad bit</li>
            <li>2^r ≥ m + r + 1</li>
          </ul>
        </div>
        <div>
          <h4>Distance</h4>
          <ul>
            <li>Detect d → d_min ≥ d+1</li>
            <li>Correct t → d_min ≥ 2t+1</li>
          </ul>
        </div>
      </div>
    </>
  );
}
