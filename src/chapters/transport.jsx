// AUTO-GENERATED from content/13_ch_transport_handshake_window_congestion_termination.html by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run `npm run content` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
      <p>From host-to-host (IP) to <strong>process-to-process</strong>. One of the highest-priority CN topics for placements.</p>
      <section>
        <h2 id="tp-job"><span className="num">8.1</span>What does the Transport layer do?</h2>
        <p>The Network layer gets data from one <strong>host</strong> to another. The Transport layer gets it to the right <strong>process/application</strong>. IP gets the packet to Google's server; the <strong>port number</strong> gets it to the web server process.</p>
        <div className="flow h">
          <span>Your browser</span>
          <span>Your laptop</span>
          <span>Internet</span>
          <span>Google server</span>
          <span>Web server process</span>
        </div>
      </section>
      <section>
        <h2 id="tp-ports"><span className="num">8.2</span>Ports and sockets</h2>
        <p>A <strong>port</strong> (16-bit, 0–65535) identifies a process/service on a host. <code>142.x.x.x:443</code> = that host's HTTPS service.</p>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Protocol</th>
                <th className="n">Port</th>
                <th>Transport</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>HTTP</td>
                <td className="n">80</td>
                <td>TCP</td>
              </tr>
              <tr>
                <td>HTTPS</td>
                <td className="n">443</td>
                <td>TCP (UDP for HTTP/3)</td>
              </tr>
              <tr>
                <td>FTP</td>
                <td className="n">20 / 21</td>
                <td>TCP</td>
              </tr>
              <tr>
                <td>SSH</td>
                <td className="n">22</td>
                <td>TCP</td>
              </tr>
              <tr>
                <td>DNS</td>
                <td className="n">53</td>
                <td>UDP (TCP too)</td>
              </tr>
              <tr>
                <td>SMTP</td>
                <td className="n">25</td>
                <td>TCP</td>
              </tr>
              <tr>
                <td>DHCP</td>
                <td className="n">67 / 68</td>
                <td>UDP</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>Especially remember: <strong>HTTP 80 · HTTPS 443 · DNS 53 · SSH 22</strong>. The full list is on the Cheat Sheet.</p>
        <p><span className="add">+ Added</span> Port ranges: <strong>0–1023</strong> well-known (need admin to bind), <strong>1024–49151</strong> registered, <strong>49152–65535</strong> dynamic/ephemeral (your client's random source port).</p>
        <p>A <strong>socket</strong> = IP + port, e.g. <code>192.168.1.10:5000</code>. A TCP connection is uniquely identified by the <strong>4-tuple</strong> (5-tuple with protocol): source IP, source port, destination IP, destination port. That's how one server on port 443 handles thousands of clients at once: every connection differs in the client's IP or port.</p>
        <pre className="dg">{"One connection = 4-tuple\n192.168.1.10:5000  ──→  142.250.x.x:443\n"}<em>(src IP : src port)      (dst IP : dst port)</em></pre>
      </section>
      <section>
        <h2 id="tp-vs"><span className="num">8.3</span>TCP vs UDP</h2>
        <div className="vs">
          <div>
            <h4>TCP · Transmission Control Protocol</h4>
            <ul>
              <li>Connection-oriented</li>
              <li>Reliable, ordered</li>
              <li>Full-duplex, byte-stream</li>
              <li>Flow + congestion control</li>
              <li>ACKs and retransmission</li>
            </ul>
            <p style={{ margin: ".5rem 0 0", color: "var(--muted)", fontSize: ".9rem" }}>"I care that the data arrives correctly and in order."</p>
          </div>
          <div>
            <h4>UDP · User Datagram Protocol</h4>
            <ul>
              <li>Connectionless</li>
              <li>Best-effort (unreliable)</li>
              <li>No ordering, no retransmission</li>
              <li>No flow/congestion control</li>
              <li>Datagram (message boundaries kept)</li>
            </ul>
            <p style={{ margin: ".5rem 0 0", color: "var(--muted)", fontSize: ".9rem" }}>"Send it quickly; let the application handle reliability."</p>
          </div>
        </div>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>TCP</th>
                <th>UDP</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Connection-oriented (handshake)</td>
                <td>Connectionless</td>
              </tr>
              <tr>
                <td>Reliable</td>
                <td>Best-effort</td>
              </tr>
              <tr>
                <td>Ordered</td>
                <td>No ordering guarantee</td>
              </tr>
              <tr>
                <td>ACKs</td>
                <td>No ACKs</td>
              </tr>
              <tr>
                <td>Retransmission</td>
                <td>None built in</td>
              </tr>
              <tr>
                <td>Flow control (rwnd)</td>
                <td>No</td>
              </tr>
              <tr>
                <td>Congestion control (cwnd)</td>
                <td>No</td>
              </tr>
              <tr>
                <td>Byte stream</td>
                <td>Datagram</td>
              </tr>
              <tr>
                <td>Header 20–60 B</td>
                <td>Header 8 B</td>
              </tr>
              <tr>
                <td>Unicast only</td>
                <td>Unicast, broadcast, multicast <span className="add">+ Added</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="co trap">
          <span className="lb">Don't say "UDP is always faster"</span>
          <p>Better: UDP has lower protocol overhead and skips TCP's connection setup, reliability and congestion control, so it is useful when <strong>low latency</strong> or <strong>application-controlled reliability</strong> is preferred.</p>
        </div>
        <h3 id="transport-where-udp-is-used">Where UDP is used</h3>
        <ul>
          <li><strong>DNS</strong>: small request/response, low overhead (TCP when needed).</li>
          <li><strong>DHCP</strong>: the client doesn't have an IP address yet.</li>
          <li><strong>Real-time</strong>: gaming, voice, video calls, live streaming. If audio packet 100 is lost, waiting seconds to retransmit old audio is worse than continuing.</li>
          <li><span className="add">+ Added</span> SNMP, NTP, TFTP, VPNs (WireGuard), and <strong>QUIC/HTTP/3</strong> which builds reliability on top of UDP.</li>
        </ul>
      </section>
      <section>
        <h2 id="tp-headers"><span className="num">8.4</span>TCP segment and UDP datagram headers</h2>
        <W name="tcphdr" />
        <p>Most important TCP fields: <strong>Sequence Number, Acknowledgement Number, Flags, Window Size</strong>.</p>
        <div className="co added">
          <span className="lb">+ Added · header details</span>
          <ul>
            <li>Seq and ACK numbers are <strong>32-bit</strong>; they wrap around (2³² bytes ≈ 4 GB).</li>
            <li><strong>Data offset</strong> = header length in 4-byte words (5–15 → 20–60 bytes).</li>
            <li><strong>Window</strong> is 16-bit (max 65,535 bytes); the <strong>window scale</strong> option multiplies it (up to 2¹⁴×) for fast links.</li>
            <li>Common options: <strong>MSS</strong>, window scale, <strong>SACK-permitted</strong>, timestamps.</li>
            <li><strong>MSS</strong> (Maximum Segment Size) = MTU − IP header − TCP header = 1500 − 20 − 20 = <strong>1460 bytes</strong> on Ethernet.</li>
            <li>Flags: URG, ACK, PSH, RST, SYN, FIN (+ ECE, CWR for ECN).</li>
            <li>UDP checksum is optional in IPv4 but mandatory in IPv6.</li>
          </ul>
        </div>
        <p>UDP header size: <strong>8 bytes</strong> (source port, destination port, length, checksum). TCP minimum header: <strong>20 bytes</strong>.</p>
      </section>
      <section>
        <h2 id="tp-mux"><span className="num">8.5</span>Multiplexing and demultiplexing</h2>
        <W name="mux" />
        <p><strong>Multiplexing</strong> (sender): Chrome, Spotify and Discord all send at once; the Transport layer combines their data and tags each with port numbers. <strong>Demultiplexing</strong> (receiver): Transport reads the destination port (e.g. 443) and hands the data to the correct process. <span className="add">+ Added</span> UDP demultiplexes by (dst IP, dst port) only; TCP uses the full 4-tuple, which is why each TCP connection gets its own socket.</p>
      </section>
      <section>
        <h2 id="tp-conn"><span className="num">8.6</span>Connection-oriented vs connectionless, and TCP reliability</h2>
        <div className="vs">
          <div>
            <h4>TCP</h4>
            <div className="flow">
              <span>Connection establishment</span>
              <span>Data transfer</span>
              <span>Connection termination</span>
            </div>
          </div>
          <div>
            <h4>UDP</h4>
            <div className="flow">
              <span>Send datagram</span>
            </div>
            <p style={{ fontSize: ".9rem", color: "var(--muted)" }}>No transport-level connection setup, so "connectionless".</p>
          </div>
        </div>
        <ul className="tree">
          <li><span className="t">TCP Reliability</span><ul><li>Sequence numbers</li><li>ACKs (cumulative)</li><li>Retransmission (timeout, 3 dup ACKs)</li><li>Checksum</li><li>Sliding window</li></ul></li>
        </ul>
        <p>TCP numbers <strong>bytes</strong>. The ACK number is the <strong>next byte expected</strong>: <code>ACK = 300</code> means "I have everything up to byte 299; send 300 next."</p>
      </section>
      <section>
        <h2 id="tp-flowcong"><span className="num">8.7</span>Flow control vs congestion control</h2>
        <p>Don't mix these. Interviewers love this distinction.</p>
        <div className="vs">
          <div><h4>Flow control → protect the RECEIVER</h4>Sender is faster than the receiver can process. Controlled by the <strong>receive window (rwnd)</strong> the receiver advertises.</div>
          <div><h4>Congestion control → protect the NETWORK</h4>Too much traffic is entering the network. Controlled by the sender's <strong>congestion window (cwnd)</strong>: slow start, congestion avoidance, fast retransmit, fast recovery.</div>
        </div>
        <h3 id="transport-tcp-connection-the-big-picture">TCP connection: the big picture</h3>
        <div className="flow">
          <span>3-way handshake</span>
          <span>Connection established</span>
          <span>Data transfer: ACKs · retransmission · flow control · congestion control</span>
          <span>4-way termination</span>
          <span>Connection closed</span>
        </div>
      </section>
      <section>
        <h2 id="tp-sockets"><span className="num">8.8</span>Socket programming flow <span className="add">+ Added</span></h2>
        <p>SDE interviews often ask "how does a server accept connections?" The Berkeley sockets API maps directly onto the TCP concepts above.</p>
        <div className="vs">
          <div>
            <h4>TCP server</h4>
            <div className="flow">
              <span>socket()</span>
              <span>bind(IP, port)</span>
              <span>listen(backlog)</span>
              <span>accept() → new socket per client (handshake already done by the kernel)</span>
              <span>recv() / send()</span>
              <span>close() → FIN</span>
            </div>
          </div>
          <div>
            <h4>TCP client</h4>
            <div className="flow">
              <span>socket()</span>
              <span>connect(server IP, port) → 3-way handshake</span>
              <span>send() / recv()</span>
              <span>close() → FIN</span>
            </div>
          </div>
        </div>
        <ul>
          <li>The <strong>listening socket</strong> never carries data; every <code>accept()</code> returns a new connected socket identified by the full 4-tuple.</li>
          <li>The <code>listen()</code> backlog is the queue of completed (and half-open) connections, which is exactly what a SYN flood fills.</li>
          <li><strong>UDP</strong> has no <code>listen()</code>/<code>accept()</code>/<code>connect()</code> handshake: just <code>socket()</code>, <code>bind()</code>, <code>sendto()</code> / <code>recvfrom()</code>.</li>
          <li>The client normally doesn't call <code>bind()</code>: the OS picks an ephemeral source port.</li>
          <li>Blocking vs non-blocking sockets; servers handle many clients with threads or event loops (<code>select</code>/<code>epoll</code>, which is what Node.js and Nginx use).</li>
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
          <h4>Identity</h4>
          <ul>
            <li>IP → host · Port → process</li>
            <li>Socket = IP + port</li>
            <li>TCP connection = 4-tuple</li>
            <li>Ephemeral ports 49152–65535</li>
          </ul>
        </div>
        <div>
          <h4>TCP</h4>
          <ul>
            <li>Reliable, ordered, connection-oriented</li>
            <li>Byte stream, full-duplex</li>
            <li>Header 20–60 B; MSS 1460</li>
          </ul>
        </div>
        <div>
          <h4>UDP</h4>
          <ul>
            <li>Connectionless, best-effort, datagram</li>
            <li>Header 8 B</li>
            <li>DNS, DHCP, VoIP, gaming, QUIC</li>
          </ul>
        </div>
        <div>
          <h4>Control</h4>
          <ul>
            <li>Flow → rwnd → receiver</li>
            <li>Congestion → cwnd → network</li>
            <li>Mux at sender, demux at receiver by port</li>
          </ul>
        </div>
        <div>
          <h4>Sockets API <span className="add">+ Added</span></h4>
          <ul>
            <li>Server: socket → bind → listen → accept → recv/send → close</li>
            <li>Client: socket → connect → send/recv → close</li>
            <li>UDP: no listen/accept, just sendto/recvfrom</li>
          </ul>
        </div>
      </div>
    </>
  );
}
