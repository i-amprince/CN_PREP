// AUTO-GENERATED from content/13_ch_transport_handshake_window_congestion_termination.html by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run `npm run content` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
      <p>The main question: <strong>how much data should a TCP sender put into the network without causing congestion?</strong> One of the most algorithm-heavy placement topics.</p>
      <section>
        <h2 id="cc-vars"><span className="num">11.1</span>cwnd and ssthresh</h2>
        <div className="vs">
          <div><h4>Flow control</h4>Protects the RECEIVER → rwnd</div>
          <div><h4>Congestion control</h4>Protects the NETWORK → cwnd</div>
        </div>
        <p><strong>cwnd</strong> (congestion window) is kept by the <strong>sender</strong> only (never sent in a header). It limits how much unacknowledged data can be in the network: cwnd = 10 KB → ~10 KB in flight, subject to rwnd.</p>
        <p><strong>ssthresh</strong> (slow start threshold) decides when TCP switches from Slow Start to Congestion Avoidance.</p>
        <p>TCP has no explicit signal from routers (unless ECN), so it <strong>infers</strong> congestion from loss: a timeout or duplicate ACKs.</p>
      </section>
      <section>
        <h2 id="cc-sim"><span className="num">11.2</span>See it: the cwnd graph</h2>
        <p>Pick ssthresh and when the losses happen. The chart draws Tahoe and Reno together so the difference is obvious. Hover or tap a point for the round's value.</p>
        <W name="cwnd" />
      </section>
      <section>
        <h2 id="cc-ss"><span className="num">11.3</span>Slow Start</h2>
        <p>Despite the name, Slow Start grows <strong>very quickly</strong>. It starts small because the sender doesn't know the network's capacity, then increases while watching for trouble.</p>
        <p>cwnd grows by 1 MSS for every ACK received, which <strong>doubles cwnd every RTT</strong>: 1 → 2 → 4 → 8 → 16 → 32 MSS. Exponential growth.</p>
        <p>When <strong>cwnd ≥ ssthresh</strong>, TCP enters Congestion Avoidance. <span className="add">+ Added</span> Modern stacks start with an initial window of 10 MSS (RFC 6928), not 1.</p>
      </section>
      <section>
        <h2 id="cc-ca"><span className="num">11.4</span>Congestion Avoidance and AIMD</h2>
        <p>Growth becomes roughly <strong>linear</strong>: about +1 MSS per RTT (16 → 17 → 18 → 19 → 20). This follows <strong>AIMD</strong>:</p>
        <ul>
          <li><strong>Additive Increase</strong>: no trouble → cwnd += ~1 MSS per RTT.</li>
          <li><strong>Multiplicative Decrease</strong>: congestion detected → cwnd ≈ cwnd / 2 (e.g. 20 → 10).</li>
        </ul>
        <p>Repeated, this gives the famous <strong>sawtooth</strong>. <span className="add">+ Added</span> AIMD is used because it converges to <strong>fairness</strong>: competing flows end up sharing the bottleneck roughly equally.</p>
      </section>
      <section>
        <h2 id="cc-fr"><span className="num">11.5</span>Fast Retransmit and Fast Recovery</h2>
        <p>Packet 3 is lost while 4 and 5 arrive; the receiver keeps ACKing the gap, so the sender sees duplicate ACKs. After <strong>3 duplicate ACKs</strong>, TCP performs <strong>Fast Retransmit</strong>: resend the missing segment immediately, without waiting for the timeout.</p>
        <p>3 dup ACKs mean data is <em>still flowing</em> (later packets are arriving), so the network isn't badly congested. <strong>Fast Recovery</strong> (Reno) uses that: halve cwnd instead of collapsing to 1.</p>
      </section>
      <section>
        <h2 id="cc-variants"><span className="num">11.6</span>Tahoe vs Reno</h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Tahoe</th>
                <th>Reno</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>3 duplicate ACKs</td>
                <td>ssthresh = cwnd/2, <strong>cwnd = 1 MSS</strong>, Slow Start</td>
                <td>ssthresh = cwnd/2, <strong>cwnd ≈ ssthresh</strong> (+3), Fast Recovery</td>
              </tr>
              <tr>
                <td>Timeout</td>
                <td>ssthresh = cwnd/2, cwnd = 1 MSS</td>
                <td>ssthresh = cwnd/2, cwnd = 1 MSS</td>
              </tr>
              <tr>
                <td>Fast Retransmit</td>
                <td>Yes</td>
                <td>Yes</td>
              </tr>
              <tr>
                <td>Fast Recovery</td>
                <td>No</td>
                <td>Yes</td>
              </tr>
              <tr>
                <td>Slow Start after 3 dup ACK</td>
                <td>Yes</td>
                <td>No</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="co key">
          <span className="lb">One-line memory trick</span>
          <span className="fx">TAHOE: 3 dup ACK → back to 1 MSS</span>
          <span className="fx">RENO: 3 dup ACK → cut in half + Fast Recovery</span>
          <span className="fx">BOTH: Timeout → cwnd = 1 MSS → Slow Start</span>
        </div>
        <h3 id="congestion-worked-examples">Worked examples</h3>
        <p><strong>3 dup ACKs, Reno</strong>: cwnd = 16, ssthresh = 8, in CA. → ssthresh = 8, cwnd ≈ 8, Fast Recovery, then 8 → 9 → 10 → 11 (linear).</p>
        <p><strong>Timeout</strong>: cwnd = 16 → ssthresh = 8, cwnd = 1 → 1 → 2 → 4 → 8 (Slow Start) → 9 → 10 → 11 (CA).</p>
        <div className="co added">
          <span className="lb">+ Added · beyond Reno</span>
          <ul>
            <li><strong>NewReno</strong>: stays in fast recovery until all data lost in the window is recovered (handles multiple losses).</li>
            <li><strong>CUBIC</strong>: default in Linux/Windows/macOS. Window grows as a cubic function of time since last loss; good on high-bandwidth, long-delay paths.</li>
            <li><strong>BBR</strong> (Google): models bottleneck bandwidth and RTT instead of reacting to loss.</li>
            <li><strong>ECN</strong>: routers mark packets (instead of dropping) when queues build; receiver echoes ECE, sender reduces cwnd and sets CWR.</li>
          </ul>
        </div>
      </section>
      <section>
        <h2 id="cc-flow"><span className="num">11.7</span>The whole algorithm as one flow</h2>
        <W name="flow-cc" />
        <div className="co qa">
          <span className="lb">Classic interview question</span>
          <p><strong>Why does TCP reduce its sending rate when packet loss occurs?</strong> Because loss usually means router queues are overflowing (congestion). Reducing cwnd lowers the traffic injected into the network so queues can drain; otherwise everyone keeps retransmitting and the network collapses (congestion collapse).</p>
        </div>
      </section>
      <section>
        <h2 id="cc-shaping"><span className="num">11.8</span>Traffic shaping: leaky bucket vs token bucket <span className="add">+ Added</span></h2>
        <p>A classic GATE/placement question. Congestion control is the <em>sender reacting</em> to the network; traffic shaping is a router or host <em>enforcing</em> a rate.</p>
        <div className="vs">
          <div>
            <h4>Leaky bucket</h4>
            <ul>
              <li>Packets enter a bucket (queue) at any rate</li>
              <li>They leave at a <strong>constant rate</strong>, like water dripping from a hole</li>
              <li>Bucket full → packets are dropped</li>
              <li>Smooths bursts completely; output is rigid</li>
            </ul>
          </div>
          <div>
            <h4>Token bucket</h4>
            <ul>
              <li>Tokens are added at rate r up to capacity C</li>
              <li>Sending a packet (or byte) consumes a token</li>
              <li><strong>Allows bursts</strong> up to C when tokens have built up, while the long-run rate stays r</li>
              <li>Used for API rate limiting and QoS policing</li>
            </ul>
          </div>
        </div>
        <div className="co formula">
          <span className="lb">Token bucket burst length</span>
          <span className="fx">Max burst time S = C / (M − r)</span>
          <p style={{ margin: ".3rem 0 0", fontSize: ".9rem" }}>C = bucket capacity (bytes), r = token rate, M = maximum output (link) rate. Example: C = 250 KB, r = 2 MB/s, M = 25 MB/s → S = 250 / 23,000 s ≈ 10.9 ms at full speed.</p>
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
          <h4>Variables</h4>
          <ul>
            <li>cwnd → network, rwnd → receiver</li>
            <li>Effective = min(cwnd, rwnd)</li>
            <li>ssthresh = switch point</li>
          </ul>
        </div>
        <div>
          <h4>Phases</h4>
          <ul>
            <li>Slow Start → exponential (×2 per RTT)</li>
            <li>CA → linear (+1 MSS per RTT)</li>
            <li>AIMD → sawtooth, fairness</li>
          </ul>
        </div>
        <div>
          <h4>Loss reactions</h4>
          <ul>
            <li>3 dup ACKs → Fast Retransmit</li>
            <li>Timeout → cwnd = 1, Slow Start (both)</li>
            <li>Tahoe: 3 dup → 1 MSS</li>
            <li>Reno: 3 dup → half + Fast Recovery</li>
          </ul>
        </div>
        <div>
          <h4>Modern</h4>
          <ul>
            <li>CUBIC default today, BBR model-based</li>
            <li>ECN marks instead of drops</li>
          </ul>
        </div>
        <div>
          <h4>Shaping <span className="add">+ Added</span></h4>
          <ul>
            <li>Leaky bucket → constant output rate</li>
            <li>Token bucket → bursts up to capacity C</li>
            <li>Burst time S = C / (M − r)</li>
          </ul>
        </div>
      </div>
    </>
  );
}
