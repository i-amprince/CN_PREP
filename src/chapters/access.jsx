// AUTO-GENERATED from content/11_ch_datalink_access_errors.html by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run `npm run content` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
      <section>
        <h2 id="ma-why"><span className="num">3.1</span>Why do we need medium access control?</h2>
        <p>Imagine many computers on the <strong>same shared medium</strong> (a bus, a hub, or the air). If everyone transmits whenever they want, A and B might transmit simultaneously and their signals <strong>collide</strong>. We need a rule for: <em>when can I transmit?</em></p>
        <ul className="tree">
          <li><span className="t">Multiple access protocols</span> <span className="add">+ Added</span><ul><li><span className="t">Random access</span> <em>anyone may try</em><ul><li>ALOHA (pure, slotted)</li><li>CSMA → CSMA/CD (Ethernet), CSMA/CA (Wi-Fi)</li></ul></li><li><span className="t">Controlled access</span> <em>take turns</em><ul><li>Reservation · Polling · Token passing (Token Ring, FDDI)</li></ul></li><li><span className="t">Channelization</span> <em>split the channel</em><ul><li>FDMA · TDMA · CDMA</li></ul></li></ul></li>
        </ul>
      </section>
      <section>
        <h2 id="ma-aloha"><span className="num">3.2</span>ALOHA <span className="add">+ Added</span></h2>
        <p>The ancestor of CSMA: transmit whenever you have data, wait for an ACK, back off randomly if none comes.</p>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Pure ALOHA</th>
                <th>Slotted ALOHA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>When to send</td>
                <td>Any time</td>
                <td>Only at the start of a time slot</td>
              </tr>
              <tr>
                <td>Vulnerable time</td>
                <td className="n">2 × Tfr</td>
                <td className="n">Tfr</td>
              </tr>
              <tr>
                <td>Throughput S</td>
                <td className="n">G·e^(−2G)</td>
                <td className="n">G·e^(−G)</td>
              </tr>
              <tr>
                <td>Max efficiency</td>
                <td className="n">18.4% at G = 0.5</td>
                <td className="n">36.8% at G = 1</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>G = average number of frames generated per frame time.</p>
      </section>
      <section>
        <h2 id="ma-csma"><span className="num">3.3</span>CSMA: Carrier Sense Multiple Access</h2>
        <ul>
          <li><strong>Carrier Sense</strong>: before transmitting, ask "is someone already transmitting?"</li>
          <li><strong>Multiple Access</strong>: many devices share the same medium.</li>
        </ul>
        <p>So: <strong>Listen → if free → transmit</strong>. But there is still a problem: two devices may both check at almost the same time, both see "free", both transmit, and collide (because of propagation delay). That is where CD and CA come in.</p>
        <p><span className="add">+ Added</span> Persistence strategies: <strong>1-persistent</strong> (send immediately when idle; Ethernet), <strong>non-persistent</strong> (if busy, wait a random time then sense again), <strong>p-persistent</strong> (if idle, send with probability p; slotted channels).</p>
      </section>
      <section>
        <h2 id="ma-cd"><span className="num">3.4</span>CSMA/CD: Collision Detection</h2>
        <p>Historically associated with <strong>shared, half-duplex Ethernet</strong> (hubs, coax).</p>
        <W name="flow-csmacd" />
        <p>The device can detect "my transmission collided" (the voltage on the wire differs from what it is sending). It then stops, sends a 32-bit <strong>jam signal</strong> <span className="add">+ Added</span> so everyone notices, and backs off.</p>
        <h3 id="access-binary-exponential-backoff">Binary Exponential Backoff</h3>
        <p>This is the algorithmic part to remember. After collisions, devices do not retry immediately. They choose a random backoff, and the possible range <strong>doubles</strong> after each repeated collision. This reduces the chance the same devices collide again.</p>
        <div className="co formula">
          <span className="lb">Exact rule <span className="add">+ Added</span></span>
          <span className="fx">{"After the n-th collision: pick K ∈ {0, 1, …, 2^min(n,10) − 1}"}</span>
          <span className="fx">Wait K × slot time (512 bit-times = 51.2 µs at 10 Mbps)</span>
          <span className="fx">Give up after 16 attempts</span>
        </div>
        <W name="backoff" />
        <h3 id="access-minimum-frame-size">Minimum frame size <span className="add">+ Added</span></h3>
        <p>A sender must still be transmitting when news of a collision gets back to it, otherwise it cannot detect the collision. So:</p>
        <div className="co formula">
          <span className="lb">Condition</span>
          <span className="fx">Tt ≥ 2 × Tp  ⇒  L_min = 2 × Tp × R</span>
          <p style={{ margin: ".3rem 0 0", fontSize: ".9rem" }}>Classic Ethernet: 10 Mbps × 51.2 µs = 512 bits = <strong>64 bytes</strong> minimum frame. That is why short payloads are padded to 46 bytes.</p>
        </div>
      </section>
      <section>
        <h2 id="ma-ca"><span className="num">3.5</span>CSMA/CA: Collision Avoidance</h2>
        <p>Used primarily in <strong>Wi-Fi (IEEE 802.11)</strong>. Why not detect collisions? In wireless, the transmitter's own signal is far stronger than anything it could hear from others, so detecting a collision while transmitting is impractical. Wi-Fi tries to <strong>avoid</strong> collisions before they happen, and uses ACKs to learn about failures.</p>
        <W name="flow-csmaca" />
        <p><span className="add">+ Added</span> Wi-Fi timing: wait <strong>DIFS</strong> before contending, <strong>SIFS</strong> (shorter) before an ACK/CTS so responses get priority. The <strong>NAV</strong> (Network Allocation Vector) is a "virtual carrier sense" timer set from the duration field in RTS/CTS frames.</p>
      </section>
      <section>
        <h2 id="ma-vs"><span className="num">3.6</span>CSMA/CD vs CSMA/CA</h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>CSMA/CD</th>
                <th>CSMA/CA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Collision Detection</td>
                <td>Collision Avoidance</td>
              </tr>
              <tr>
                <td>Traditional shared Ethernet</td>
                <td>Wi-Fi</td>
              </tr>
              <tr>
                <td>Detect collision during transmission</td>
                <td>Try to avoid collision before it happens</td>
              </tr>
              <tr>
                <td>Collision → stop + jam + backoff</td>
                <td>Random backoff before sending + ACK</td>
              </tr>
              <tr>
                <td>Half-duplex Ethernet</td>
                <td>Wireless LAN</td>
              </tr>
              <tr>
                <td>Backoff after a collision</td>
                <td>Backoff even when the channel is idle</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="co trap">
          <span className="lb">Very important modern note</span>
          <p>Modern switched Ethernet is <strong>full-duplex</strong>, so collisions don't occur on a dedicated switch link. CSMA/CD is mainly a historical/legacy concept today, but it remains important for interviews and for understanding Ethernet.</p>
        </div>
      </section>
      <section>
        <h2 id="ma-hidden"><span className="num">3.7</span>Hidden terminal problem and RTS/CTS</h2>
        <p>A and C cannot hear each other, but both can reach B. A thinks "channel is free", C thinks "channel is free", both transmit to B → <strong>collision at B</strong>.</p>
        <W name="hidden" />
        <p>Wi-Fi can use <strong>RTS (Request To Send)</strong> and <strong>CTS (Clear To Send)</strong>. Other nearby devices that hear the CTS stay silent for the announced duration.</p>
        <W name="seq-rtscts" />
        <p><span className="add">+ Added</span> <strong>Exposed terminal problem</strong>: the opposite case. B is sending to A; C hears B and wrongly stays silent, even though C's transmission to D would not interfere at A. Capacity is wasted.</p>
      </section>
      <section>
        <h2 id="ma-big"><span className="num">3.8</span>One big picture</h2>
        <ul className="tree">
          <li><span className="t">Data Link Layer</span><ul><li>LLC</li><li><span className="t">MAC</span><ul><li>MAC Address</li><li>Ethernet<ul><li>Frame</li></ul></li><li>Medium Access<ul><li><span className="t">CSMA/CD</span><ul><li>Binary Exponential Backoff</li></ul></li><li><span className="t">CSMA/CA</span><ul><li>Random Backoff</li><li>ACK</li><li>RTS/CTS</li></ul></li></ul></li></ul></li></ul></li>
        </ul>
      </section>
    </>
  );
}

export function Quick() {
  return (
    <>
      <div className="quick-grid">
        <div>
          <h4>ALOHA</h4>
          <ul>
            <li>Pure: 18.4% (G = 0.5), vulnerable 2Tfr</li>
            <li>Slotted: 36.8% (G = 1), vulnerable Tfr</li>
          </ul>
        </div>
        <div>
          <h4>CSMA/CD</h4>
          <ul>
            <li>Listen → send → detect → jam → backoff</li>
            <li>BEB: K ∈ [0, 2^min(n,10)−1], give up at 16</li>
            <li>Min frame: Tt ≥ 2Tp → 64 B</li>
            <li>Legacy half-duplex Ethernet</li>
          </ul>
        </div>
        <div>
          <h4>CSMA/CA</h4>
          <ul>
            <li>Wi-Fi (802.11)</li>
            <li>Sense → backoff → send → wait ACK</li>
            <li>Can't detect collisions over the air</li>
          </ul>
        </div>
        <div>
          <h4>Hidden terminal</h4>
          <ul>
            <li>A and C can't hear each other → collide at B</li>
            <li>Fix: RTS → CTS → DATA → ACK</li>
            <li>Exposed terminal = needless silence</li>
          </ul>
        </div>
      </div>
    </>
  );
}
