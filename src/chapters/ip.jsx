// AUTO-GENERATED from content/12_ch_ip_subnet_routing.html by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run `npm run content` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
      <p>Now we move from local delivery (MAC) to delivery <strong>between different networks</strong> (IP).</p>
      <section>
        <h2 id="ip-job"><span className="num">5.1</span>What does the Network layer do?</h2>
        <ul>
          <li>Logical addressing → IP addresses</li>
          <li>Routing (choosing the path)</li>
          <li>Packet forwarding</li>
          <li>Internetwork communication (and fragmentation when needed)</li>
        </ul>
        <pre className="dg">{"Data Link → \"Which device on this local network?\"\nNetwork   → \"Which network should this packet go to?\"\n\nLaptop → Home Router → ISP Router → Google Server"}</pre>
      </section>
      <section>
        <h2 id="ip-addr"><span className="num">5.2</span>IP address: IPv4 and IPv6</h2>
        <div className="vs">
          <div>
            <h4>IPv4</h4>
            <code>192.168.1.10</code>
            <ul>
              <li>32 bits = 4 octets of 8 bits</li>
              <li>Each octet 0–255</li>
              <li>~4.3 billion addresses (2³²)</li>
            </ul>
          </div>
          <div>
            <h4>IPv6</h4>
            <code>2001:0db8:85a3::8a2e:0370:7334</code>
            <ul>
              <li>128 bits, 8 groups of 16-bit hex</li>
              <li>Main reason: IPv4 address space ran out</li>
              <li>Details in the Subnetting chapter</li>
            </ul>
          </div>
        </div>
        <h3 id="ip-network-part-vs-host-part">Network part vs host part</h3>
        <p><code>192.168.1.10/24</code>: <code>/24</code> means the first 24 bits are the <strong>network</strong>, the last 8 bits are the <strong>host</strong>. So network = 192.168.1.0, host = 10.</p>
        <div className="tbl">
          <table>
            <tbody>
              <tr>
                <td>Network address</td>
                <td className="n">192.168.1.0</td>
                <td>host bits all 0, not assignable</td>
              </tr>
              <tr>
                <td>First usable</td>
                <td className="n">192.168.1.1</td>
                <td>often the gateway</td>
              </tr>
              <tr>
                <td>Last usable</td>
                <td className="n">192.168.1.254</td>
                <td></td>
              </tr>
              <tr>
                <td>Broadcast</td>
                <td className="n">192.168.1.255</td>
                <td>host bits all 1, not assignable</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>This leads to subnetting, covered fully in the next chapter (with a calculator).</p>
      </section>
      <section>
        <h2 id="ip-private"><span className="num">5.3</span>Private vs public IP</h2>
        <div className="vs">
          <div><h4>Private (RFC 1918)</h4>Used inside local networks, not routed on the Internet.<ul><li><code>10.0.0.0/8</code></li><li><code>172.16.0.0/12</code> (172.16–172.31)</li><li><code>192.168.0.0/16</code></li></ul></div>
          <div><h4>Public</h4>Globally unique, used on the public Internet. Your home devices don't each need one because of NAT.</div>
        </div>
        <p><span className="add">+ Added</span> Other special ranges: <code>127.0.0.0/8</code> loopback (127.0.0.1 = localhost), <code>169.254.0.0/16</code> link-local / APIPA (self-assigned when DHCP fails), <code>0.0.0.0</code> "this host / any", <code>255.255.255.255</code> limited broadcast, <code>100.64.0.0/10</code> carrier-grade NAT.</p>
      </section>
      <section>
        <h2 id="ip-nat"><span className="num">5.4</span>NAT: Network Address Translation</h2>
        <p>Your laptop (192.168.1.10) sends with source 192.168.1.10. The router rewrites the source to its own public address and remembers the mapping in a <strong>translation table</strong> so replies find their way back.</p>
        <W name="nat" />
        <p><strong>Why NAT?</strong> It lets many private IPs share one public IP and helps <strong>conserve IPv4 addresses</strong>.</p>
        <div className="co added">
          <span className="lb">+ Added · NAT types and side-effects</span>
          <ul>
            <li><strong>Static NAT</strong>: one private ↔ one public (fixed). For servers.</li>
            <li><strong>Dynamic NAT</strong>: private → any free public address from a pool.</li>
            <li><strong>PAT / NAPT / "NAT overload"</strong>: many private → one public, distinguished by <strong>port</strong>. This is what home routers do.</li>
            <li>Side-effects: breaks true end-to-end connectivity; inbound connections need <strong>port forwarding</strong>; complicates peer-to-peer (needs STUN/TURN); NAT is <em>not</em> a security feature, though it hides internal addresses. NAT is technically a Layer-3/4 hack (it rewrites ports too).</li>
          </ul>
        </div>
      </section>
      <section>
        <h2 id="ip-arp"><span className="num">5.5</span>ARP: Address Resolution Protocol (very important)</h2>
        <p>Purpose: find the <strong>MAC address</strong> for an <strong>IPv4 address</strong> on the local network. A (192.168.1.10, AA-AA) wants to talk to B (192.168.1.20, BB-BB). A knows B's IP, but Ethernet needs B's MAC.</p>
        <W name="seq-arp" />
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Message</th>
                <th>Sent as</th>
                <th>Why</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ARP Request "Who has 192.168.1.20?"</td>
                <td><strong>Broadcast</strong> (FF:FF:FF:FF:FF:FF)</td>
                <td>A doesn't know B's MAC</td>
              </tr>
              <tr>
                <td>ARP Reply "192.168.1.20 is BB-BB"</td>
                <td><strong>Unicast</strong></td>
                <td>B now knows exactly who asked</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>A stores <code>192.168.1.20 → BB-BB</code> in its <strong>ARP cache</strong> (entries expire after a while). B also caches A's mapping from the request.</p>
        <div className="co added">
          <span className="lb">+ Added · ARP extras</span>
          <ul>
            <li>ARP sits between L2 and L3 (often called "Layer 2.5"); Ethernet type 0x0806.</li>
            <li><strong>Gratuitous ARP</strong>: a host announces its own IP→MAC (after boot / IP change), also used to detect duplicate IPs.</li>
            <li><strong>ARP spoofing / poisoning</strong>: attacker sends fake replies ("I am the gateway") to become a man-in-the-middle. ARP has no authentication. Defence: Dynamic ARP Inspection, static entries.</li>
            <li><strong>RARP</strong> (MAC → IP, obsolete, replaced by BOOTP/DHCP). <strong>Proxy ARP</strong>: a router answers on behalf of another network.</li>
            <li>IPv6 has no ARP; it uses <strong>NDP</strong> (Neighbor Discovery, ICMPv6).</li>
          </ul>
        </div>
      </section>
      <section>
        <h2 id="ip-gateway"><span className="num">5.6</span>What if the destination is outside my network?</h2>
        <p>This is VERY important. Laptop 192.168.1.10/24 wants Google at 142.x.x.x. The laptop ANDs both IPs with its mask, sees Google is <strong>not in its subnet</strong>, so it <strong>does not ARP for Google's MAC</strong>. It ARPs for the <strong>default gateway</strong> (192.168.1.1) and sends the frame to the router's MAC.</p>
        <div className="co key">
          <span className="lb">Key concept</span>
          <p>For an external destination, your host sends the frame to the <strong>router's MAC</strong>, not the remote server's MAC. The <strong>IP destination</strong> is still the server.</p>
        </div>
      </section>
      <section>
        <h2 id="ip-hops"><span className="num">5.7</span>MAC changes, IP usually doesn't</h2>
        <p>Step through a packet going Laptop → Router 1 → Router 2 → Server. Watch which header fields change on each link. Turn NAT on to see the one exception.</p>
        <W name="hops" />
        <p>This is one of the best ways to distinguish Layer 2 and Layer 3: <strong>MAC addresses are rewritten at every hop; source and destination IP normally stay the same; TTL drops by 1 at each router.</strong></p>
      </section>
      <section>
        <h2 id="ip-routing"><span className="num">5.8</span>Routing table, default route and longest prefix match</h2>
        <p>A router receives an IP packet, looks at the <strong>destination IP</strong>, and checks its routing table:</p>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Destination</th>
                <th>Next hop</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="n">192.168.1.0/24</td>
                <td>Direct (connected)</td>
              </tr>
              <tr>
                <td className="n">10.0.0.0/8</td>
                <td>Router A</td>
              </tr>
              <tr>
                <td className="n">172.16.0.0/16</td>
                <td>Router B</td>
              </tr>
              <tr>
                <td className="n">0.0.0.0/0</td>
                <td>Router C (default)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p><strong>Default route</strong> <code>0.0.0.0/0</code> means "if nothing more specific matches, send it here" (usually toward the ISP). It matches everything because it has zero network bits.</p>
        <p><strong>Longest Prefix Match</strong>: if several entries match, the <strong>most specific</strong>{" (longest prefix) wins: /24 > /16 > /8 > /0. Test it:"}</p>
        <W name="lpm" />
      </section>
      <section>
        <h2 id="ip-ttl"><span className="num">5.9</span>TTL: Time To Live</h2>
        <p>Every IPv4 packet has an 8-bit TTL field (IPv6 calls it <strong>Hop Limit</strong>). At each router: <code>TTL = TTL − 1</code>. If it reaches 0, the packet is discarded and the router sends an ICMP "Time Exceeded" back. Purpose: stop packets circulating forever in routing loops (A → B → C → A → …). Typical starting values: 64 (Linux/macOS), 128 (Windows), 255.</p>
        <div className="co trap">
          <span className="lb">Trap</span>
          <p>IP TTL counts <strong>hops</strong>. DNS TTL is a <strong>cache lifetime in seconds</strong>. Same name, different things.</p>
        </div>
      </section>
      <section>
        <h2 id="ip-icmp"><span className="num">5.10</span>ICMP</h2>
        <p>Internet Control Message Protocol: network diagnostic and error messages. It is carried <strong>inside IP</strong> (protocol number 1), so it is considered a Network-layer protocol.</p>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Type <span className="add">+ Added</span></th>
                <th>Message</th>
                <th>Used by</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="n">8</td>
                <td>Echo Request</td>
                <td>ping</td>
              </tr>
              <tr>
                <td className="n">0</td>
                <td>Echo Reply</td>
                <td>ping</td>
              </tr>
              <tr>
                <td className="n">3</td>
                <td>Destination Unreachable (host/port/net; code 4 = fragmentation needed)</td>
                <td>errors, Path MTU Discovery</td>
              </tr>
              <tr>
                <td className="n">11</td>
                <td>Time Exceeded (TTL hit 0)</td>
                <td>traceroute</td>
              </tr>
              <tr>
                <td className="n">5</td>
                <td>Redirect</td>
                <td>better gateway hint</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p><strong>traceroute</strong> uses TTL manipulation: send with TTL = 1 → first router replies "Time Exceeded" (revealing itself); TTL = 2 → second router; and so on until the destination answers. Linux traceroute sends UDP probes, Windows <code>tracert</code> sends ICMP echo.</p>
        <W name="traceroute" />
      </section>
      <section>
        <h2 id="ip-scenario"><span className="num">5.11</span>Interview scenario: PC opens google.com</h2>
        <p>"Your PC wants to access google.com. Google is outside your local network. What happens at Layer 2 and Layer 3?"</p>
        <div className="flow">
          <span>DNS gives Google's IP</span>
          <span>PC checks: destination is outside my subnet</span>
          <span>Find default gateway</span>
          <span>ARP → gateway's MAC</span>
          <span>IP packet: Src IP = PC, Dst IP = Google</span>
          <span>Ethernet frame: Src MAC = PC, Dst MAC = Router</span>
          <span>Router forwards; MAC addresses change at every hop</span>
          <span>IP packet continues toward Google (TTL −1 per router)</span>
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
          <h4>Addressing</h4>
          <ul>
            <li>IPv4 32-bit, IPv6 128-bit</li>
            <li>Private: 10/8, 172.16/12, 192.168/16</li>
            <li>127/8 loopback, 169.254/16 APIPA</li>
          </ul>
        </div>
        <div>
          <h4>ARP</h4>
          <ul>
            <li>IPv4 → MAC on local link</li>
            <li>Request → broadcast; Reply → unicast</li>
            <li>Remote destination → ARP for gateway</li>
            <li>Spoofing → MITM; IPv6 uses NDP</li>
          </ul>
        </div>
        <div>
          <h4>Hops</h4>
          <ul>
            <li>MAC changes every hop</li>
            <li>IP stays end-to-end (except NAT)</li>
            <li>TTL −1 per router, 0 → drop + ICMP</li>
          </ul>
        </div>
        <div>
          <h4>Routing</h4>
          <ul>
            <li>0.0.0.0/0 = default route</li>
            <li>{"Longest prefix wins: /24 > /16 > /8"}</li>
          </ul>
        </div>
        <div>
          <h4>{"NAT & ICMP"}</h4>
          <ul>
            <li>PAT: many private → 1 public by port</li>
            <li>ping → ICMP Echo Request (8)/Reply (0)</li>
            <li>traceroute → TTL + ICMP Time Exceeded (11)</li>
          </ul>
        </div>
      </div>
    </>
  );
}
