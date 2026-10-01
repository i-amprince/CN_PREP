// AUTO-GENERATED from content/10_ch_basics_osi.html by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run `npm run content` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
      <div className="co added">
        <span className="lb">+ Added chapter</span>
        <p>Your notes start at OSI. Interviewers and GATE-style MCQs often start one step earlier: network types, topologies, switching, and the delay formulas. This chapter covers that ground.</p>
      </div>
      <section>
        <h2 id="basics-what"><span className="num">0.1</span>What is a computer network?</h2>
        <p>A computer network is a set of <strong>nodes</strong> (hosts, switches, routers) connected by <strong>links</strong> (cable, fibre, radio) that follow shared <strong>protocols</strong> so they can exchange data.</p>
        <p>A <strong>protocol</strong> defines three things: <em>syntax</em> (the format of messages), <em>semantics</em> (what each field means) and <em>timing</em> (when to send, how fast).</p>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Span</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>PAN</td>
                <td>~10 m, one person</td>
                <td>Bluetooth earbuds, phone hotspot</td>
              </tr>
              <tr>
                <td>LAN</td>
                <td>Building / campus</td>
                <td>Office Ethernet, home Wi-Fi</td>
              </tr>
              <tr>
                <td>MAN</td>
                <td>City</td>
                <td>Cable TV network, city-wide fibre ring</td>
              </tr>
              <tr>
                <td>WAN</td>
                <td>Country / world</td>
                <td>ISP backbones, the Internet</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 id="basics-topo"><span className="num">0.2</span>Topologies</h2>
        <W name="topology" />
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Topology</th>
                <th>Links for n nodes</th>
                <th>Good</th>
                <th>Bad</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bus</td>
                <td className="n">1 backbone</td>
                <td>Cheap, simple</td>
                <td>Backbone failure kills all; collisions</td>
              </tr>
              <tr>
                <td>Star</td>
                <td className="n">n</td>
                <td>Easy to add/remove; one failed cable affects one host</td>
                <td>Central hub/switch is a single point of failure</td>
              </tr>
              <tr>
                <td>Ring</td>
                <td className="n">n</td>
                <td>Orderly access (token passing)</td>
                <td>One break can stop the ring (unless dual ring)</td>
              </tr>
              <tr>
                <td>Mesh (full)</td>
                <td className="n">n(n−1)/2</td>
                <td>Redundant, robust, private links</td>
                <td>Expensive cabling and ports</td>
              </tr>
              <tr>
                <td>Tree / Hybrid</td>
                <td className="n">n−1</td>
                <td>Scales hierarchically</td>
                <td>Root failure splits the network</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="co formula">
          <span className="lb">Formula</span>
          <span className="fx">Full mesh links = n(n−1)/2   ·   I/O ports per device = n−1</span>
          <p style={{ margin: ".3rem 0 0", fontSize: ".9rem" }}>Example: 6 devices → 6·5/2 = <strong>15</strong> links, each device needs 5 ports.</p>
        </div>
      </section>
      <section>
        <h2 id="basics-modes"><span className="num">0.3</span>{"Transmission modes & casting"}</h2>
        <div className="vs">
          <div><h4>Simplex</h4>One direction only. Keyboard → computer, broadcast radio.</div>
          <div><h4>Half-duplex</h4>Both directions, one at a time. Walkie-talkie, hub-based Ethernet, Wi-Fi.</div>
          <div><h4>Full-duplex</h4>Both directions at once. Phone call, switched Ethernet, TCP.</div>
        </div>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Casting</th>
                <th>Meaning</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Unicast</td>
                <td>One → one</td>
                <td>Normal web request</td>
              </tr>
              <tr>
                <td>Broadcast</td>
                <td>One → all on the segment</td>
                <td>ARP request, DHCP Discover (FF:FF:FF:FF:FF:FF)</td>
              </tr>
              <tr>
                <td>Multicast</td>
                <td>One → a subscribed group</td>
                <td>IPTV, OSPF hellos (224.0.0.5)</td>
              </tr>
              <tr>
                <td>Anycast</td>
                <td>One → nearest of many with same address</td>
                <td>DNS root servers, CDNs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 id="basics-switching"><span className="num">0.4</span>Circuit vs packet switching</h2>
        <div className="vs">
          <div>
            <h4>Circuit switching</h4>
            <ul>
              <li>Dedicated path reserved before data flows (setup → transfer → teardown)</li>
              <li>Fixed bandwidth, in-order, no queuing delay</li>
              <li>Wastes capacity when idle</li>
              <li>Example: old telephone network (PSTN)</li>
            </ul>
          </div>
          <div>
            <h4>Packet switching</h4>
            <ul>
              <li>Data split into packets; each forwarded independently (store-and-forward)</li>
              <li>Links shared on demand (statistical multiplexing)</li>
              <li>Variable delay, possible loss/reordering</li>
              <li>Example: the Internet (IP)</li>
            </ul>
          </div>
        </div>
        <p><strong>Datagram</strong> packet switching (IP) routes every packet separately. <strong>Virtual-circuit</strong> packet switching (ATM, MPLS, Frame Relay) sets up a path first, then all packets follow it. <strong>Message switching</strong> stores whole messages at each hop (telegraph/email style).</p>
      </section>
      <section>
        <h2 id="basics-delay"><span className="num">0.5</span>Delays, throughput and bandwidth-delay product</h2>
        <p>Total delay per hop = <strong>processing + queuing + transmission + propagation</strong>.</p>
        <div className="co formula">
          <span className="lb">Formulas you will be asked</span>
          <span className="fx">Transmission delay  Tt = L / R   <em>(packet size ÷ bandwidth)</em></span>
          <span className="fx">Propagation delay   Tp = d / v   <em>(distance ÷ signal speed, ~2×10⁸ m/s in cable)</em></span>
          <span className="fx">RTT ≈ 2 × Tp   <em>(when Tt of the ACK is negligible)</em></span>
          <span className="fx">a = Tp / Tt</span>
          <span className="fx">Stop-and-Wait efficiency η = 1 / (1 + 2a)</span>
          <span className="fx">Bandwidth-Delay Product = R × RTT  <em>(bits that fit "in the pipe")</em></span>
          <span className="fx">Throughput (window W) = min(R, W / RTT)</span>
        </div>
        <div className="co trap">
          <span className="lb">Trap</span>
          <p>Transmission delay depends on <strong>packet size and bandwidth</strong>, not distance. Propagation delay depends on <strong>distance and medium</strong>, not packet size. Units: 1 KB in networking questions is often 1000 bytes for bandwidth (Mbps = 10⁶ bits/s) but 1024 for memory. Read the question.</p>
        </div>
        <W name="delay" />
        <h3 id="basics-bandwidth-vs-throughput-vs-latency">Bandwidth vs throughput vs latency</h3>
        <ul>
          <li><strong>Bandwidth</strong>: the maximum rate a link can carry (capacity, bits/s).</li>
          <li><strong>Throughput</strong>: the rate you actually achieve end to end (limited by the slowest link, window, losses).</li>
          <li><strong>Latency</strong>: time for one bit to get from A to B. <strong>Jitter</strong> is variation in latency (matters for voice/video).</li>
        </ul>
        <h3 id="basics-channel-capacity-gate-favourite">Channel capacity (GATE favourite)</h3>
        <div className="co formula">
          <span className="lb">Formula</span>
          <span className="fx">Nyquist (noiseless): C = 2B·log₂(L)  <em>(B = bandwidth Hz, L = signal levels)</em></span>
          <span className="fx">Shannon (noisy): C = B·log₂(1 + SNR)  <em>(SNR as a ratio; SNR_dB = 10·log₁₀ SNR)</em></span>
        </div>
      </section>
      <section>
        <h2 id="basics-media"><span className="num">0.6</span>Physical layer: transmission media</h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Medium</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Twisted pair (UTP/STP)</td>
                <td>Cat5e/Cat6 Ethernet, RJ-45. Twisting cancels interference. ~100 m per segment.</td>
              </tr>
              <tr>
                <td>Coaxial</td>
                <td>Cable TV/old Ethernet (10BASE2/5). Better shielding than UTP.</td>
              </tr>
              <tr>
                <td>Optical fibre</td>
                <td>Light pulses; huge bandwidth, long distance, immune to EMI. Single-mode (long haul) vs multi-mode (short).</td>
              </tr>
              <tr>
                <td>Wireless</td>
                <td>Radio (Wi-Fi, cellular), microwave, infrared, satellite. Shared, noisy, needs CSMA/CA.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>Physical-layer devices: <strong>repeater</strong> (regenerates the signal), <strong>hub</strong> (multi-port repeater), modems and transceivers. Encoding examples: NRZ, Manchester (used in 10 Mbps Ethernet; a transition in every bit gives clock recovery).</p>
      </section>
    </>
  );
}

export function Quick() {
  return (
    <>
      <div className="quick-grid">
        <div>
          <h4>{"Types & topologies"}</h4>
          <ul>
            <li>{"PAN < LAN < MAN < WAN"}</li>
            <li>Full mesh links = n(n−1)/2</li>
            <li>Star: hub = single point of failure</li>
            <li>Bus/hub = one collision domain</li>
          </ul>
        </div>
        <div>
          <h4>Modes</h4>
          <ul>
            <li>Simplex → one way</li>
            <li>Half-duplex → Wi-Fi, hub</li>
            <li>Full-duplex → switch, TCP</li>
            <li>Anycast → nearest (DNS root, CDN)</li>
          </ul>
        </div>
        <div>
          <h4>Delays</h4>
          <ul>
            <li>Tt = L/R (size, bandwidth)</li>
            <li>Tp = d/v (distance)</li>
            <li>η(stop-and-wait) = 1/(1+2a), a = Tp/Tt</li>
            <li>BDP = R × RTT</li>
          </ul>
        </div>
        <div>
          <h4>Switching</h4>
          <ul>
            <li>Circuit → reserved path, phone network</li>
            <li>Packet → shared, store-and-forward, Internet</li>
            <li>Datagram (IP) vs virtual circuit (MPLS)</li>
          </ul>
        </div>
      </div>
    </>
  );
}
