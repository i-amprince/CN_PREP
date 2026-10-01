// AUTO-GENERATED from content/13_ch_transport_handshake_window_congestion_termination.html by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run `npm run content` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
      <p>Connects sequence numbers, ACKs, retransmission, receiver window and sliding window. The foundation for congestion control.</p>
      <section>
        <h2 id="sw-why"><span className="num">10.1</span>Why a sliding window?</h2>
        <p>Stop-and-Wait: send one segment, wait for its ACK, send the next. Reliable but slow, especially when delay is large: the link sits idle for a whole RTT after every packet. A sliding window lets <strong>multiple bytes/segments be in flight</strong> before waiting for ACKs, which improves utilisation.</p>
        <div className="co formula">
          <span className="lb">How much better? <span className="add">+ Added</span></span>
          <span className="fx">Stop-and-Wait efficiency η = 1 / (1 + 2a),  a = Tp / Tt</span>
          <span className="fx">Window of N: η = min(1, N / (1 + 2a))</span>
          <span className="fx">Window needed for 100% utilisation: N ≥ 1 + 2a</span>
          <p style={{ margin: ".3rem 0 0", fontSize: ".9rem" }}>Example: Tt = 1 ms, Tp = 10 ms → a = 10 → Stop-and-Wait η = 1/21 ≈ 4.8%. A window of 21 fills the pipe.</p>
        </div>
        <p>TCP's window is measured in <strong>bytes</strong>, not packets. Below, the window covers what may be sent without waiting; it slides right as ACKs come in.</p>
        <W name="slidewin" />
        <p>Why "sliding"? Suppose the window initially covers four positions. As the receiver acknowledges the first part, the window moves forward:</p>
        <pre className="dg">{"[1000 1010 1020 1030]\n      [1010 1020 1030 1040]     "}<em>← first part ACKed</em>{"\n            [1020 1030 1040 1050]"}</pre>
        <p>The window slides forward as data is acknowledged. Byte view: if the current window allows <code>1000 → 1399</code>, the sender may send all of those bytes without waiting for further ACKs.</p>
      </section>
      <section>
        <h2 id="sw-flow"><span className="num">10.2</span>Flow control and rwnd</h2>
        <p>The sender can transmit much faster than the receiver's application reads. If it sends too much, the receive buffer overflows and data is lost. <strong>Flow control prevents the sender from overwhelming the receiver.</strong></p>
        <p>The receiver advertises a <strong>Receive Window (rwnd)</strong> in every segment: "you may have up to rwnd more bytes outstanding". If rwnd = 5000, the sender must keep unacknowledged data ≤ 5000.</p>
        <div className="co key">
          <span className="lb">The one formula</span>
          <span className="fx">Effective send window = min(rwnd, cwnd)</span>
          <p style={{ margin: ".3rem 0 0" }}>rwnd protects the receiver; cwnd protects the network. Example: rwnd = 10 KB, cwnd = 6 KB → 6 KB (network limits). Later rwnd = 4 KB, cwnd = 6 KB → 4 KB (receiver limits).</p>
        </div>
        <W name="effwin" />
        <div className="co added">
          <span className="lb">+ Added · edge cases interviewers like</span>
          <ul>
            <li><strong>Zero window</strong>: receiver advertises rwnd = 0, sender stops and runs a <strong>persist timer</strong>, sending small window probes so a lost "window open" update can't deadlock the connection.</li>
            <li><strong>Silly Window Syndrome</strong>: tiny windows cause tiny segments (40 B header for 1 B data). Fixes: receiver waits until it can advertise a decent window (Clark); sender uses <strong>Nagle's algorithm</strong> (buffer small writes while an ACK is outstanding).</li>
            <li><strong>Delayed ACK</strong>: receiver waits up to ~200 ms (or every 2nd segment) to ACK. Nagle + delayed ACK together can add latency; interactive apps set <code>TCP_NODELAY</code>.</li>
          </ul>
        </div>
      </section>
      <section>
        <h2 id="sw-ack"><span className="num">10.3</span>Cumulative ACKs, loss and retransmission</h2>
        <p>TCP commonly uses <strong>cumulative ACKs</strong>: receiving 1000–1099, 1100–1199, 1200–1299 → one <code>ACK = 1300</code> confirms everything before 1300.</p>
        <p>If 1100–1199 is lost, the receiver keeps sending <code>ACK = 1100</code> for every later segment: <strong>duplicate ACKs</strong>.</p>
        <div className="vs">
          <div><h4>Loss signal 1: Timeout</h4>No ACK before the retransmission timer (RTO) expires → retransmit. Strong congestion signal.</div>
          <div><h4>Loss signal 2: Duplicate ACKs</h4>3 duplicate ACKs → <strong>fast retransmit</strong> without waiting for the timer.</div>
        </div>
        <h3 id="window-how-long-is-the-timeout">How long is the timeout? <span className="add">+ Added</span></h3>
        <div className="co formula">
          <span className="lb">RTO estimation (Jacobson / RFC 6298)</span>
          <span className="fx">EstimatedRTT = (1 − α)·EstimatedRTT + α·SampleRTT  <em>α = 1/8</em></span>
          <span className="fx">DevRTT = (1 − β)·DevRTT + β·|SampleRTT − EstimatedRTT|  <em>β = 1/4</em></span>
          <span className="fx">RTO = EstimatedRTT + 4·DevRTT</span>
          <p style={{ margin: ".3rem 0 0", fontSize: ".9rem" }}><strong>Karn's algorithm</strong>: don't take RTT samples from retransmitted segments (you can't tell which copy was ACKed), and double the RTO after each timeout (exponential backoff).</p>
        </div>
      </section>
      <section>
        <h2 id="sw-gbn"><span className="num">10.4</span>Go-Back-N vs Selective Repeat</h2>
        <p>General sliding-window ARQ schemes. Lose one packet and compare what gets resent:</p>
        <W name="gbnsr" />
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Go-Back-N</th>
                <th>Selective Repeat</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>On loss of k</td>
                <td>Resend k and everything after it</td>
                <td>Resend only k</td>
              </tr>
              <tr>
                <td>Receiver buffer</td>
                <td>None (window 1), discards out-of-order</td>
                <td>Buffers out-of-order packets</td>
              </tr>
              <tr>
                <td>ACKs</td>
                <td>Cumulative</td>
                <td>Individual</td>
              </tr>
              <tr>
                <td>Sender window (k-bit seq) <span className="add">+ Added</span></td>
                <td className="n">≤ 2^k − 1</td>
                <td className="n">≤ 2^(k−1)</td>
              </tr>
              <tr>
                <td>Complexity</td>
                <td>Simple receiver</td>
                <td>More complex, less bandwidth wasted</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="co trap">
          <span className="lb">TCP nuance</span>
          <p>Don't blindly say "TCP = Selective Repeat". Classic TCP uses cumulative ACKs and its retransmission behaviour resembles Go-Back-N in some respects, but receivers buffer out-of-order data, and modern TCP uses <strong>SACK</strong> (Selective Acknowledgment) so the receiver can say "I'm missing 3, but I have 4 and 5", and only the gap is resent. TCP is best described as a hybrid.</p>
        </div>
        <p><span className="add">+ Added</span> Why the window limit? With 2-bit sequence numbers (0–3) and SR window 3: if all ACKs are lost, the receiver can't tell a retransmitted old packet 0 from a new packet 0. Window ≤ 2 avoids the overlap.</p>
      </section>
      <section>
        <h2 id="sw-terms"><span className="num">10.5</span>Terms and the big picture</h2>
        <ul>
          <li><strong>Bytes in flight</strong>: sent but not yet acknowledged. Sent 10 KB, ACKed 6 KB → in flight 4 KB.</li>
          <li><strong>Window</strong>: max outstanding data allowed under current limits.</li>
        </ul>
        <ul className="tree">
          <li><span className="t">TCP Reliability</span><ul><li>Sequence numbers</li><li>ACKs</li><li>Checksum</li><li>Sliding window</li><li>Retransmission timer</li><li>Duplicate ACKs</li><li>SACK</li></ul></li>
        </ul>
        <p>Don't say "TCP is reliable because of ACK". It's the combination of all of these.</p>
        <pre className="dg">{"                 TCP Sender\n             ┌───────┴───────┐\n        "}<b>Flow Control</b>   <b>Congestion Control</b>{"\n            rwnd             cwnd\n             └───────┬───────┘\n          Effective Window = min(rwnd, cwnd)\n                     ↓\n                  Network"}</pre>
      </section>
    </>
  );
}

export function Quick() {
  return (
    <>
      <div className="quick-grid">
        <div>
          <h4>Window</h4>
          <ul>
            <li>Many bytes in flight → utilisation</li>
            <li>Effective = min(rwnd, cwnd)</li>
            <li>Stop-and-wait η = 1/(1+2a)</li>
            <li>Full pipe: N ≥ 1+2a</li>
          </ul>
        </div>
        <div>
          <h4>{"ACKs & loss"}</h4>
          <ul>
            <li>Cumulative ACK = next byte expected</li>
            <li>Loss → timeout OR 3 dup ACKs</li>
            <li>RTO = EstRTT + 4·DevRTT; Karn's rule</li>
          </ul>
        </div>
        <div>
          <h4>GBN vs SR</h4>
          <ul>
            <li>GBN resends k..end, window ≤ 2^k−1</li>
            <li>SR resends k only, window ≤ 2^(k−1)</li>
            <li>TCP: cumulative + SACK hybrid</li>
          </ul>
        </div>
        <div>
          <h4>Edge cases</h4>
          <ul>
            <li>rwnd = 0 → persist timer probes</li>
            <li>Silly window → Nagle / Clark</li>
            <li>Delayed ACK ~200 ms</li>
          </ul>
        </div>
      </div>
    </>
  );
}
