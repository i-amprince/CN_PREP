// AUTO-GENERATED from content/11_ch_datalink_access_errors.html by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run `npm run content` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
      <p>This is an important placement topic because MAC, Ethernet, frames, collision domains, and switching all connect here.</p>
      <section>
        <h2 id="dl-job"><span className="num">2.1</span>What does the Data Link layer do?</h2>
        <p>The Data Link layer provides <strong>node-to-node delivery</strong> (one hop). Its main responsibilities:</p>
        <ul>
          <li><strong>Framing</strong>: wrapping the packet with a header and trailer</li>
          <li><strong>MAC addressing</strong></li>
          <li><strong>Error detection</strong> (FCS/CRC)</li>
          <li><strong>Medium access control</strong> (who may transmit on a shared medium)</li>
          <li><strong>Flow control</strong> in some link-layer protocols</li>
        </ul>
        <div className="flow">
          <span>Network Layer → IP packet</span>
          <span>Data Link Layer → Ethernet Frame</span>
          <span>Physical Layer → Bits</span>
        </div>
        <h3 id="datalink-two-sublayers">Two sublayers</h3>
        <ul className="tree">
          <li><span className="t">DATA LINK</span><ul><li><span className="t">LLC</span> <em>(Logical Link Control) interface between Network layer and MAC</em></li><li><span className="t">MAC</span> <em>(Media Access Control) MAC addressing · controlling access to the shared medium · frame-related functions</em></li></ul></li>
        </ul>
        <p>CSMA/CD and CSMA/CA operate at the <strong>MAC sublayer</strong>.</p>
        <h3 id="datalink-framing-methods">Framing methods <span className="add">+ Added</span></h3>
        <p>How does the receiver know where a frame starts and ends? <strong>Character count</strong> (rarely used), <strong>byte stuffing</strong> (flag byte; escape any flag inside the data with an ESC byte), <strong>bit stuffing</strong> (HDLC flag 01111110; after five consecutive 1s in the data, insert a 0), and physical-layer coding violations. Ethernet uses a preamble + Start Frame Delimiter plus inter-frame gaps.</p>
      </section>
      <section>
        <h2 id="dl-mac"><span className="num">2.2</span>MAC address</h2>
        <p>A MAC address identifies a network interface at the Data Link layer. Example: <code>48:2A:E3:91:AB:10</code>. It is <strong>48 bits = 6 bytes</strong>, written as 12 hex digits.</p>
        <W name="macaddr" />
        <ul>
          <li>First 24 bits = <strong>OUI</strong> (Organisationally Unique Identifier, the vendor) <span className="add">+ Added</span></li>
          <li>Last 24 bits = NIC-specific part assigned by the vendor</li>
          <li>Least-significant bit of the first byte: <strong>0 = unicast, 1 = multicast</strong>. Second-least: 0 = globally unique, 1 = locally administered (e.g. phone MAC randomisation)</li>
          <li>Broadcast MAC = <code>FF:FF:FF:FF:FF:FF</code></li>
        </ul>
        <div className="co key">
          <span className="lb">Remember</span>
          <p>IP is used for routing <strong>between networks</strong>. MAC is used for delivery <strong>on the local link</strong>.</p>
        </div>
      </section>
      <section>
        <h2 id="dl-frame"><span className="num">2.3</span>Ethernet frame</h2>
        <W name="ethframe" />
        <p>Important fields: <strong>Destination MAC, Source MAC, Type/Length, Data, FCS</strong>. Destination comes <em>first</em> so a switch can start forwarding as soon as it reads 6 bytes (cut-through switching).</p>
        <p><strong>FCS (Frame Check Sequence)</strong> is used for error detection, using a 32-bit CRC. It detects whether the frame was corrupted in transmission; a bad frame is silently dropped (Ethernet does not retransmit, higher layers like TCP do).</p>
        <div className="co added">
          <span className="lb">+ Added · numbers to remember</span>
          <ul>
            <li>Preamble 7 B + SFD 1 B (not counted in frame size)</li>
            <li>Header 14 B (6 + 6 + 2) + FCS 4 B = 18 B overhead</li>
            <li>Payload 46–1500 B → frame <strong>64–1518 B</strong> (1522 with an 802.1Q VLAN tag)</li>
            <li><strong>MTU = 1500 B</strong>. Payload shorter than 46 B is padded.</li>
            <li>Type values: 0x0800 = IPv4, 0x0806 = ARP, 0x86DD = IPv6, 0x8100 = VLAN tag</li>
          </ul>
        </div>
      </section>
      <section>
        <h2 id="dl-hubswitch"><span className="num">2.4</span>Hub vs switch, and how a switch learns</h2>
        <p>A very common interview question. A <strong>hub</strong> (Layer 1) repeats the signal to all ports. A <strong>switch</strong> (Layer 2) keeps a MAC → port table and only sends the frame where it needs to go.</p>
        <p>Try it: send frames between hosts and watch the table fill in. Toggle hub mode to compare.</p>
        <W name="switchsim" />
        <h3 id="datalink-the-learning-process-step-by-step">The learning process, step by step</h3>
        <ol>
          <li>A sends a frame to B. The switch sees <code>Source MAC = A</code> on port 1, so it learns <strong>A → Port 1</strong>.</li>
          <li>It checks the destination MAC B. If B is unknown, it <strong>floods</strong> the frame out all ports <strong>except the incoming port</strong>.</li>
          <li>When B replies, the switch learns <strong>B → Port 2</strong>.</li>
          <li>Now A → B frames are forwarded directly to port 2 only.</li>
        </ol>
        <div className="co key">
          <span className="lb">Classic interview line</span>
          <p>A switch <strong>learns from the SOURCE MAC</strong> and <strong>forwards based on the DESTINATION MAC</strong>.</p>
        </div>
        <p><span className="add">+ Added</span> Entries <strong>age out</strong> (typically 300 s) so the table stays current when devices move. Broadcast frames (FF:FF…) and unknown unicast are always flooded. Switching modes: <strong>store-and-forward</strong> (receive whole frame, check FCS, then forward) vs <strong>cut-through</strong> (forward after reading destination MAC; lower latency, may pass bad frames).</p>
      </section>
      <section>
        <h2 id="dl-domains"><span className="num">2.5</span>Collision domain vs broadcast domain</h2>
        <W name="domains" />
        <div className="vs">
          <div><h4>Collision domain</h4>A region where transmitted frames can collide. All devices on a hub share <strong>one</strong> collision domain. Each switch port is generally a <strong>separate</strong> collision domain.</div>
          <div><h4>Broadcast domain</h4>The group of devices that receive a Layer-2 broadcast. A <strong>router</strong> separates broadcast domains: a broadcast from Network A does not normally cross the router. VLANs also split them.</div>
        </div>
        <div className="co key">
          <span className="lb">Quick memory</span>
          <span className="fx">Switch → separates collision domains</span>
          <span className="fx">Router → separates broadcast domains</span>
        </div>
        <div className="co added">
          <span className="lb">+ Added · counting question</span>
          <p>"2 hubs (4 PCs each) connected to a switch, switch connected to a router" → collision domains = 2 (one per hub port on the switch) + 1 (switch–router link) = <strong>3</strong>; broadcast domains = <strong>1</strong> on that side of the router. Rule: count switch/router ports in use for collision domains; count router interfaces (or VLANs) for broadcast domains.</p>
        </div>
      </section>
      <section>
        <h2 id="dl-vlan"><span className="num">2.6</span>VLANs <span className="add">+ Added</span></h2>
        <p>A <strong>VLAN</strong> (Virtual LAN) splits one physical switch into several logical Layer-2 networks. Each VLAN is its own <strong>broadcast domain</strong>, so traffic between VLANs needs a router (or a Layer-3 switch): "inter-VLAN routing".</p>
        <ul>
          <li><strong>IEEE 802.1Q</strong> inserts a 4-byte tag (12-bit VLAN ID → up to 4094 usable VLANs) into the frame.</li>
          <li><strong>Access port</strong>: belongs to one VLAN, untagged frames (to a PC).</li>
          <li><strong>Trunk port</strong>: carries many VLANs, tagged frames (switch to switch).</li>
          <li>Why: security isolation (HR vs guests), smaller broadcast domains, flexible grouping without rewiring.</li>
        </ul>
      </section>
      <section>
        <h2 id="dl-stp"><span className="num">2.7</span>Spanning Tree Protocol (STP) <span className="add">+ Added</span></h2>
        <p>Redundant links between switches create <strong>loops</strong>. Ethernet frames have no TTL, so a broadcast circles forever: a <strong>broadcast storm</strong>, plus MAC table instability. <strong>STP (IEEE 802.1D)</strong> fixes this by logically blocking some ports so the active topology is a tree.</p>
        <ol>
          <li>Elect a <strong>root bridge</strong> (lowest Bridge ID = priority + MAC).</li>
          <li>Each other switch picks its <strong>root port</strong> (lowest cost path to root).</li>
          <li>Each segment picks a <strong>designated port</strong>.</li>
          <li>All other ports are <strong>blocked</strong>; they unblock if an active link fails.</li>
        </ol>
        <p>Rapid STP (RSTP, 802.1w) converges in seconds instead of ~30–50 s.</p>
      </section>
    </>
  );
}

export function Quick() {
  return (
    <>
      <div className="quick-grid">
        <div>
          <h4>Data Link</h4>
          <ul>
            <li>Node-to-node delivery</li>
            <li>Framing · MAC addressing · error detection · medium access</li>
            <li>Sublayers: LLC + MAC</li>
          </ul>
        </div>
        <div>
          <h4>{"MAC & frame"}</h4>
          <ul>
            <li>48 bits = 6 bytes; first 24 = OUI</li>
            <li>Broadcast FF:FF:FF:FF:FF:FF</li>
            <li>Frame 64–1518 B, MTU 1500</li>
            <li>FCS = CRC-32, error detection only</li>
          </ul>
        </div>
        <div>
          <h4>Switch</h4>
          <ul>
            <li>Learns from SOURCE MAC</li>
            <li>Forwards on DESTINATION MAC</li>
            <li>Unknown/broadcast → flood (except incoming port)</li>
          </ul>
        </div>
        <div>
          <h4>Domains</h4>
          <ul>
            <li>Switch → separates collision domains</li>
            <li>Router / VLAN → separates broadcast domains</li>
            <li>Hub → 1 collision domain</li>
          </ul>
        </div>
        <div>
          <h4>{"VLAN & STP"}</h4>
          <ul>
            <li>802.1Q tag, 12-bit VLAN ID</li>
            <li>Inter-VLAN traffic needs L3</li>
            <li>STP blocks ports to prevent loops / broadcast storms</li>
          </ul>
        </div>
      </div>
    </>
  );
}
