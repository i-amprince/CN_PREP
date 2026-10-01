// AUTO-GENERATED from content/13_ch_transport_handshake_window_congestion_termination.html by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run `npm run content` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
      <p>One of the most frequently asked CN topics. Don't just memorise SYN → SYN-ACK → ACK; understand <strong>why</strong> each step exists.</p>
      <section>
        <h2 id="hs-why"><span className="num">9.1</span>Why does TCP need a handshake?</h2>
        <p>TCP is connection-oriented. Before sending data, both sides must agree on state, especially:</p>
        <ul>
          <li>Each side's <strong>Initial Sequence Number</strong> (ISN)</li>
          <li>Connection state (and options like MSS, window scale, SACK)</li>
          <li>Proof that <strong>both</strong> directions work</li>
        </ul>
        <p>Step through it. Change the ISNs to see how the numbers follow.</p>
        <W name="seq-handshake" />
      </section>
      <section>
        <h2 id="hs-steps"><span className="num">9.2</span>The three steps</h2>
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
                <td>1. SYN</td>
                <td>Client → Server</td>
                <td className="n">SYN=1, Seq=x</td>
                <td>"I want to connect; my sequence numbers start at x."</td>
              </tr>
              <tr>
                <td>2. SYN + ACK</td>
                <td>Server → Client</td>
                <td className="n">SYN=1, ACK=1, Seq=y, Ack=x+1</td>
                <td>"Got your SYN. My numbers start at y. I expect x+1 next."</td>
              </tr>
              <tr>
                <td>3. ACK</td>
                <td>Client → Server</td>
                <td className="n">ACK=1, Seq=x+1, Ack=y+1</td>
                <td>"Got your y. Ready." Connection ESTABLISHED.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <pre className="dg">{"Client                              Server\nCLOSED                              LISTEN\n   | -------- "}<b>SYN, Seq=x</b>{" ------------->|\nSYN-SENT                         SYN-RECEIVED\n   | <---- "}<b>SYN+ACK, Seq=y, Ack=x+1</b>{" ----|\n   | -------- "}<b>ACK, Ack=y+1</b>{" ----------->|\nESTABLISHED                       ESTABLISHED"}</pre>
        <p><span className="add">+ Added</span> The third ACK may already carry data. The ISN is chosen <strong>randomly</strong> (not 0) so old segments from a previous connection and blind spoofing attacks are unlikely to match.</p>
      </section>
      <section>
        <h2 id="hs-why3"><span className="num">9.3</span>Why 3-way and not 2-way?</h2>
        <p>Both sides need to know the other can <strong>send and receive</strong>, and sequence numbers must be synchronised in <strong>both directions</strong>.</p>
        <ul>
          <li>After SYN → SYN-ACK, the <strong>client</strong> knows the server got its SYN and can reply.</li>
          <li>But the <strong>server</strong> doesn't yet know the client received the SYN-ACK (and so the server's ISN y).</li>
          <li>The third ACK confirms that.</li>
        </ul>
        <p><span className="add">+ Added</span> It also protects against <strong>old duplicate SYNs</strong>: if a delayed SYN from a dead connection arrives, the server's SYN-ACK gets a RST from the client instead of opening a ghost connection, which a 2-way handshake could not prevent.</p>
      </section>
      <section>
        <h2 id="hs-seq"><span className="num">9.4</span>Sequence numbers and ACK numbers</h2>
        <p>TCP is a <strong>byte-stream</strong> protocol: sequence numbers count <strong>bytes</strong>, not segments.</p>
        <p>ISN = 1000, send 500 bytes → they occupy 1000 to 1499 → receiver replies <strong>ACK = 1500</strong> ("I've got everything before 1500, send 1500 next"). The next segment carries Seq = 1500.</p>
        <div className="co key">
          <span className="lb">Rules</span>
          <span className="fx">ACK number = next byte expected</span>
          <span className="fx">Next Seq = Seq + data length</span>
          <span className="fx">SYN consumes 1 sequence number</span>
          <span className="fx">FIN consumes 1 sequence number</span>
          <span className="fx">A pure ACK (no data) consumes 0</span>
        </div>
        <p>Classic trap: client SYN with Seq = 100 → server replies <strong>Ack = 101</strong> (the SYN consumed one number).</p>
        <W name="seqcalc" />
        <h3 id="handshake-what-if-a-segment-is-lost">What if a segment is lost?</h3>
        <p>Sender sends 1000–1099, 1100–1199 (lost), 1200–1299. Receiver got the first and third, but still expects 1100, so it keeps sending <strong>ACK = 1100</strong>. These are <strong>duplicate ACKs</strong>. Three of them trigger <strong>Fast Retransmit</strong> (Congestion Control chapter).</p>
      </section>
      <section>
        <h2 id="hs-flags"><span className="num">9.5</span>TCP flags</h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Flag</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>SYN</td>
                <td>Synchronise: connection establishment</td>
              </tr>
              <tr>
                <td>ACK</td>
                <td>Acknowledgement field is valid (set on almost every segment after the first SYN)</td>
              </tr>
              <tr>
                <td>FIN</td>
                <td>Graceful termination: "I'm done sending"</td>
              </tr>
              <tr>
                <td>RST</td>
                <td>Reset: abrupt termination</td>
              </tr>
              <tr>
                <td>PSH</td>
                <td>Push data to the application immediately</td>
              </tr>
              <tr>
                <td>URG</td>
                <td>Urgent data (urgent pointer valid); rarely used</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>Most important: <strong>SYN, ACK, FIN, RST</strong>.</p>
      </section>
      <section>
        <h2 id="hs-flood"><span className="num">9.6</span>SYN flood attack</h2>
        <p>The attacker sends lots of SYNs (often from spoofed IPs). The server replies SYN-ACK and keeps state for each <strong>half-open connection</strong> in its backlog queue, but the final ACK never comes. The queue fills and real clients can't connect: a denial of service.</p>
        <p><span className="add">+ Added</span> Defences: <strong>SYN cookies</strong> (encode the connection state into the server's ISN so no memory is kept until the ACK returns), larger backlog, shorter SYN-RECEIVED timeouts, rate limiting, upstream DDoS scrubbing.</p>
      </section>
      <section>
        <h2 id="hs-states"><span className="num">9.7</span>Connection states and a key distinction</h2>
        <div className="vs">
          <div>
            <h4>Client</h4>
            <div className="flow">
              <span>CLOSED</span>
              <span>SYN-SENT</span>
              <span>ESTABLISHED</span>
            </div>
          </div>
          <div>
            <h4>Server</h4>
            <div className="flow">
              <span>LISTEN</span>
              <span>SYN-RECEIVED</span>
              <span>ESTABLISHED</span>
            </div>
          </div>
        </div>
        <div className="co trap">
          <span className="lb">Don't mix them</span>
          <p><strong>Handshake = 3-way</strong>: SYN, SYN-ACK, ACK.<br /><strong>Termination = usually 4-way</strong>: FIN, ACK, FIN, ACK.</p>
        </div>
        <p><span className="add">+ Added</span> <strong>TCP Fast Open</strong> lets a returning client send data in the SYN using a cookie, saving one RTT. TLS 1.3 and QUIC push this further.</p>
      </section>
    </>
  );
}

export function Quick() {
  return (
    <>
      <div className="quick-grid">
        <div>
          <h4>Handshake</h4>
          <ul>
            <li>SYN (Seq=x)</li>
            <li>SYN+ACK (Seq=y, Ack=x+1)</li>
            <li>ACK (Ack=y+1)</li>
            <li>Purpose: sync ISNs both ways + prove both directions</li>
          </ul>
        </div>
        <div>
          <h4>Numbers</h4>
          <ul>
            <li>ACK = next byte expected</li>
            <li>SYN and FIN consume 1</li>
            <li>ISN random</li>
          </ul>
        </div>
        <div>
          <h4>Flags</h4>
          <ul>
            <li>SYN establish · ACK acknowledge</li>
            <li>FIN graceful close · RST reset</li>
            <li>PSH push · URG urgent</li>
          </ul>
        </div>
        <div>
          <h4>{"Attacks & loss"}</h4>
          <ul>
            <li>SYN flood → half-open → SYN cookies</li>
            <li>Dup ACKs → possible loss → fast retransmit</li>
          </ul>
        </div>
      </div>
    </>
  );
}
