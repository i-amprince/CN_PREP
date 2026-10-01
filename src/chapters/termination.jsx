// AUTO-GENERATED from content/13_ch_transport_handshake_window_congestion_termination.html by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run `npm run content` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
      <p>Finishing the TCP lifecycle: establishment → data transfer → termination.</p>
      <section>
        <h2 id="tm-why"><span className="num">12.1</span>Why 4 steps?</h2>
        <p>TCP is <strong>full-duplex</strong>: each direction is closed <strong>independently</strong>. The client can say "I'm finished sending" while the server still has data to send. So the server ACKs the client's FIN, keeps sending, and sends its own FIN later.</p>
        <W name="seq-fin" />
      </section>
      <section>
        <h2 id="tm-steps"><span className="num">12.2</span>Step by step</h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Step</th>
                <th>Direction</th>
                <th>Fields</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1. FIN</td>
                <td>Client → Server</td>
                <td className="n">FIN=1, Seq=x</td>
                <td>"I have no more data to send."</td>
              </tr>
              <tr>
                <td>2. ACK</td>
                <td>Server → Client</td>
                <td className="n">Ack=x+1</td>
                <td>"Got your FIN." Server may still send data.</td>
              </tr>
              <tr>
                <td>3. FIN</td>
                <td>Server → Client</td>
                <td className="n">FIN=1, Seq=y</td>
                <td>"I'm also finished sending."</td>
              </tr>
              <tr>
                <td>4. ACK</td>
                <td>Client → Server</td>
                <td className="n">Ack=y+1</td>
                <td>Closed (client waits in TIME_WAIT).</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>FIN consumes one sequence number, just like SYN: FIN Seq = 5000 → ACK = 5001.</p>
        <p><span className="add">+ Added</span> If the server has nothing left to send, steps 2 and 3 are often <strong>combined</strong> into one FIN+ACK, so you'll see a 3-segment close in packet captures.</p>
        <p><strong>Half-close</strong>: FIN means "I've finished <em>sending</em>", not "I'll stop receiving". After the client's FIN, the server can still send DATA until it sends its own FIN. Possible because TCP is full-duplex.</p>
      </section>
      <section>
        <h2 id="tm-tw"><span className="num">12.3</span>TIME_WAIT</h2>
        <p>After sending the final ACK, the active closer doesn't forget the connection immediately. It enters <strong>TIME_WAIT</strong> for <strong>2 × MSL</strong> (Maximum Segment Lifetime), commonly 60 s total on Linux, though the exact value is implementation-dependent.</p>
        <div className="vs">
          <div><h4>Reason 1: delayed old packets</h4>An old segment from this connection may still be in the network. Waiting ensures it dies before a new connection with the same 4-tuple could receive it.</div>
          <div><h4>Reason 2: retransmit the final ACK</h4>If the last ACK is lost, the server resends its FIN. A client still in TIME_WAIT can ACK it again instead of answering with RST.</div>
        </div>
        <p><strong>Who enters TIME_WAIT?</strong> The endpoint that performs the <strong>active close</strong> (sends the first FIN), which sends the final ACK. Usually the client, but don't memorise "client always"; it depends on who closes first.</p>
        <p><span className="add">+ Added</span> The passive side goes ESTABLISHED → <strong>CLOSE_WAIT</strong> (got FIN, waiting for its own app to call close) → <strong>LAST_ACK</strong> → CLOSED. Lots of sockets stuck in CLOSE_WAIT = an application bug (it never closes). Lots in TIME_WAIT on a busy server = it is the active closer; mitigations include connection reuse (keep-alive) and <code>SO_REUSEADDR</code>.</p>
      </section>
      <section>
        <h2 id="tm-rst"><span className="num">12.4</span>FIN vs RST</h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>FIN</th>
                <th>RST</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Graceful close</td>
                <td>Abrupt reset</td>
              </tr>
              <tr>
                <td>Normal termination</td>
                <td>Error / forced termination</td>
              </tr>
              <tr>
                <td>Remaining data still delivered</td>
                <td>Buffered data discarded immediately</td>
              </tr>
              <tr>
                <td>Part of 4-way termination</td>
                <td>Not part of the normal handshake; no ACK expected</td>
              </tr>
              <tr>
                <td>Consumes 1 sequence number</td>
                <td>No TIME_WAIT</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>RST happens when: connecting to a port nobody listens on (the "connection refused" error), a serious protocol error, a segment for a connection that doesn't exist, or an application aborting (e.g. <code>SO_LINGER</code> with timeout 0).</p>
      </section>
      <section>
        <h2 id="tm-states"><span className="num">12.5</span>Full TCP state lifecycle</h2>
        <W name="tcpstates" />
      </section>
      <section>
        <h2 id="tm-map"><span className="num">12.6</span>TCP complete revision map</h2>
        <ul className="tree">
          <li><span className="t">TCP</span><ul><li><span className="t">Establishment</span> <em>3-way: SYN · SYN-ACK · ACK</em></li><li><span className="t">Data transfer</span><ul><li>Seq numbers → ACKs → reliability</li><li>Sliding window → flow control (rwnd)</li><li>Congestion control (cwnd)<ul><li>Slow Start</li><li>AIMD / Congestion Avoidance</li><li>Fast Retransmit → Tahoe / Reno (Fast Recovery)</li></ul></li></ul></li><li><span className="t">Termination</span> <em>4-way: FIN · ACK · FIN · ACK → TIME_WAIT</em></li></ul></li>
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
          <h4>Close</h4>
          <ul>
            <li>FIN → ACK → FIN → ACK</li>
            <li>4 steps because full-duplex (half-close)</li>
            <li>FIN consumes 1 seq</li>
          </ul>
        </div>
        <div>
          <h4>TIME_WAIT</h4>
          <ul>
            <li>2 × MSL, active closer</li>
            <li>Kills delayed old segments</li>
            <li>Can re-send final ACK</li>
          </ul>
        </div>
        <div>
          <h4>FIN vs RST</h4>
          <ul>
            <li>FIN graceful, RST abrupt</li>
            <li>RST: closed port, error, abort</li>
          </ul>
        </div>
        <div>
          <h4>States</h4>
          <ul>
            <li>Active: FIN_WAIT_1 → FIN_WAIT_2 → TIME_WAIT</li>
            <li>Passive: CLOSE_WAIT → LAST_ACK</li>
          </ul>
        </div>
      </div>
    </>
  );
}
