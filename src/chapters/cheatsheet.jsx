// AUTO-GENERATED from content/17_ch_cheatsheet.html by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run `npm run content` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
      <p>Everything you need the night before, on one page: ports, formulas, every "X vs Y" table, a protocol map, the command-line tools, and an interview question bank covering every chapter. Use the search box (top) to jump anywhere.</p>
      <section>
        <h2 id="cs-ports"><span className="num">20.1</span>Master ports table</h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Port</th>
                <th>Protocol</th>
                <th>Transport</th>
                <th>Remember it as</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="n">20 / 21</td>
                <td>FTP</td>
                <td>TCP</td>
                <td>20 data (active mode), 21 control</td>
              </tr>
              <tr>
                <td className="n">22</td>
                <td>SSH (also SFTP, SCP)</td>
                <td>TCP</td>
                <td>Secure remote shell</td>
              </tr>
              <tr>
                <td className="n">23</td>
                <td>Telnet</td>
                <td>TCP</td>
                <td>Plain-text remote shell (insecure)</td>
              </tr>
              <tr>
                <td className="n">25 / 587 / 465</td>
                <td>SMTP</td>
                <td>TCP</td>
                <td>Sending mail: 25 relay, 587 submission (STARTTLS), 465 implicit TLS</td>
              </tr>
              <tr>
                <td className="n">53</td>
                <td>DNS</td>
                <td>UDP (TCP too)</td>
                <td>Name → IP; TCP for zone transfers / big answers</td>
              </tr>
              <tr>
                <td className="n">67 / 68</td>
                <td>DHCP</td>
                <td>UDP</td>
                <td>67 server, 68 client</td>
              </tr>
              <tr>
                <td className="n">69 <span className="add">+ Added</span></td>
                <td>TFTP</td>
                <td>UDP</td>
                <td>Trivial FTP (network boot, router configs)</td>
              </tr>
              <tr>
                <td className="n">80</td>
                <td>HTTP</td>
                <td>TCP</td>
                <td>Web</td>
              </tr>
              <tr>
                <td className="n">110 / 995</td>
                <td>POP3 / POP3S</td>
                <td>TCP</td>
                <td>Download mail</td>
              </tr>
              <tr>
                <td className="n">123</td>
                <td>NTP</td>
                <td>UDP</td>
                <td>Time sync</td>
              </tr>
              <tr>
                <td className="n">143 / 993</td>
                <td>IMAP / IMAPS</td>
                <td>TCP</td>
                <td>Mail stays on server</td>
              </tr>
              <tr>
                <td className="n">161 / 162</td>
                <td>SNMP</td>
                <td>UDP</td>
                <td>161 queries, 162 traps</td>
              </tr>
              <tr>
                <td className="n">179</td>
                <td>BGP</td>
                <td>TCP</td>
                <td>Routing between ASes</td>
              </tr>
              <tr>
                <td className="n">389 / 636 <span className="add">+ Added</span></td>
                <td>LDAP / LDAPS</td>
                <td>TCP</td>
                <td>Directory (Active Directory)</td>
              </tr>
              <tr>
                <td className="n">443</td>
                <td>HTTPS (and HTTP/3)</td>
                <td>TCP (UDP for QUIC)</td>
                <td>Web over TLS</td>
              </tr>
              <tr>
                <td className="n">500 / 4500 <span className="add">+ Added</span></td>
                <td>IKE / IPsec NAT-T</td>
                <td>UDP</td>
                <td>VPN key exchange</td>
              </tr>
              <tr>
                <td className="n">520</td>
                <td>RIP</td>
                <td>UDP</td>
                <td>Distance vector updates every 30 s</td>
              </tr>
              <tr>
                <td className="n">853 <span className="add">+ Added</span></td>
                <td>DNS over TLS</td>
                <td>TCP</td>
                <td>Encrypted DNS</td>
              </tr>
              <tr>
                <td className="n">1194 / 51820 <span className="add">+ Added</span></td>
                <td>OpenVPN / WireGuard</td>
                <td>UDP</td>
                <td>VPNs</td>
              </tr>
              <tr>
                <td className="n">3306 · 5432 · 6379 · 27017 <span className="add">+ Added</span></td>
                <td>MySQL · PostgreSQL · Redis · MongoDB</td>
                <td>TCP</td>
                <td>Handy for backend interviews</td>
              </tr>
              <tr>
                <td className="n">3389</td>
                <td>RDP</td>
                <td>TCP</td>
                <td>Windows remote desktop</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="co key">
          <span className="lb">Not ports: IP protocol numbers</span>
          <span className="fx">ICMP = 1 · TCP = 6 · UDP = 17 · GRE = 47 · ESP = 50 · AH = 51 · OSPF = 89</span>
          <p style={{ margin: ".3rem 0 0", fontSize: ".9rem" }}>OSPF runs directly on IP (protocol 89), with no TCP/UDP port. Port ranges: 0–1023 well-known, 1024–49151 registered, 49152–65535 ephemeral.</p>
        </div>
      </section>
      <section>
        <h2 id="cs-formulas"><span className="num">20.2</span>All the formulas</h2>
        <div className="co formula">
          <span className="lb">Delays and efficiency (chapter 0, 10)</span>
          <span className="fx">Tt = L / R · Tp = d / v · RTT ≈ 2·Tp</span>
          <span className="fx">Total per-hop delay = processing + queuing + transmission + propagation</span>
          <span className="fx">a = Tp / Tt · Stop-and-Wait η = 1 / (1 + 2a)</span>
          <span className="fx">Window N: η = min(1, N / (1 + 2a)) · full pipe needs N ≥ 1 + 2a</span>
          <span className="fx">BDP = R × RTT · Throughput = min(R, W / RTT)</span>
        </div>
        <div className="co formula">
          <span className="lb">Channel capacity</span>
          <span className="fx">Nyquist (noiseless): C = 2B·log₂(L)</span>
          <span className="fx">Shannon (noisy): C = B·log₂(1 + SNR), SNR_dB = 10·log₁₀(SNR)</span>
        </div>
        <div className="co formula">
          <span className="lb">Medium access (chapter 3)</span>
          <span className="fx">Pure ALOHA S = G·e^(−2G), max 18.4% at G = 0.5, vulnerable 2·Tfr</span>
          <span className="fx">Slotted ALOHA S = G·e^(−G), max 36.8% at G = 1, vulnerable Tfr</span>
          <span className="fx">CSMA/CD: Tt ≥ 2·Tp ⇒ L_min = 2·Tp·R (Ethernet: 512 bits = 64 B)</span>
          <span className="fx">BEB: after n-th collision K ∈ [0, 2^min(n,10) − 1], wait K × 51.2 µs, give up after 16</span>
        </div>
        <div className="co formula">
          <span className="lb">Topology, errors (chapters 0, 4)</span>
          <span className="fx">Full mesh links = n(n−1)/2, ports per device = n−1</span>
          <span className="fx">CRC: generator degree r → append r zeros → XOR-divide → r-bit remainder</span>
          <span className="fx">Hamming parity bits: 2^r ≥ m + r + 1</span>
          <span className="fx">Detect d errors: d_min ≥ d + 1 · Correct t errors: d_min ≥ 2t + 1</span>
        </div>
        <div className="co formula">
          <span className="lb">Subnetting (chapter 6)</span>
          <span className="fx">Host bits h = 32 − prefix · Usable hosts = 2^h − 2</span>
          <span className="fx">Subnets from s borrowed bits = 2^s · Block size = 256 − mask octet</span>
          <span className="fx">Network = IP AND mask · Broadcast = network OR wildcard</span>
          <span className="fx">Fragment offset = data bytes before this fragment ÷ 8</span>
        </div>
        <div className="co formula">
          <span className="lb">TCP (chapters 8–11)</span>
          <span className="fx">Next Seq = Seq + data length · ACK = next byte expected · SYN, FIN consume 1</span>
          <span className="fx">MSS = MTU − 20 (IP) − 20 (TCP) = 1460 on Ethernet</span>
          <span className="fx">Effective window = min(rwnd, cwnd)</span>
          <span className="fx">GBN sender window ≤ 2^k − 1 · SR window ≤ 2^(k−1) (k-bit sequence numbers)</span>
          <span className="fx">EstRTT = (1−α)·EstRTT + α·Sample (α = 1/8) · DevRTT with β = 1/4</span>
          <span className="fx">RTO = EstRTT + 4·DevRTT</span>
          <span className="fx">Slow start: cwnd ×2 per RTT · CA: +1 MSS per RTT · loss: ssthresh = cwnd/2</span>
        </div>
      </section>
      <section>
        <h2 id="cs-vs"><span className="num">20.3</span>Every "X vs Y" in one place</h2>
        <h3 id="cheatsheet-tcp-vs-udp">TCP vs UDP</h3>
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
                <td>Connection-oriented, 3-way handshake</td>
                <td>Connectionless</td>
              </tr>
              <tr>
                <td>Reliable, ordered, retransmits</td>
                <td>Best-effort, no ordering</td>
              </tr>
              <tr>
                <td>Flow + congestion control</td>
                <td>None</td>
              </tr>
              <tr>
                <td>Byte stream, header 20–60 B</td>
                <td>Datagrams, header 8 B</td>
              </tr>
              <tr>
                <td>HTTP/1.1, HTTP/2, SSH, SMTP, FTP</td>
                <td>DNS, DHCP, VoIP, gaming, QUIC</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 id="cheatsheet-hub-vs-switch-vs-router">Hub vs switch vs router</h3>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Hub</th>
                <th>Switch</th>
                <th>Router</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Layer</td>
                <td>1 Physical</td>
                <td>2 Data Link</td>
                <td>3 Network</td>
              </tr>
              <tr>
                <td>Uses</td>
                <td>Bits only</td>
                <td>MAC table</td>
                <td>IP routing table</td>
              </tr>
              <tr>
                <td>Sends to</td>
                <td>All ports</td>
                <td>Destination port (floods unknown)</td>
                <td>Next hop</td>
              </tr>
              <tr>
                <td>Collision domains</td>
                <td>1 for all ports</td>
                <td>1 per port</td>
                <td>1 per port</td>
              </tr>
              <tr>
                <td>Broadcast domains</td>
                <td>1</td>
                <td>1 (unless VLANs)</td>
                <td>1 per interface</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 id="cheatsheet-csma-cd-vs-csma-ca">CSMA/CD vs CSMA/CA</h3>
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
                <td>Shared half-duplex Ethernet (legacy)</td>
                <td>Wi-Fi (802.11)</td>
              </tr>
              <tr>
                <td>Detect during transmission → jam + backoff</td>
                <td>Random backoff before sending + ACK</td>
              </tr>
              <tr>
                <td>Backoff after a collision</td>
                <td>Backoff even when idle; RTS/CTS optional</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 id="cheatsheet-distance-vector-vs-link-state">Distance vector vs link state</h3>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Distance vector</th>
                <th>Link state</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Knows neighbours' distances</td>
                <td>Knows the full topology</td>
              </tr>
              <tr>
                <td>Bellman-Ford</td>
                <td>Dijkstra (SPF)</td>
              </tr>
              <tr>
                <td>RIP</td>
                <td>OSPF, IS-IS</td>
              </tr>
              <tr>
                <td>Whole table to neighbours, periodically</td>
                <td>LSAs flooded to all, on change</td>
              </tr>
              <tr>
                <td>Slow convergence, count-to-infinity</td>
                <td>Fast convergence, more CPU/memory</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 id="cheatsheet-rip-vs-ospf-vs-bgp">RIP vs OSPF vs BGP</h3>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>RIP</th>
                <th>OSPF</th>
                <th>BGP</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Type</td>
                <td>Distance vector (IGP)</td>
                <td>Link state (IGP)</td>
                <td>Path vector (EGP)</td>
              </tr>
              <tr>
                <td>Algorithm</td>
                <td>Bellman-Ford</td>
                <td>Dijkstra</td>
                <td>Policy + attributes</td>
              </tr>
              <tr>
                <td>Metric</td>
                <td>Hop count (max 15, 16 = ∞)</td>
                <td>Cost (bandwidth)</td>
                <td>AS_PATH, LOCAL_PREF, MED…</td>
              </tr>
              <tr>
                <td>Runs on</td>
                <td>UDP 520</td>
                <td>IP protocol 89</td>
                <td>TCP 179</td>
              </tr>
              <tr>
                <td>Scope</td>
                <td>Small networks</td>
                <td>Inside an AS (areas)</td>
                <td>Between ASes (the Internet)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 id="cheatsheet-tahoe-vs-reno">Tahoe vs Reno</h3>
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
                <td>ssthresh = cwnd/2, cwnd = 1, slow start</td>
                <td>ssthresh = cwnd/2, cwnd ≈ ssthresh, fast recovery</td>
              </tr>
              <tr>
                <td>Timeout</td>
                <td>cwnd = 1, slow start</td>
                <td>cwnd = 1, slow start</td>
              </tr>
              <tr>
                <td>Fast retransmit / fast recovery</td>
                <td>Yes / No</td>
                <td>Yes / Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 id="cheatsheet-flow-control-vs-congestion-control">Flow control vs congestion control</h3>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Flow control</th>
                <th>Congestion control</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Protects the receiver</td>
                <td>Protects the network</td>
              </tr>
              <tr>
                <td>rwnd, advertised by the receiver</td>
                <td>cwnd, computed by the sender</td>
              </tr>
              <tr>
                <td>"Can the receiver handle this?"</td>
                <td>"Can the network handle this?"</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ textAlign: "center" }}>Effective window = min(rwnd, cwnd)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 id="cheatsheet-fin-vs-rst">FIN vs RST</h3>
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
                <td>Graceful close, "done sending"</td>
                <td>Abrupt reset, "abort"</td>
              </tr>
              <tr>
                <td>Part of the 4-way close, consumes 1 seq</td>
                <td>No handshake, buffered data discarded</td>
              </tr>
              <tr>
                <td>Active closer ends in TIME_WAIT</td>
                <td>No TIME_WAIT</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 id="cheatsheet-get-vs-post">GET vs POST</h3>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>GET</th>
                <th>POST</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Retrieve</td>
                <td>Submit / create / process</td>
              </tr>
              <tr>
                <td>Params in URL</td>
                <td>Data in body</td>
              </tr>
              <tr>
                <td>Safe + idempotent</td>
                <td>Neither</td>
              </tr>
              <tr>
                <td>Cacheable, bookmarkable</td>
                <td>Usually not</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ textAlign: "center" }}>Neither is "secure": HTTPS encrypts both</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 id="cheatsheet-401-vs-403">401 vs 403</h3>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>401 Unauthorized</th>
                <th>403 Forbidden</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Authentication missing or failed</td>
                <td>Authenticated, but not allowed</td>
              </tr>
              <tr>
                <td>"Who are you?"</td>
                <td>"I know who you are, but you can't do this."</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 id="cheatsheet-cookie-vs-session-vs-jwt">Cookie vs session (vs JWT)</h3>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Session</th>
                <th>JWT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Stored in the browser</td>
                <td>State stored on the server</td>
                <td>Self-contained signed token held by the client</td>
              </tr>
              <tr>
                <td>Sent automatically with each request</td>
                <td>Found via a session-ID cookie</td>
                <td>Sent as Authorization: Bearer</td>
              </tr>
              <tr>
                <td>Transport mechanism</td>
                <td>Easy to revoke</td>
                <td>Stateless, hard to revoke; signed not encrypted</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 id="cheatsheet-http-1-1-vs-http-2-vs-http-3">HTTP/1.1 vs HTTP/2 vs HTTP/3</h3>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>HTTP/1.1</th>
                <th>HTTP/2</th>
                <th>HTTP/3</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Transport</td>
                <td>TCP</td>
                <td>TCP</td>
                <td>QUIC over UDP</td>
              </tr>
              <tr>
                <td>Multiplexing</td>
                <td>Limited</td>
                <td>Yes</td>
                <td>Yes, no TCP HOL blocking</td>
              </tr>
              <tr>
                <td>Framing</td>
                <td>Text</td>
                <td>Binary</td>
                <td>Binary</td>
              </tr>
              <tr>
                <td>Header compression</td>
                <td>—</td>
                <td>HPACK</td>
                <td>QPACK</td>
              </tr>
              <tr>
                <td>Main idea</td>
                <td>Persistent connections</td>
                <td>Multiplexing</td>
                <td>QUIC-based transport</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 id="cheatsheet-symmetric-vs-asymmetric-encryption">Symmetric vs asymmetric encryption</h3>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Symmetric</th>
                <th>Asymmetric</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>One shared secret key</td>
                <td>Public + private key pair</td>
              </tr>
              <tr>
                <td>Fast: bulk data</td>
                <td>Slow: authentication and key exchange</td>
              </tr>
              <tr>
                <td>AES, ChaCha20</td>
                <td>RSA, ECC (ECDHE, ECDSA)</td>
              </tr>
              <tr>
                <td>Problem: key distribution</td>
                <td>Problem: speed</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 id="cheatsheet-dns-vs-dhcp">DNS vs DHCP</h3>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>DNS</th>
                <th>DHCP</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Resolves names: domain → IP</td>
                <td>Configures hosts: IP, mask, gateway, DNS</td>
              </tr>
              <tr>
                <td>Port 53, UDP (TCP too)</td>
                <td>UDP 67/68</td>
              </tr>
              <tr>
                <td>"What IP belongs to this domain?"</td>
                <td>"What network configuration should I use?"</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 id="cheatsheet-tunneling-vs-vpn">Tunneling vs VPN</h3>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Tunneling</th>
                <th>VPN</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Technique: packet inside a packet</td>
                <td>Service: tunneling + authentication + encryption</td>
              </tr>
              <tr>
                <td>GRE, 6in4 (no encryption)</td>
                <td>IPsec, OpenVPN, WireGuard</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 id="cheatsheet-ipv4-vs-ipv6">IPv4 vs IPv6</h3>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>IPv4</th>
                <th>IPv6</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>32-bit, dotted decimal</td>
                <td>128-bit, hex with colons</td>
              </tr>
              <tr>
                <td>Header 20–60 B, with checksum</td>
                <td>40 B fixed, no checksum</td>
              </tr>
              <tr>
                <td>Routers and hosts fragment</td>
                <td>Only the source fragments</td>
              </tr>
              <tr>
                <td>Broadcast, ARP, NAT common</td>
                <td>No broadcast; NDP; no NAT needed</td>
              </tr>
              <tr>
                <td>DHCP or manual</td>
                <td>SLAAC or DHCPv6</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 id="cheatsheet-more-pairs">More pairs <span className="add">+ Added</span></h3>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Pair</th>
                <th>One-line difference</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>OSI vs TCP/IP</td>
                <td>7-layer reference model vs 4-layer model the Internet runs on</td>
              </tr>
              <tr>
                <td>IP vs MAC</td>
                <td>Logical, routing between networks, end-to-end vs physical, local link, changes every hop</td>
              </tr>
              <tr>
                <td>Circuit vs packet switching</td>
                <td>Reserved path, fixed bandwidth vs shared links, store-and-forward</td>
              </tr>
              <tr>
                <td>Collision vs broadcast domain</td>
                <td>Switch splits collision domains; router/VLAN splits broadcast domains</td>
              </tr>
              <tr>
                <td>ARP request vs reply</td>
                <td>Broadcast vs unicast</td>
              </tr>
              <tr>
                <td>Static vs dynamic routing</td>
                <td>Admin-configured vs routers exchange info (RIP/OSPF/BGP)</td>
              </tr>
              <tr>
                <td>Routing vs forwarding</td>
                <td>Decide the path (control plane) vs push each packet out an interface (data plane)</td>
              </tr>
              <tr>
                <td>Go-Back-N vs Selective Repeat</td>
                <td>Resend k and everything after vs resend only k</td>
              </tr>
              <tr>
                <td>Recursive vs iterative DNS</td>
                <td>"Give me the final answer" vs "ask that server next"</td>
              </tr>
              <tr>
                <td>HTTP vs HTTPS</td>
                <td>Port 80, plain vs port 443, TLS (encryption + server authentication)</td>
              </tr>
              <tr>
                <td>POP3 vs IMAP</td>
                <td>Download and delete vs keep on server and sync</td>
              </tr>
              <tr>
                <td>Encryption vs hashing</td>
                <td>Reversible with a key vs one-way digest</td>
              </tr>
              <tr>
                <td>Forward vs reverse proxy</td>
                <td>Acts for clients vs acts for servers</td>
              </tr>
              <tr>
                <td>L4 vs L7 load balancer</td>
                <td>IP/port only vs reads HTTP (path, host, cookies)</td>
              </tr>
              <tr>
                <td>IDS vs IPS</td>
                <td>Detects and alerts vs sits inline and blocks</td>
              </tr>
              <tr>
                <td>Stateless vs stateful firewall</td>
                <td>Each packet alone vs tracks connections</td>
              </tr>
              <tr>
                <td>Remote-access vs site-to-site VPN</td>
                <td>One user to a network vs network to network</td>
              </tr>
              <tr>
                <td>Bandwidth vs throughput vs latency</td>
                <td>Capacity vs achieved rate vs delay</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 id="cs-map"><span className="num">20.4</span>Protocol → layer map <span className="add">+ Added</span></h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Layer</th>
                <th>Protocols / technologies</th>
                <th>PDU</th>
                <th>Device</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>7 Application</td>
                <td>HTTP, HTTPS, DNS, DHCP, FTP, SMTP, POP3, IMAP, SSH, Telnet, SNMP, NTP, BGP (runs on TCP)</td>
                <td>Message / data</td>
                <td>Gateway, L7 firewall, proxy</td>
              </tr>
              <tr>
                <td>6 Presentation</td>
                <td>TLS/SSL (encryption), JPEG, ASCII/UTF-8, compression</td>
                <td>Data</td>
                <td></td>
              </tr>
              <tr>
                <td>5 Session</td>
                <td>RPC, NetBIOS, session setup/checkpoints</td>
                <td>Data</td>
                <td></td>
              </tr>
              <tr>
                <td>4 Transport</td>
                <td>TCP, UDP, QUIC (over UDP)</td>
                <td>Segment / datagram</td>
                <td>L4 load balancer</td>
              </tr>
              <tr>
                <td>3 Network</td>
                <td>IPv4, IPv6, ICMP, IPsec, OSPF, RIP (on UDP), NAT</td>
                <td>Packet</td>
                <td>Router, L3 switch</td>
              </tr>
              <tr>
                <td>2.5</td>
                <td>ARP, MPLS</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>2 Data Link</td>
                <td>Ethernet, Wi-Fi MAC (802.11), PPP, VLAN 802.1Q, STP</td>
                <td>Frame</td>
                <td>Switch, bridge, AP</td>
              </tr>
              <tr>
                <td>1 Physical</td>
                <td>Cables, fibre, radio, encoding (Manchester), Wi-Fi PHY</td>
                <td>Bits</td>
                <td>Hub, repeater, modem</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 id="cs-tools"><span className="num">20.5</span>Command-line toolkit <span className="add">+ Added</span></h2>
        <p>Interviewers like "how would you debug a slow / unreachable website?" Walk up the layers with these:</p>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Command</th>
                <th>What it tells you</th>
                <th>Layer</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="n">ipconfig /all · ip addr · ifconfig</td>
                <td>Your IP, mask, gateway, DNS servers, MAC</td>
                <td>2–3</td>
              </tr>
              <tr>
                <td className="n">ping 8.8.8.8</td>
                <td>Reachability and RTT (ICMP echo). Ping the gateway first, then an Internet IP, then a name</td>
                <td>3</td>
              </tr>
              <tr>
                <td className="n">traceroute / tracert</td>
                <td>Every router on the path (TTL trick); where the delay or loss starts</td>
                <td>3</td>
              </tr>
              <tr>
                <td className="n">arp -a · ip neigh</td>
                <td>ARP cache: IP → MAC mappings on your LAN</td>
                <td>2.5</td>
              </tr>
              <tr>
                <td className="n">nslookup / dig google.com</td>
                <td>DNS answer, TTL, which server replied (dig +trace walks root → TLD → authoritative)</td>
                <td>7</td>
              </tr>
              <tr>
                <td className="n">netstat -an · ss -tulpn</td>
                <td>Open sockets and their states (LISTEN, ESTABLISHED, TIME_WAIT…)</td>
                <td>4</td>
              </tr>
              <tr>
                <td className="n">route print · ip route</td>
                <td>Routing table, default route</td>
                <td>3</td>
              </tr>
              <tr>
                <td className="n">curl -v https://site</td>
                <td>Full HTTP exchange: TLS handshake, headers, status code</td>
                <td>7</td>
              </tr>
              <tr>
                <td className="n">nc -vz host 443 · telnet host 443</td>
                <td>Is a TCP port open?</td>
                <td>4</td>
              </tr>
              <tr>
                <td className="n">tcpdump · Wireshark</td>
                <td>Capture and inspect actual packets</td>
                <td>all</td>
              </tr>
              <tr>
                <td className="n">nmap</td>
                <td>Scan which hosts and ports are up (only on networks you're allowed to)</td>
                <td>3–4</td>
              </tr>
              <tr>
                <td className="n">whois · mtr</td>
                <td>Domain/IP ownership · continuous traceroute + ping</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="co qa">
          <span className="lb">"Website not loading": a layered checklist</span>
          <ol>
            <li><strong>Physical/link</strong>: cable / Wi-Fi connected? Got an IP (not 169.254.x.x)?</li>
            <li><strong>Network</strong>: ping the gateway, then 8.8.8.8. Fails → local network or ISP.</li>
            <li><strong>DNS</strong>: ping 8.8.8.8 works but the name fails → DNS problem (nslookup).</li>
            <li><strong>Transport</strong>: port 443 reachable (nc / curl)? Firewall?</li>
            <li><strong>Application</strong>: curl -v: TLS errors? HTTP 4xx / 5xx?</li>
          </ol>
        </div>
      </section>
      <section>
        <h2 id="cs-qa"><span className="num">20.6</span>{"Interview Q&A bank"}</h2>
        <p>Tap a question to reveal the answer. Say the answer out loud before opening it.</p>
        <h3 id="cheatsheet-foundations-models">{"Foundations & models"}</h3>
        <details className="qa">
          <summary>What is the difference between the OSI and TCP/IP models?</summary>
          <div>OSI is a 7-layer reference model (Application, Presentation, Session, Transport, Network, Data Link, Physical). TCP/IP is the 4-layer model the Internet actually uses (Application, Transport, Internet, Network Access): it merges the top three OSI layers into Application and the bottom two into Network Access.</div>
        </details>
        <details className="qa">
          <summary>What is encapsulation?</summary>
          <div>Each layer adds its own header going down: Data → TCP segment → IP packet → Ethernet frame (+FCS) → bits. The receiver strips them going up (decapsulation). Logically each layer talks to its peer layer; physically data goes down, across and up.</div>
        </details>
        <details className="qa">
          <summary>Which layer does each device work at?</summary>
          <div>Hub and repeater: Layer 1 (bits). Switch and bridge: Layer 2 (MAC). Router: Layer 3 (IP). L4/L7 load balancers and firewalls work higher up.</div>
        </details>
        <details className="qa">
          <summary>Transmission delay vs propagation delay?</summary>
          <div>Transmission delay = L/R: time to push all bits onto the link; depends on packet size and bandwidth. Propagation delay = d/v: time for a bit to travel the distance; depends on distance and medium, not size.</div>
        </details>
        <details className="qa">
          <summary>Circuit switching vs packet switching?</summary>
          <div>Circuit switching reserves a dedicated path and fixed bandwidth before sending (old telephone network). Packet switching splits data into packets forwarded independently over shared links (store-and-forward), giving better utilisation but variable delay (the Internet).</div>
        </details>
        <h3 id="cheatsheet-data-link-medium-access">{"Data link & medium access"}</h3>
        <details className="qa">
          <summary>How does a switch learn MAC addresses?</summary>
          <div>It learns from the SOURCE MAC of each incoming frame (MAC → arrival port) and forwards based on the DESTINATION MAC. Unknown or broadcast destinations are flooded out every port except the one the frame came in on.</div>
        </details>
        <details className="qa">
          <summary>Collision domain vs broadcast domain?</summary>
          <div>A collision domain is where frames can collide; a switch gives each port its own. A broadcast domain is everyone who receives a Layer-2 broadcast; only routers (or VLANs) split it.</div>
        </details>
        <details className="qa">
          <summary>What is a VLAN and why use it?</summary>
          <div>A Virtual LAN splits one physical switch into separate Layer-2 networks (each its own broadcast domain) using 802.1Q tags. Used for isolation (HR vs guests), smaller broadcast domains and flexible grouping; inter-VLAN traffic needs a router or L3 switch.</div>
        </details>
        <details className="qa">
          <summary>Why is STP needed?</summary>
          <div>Redundant switch links form loops; Ethernet frames have no TTL, so broadcasts circulate forever (broadcast storm). STP elects a root bridge and blocks redundant ports so the active topology is a loop-free tree.</div>
        </details>
        <details className="qa">
          <summary>Why does Ethernet have a minimum frame size of 64 bytes?</summary>
          <div>So that a sender is still transmitting when news of a collision returns: Tt ≥ 2·Tp. At 10 Mbps with a 51.2 µs slot that is 512 bits = 64 bytes; short payloads are padded.</div>
        </details>
        <details className="qa">
          <summary>Explain binary exponential backoff.</summary>
          <div>After the n-th collision a station waits K slot times, with K chosen randomly from 0 to 2^min(n,10) − 1. The range doubles each time, which makes repeat collisions less likely. It gives up after 16 attempts.</div>
        </details>
        <details className="qa">
          <summary>Why does Wi-Fi use CSMA/CA instead of CSMA/CD?</summary>
          <div>A wireless radio can't detect a collision while transmitting (its own signal drowns everything, and the collision happens at the receiver, which it may not hear). So Wi-Fi avoids collisions with random backoff, uses ACKs to detect failure, and optionally RTS/CTS.</div>
        </details>
        <details className="qa">
          <summary>What is the hidden terminal problem and how is it solved?</summary>
          <div>A and C can both reach B but can't hear each other, so both sense "free" and collide at B. RTS/CTS fixes it: B's CTS is heard by C, which stays silent for the announced duration.</div>
        </details>
        <details className="qa">
          <summary>CRC vs checksum vs Hamming code?</summary>
          <div>Checksum: 1's-complement sum, cheap, used by IP/TCP/UDP, detection only. CRC: polynomial XOR division, strong detection including burst errors, used by Ethernet FCS. Hamming: places parity bits at powers of 2 and can correct a single-bit error using the syndrome.</div>
        </details>
        <h3 id="cheatsheet-network-layer">Network layer</h3>
        <details className="qa">
          <summary>What does ARP do? Is the request broadcast or unicast?</summary>
          <div>ARP maps an IPv4 address to a MAC on the local link. The request ("Who has 192.168.1.20?") is broadcast; the reply is unicast. Results go in the ARP cache. IPv6 uses NDP instead.</div>
        </details>
        <details className="qa">
          <summary>Your PC sends a packet to a server on another network. Whose MAC does it put in the frame?</summary>
          <div>The default gateway's (router's) MAC, found with ARP. The destination IP is still the server's.</div>
        </details>
        <details className="qa">
          <summary>Which addresses change as a packet crosses routers?</summary>
          <div>The MAC addresses change at every hop (new frame per link). Source and destination IP stay the same end-to-end, except where NAT rewrites them. TTL decreases by 1 per router.</div>
        </details>
        <details className="qa">
          <summary>What is NAT and why is it used?</summary>
          <div>Network Address Translation rewrites private source addresses (and ports, in PAT) to a public IP at the router and keeps a translation table so replies come back. It lets many devices share one public IPv4 address, conserving addresses; side-effect: breaks end-to-end connectivity (needs port forwarding).</div>
        </details>
        <details className="qa">
          <summary>What is longest prefix match?</summary>
          <div>When several routing-table entries match a destination, the router uses the most specific (longest prefix): /24 beats /16 beats /8, and 0.0.0.0/0 (default route) matches only if nothing else does.</div>
        </details>
        <details className="qa">
          <summary>What is TTL and why does it exist?</summary>
          <div>An 8-bit IP header field decremented by every router; at 0 the packet is dropped and an ICMP Time Exceeded is sent. It stops packets looping forever. (DNS TTL is something else: a cache lifetime in seconds.)</div>
        </details>
        <details className="qa">
          <summary>How does traceroute work?</summary>
          <div>It sends probes with TTL = 1, 2, 3…; each router where TTL hits 0 replies with ICMP Time Exceeded, revealing itself. The destination finally replies (ICMP echo reply or port unreachable).</div>
        </details>
        <details className="qa">
          <summary>How many usable hosts in a /26? Which subnet is 192.168.10.77/26 in?</summary>
          <div>2^6 − 2 = 62 hosts. Block size 64, so 77 is in 192.168.10.64/26: broadcast .127, usable .65–.126.</div>
        </details>
        <details className="qa">
          <summary>Why was IPv6 introduced and what else changed?</summary>
          <div>IPv4's 32-bit space ran out. IPv6 has 128-bit addresses, a fixed 40-byte header without checksum, no broadcast, no router fragmentation, NDP instead of ARP, SLAAC autoconfiguration, and no need for NAT.</div>
        </details>
        <details className="qa">
          <summary>How does IP fragmentation work?</summary>
          <div>A router splits a packet larger than the next link's MTU; all fragments share the Identification field, MF = 1 on all but the last, and the offset is in 8-byte units. Only the destination reassembles. If DF is set the router drops it and sends ICMP "fragmentation needed" (Path MTU Discovery).</div>
        </details>
        <details className="qa">
          <summary>Distance vector vs link state? Why does OSPF converge faster than RIP?</summary>
          <div>DV routers share distance tables with neighbours (Bellman-Ford, RIP); LS routers flood link-state adverts so everyone has the full map and runs Dijkstra (OSPF). OSPF reacts to changes immediately with a full view, while DV spreads information hop by hop on timers and can count to infinity.</div>
        </details>
        <details className="qa">
          <summary>What is the count-to-infinity problem?</summary>
          <div>In distance vector routing, after a link fails, routers keep believing each other's stale routes and increase the metric step by step (2, 3, 4…) until reaching "infinity" (16 in RIP). Fixes: split horizon, poison reverse, triggered updates, hold-down timers.</div>
        </details>
        <details className="qa">
          <summary>What is BGP and why is it "policy-based"?</summary>
          <div>BGP is the path-vector protocol that routes between autonomous systems (over TCP 179). Routes are chosen by business policy and attributes (AS_PATH, LOCAL_PREF, MED), not just shortest path; AS_PATH also prevents loops.</div>
        </details>
        <h3 id="cheatsheet-transport-layer">Transport layer</h3>
        <details className="qa">
          <summary>TCP vs UDP: when would you choose UDP?</summary>
          <div>When low latency matters more than perfect delivery or the app handles reliability itself: DNS queries, DHCP, VoIP, video calls, online games, live streaming, and QUIC/HTTP/3.</div>
        </details>
        <details className="qa">
          <summary>What uniquely identifies a TCP connection?</summary>
          <div>The 4-tuple: source IP, source port, destination IP, destination port (plus protocol: 5-tuple). That's how one server port 443 serves thousands of clients.</div>
        </details>
        <details className="qa">
          <summary>Explain the TCP 3-way handshake. Why not 2-way?</summary>
          <div>SYN (Seq = x) → SYN-ACK (Seq = y, Ack = x+1) → ACK (Ack = y+1). Both sides must exchange and confirm their initial sequence numbers and prove both directions work; with only two messages the server never learns the client received its SYN-ACK, and old duplicate SYNs could open ghost connections.</div>
        </details>
        <details className="qa">
          <summary>Client sends SYN with Seq = 100. What ACK number does the server send?</summary>
          <div>101, because the SYN consumes one sequence number (FIN does too).</div>
        </details>
        <details className="qa">
          <summary>What is a SYN flood and how do SYN cookies help?</summary>
          <div>An attacker sends many SYNs and never completes the handshake, filling the server's half-open connection queue. SYN cookies encode the connection state in the server's ISN, so the server keeps no memory until a valid ACK arrives.</div>
        </details>
        <details className="qa">
          <summary>Flow control vs congestion control?</summary>
          <div>Flow control protects the receiver using rwnd (advertised by the receiver). Congestion control protects the network using cwnd (computed by the sender). The sender may have min(rwnd, cwnd) bytes in flight.</div>
        </details>
        <details className="qa">
          <summary>How does TCP detect packet loss?</summary>
          <div>Two ways: a retransmission timeout (RTO expires with no ACK) and three duplicate ACKs (triggers fast retransmit). RTO = EstimatedRTT + 4·DevRTT.</div>
        </details>
        <details className="qa">
          <summary>Go-Back-N vs Selective Repeat? Which does TCP use?</summary>
          <div>GBN resends the lost packet and everything after it; SR resends only the lost one and buffers out-of-order packets. TCP is a hybrid: cumulative ACKs like GBN, but receivers buffer out-of-order data and SACK lets it resend only the gaps.</div>
        </details>
        <details className="qa">
          <summary>Explain slow start and congestion avoidance.</summary>
          <div>Slow start doubles cwnd every RTT (exponential) from a small start until it reaches ssthresh; then congestion avoidance adds about 1 MSS per RTT (linear). On loss, ssthresh = cwnd/2.</div>
        </details>
        <details className="qa">
          <summary>Tahoe vs Reno on 3 duplicate ACKs?</summary>
          <div>Tahoe sets cwnd = 1 MSS and restarts slow start. Reno halves cwnd (cwnd ≈ ssthresh) and enters fast recovery. Both go to cwnd = 1 on a timeout.</div>
        </details>
        <details className="qa">
          <summary>Why 4-way termination and not 3?</summary>
          <div>TCP is full-duplex; each direction closes independently. The server ACKs the client's FIN immediately but may keep sending data (half-close), and sends its own FIN later. If it has nothing left, the ACK and FIN can be combined.</div>
        </details>
        <details className="qa">
          <summary>What is TIME_WAIT and why 2MSL?</summary>
          <div>The active closer waits 2 × Maximum Segment Lifetime after its final ACK so that (1) delayed old segments die before the same 4-tuple is reused and (2) it can re-send the final ACK if the peer's FIN is retransmitted.</div>
        </details>
        <details className="qa">
          <summary>FIN vs RST?</summary>
          <div>FIN is a graceful close after all data is delivered. RST aborts immediately (closed port, error, application abort), discarding buffered data, with no TIME_WAIT.</div>
        </details>
        <h3 id="cheatsheet-application-layer-security">{"Application layer & security"}</h3>
        <details className="qa">
          <summary>How does DNS resolution work?</summary>
          <div>Browser cache → OS cache → recursive resolver. If the resolver has no cached answer it queries iteratively: root (→ .com TLD server) → TLD (→ authoritative server) → authoritative (→ A record). The resolver caches the answer for its TTL and returns it.</div>
        </details>
        <details className="qa">
          <summary>Does DNS use TCP or UDP?</summary>
          <div>Both, port 53. UDP for normal queries; TCP for zone transfers and responses too large for UDP. (DoT uses 853, DoH uses 443.)</div>
        </details>
        <details className="qa">
          <summary>Explain DHCP DORA. Why is Discover a broadcast?</summary>
          <div>Discover (broadcast) → Offer → Request (broadcast) → ACK, over UDP 67/68. The client has no IP and doesn't know the server, so it must broadcast; the Request is broadcast so other offering servers know they weren't chosen.</div>
        </details>
        <details className="qa">
          <summary>What does "HTTP is stateless" mean, and how do sites keep you logged in?</summary>
          <div>Each request is independent; the server keeps no memory of earlier ones. State is added with cookies (a session ID pointing to server-side session data) or tokens like JWT sent in each request.</div>
        </details>
        <details className="qa">
          <summary>Which HTTP methods are idempotent?</summary>
          <div>GET, PUT, DELETE, HEAD, OPTIONS (GET, HEAD and OPTIONS are also safe). POST is neither safe nor idempotent; PATCH isn't guaranteed to be idempotent.</div>
        </details>
        <details className="qa">
          <summary>502 vs 503 vs 504?</summary>
          <div>502 Bad Gateway: the proxy got an invalid response from the upstream server. 503 Service Unavailable: the server is overloaded or down for maintenance. 504 Gateway Timeout: the proxy didn't get a response from upstream in time.</div>
        </details>
        <details className="qa">
          <summary>What changed in HTTP/2 and HTTP/3?</summary>
          <div>HTTP/2: binary framing, many streams multiplexed over one TCP connection, HPACK header compression. HTTP/3: runs on QUIC over UDP, so a lost packet only stalls its own stream (no TCP head-of-line blocking), with TLS 1.3 built in and faster setup.</div>
        </details>
        <details className="qa">
          <summary>Does HTTPS encrypt data with the server's public key?</summary>
          <div>No, not the bulk data. Public-key crypto authenticates the server (certificate) and establishes keys (ECDHE); the actual HTTP data is encrypted with fast symmetric session keys (AES-GCM, ChaCha20).</div>
        </details>
        <details className="qa">
          <summary>How does the browser know the certificate is genuine?</summary>
          <div>It checks the chain server cert → intermediate CA → a root CA in its trust store, verifying each signature, the validity dates, that the domain matches (SAN), and revocation status.</div>
        </details>
        <details className="qa">
          <summary>What is forward secrecy?</summary>
          <div>Using ephemeral (EC)DHE keys per session, so stealing the server's long-term private key later doesn't let an attacker decrypt previously recorded sessions. TLS 1.3 always provides it.</div>
        </details>
        <details className="qa">
          <summary>What is a man-in-the-middle attack and how does TLS prevent it?</summary>
          <div>An attacker sits between client and server and impersonates each. TLS prevents it because the attacker can't present a valid, CA-signed certificate for the real domain, so certificate validation fails (HSTS stops downgrade to HTTP).</div>
        </details>
        <details className="qa">
          <summary>Forward proxy vs reverse proxy vs load balancer vs CDN?</summary>
          <div>A forward proxy acts for clients (the server sees the proxy). A reverse proxy acts for servers (clients see one endpoint) and can load balance, terminate TLS and cache. A load balancer spreads requests across servers (L4 or L7). A CDN caches content at edge servers near users.</div>
        </details>
        <details className="qa">
          <summary>Stateless vs stateful firewall?</summary>
          <div>A stateless packet filter judges each packet alone by IP/port/protocol rules. A stateful firewall tracks connections and automatically allows the replies to traffic that was allowed out.</div>
        </details>
        <details className="qa">
          <summary>DoS vs DDoS, and how do you defend?</summary>
          <div>DoS floods a target from one source; DDoS uses many (a botnet), so blocking one IP doesn't help. Defences: rate limiting, SYN cookies, CDN/anycast absorption, scrubbing services, autoscaling.</div>
        </details>
        <h3 id="cheatsheet-wireless-vpn-big-picture">Wireless, VPN, big picture</h3>
        <details className="qa">
          <summary>What is the difference between tunneling and a VPN?</summary>
          <div>Tunneling is the technique of putting a packet inside another packet (GRE, 6in4), with no encryption by itself. A VPN is a service built on tunneling plus authentication and encryption/integrity (IPsec, OpenVPN, WireGuard).</div>
        </details>
        <details className="qa">
          <summary>IPsec transport mode vs tunnel mode?</summary>
          <div>Transport mode protects only the payload and keeps the original IP header (host-to-host). Tunnel mode encrypts the entire original packet and adds a new outer IP header (gateway-to-gateway, site-to-site VPNs).</div>
        </details>
        <details className="qa">
          <summary>2.4 GHz vs 5 GHz Wi-Fi?</summary>
          <div>2.4 GHz: longer range and better wall penetration, but slower and crowded (only 3 non-overlapping channels: 1, 6, 11). 5 GHz (and 6 GHz): faster, many more channels, shorter range.</div>
        </details>
        <details className="qa">
          <summary>WEP vs WPA2 vs WPA3?</summary>
          <div>WEP (RC4) is broken. WPA2 uses AES-CCMP and is still common. WPA3 replaces the pre-shared-key handshake with SAE, which resists offline password guessing and gives forward secrecy.</div>
        </details>
        <details className="qa">
          <summary>What happens when you type https://google.com? (short version)</summary>
          <div>DNS lookup → check if remote → ARP for the gateway MAC → TCP handshake → TLS handshake (certificate check, session keys) → encrypted HTTP GET → encapsulated into segment/packet/frame → switch (MAC) → routers (IP, MAC rewritten, TTL−1) with NAT at home → Google load balancer → server → response back → browser decrypts and renders. Full version: chapter 19.</div>
        </details>
        <details className="qa">
          <summary>How would you debug "the website won't load"?</summary>
          <div>Go up the layers: link up and valid IP (ipconfig) → ping gateway → ping 8.8.8.8 → DNS (nslookup) → port reachable (curl / nc) → TLS and HTTP status (curl -v). The first failing layer is your problem.</div>
        </details>
      </section>
    </>
  );
}

export function Quick() {
  return (
    <>
      <div className="quick-grid">
        <div>
          <h4>Must-know ports</h4>
          <ul>
            <li>HTTP 80 · HTTPS 443 · DNS 53 · SSH 22</li>
            <li>FTP 20/21 · Telnet 23 · SMTP 25/587</li>
            <li>DHCP 67/68 · NTP 123 · SNMP 161</li>
            <li>POP3 110 · IMAP 143 · BGP 179 · RIP 520 · RDP 3389</li>
          </ul>
        </div>
        <div>
          <h4>Protocol numbers</h4>
          <ul>
            <li>ICMP 1 · TCP 6 · UDP 17</li>
            <li>GRE 47 · ESP 50 · AH 51 · OSPF 89</li>
          </ul>
        </div>
        <div>
          <h4>Top formulas</h4>
          <ul>
            <li>Tt = L/R · Tp = d/v · η = 1/(1+2a)</li>
            <li>Hosts = 2^h − 2 · block = 256 − mask</li>
            <li>Effective window = min(rwnd, cwnd)</li>
            <li>RTO = EstRTT + 4·DevRTT</li>
          </ul>
        </div>
        <div>
          <h4>Top one-liners</h4>
          <ul>
            <li>Switch learns SOURCE, forwards on DESTINATION</li>
            <li>ARP request broadcast, reply unicast</li>
            <li>MAC changes per hop, IP stays</li>
            <li>SYN/FIN consume 1 · ACK = next byte</li>
            <li>401 who are you · 403 not allowed</li>
          </ul>
        </div>
      </div>
    </>
  );
}
