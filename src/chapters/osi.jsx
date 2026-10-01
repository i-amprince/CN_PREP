// AUTO-GENERATED from content/10_ch_basics_osi.html by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run `npm run content` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
      <section>
        <h2 id="osi-map"><span className="num">1.1</span>The OSI 7 layers: build the mental map</h2>
        <p>For placements, remember <strong>what problem each layer solves</strong>, not just the names. Click a layer to see its job, its data unit, addresses, devices and protocols.</p>
        <W name="osi" />
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Layer</th>
                <th>Main job</th>
                <th>Examples</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="n">7</td>
                <td>Application</td>
                <td>Network services to applications</td>
                <td>HTTP, DNS, FTP, SMTP</td>
              </tr>
              <tr>
                <td className="n">6</td>
                <td>Presentation</td>
                <td>Data format, encryption, compression</td>
                <td>TLS/SSL, encoding (JPEG, ASCII, UTF-8)</td>
              </tr>
              <tr>
                <td className="n">5</td>
                <td>Session</td>
                <td>Establish / manage / terminate sessions, checkpoints</td>
                <td>Session management, RPC, NetBIOS</td>
              </tr>
              <tr>
                <td className="n">4</td>
                <td>Transport</td>
                <td>Process-to-process delivery</td>
                <td>TCP, UDP</td>
              </tr>
              <tr>
                <td className="n">3</td>
                <td>Network</td>
                <td>Host-to-host delivery + routing</td>
                <td>IP, ICMP</td>
              </tr>
              <tr>
                <td className="n">2</td>
                <td>Data Link</td>
                <td>Node-to-node delivery</td>
                <td>Ethernet, Wi-Fi</td>
              </tr>
              <tr>
                <td className="n">1</td>
                <td>Physical</td>
                <td>Send raw bits</td>
                <td>Cables, radio</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="co added">
          <span className="lb">+ Added · mnemonics</span>
          <p>Top → bottom (7→1): <strong>A</strong>ll <strong>P</strong>eople <strong>S</strong>eem <strong>T</strong>o <strong>N</strong>eed <strong>D</strong>ata <strong>P</strong>rocessing.<br />Bottom → top (1→7): <strong>P</strong>lease <strong>D</strong>o <strong>N</strong>ot <strong>T</strong>hrow <strong>S</strong>ausage <strong>P</strong>izza <strong>A</strong>way.</p>
        </div>
      </section>
      <section>
        <h2 id="osi-tcpip"><span className="num">1.2</span>TCP/IP model and the mapping</h2>
        <p>The TCP/IP model usually has 4 layers: <strong>Application, Transport, Internet, Network Access</strong>. (Some textbooks use a 5-layer hybrid: Application, Transport, Network, Data Link, Physical.)</p>
        <W name="osimap" />
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>OSI</th>
                <th>TCP/IP</th>
                <th className="n">PDU name <span className="add">+ Added</span></th>
                <th>Address used <span className="add">+ Added</span></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Application / Presentation / Session</td>
                <td>Application</td>
                <td>Data / Message</td>
                <td>URL, domain name</td>
              </tr>
              <tr>
                <td>Transport</td>
                <td>Transport</td>
                <td>Segment (TCP) / Datagram (UDP)</td>
                <td>Port number (16-bit)</td>
              </tr>
              <tr>
                <td>Network</td>
                <td>Internet</td>
                <td>Packet</td>
                <td>IP address (32/128-bit)</td>
              </tr>
              <tr>
                <td>Data Link</td>
                <td rowSpan="2">Network Access</td>
                <td>Frame</td>
                <td>MAC address (48-bit)</td>
              </tr>
              <tr>
                <td>Physical</td>
                <td>Bits / Symbols</td>
                <td>none</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="co added">
          <span className="lb">+ Added · OSI vs TCP/IP</span>
          <div className="tbl" style={{ margin: ".3rem 0 0" }}>
            <table>
              <thead>
                <tr>
                  <th>OSI</th>
                  <th>TCP/IP</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>7 layers, reference/theoretical model</td>
                  <td>4 layers, the model the Internet actually runs on</td>
                </tr>
                <tr>
                  <td>Model came first, protocols later</td>
                  <td>Protocols came first, model described them</td>
                </tr>
                <tr>
                  <td>Separate Presentation and Session layers</td>
                  <td>Merged into Application</td>
                </tr>
                <tr>
                  <td>Clear distinction of service, interface, protocol</td>
                  <td>Less strict separation</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section>
        <h2 id="osi-peer"><span className="num">1.3</span>Very important: "Who communicates with whom?"</h2>
        <p>This is a common interview concept. <strong>Logically</strong>, each layer talks to the same layer on the other side (peer-to-peer):</p>
        <pre className="dg">Application <b>↔</b>{" Application\nTransport   "}<b>↔</b>{" Transport\nNetwork     "}<b>↔</b>{" Network\nData Link   "}<b>↔</b>{" Data Link\nPhysical    "}<b>↔</b> Physical</pre>
        <p>But <strong>physically</strong>, data travels <em>down</em> the sender's layers, <em>across</em> the network, and <em>up</em> the receiver's layers. Each layer adds its own header going down (<strong>encapsulation</strong>) and removes it going up (<strong>decapsulation</strong>).</p>
        <W name="encap" />
        <pre className="dg">{"Application Data\n      ↓\n"}<b>TCP Header</b>{" + Data          = Segment\n      ↓\n"}<b>IP Header</b>{" + Segment        = Packet\n      ↓\n"}<b>MAC Header</b>{" + Packet (+FCS) = Frame\n      ↓\nBits"}</pre>
        <p>At the receiver it reverses: Bits → Frame → Packet → Segment → HTTP data. This becomes very important later for TCP, IP, MAC, ARP and switching.</p>
      </section>
      <section>
        <h2 id="osi-devices"><span className="num">1.4</span>Devices by layer</h2>
        <p>This is worth memorising.</p>
        <div className="vs">
          <div><h4>Hub · Layer 1</h4>Simply broadcasts bits to all ports. No intelligence about MAC/IP. One collision domain.</div>
          <div><h4>Switch · Layer 2</h4>Uses a MAC address table (MAC → port). Forwards Ethernet frames based on destination MAC. (Layer-3 switches also exist, but ordinary Ethernet switching is Layer 2.)</div>
          <div><h4>Router · Layer 3</h4>Uses IP addresses and routing tables. Decides "which next hop/network should this packet go to?"</div>
        </div>
        <pre className="dg">{"MAC Address → Port        Network A\nAA:AA       → 1               |\nBB:BB       → 2            "}<b>Router</b>{"\nCC:CC       → 3               |\n                          Network B"}</pre>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Device</th>
                <th>Layer</th>
                <th>Works with</th>
                <th>Splits collision domain?</th>
                <th>Splits broadcast domain?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Repeater <span className="add">+ Added</span></td>
                <td>1</td>
                <td>Signal</td>
                <td>No</td>
                <td>No</td>
              </tr>
              <tr>
                <td>Hub</td>
                <td>1</td>
                <td>Bits</td>
                <td>No</td>
                <td>No</td>
              </tr>
              <tr>
                <td>Bridge <span className="add">+ Added</span></td>
                <td>2</td>
                <td>MAC (2–few ports)</td>
                <td>Yes</td>
                <td>No</td>
              </tr>
              <tr>
                <td>Switch</td>
                <td>2</td>
                <td>MAC</td>
                <td>Yes (per port)</td>
                <td>No (unless VLANs)</td>
              </tr>
              <tr>
                <td>Router</td>
                <td>3</td>
                <td>IP</td>
                <td>Yes</td>
                <td>Yes</td>
              </tr>
              <tr>
                <td>Gateway <span className="add">+ Added</span></td>
                <td>Up to 7</td>
                <td>Protocol conversion</td>
                <td>Yes</td>
                <td>Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="co key">
          <span className="lb">Quick mapping</span>
          <span className="fx">Hub → Physical → Bits</span>
          <span className="fx">Switch → Data Link → MAC</span>
          <span className="fx">Router → Network → IP</span>
        </div>
      </section>
      <section>
        <h2 id="osi-sublayers"><span className="num">1.5</span>MAC: an important correction</h2>
        <p>You mentioned "MAC has 2 layers". Precisely: the <strong>Data Link layer</strong> has two sublayers, and MAC is one of them.</p>
        <ul className="tree">
          <li><span className="t">Data Link Layer</span><ul><li><span className="t">LLC</span> <em>Logical Link Control: multiplexing network protocols; flow/error-related control between LLC entities</em></li><li><span className="t">MAC</span> <em>Media Access Control</em><ul><li>MAC address</li><li>framing-related functions</li><li>Medium access<ul><li>CSMA/CD</li><li>CSMA/CA</li></ul></li></ul></li></ul></li>
        </ul>
      </section>
      <section>
        <h2 id="osi-ipmac"><span className="num">1.6</span>IP address vs MAC address</h2>
        <div className="vs">
          <div>
            <h4>IP address</h4>
            <ul>
              <li>Network layer</li>
              <li>Identifies a device/interface logically</li>
              <li>Used for <strong>routing across networks</strong></li>
              <li>Can change (DHCP, moving networks)</li>
            </ul>
          </div>
          <div>
            <h4>MAC address</h4>
            <ul>
              <li>Data Link layer</li>
              <li>Burned into the NIC (can be spoofed/randomised)</li>
              <li>Used for <strong>delivery within the local link</strong></li>
              <li>48-bit, e.g. AA:BB:CC:DD:EE:FF</li>
            </ul>
          </div>
        </div>
        <p>Example: your laptop has IP = 192.168.1.10 and MAC = AA:BB:CC:DD:EE:FF. When your packet crosses multiple routers (Laptop → Router → Router → Server), the <strong>IP addresses generally stay the same</strong> source/destination (ignoring NAT), while the <strong>MAC addresses change hop by hop</strong>.</p>
        <div className="co key">
          <span className="lb">Very important interview concept</span>
          <p>MAC changes at every hop; IP stays end-to-end (except NAT). See it animated in the Network Layer chapter.</p>
        </div>
      </section>
      <section>
        <h2 id="osi-model"><span className="num">1.7</span>The mental model to use for every problem</h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Ask</th>
                <th>Layer</th>
                <th>Scope</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>What data?</td>
                <td>Application</td>
                <td>Process / data</td>
              </tr>
              <tr>
                <td>Which process?</td>
                <td>Transport</td>
                <td>Process-to-process</td>
              </tr>
              <tr>
                <td>Which host / network?</td>
                <td>Network</td>
                <td>Host-to-host</td>
              </tr>
              <tr>
                <td>Which local device?</td>
                <td>Data Link</td>
                <td>Node-to-node (hop)</td>
              </tr>
              <tr>
                <td>How are bits physically sent?</td>
                <td>Physical</td>
                <td>Bits</td>
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
          <h4>Layers (7→1)</h4>
          <ul>
            <li>All People Seem To Need Data Processing</li>
            <li>App · Pres · Session · Transport · Network · Data Link · Physical</li>
            <li>TCP/IP: App · Transport · Internet · Network Access</li>
          </ul>
        </div>
        <div>
          <h4>Scope</h4>
          <ul>
            <li>Transport → process-to-process</li>
            <li>Network → host-to-host</li>
            <li>Data Link → node-to-node</li>
            <li>Physical → bits</li>
          </ul>
        </div>
        <div>
          <h4>PDUs</h4>
          <ul>
            <li>Data → Segment → Packet → Frame → Bits</li>
            <li>Port → IP → MAC</li>
            <li>Peer layers talk logically; data flows down–across–up</li>
          </ul>
        </div>
        <div>
          <h4>Devices</h4>
          <ul>
            <li>Hub → L1 → bits</li>
            <li>Switch → L2 → MAC</li>
            <li>Router → L3 → IP</li>
            <li>Data Link = LLC + MAC sublayers</li>
          </ul>
        </div>
        <div>
          <h4>IP vs MAC</h4>
          <ul>
            <li>IP → routing between networks, end-to-end</li>
            <li>MAC → local link, changes every hop</li>
          </ul>
        </div>
      </div>
    </>
  );
}
