// AUTO-GENERATED from content/12_ch_ip_subnet_routing.html by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run `npm run content` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
      <div className="co added">
        <span className="lb">+ Added chapter</span>
        <p>Your notes said subnetting would be "covered separately and properly". Here it is, plus IPv4 classes, the IPv4 header, fragmentation and IPv6.</p>
      </div>
      <section>
        <h2 id="sn-classes"><span className="num">6.1</span>Classful addressing (history, still asked)</h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Class</th>
                <th>First octet</th>
                <th>Leading bits</th>
                <th>Default mask</th>
                <th>Use</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>A</td>
                <td className="n">1–126</td>
                <td className="n">0</td>
                <td className="n">/8 · 255.0.0.0</td>
                <td>Huge networks (16.7M hosts)</td>
              </tr>
              <tr>
                <td>B</td>
                <td className="n">128–191</td>
                <td className="n">10</td>
                <td className="n">/16 · 255.255.0.0</td>
                <td>Medium (65,534 hosts)</td>
              </tr>
              <tr>
                <td>C</td>
                <td className="n">192–223</td>
                <td className="n">110</td>
                <td className="n">/24 · 255.255.255.0</td>
                <td>Small (254 hosts)</td>
              </tr>
              <tr>
                <td>D</td>
                <td className="n">224–239</td>
                <td className="n">1110</td>
                <td>none</td>
                <td>Multicast</td>
              </tr>
              <tr>
                <td>E</td>
                <td className="n">240–255</td>
                <td className="n">1111</td>
                <td>none</td>
                <td>Reserved / experimental</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>127 is reserved for loopback (that's why Class A ends at 126). Classful addressing wasted addresses, so it was replaced by <strong>CIDR</strong> (Classless Inter-Domain Routing) in 1993: any prefix length <code>/n</code> is allowed.</p>
      </section>
      <section>
        <h2 id="sn-basics"><span className="num">6.2</span>Subnet mask and the core formulas</h2>
        <p>A subnet mask has 1s for network bits and 0s for host bits. <code>/26</code> = 26 ones = <code>255.255.255.192</code>. Network address = <strong>IP AND mask</strong>. Broadcast = network OR (inverted mask).</p>
        <div className="co formula">
          <span className="lb">Formulas</span>
          <span className="fx">Host bits h = 32 − prefix</span>
          <span className="fx">Total addresses = 2^h</span>
          <span className="fx">Usable hosts = 2^h − 2  <em>(minus network + broadcast)</em></span>
          <span className="fx">Subnets from borrowing s bits = 2^s</span>
          <span className="fx">Block size ("magic number") = 256 − mask octet</span>
        </div>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Prefix</th>
                <th>Mask</th>
                <th className="n">Block</th>
                <th className="n">Usable hosts</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>/24</td>
                <td className="n">255.255.255.0</td>
                <td className="n">256</td>
                <td className="n">254</td>
              </tr>
              <tr>
                <td>/25</td>
                <td className="n">255.255.255.128</td>
                <td className="n">128</td>
                <td className="n">126</td>
              </tr>
              <tr>
                <td>/26</td>
                <td className="n">255.255.255.192</td>
                <td className="n">64</td>
                <td className="n">62</td>
              </tr>
              <tr>
                <td>/27</td>
                <td className="n">255.255.255.224</td>
                <td className="n">32</td>
                <td className="n">30</td>
              </tr>
              <tr>
                <td>/28</td>
                <td className="n">255.255.255.240</td>
                <td className="n">16</td>
                <td className="n">14</td>
              </tr>
              <tr>
                <td>/29</td>
                <td className="n">255.255.255.248</td>
                <td className="n">8</td>
                <td className="n">6</td>
              </tr>
              <tr>
                <td>/30</td>
                <td className="n">255.255.255.252</td>
                <td className="n">4</td>
                <td className="n">2 (point-to-point links)</td>
              </tr>
              <tr>
                <td>/31</td>
                <td className="n">255.255.255.254</td>
                <td className="n">2</td>
                <td className="n">2 (special case, P2P, RFC 3021)</td>
              </tr>
              <tr>
                <td>/32</td>
                <td className="n">255.255.255.255</td>
                <td className="n">1</td>
                <td className="n">single host route</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 id="sn-calc"><span className="num">6.3</span>Subnet calculator</h2>
        <p>Type any IP/prefix. The binary row shows network bits (coloured) vs host bits.</p>
        <W name="subnetcalc" />
      </section>
      <section>
        <h2 id="sn-method"><span className="num">6.4</span>The fast method (magic number)</h2>
        <p>Question: <em>Which subnet does 192.168.10.77/26 belong to?</em></p>
        <ol>
          <li>/26 → mask octet 192 → block = 256 − 192 = <strong>64</strong>.</li>
          <li>Subnets start at multiples of 64: 0, 64, 128, 192.</li>
          <li>77 falls in 64–127 → network <strong>192.168.10.64</strong>, broadcast <strong>192.168.10.127</strong>.</li>
          <li>Usable: .65 – .126 (62 hosts).</li>
        </ol>
        <p>Question: <em>Split 192.168.1.0/24 into 4 equal subnets.</em> Borrow 2 bits (2² = 4) → /26: .0, .64, .128, .192, each 62 hosts. Use the splitter:</p>
        <W name="subnetsplit" />
        <h3 id="subnet-vlsm-variable-length-subnet-masking">VLSM (Variable Length Subnet Masking)</h3>
        <p>Give each subnet only the size it needs. Allocate <strong>largest first</strong>. Example from 192.168.1.0/24 for needs of 100, 50, 20, 2 hosts: /25 (126) → .0/25, /26 (62) → .128/26, /27 (30) → .192/27, /30 (2) → .224/30.</p>
        <h3 id="subnet-supernetting-route-aggregation">Supernetting / route aggregation</h3>
        <p>Combine contiguous networks into one shorter prefix: 192.168.0.0/24 + 192.168.1.0/24 + 192.168.2.0/24 + 192.168.3.0/24 = <strong>192.168.0.0/22</strong>. Smaller routing tables.</p>
      </section>
      <section>
        <h2 id="sn-header"><span className="num">6.5</span>IPv4 header</h2>
        <W name="ipv4hdr" />
        <ul>
          <li>Header is <strong>20 bytes minimum, 60 bytes max</strong> (IHL counts 4-byte words: 5–15).</li>
          <li><strong>Total length</strong> 16-bit → max packet 65,535 bytes.</li>
          <li><strong>Protocol</strong>: 1 = ICMP, 6 = TCP, 17 = UDP, 89 = OSPF.</li>
          <li><strong>Header checksum</strong> covers only the header and is recomputed at every router (because TTL changes).</li>
        </ul>
      </section>
      <section>
        <h2 id="sn-frag"><span className="num">6.6</span>Fragmentation</h2>
        <p>If a packet is bigger than the next link's MTU, an IPv4 router splits it into fragments; only the <strong>destination host</strong> reassembles them.</p>
        <ul>
          <li><strong>Identification</strong>: same for all fragments of one packet.</li>
          <li><strong>MF</strong> (More Fragments) = 1 on all but the last fragment. <strong>DF</strong> (Don't Fragment) = 1 → drop and send ICMP "fragmentation needed" (used by Path MTU Discovery).</li>
          <li><strong>Fragment offset</strong> is in units of <strong>8 bytes</strong>, so each fragment's data (except the last) must be a multiple of 8.</li>
        </ul>
        <W name="frag" />
      </section>
      <section>
        <h2 id="sn-v6"><span className="num">6.7</span>IPv6 essentials</h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>IPv4</th>
                <th>IPv6</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Address size</td>
                <td>32-bit</td>
                <td>128-bit</td>
              </tr>
              <tr>
                <td>Header</td>
                <td>20–60 B, variable</td>
                <td>40 B fixed + extension headers</td>
              </tr>
              <tr>
                <td>Checksum</td>
                <td>Header checksum</td>
                <td>None (L2/L4 already check)</td>
              </tr>
              <tr>
                <td>Fragmentation</td>
                <td>Routers and hosts</td>
                <td>Source host only</td>
              </tr>
              <tr>
                <td>Broadcast</td>
                <td>Yes</td>
                <td>No; multicast + anycast instead</td>
              </tr>
              <tr>
                <td>Address resolution</td>
                <td>ARP</td>
                <td>NDP (ICMPv6)</td>
              </tr>
              <tr>
                <td>Configuration</td>
                <td>Manual / DHCP</td>
                <td>SLAAC or DHCPv6</td>
              </tr>
              <tr>
                <td>TTL</td>
                <td>TTL</td>
                <td>Hop Limit</td>
              </tr>
              <tr>
                <td>NAT</td>
                <td>Common</td>
                <td>Not needed (plenty of addresses)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p><strong>Shortening rules</strong>: drop leading zeros in a group (<code>0db8 → db8</code>); replace <strong>one</strong> run of all-zero groups with <code>::</code> (only once per address). <code>2001:0db8:0000:0000:0000:0000:0000:0001</code> → <code>2001:db8::1</code>. Special: <code>::1</code> loopback, <code>fe80::/10</code> link-local, <code>ff00::/8</code> multicast, <code>2000::/3</code> global unicast.</p>
        <p>Transition: <strong>dual stack</strong> (both), <strong>tunnelling</strong> (6in4), <strong>translation</strong> (NAT64).</p>
      </section>
    </>
  );
}

export function Quick() {
  return (
    <>
      <div className="quick-grid">
        <div>
          <h4>Classes</h4>
          <ul>
            <li>A 1–126 /8 · B 128–191 /16 · C 192–223 /24</li>
            <li>D 224–239 multicast · E 240–255</li>
            <li>CIDR replaced classes</li>
          </ul>
        </div>
        <div>
          <h4>Formulas</h4>
          <ul>
            <li>Hosts = 2^(32−n) − 2</li>
            <li>Block = 256 − mask octet</li>
            <li>Network = IP AND mask</li>
            <li>/30 → 2 hosts (P2P)</li>
          </ul>
        </div>
        <div>
          <h4>IPv4 header</h4>
          <ul>
            <li>20–60 B; protocol 1/6/17</li>
            <li>Checksum recomputed per hop</li>
            <li>Fragment offset ×8 bytes; MF, DF flags</li>
            <li>Reassembly only at destination</li>
          </ul>
        </div>
        <div>
          <h4>IPv6</h4>
          <ul>
            <li>128-bit, 40 B fixed header</li>
            <li>No broadcast, no header checksum, no router fragmentation</li>
            <li>NDP replaces ARP; :: only once</li>
          </ul>
        </div>
      </div>
    </>
  );
}
