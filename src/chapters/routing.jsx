// AUTO-GENERATED from content/12_ch_ip_subnet_routing.html by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run `npm run content` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
      <p>The algorithm-heavy part. Interviewers connect routing tables → routing algorithms → Dijkstra/Bellman-Ford → RIP/OSPF/BGP.</p>
      <section>
        <h2 id="rt-what"><span className="num">7.1</span>Routing vs forwarding</h2>
        <p><strong>Routing</strong> = finding a path from a source network to a destination network (A → R1 → R2 → R3 → B). It's the control plane, slow, runs routing protocols.</p>
        <p><strong>Forwarding</strong> = actually sending each arriving packet out the right interface. It's the data plane, per-packet, fast.</p>
        <div className="vs">
          <div><h4>Routing</h4>"Which path?" Builds the table.</div>
          <div><h4>Forwarding</h4>"Send it through this interface." Uses the table.</div>
        </div>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Destination</th>
                <th>Next hop</th>
                <th>Interface</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="n">192.168.1.0/24</td>
                <td>Direct</td>
                <td>eth0</td>
              </tr>
              <tr>
                <td className="n">10.0.0.0/8</td>
                <td className="n">192.168.2.1</td>
                <td>eth1</td>
              </tr>
              <tr>
                <td className="n">172.16.0.0/16</td>
                <td className="n">192.168.3.1</td>
                <td>eth2</td>
              </tr>
              <tr>
                <td className="n">0.0.0.0/0</td>
                <td>ISP</td>
                <td>eth3</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flow h">
          <span>Destination IP</span>
          <span>Check table</span>
          <span>Longest prefix match</span>
          <span>Next hop</span>
          <span>Forward</span>
        </div>
      </section>
      <section>
        <h2 id="rt-static"><span className="num">7.2</span>Static vs dynamic routing</h2>
        <div className="vs">
          <div><h4>Static</h4>Admin configures routes manually.<ul><li>✔ Simple, predictable, no protocol overhead, secure</li><li>✘ Doesn't adapt to failures</li><li>✘ Hard to maintain in large networks</li></ul></div>
          <div><h4>Dynamic</h4>Routers exchange information and compute routes automatically.<ul><li>✔ Adapts to failures and changes</li><li>✘ CPU/bandwidth overhead, convergence time</li><li>Examples: RIP, OSPF, BGP</li></ul></div>
        </div>
      </section>
      <section>
        <h2 id="rt-dv"><span className="num">7.3</span>Distance Vector and Bellman-Ford</h2>
        <p>Each router knows "how far is each destination, and through which neighbour?" It does <strong>not</strong> have the full topology; it periodically shares its whole table <strong>with neighbours only</strong>. People call it "routing by rumour".</p>
        <div className="co formula">
          <span className="lb">Bellman-Ford equation</span>
          <span className="fx">{"D_x(y) = min over neighbours v of { c(x,v) + D_v(y) }"}</span>
          <p style={{ margin: ".3rem 0 0", fontSize: ".9rem" }}>distance to destination = cost to neighbour + neighbour's distance to destination</p>
        </div>
        <pre className="dg">{"A ----1---- B ----2---- C\n \\                     /\n  ---------5-----------\n\nA → C direct   = 5\nA → C via B    = 1 + 2 = "}<b>3</b>  ✔ chosen</pre>
        <h3 id="routing-count-to-infinity">Count-to-infinity</h3>
        <p>A — B — C. A reaches C via B. Now C fails. B loses its direct route, but A still advertises "I can reach C in 2". B believes it (cost 3 via A), A then updates to 4 via B, and so on: <strong>2 → 3 → 4 → 5 → …</strong> until infinity (16 in RIP). Bad news travels slowly; good news travels fast.</p>
        <W name="cti" />
        <ul>
          <li><strong>Split horizon</strong>: don't advertise a route back out the interface you learned it from.</li>
          <li><strong>Poison reverse</strong>: do advertise it back, but with an infinite metric.</li>
          <li><span className="add">+ Added</span> <strong>Route poisoning</strong> (advertise failed route as ∞ immediately), <strong>triggered updates</strong> (send on change, not just every 30 s), <strong>hold-down timers</strong> (ignore worse news for a while). Split horizon does not fix loops involving 3+ routers.</li>
        </ul>
      </section>
      <section>
        <h2 id="rt-rip"><span className="num">7.4</span>RIP: Routing Information Protocol</h2>
        <p>Distance Vector protocol. <strong>Metric = hop count.</strong> Maximum usable = <strong>15</strong>, <strong>16 = infinity / unreachable</strong> (common MCQ). That limits RIP to small networks.</p>
        <p><span className="add">+ Added</span> Sends its full table every <strong>30 s</strong>; runs over <strong>UDP port 520</strong>. RIPv1 is classful and broadcasts; RIPv2 is classless (sends masks), uses multicast 224.0.0.9 and supports authentication. RIPng is for IPv6.</p>
      </section>
      <section>
        <h2 id="rt-ls"><span className="num">7.5</span>Link State and Dijkstra</h2>
        <p>Each router floods <strong>Link-State Advertisements (LSAs)</strong> describing its own links to <strong>every</strong> router. Everyone builds the same full topology map (LSDB), then each runs <strong>Dijkstra</strong> to compute its own shortest-path tree.</p>
        <p>Dijkstra repeatedly picks the <strong>closest unvisited node</strong> and relaxes its neighbours. Step through it:</p>
        <W name="dijkstra" />
        <p>Your notes' example: A–B 2, B–D 1, A–C 5, C–D 2. Start A: A = 0, B = 2, C = 5, D = ∞. Pick B (2) → D = 2 + 1 = 3. Pick D (3) → C via D = 5, no improvement. Path A → B → D costs 3.</p>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Dijkstra</th>
                <th>Bellman-Ford</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Link State</td>
                <td>Distance Vector</td>
              </tr>
              <tr>
                <td>Uses complete topology</td>
                <td>Uses neighbour information</td>
              </tr>
              <tr>
                <td>Greedy</td>
                <td>Relaxation, iterative (V−1 rounds)</td>
              </tr>
              <tr>
                <td>OSPF, IS-IS</td>
                <td>RIP</td>
              </tr>
              <tr>
                <td>No negative edges</td>
                <td>Handles negative edges (detects negative cycles)</td>
              </tr>
              <tr>
                <td>O((V+E) log V) with heap</td>
                <td>O(V·E)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 id="rt-ospf"><span className="num">7.6</span>OSPF: Open Shortest Path First</h2>
        <p>Link State protocol using Dijkstra's SPF. <strong>Metric = cost</strong>, generally based on bandwidth (cost = reference bandwidth / interface bandwidth; default reference 100 Mbps). Used <strong>within an autonomous system</strong>.</p>
        <p><span className="add">+ Added</span> Runs directly over IP (<strong>protocol 89</strong>, no TCP/UDP). Uses <strong>Hello</strong> packets to find neighbours, sends updates only on change, supports VLSM/CIDR and authentication. Large networks are split into <strong>areas</strong>; all areas connect to backbone <strong>Area 0</strong>, which keeps LSA flooding and SPF runs small. On multi-access links a DR/BDR (designated router) reduces adjacencies.</p>
      </section>
      <section>
        <h2 id="rt-as"><span className="num">7.7</span>Autonomous systems, IGP vs EGP, BGP</h2>
        <p>An <strong>Autonomous System (AS)</strong> is a network or group of networks under one administrative control and routing policy (an ISP, a big company, Google). Each has an AS number.</p>
        <div className="vs">
          <div><h4>IGP: inside an AS</h4>RIP, OSPF, IS-IS, EIGRP <span className="add">+ Added</span>. Goal: fastest/shortest path.</div>
          <div><h4>EGP: between ASes</h4>BGP. Goal: policy (business relationships, who pays whom).</div>
        </div>
        <p><strong>BGP (Border Gateway Protocol)</strong> is the routing protocol of the Internet between ASes. It isn't simply "find the shortest path"; it considers <strong>policies and multiple path attributes</strong>.</p>
        <ul>
          <li><span className="add">+ Added</span> <strong>Path-vector</strong> protocol: advertisements carry the full AS_PATH; a router rejects any path containing its own AS number → loop prevention.</li>
          <li>Runs over <strong>TCP port 179</strong> (reliable, incremental updates).</li>
          <li><strong>eBGP</strong> between different ASes; <strong>iBGP</strong> distributes external routes inside one AS.</li>
          <li>Attributes: AS_PATH, NEXT_HOP, LOCAL_PREF, MED. BGP hijacks/leaks have caused real outages.</li>
        </ul>
      </section>
      <section>
        <h2 id="rt-compare"><span className="num">7.8</span>Distance Vector vs Link State</h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Distance Vector</th>
                <th>Link State</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Knowledge</td>
                <td>Neighbour information</td>
                <td>Full topology</td>
              </tr>
              <tr>
                <td>Main idea</td>
                <td>Distance + direction</td>
                <td>Map, then compute</td>
              </tr>
              <tr>
                <td>Algorithm</td>
                <td>Bellman-Ford</td>
                <td>Dijkstra</td>
              </tr>
              <tr>
                <td>Example</td>
                <td>RIP</td>
                <td>OSPF</td>
              </tr>
              <tr>
                <td>Updates</td>
                <td>Whole table to neighbours, periodic</td>
                <td>LSAs flooded to all, on change</td>
              </tr>
              <tr>
                <td>Convergence</td>
                <td>Slower</td>
                <td>Faster</td>
              </tr>
              <tr>
                <td>Count-to-infinity</td>
                <td>Yes</td>
                <td>Not the same problem</td>
              </tr>
              <tr>
                <td>CPU / memory</td>
                <td>Low</td>
                <td>Higher</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul className="tree">
          <li><span className="t">Routing Protocols</span><ul><li><span className="t">IGP</span><ul><li>RIP <em>→ Distance Vector</em></li><li>OSPF <em>→ Link State</em></li></ul></li><li><span className="t">EGP</span><ul><li>BGP <em>→ Path vector, inter-AS</em></li></ul></li></ul></li>
        </ul>
        <div className="co trap">
          <span className="lb">Subtle but important</span>
          <p>Don't say "Dijkstra is the OSPF protocol". Say: <strong>OSPF is a routing protocol that uses the Shortest Path First approach based on Dijkstra's algorithm.</strong> Similarly, RIP is a Distance Vector protocol based on the Bellman-Ford principle.</p>
        </div>
        <div className="co qa">
          <span className="lb">Interview answer</span>
          <p><strong>Why does OSPF generally converge faster than RIP?</strong> Because in OSPF every router has the full topology and recomputes paths itself as soon as an LSA arrives, while distance-vector protocols exchange distances iteratively with neighbours on timers and can suffer from count-to-infinity.</p>
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
          <h4>Chains to memorise</h4>
          <ul>
            <li>RIP → DV → Bellman-Ford → count-to-infinity</li>
            <li>OSPF → Link State → Dijkstra → shortest path</li>
            <li>BGP → between ASes → policy, path vector</li>
          </ul>
        </div>
        <div>
          <h4>RIP</h4>
          <ul>
            <li>Hop count, max 15, 16 = ∞</li>
            <li>Every 30 s, UDP 520</li>
          </ul>
        </div>
        <div>
          <h4>OSPF</h4>
          <ul>
            <li>Cost (bandwidth), areas, Area 0</li>
            <li>IP protocol 89, Hello packets</li>
          </ul>
        </div>
        <div>
          <h4>BGP</h4>
          <ul>
            <li>TCP 179, AS_PATH loop prevention</li>
            <li>eBGP / iBGP</li>
          </ul>
        </div>
        <div>
          <h4>Fixes for count-to-∞</h4>
          <ul>
            <li>Split horizon</li>
            <li>Poison reverse</li>
            <li>Hold-down, triggered updates</li>
          </ul>
        </div>
      </div>
    </>
  );
}
