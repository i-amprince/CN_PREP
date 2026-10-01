// AUTO-GENERATED from content/16_ch_journey.html by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run `npm run content` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
      <p>This is one of the most important Computer Networks interview questions because it connects almost every concept you've revised. Play the journey first, then read each step.</p>
      <section>
        <h2 id="jr-overview"><span className="num">19.1</span>The whole journey at a glance</h2>
        <p>You type <code>https://google.com</code>. The browser needs to find the server and establish a secure connection. Overall flow:</p>
        <div className="flow h">
          <span>URL</span>
          <span>DNS</span>
          <span>IP address</span>
          <span>ARP → Gateway MAC</span>
          <span>TCP 3-way handshake</span>
          <span>TLS handshake</span>
          <span>HTTP request</span>
          <span>Routers forward packets</span>
          <span>Google server</span>
          <span>HTTP response</span>
          <span>Browser renders page</span>
        </div>
        <W name="journey" />
      </section>
      <section>
        <h2 id="jr-url"><span className="num">19.2</span>Step 1: the user enters the URL</h2>
        <p>You type <code>https://google.com</code>. Browser needs to find the server and establish a secure connection.</p>
        <p><span className="add">+ Added</span> The browser first <strong>parses the URL</strong>: scheme <code>https</code> → port <strong>443</strong> and TLS; host <code>google.com</code>; path <code>/</code>. If the domain is on the <strong>HSTS</strong> preload list, the browser goes straight to HTTPS even if you typed <code>http://</code>. If what you typed isn't a URL at all, it becomes a search query.</p>
      </section>
      <section>
        <h2 id="jr-dns"><span className="num">19.3</span>Step 2: DNS, find the IP address</h2>
        <p>Browser/OS needs <code>google.com → IP address</code>. It checks possible caches first:</p>
        <div className="flow">
          <span>Browser cache</span>
          <span>OS DNS cache (and hosts file)</span>
          <span>DNS resolver cache</span>
          <span>DNS hierarchy: Root → .com TLD → google.com authoritative</span>
        </div>
        <p>If not cached, DNS resolution eventually reaches an <strong>authoritative DNS server</strong>. Example: <code>google.com → 142.x.x.x</code>. The exact IP can vary (Google answers with a server near you).</p>
        <div className="co key">
          <span className="lb">Important</span>
          <span className="fx">DNS: Domain name → IP address</span>
          <span className="fx">DNS commonly uses UDP 53, but TCP can also be used.</span>
        </div>
        <p>Full walk-through with the sequence diagram: <a href="#/ch/dns?tab=notes&h=dns-hier">DNS chapter, 13.2</a>.</p>
      </section>
      <section>
        <h2 id="jr-local"><span className="num">19.4</span>Step 3: decide, is the destination local or remote?</h2>
        <p>Suppose your computer has <code>IP = 192.168.1.10</code> and <code>Subnet = 192.168.1.0/24</code>, and Google's IP is something completely different.</p>
        <pre className="dg">My network:     192.168.1.10  AND 255.255.255.0 = <b>192.168.1.0</b>{"\nGoogle:         142.250.x.x   AND 255.255.255.0 = "}<b>142.250.x.0</b>{"\n                                                  different → remote"}</pre>
        <p>Your computer determines: <strong>Google is outside my subnet → send the packet to the default gateway.</strong> So your computer needs the <strong>MAC address of the router/default gateway, not Google's MAC address</strong>.</p>
      </section>
      <section>
        <h2 id="jr-arp"><span className="num">19.5</span>Step 4: ARP, find the gateway's MAC</h2>
        <p>Suppose the gateway is <code>192.168.1.1</code>. Your computer checks its <strong>ARP cache</strong>. If not present:</p>
        <pre className="dg">ARP Request (<b>broadcast</b>{" to FF:FF:FF:FF:FF:FF):\n\"Who has 192.168.1.1?\"\n\nARP Reply ("}<b>unicast</b>{"):\n\"192.168.1.1 is at AA:BB:CC:DD:EE:FF\""}</pre>
        <p>Now your computer knows the gateway's MAC.</p>
        <div className="co trap">
          <span className="lb">Very important interview point</span>
          <p><strong>You do not ARP for Google's MAC address.</strong> You ARP for the <strong>default gateway's MAC</strong>, because MAC addresses are only relevant to the current local link.</p>
        </div>
      </section>
      <section>
        <h2 id="jr-tcp"><span className="num">19.6</span>Step 5: TCP 3-way handshake</h2>
        <p>Since HTTPS normally uses TCP for HTTP/1.1 and HTTP/2, TCP connection establishment happens <strong>before</strong> HTTP data transfer.</p>
        <pre className="dg">{"Client                    Server\n   "}<b>SYN</b>{"  ------------------>\n       <---------------- "}<b>SYN + ACK</b>{"\n   "}<b>ACK</b>{"  ------------------>\n\nClient: SYN,        Seq = 100\nServer: SYN + ACK,  Seq = 500, Ack = 101\nClient: ACK,        Ack = 501\n\n→ TCP connection established"}</pre>
        <p>Details and the interactive version: <a href="#/ch/handshake">3-way handshake chapter</a>.</p>
      </section>
      <section>
        <h2 id="jr-tls"><span className="num">19.7</span>Step 6: TLS handshake</h2>
        <p>Because the URL is <code>https://</code>, we need TLS. High-level:</p>
        <div className="flow">
          <span>Client → ClientHello (+ key share, SNI = google.com)</span>
          <span>Server → ServerHello + Certificate + key-exchange information</span>
          <span>Client/Server → establish shared session keys</span>
        </div>
        <p>The browser <strong>verifies the server certificate</strong>. The certificate helps establish: "This public key belongs to google.com." Then both sides derive <strong>symmetric session keys</strong>.</p>
        <div className="vs">
          <div><h4>Asymmetric cryptography</h4>Authentication + key establishment</div>
          <div><h4>Symmetric cryptography</h4>Actual HTTP data. Why? Because it is much faster for bulk data.</div>
        </div>
      </section>
      <section>
        <h2 id="jr-http"><span className="num">19.8</span>Step 7: the HTTP request</h2>
        <p>Now the browser can send the actual HTTP request. Conceptually:</p>
        <pre className="dg">{"GET / HTTP/2\nHost: google.com"}</pre>
        <p>The HTTP data is <strong>encrypted by TLS</strong>. So what travels through the network is roughly: <strong>encrypted HTTP data → TCP segment → IP packet → Ethernet frame</strong>.</p>
      </section>
      <section>
        <h2 id="jr-encap"><span className="num">19.9</span>Step 8: encapsulation</h2>
        <p>This is a very common interview question.</p>
        <div className="vs">
          <div>
            <h4>At the sender</h4>
            <div className="flow">
              <span>HTTP data</span>
              <span>TLS encrypted data</span>
              <span>TCP segment</span>
              <span>IP packet</span>
              <span>Ethernet frame</span>
              <span>Bits</span>
            </div>
          </div>
          <div>
            <h4>At the receiver</h4>
            <div className="flow">
              <span>Bits</span>
              <span>Ethernet frame</span>
              <span>IP packet</span>
              <span>TCP segment</span>
              <span>TLS</span>
              <span>HTTP</span>
            </div>
          </div>
        </div>
        <p>This is encapsulation and decapsulation.</p>
        <W name="encap" />
      </section>
      <section>
        <h2 id="jr-switch"><span className="num">19.10</span>Step 9: the switch forwards the frame</h2>
        <p>Your computer sends the Ethernet frame to the switch. The frame contains <strong>Source MAC = your computer</strong>, <strong>Destination MAC = router</strong>. The switch checks its MAC table and forwards the frame toward the router (on Wi-Fi, the access point plays this role).</p>
        <div className="co key">
          <span className="lb">Remember</span>
          <span className="fx">Switch → MAC address</span>
          <span className="fx">Router → IP address</span>
        </div>
      </section>
      <section>
        <h2 id="jr-router"><span className="num">19.11</span>Step 10: routers forward the IP packet</h2>
        <p>The router receives the Ethernet frame. It <strong>removes the incoming link-layer header/trailer</strong> and examines the IP packet. It checks its routing table:</p>
        <div className="flow h">
          <span>Destination IP</span>
          <span>Longest Prefix Match</span>
          <span>Next Hop</span>
          <span>Outgoing Interface</span>
        </div>
        <p>Then it creates a <strong>new link-layer frame</strong> for the next hop.</p>
        <div className="co key">
          <span className="lb">Very important: at every router</span>
          <span className="fx">MAC addresses → change</span>
          <span className="fx">IP source/destination → normally remain the same</span>
          <span className="fx">TTL → decreases (and the header checksum is recomputed)</span>
        </div>
        <p>Example: <code>PC → Router A → Router B → Router C → Google</code>. MAC addresses are different on each link. See it field by field in the <a href="#/ch/ip?tab=notes&h=ip-hops">hop-by-hop diagram</a>.</p>
        <p><span className="add">+ Added</span> Between your ISP and Google, the path is chosen by <strong>BGP</strong> (between autonomous systems); inside each network, by an IGP like <strong>OSPF</strong>.</p>
      </section>
      <section>
        <h2 id="jr-nat"><span className="num">19.12</span>Step 11: NAT may happen</h2>
        <p>If you're using a private IP (<code>192.168.1.10</code>), your home router may perform NAT:</p>
        <pre className="dg">{"192.168.1.10:5000\n        ↓ "}<b>NAT</b>{"\nPublic_IP:30001"}</pre>
        <p>The Internet generally sees the <strong>public address</strong>, not your private address. NAT keeps track of the mapping so replies can return to the correct internal device.</p>
      </section>
      <section>
        <h2 id="jr-google"><span className="num">19.13</span>Step 12: the packet reaches Google's server</h2>
        <div className="flow">
          <span>Internet</span>
          <span>Google network</span>
          <span>Load balancer / frontend infrastructure</span>
          <span>Appropriate server</span>
        </div>
        <p>The server processes the request. It may need to retrieve data from other internal services/databases, depending on the request.</p>
        <p><span className="add">+ Added</span> In reality you probably reached a Google <strong>edge</strong> location close to you (DNS and anycast pick it). The frontend terminates TLS and a <strong>reverse proxy / L7 load balancer</strong> forwards the request to a backend over Google's private network. See <a href="#/ch/security?tab=notes&h=sec-proxy">proxies, load balancers and CDNs</a>.</p>
      </section>
      <section>
        <h2 id="jr-response"><span className="num">19.14</span>Step 13: the response comes back</h2>
        <p>The server sends an HTTP response, for example <code>HTTP/2 200 OK</code>. The response is wrapped the same way:</p>
        <div className="flow h">
          <span>HTTP</span>
          <span>TLS encryption</span>
          <span>TCP</span>
          <span>IP</span>
          <span>Link-layer frame</span>
        </div>
        <p>It travels back through the network (NAT translates the destination back to <code>192.168.1.10:5000</code> at your router). <strong>TCP provides:</strong></p>
        <ul>
          <li>ordering</li>
          <li>acknowledgements</li>
          <li>retransmission when needed</li>
          <li>flow control</li>
          <li>congestion control</li>
        </ul>
      </section>
      <section>
        <h2 id="jr-render"><span className="num">19.15</span>Step 14: the browser receives and renders</h2>
        <div className="flow h">
          <span>Ethernet</span>
          <span>IP</span>
          <span>TCP</span>
          <span>TLS</span>
          <span>HTTP</span>
          <span>Browser</span>
        </div>
        <p>The browser processes the response and renders the page. It may then make many additional requests for: <strong>HTML, CSS, JavaScript, images, fonts, APIs</strong>. Those requests can <strong>reuse connections</strong> depending on the protocol and browser/server behaviour (keep-alive in HTTP/1.1, multiplexed streams in HTTP/2 and HTTP/3).</p>
        <p><span className="add">+ Added</span> Rendering pipeline in one line: parse HTML → DOM, parse CSS → CSSOM, combine into the render tree → layout → paint → composite. JavaScript can block parsing unless it is <code>async</code>/<code>defer</code>.</p>
      </section>
      <section>
        <h2 id="jr-answer"><span className="num">19.16</span>The complete interview answer</h2>
        <p>If the interviewer asks <em>"What happens when you type https://google.com?"</em>, a good structured answer:</p>
        <div className="co qa">
          <span className="lb">12-point answer</span>
          <ol>
            <li>Browser checks caches and performs DNS resolution.</li>
            <li>DNS gives the server IP address.</li>
            <li>Client checks whether the destination is local; if remote, it needs the default gateway's MAC using ARP.</li>
            <li>TCP 3-way handshake establishes the connection.</li>
            <li>TLS handshake authenticates the server and establishes encryption keys.</li>
            <li>Browser sends an encrypted HTTP request.</li>
            <li>Data is encapsulated as TCP segment → IP packet → Ethernet frame.</li>
            <li>Switches forward using MAC addresses.</li>
            <li>Routers forward using IP addresses and routing tables.</li>
            <li>NAT may translate the private source IP to a public IP.</li>
            <li>Server processes the request and sends the response.</li>
            <li>TCP delivers it reliably, TLS decrypts it, and the browser renders the response.</li>
          </ol>
        </div>
        <div className="co added">
          <span className="lb">+ Added · HTTP/3 changes the middle</span>
          <p>With HTTP/3 the browser uses <strong>QUIC over UDP</strong> (port 443) instead of TCP + TLS. QUIC merges the transport and TLS 1.3 handshakes into <strong>one round trip</strong> (0-RTT when resuming), so steps 4 and 5 collapse into one. Browsers learn a site supports HTTP/3 from the <code>Alt-Svc</code> header or a DNS HTTPS record, and fall back to TCP if UDP is blocked.</p>
        </div>
      </section>
      <section>
        <h2 id="jr-traps"><span className="num">19.17</span>Placement traps</h2>
        <details className="qa">
          <summary>Q1. Does the client find Google's MAC address?</summary>
          <div><strong>No.</strong> It finds the MAC of the next-hop router / default gateway.</div>
        </details>
        <details className="qa">
          <summary>Q2. Does the MAC address remain the same across the Internet?</summary>
          <div><strong>No.</strong> MAC changes at every Layer-2 hop.</div>
        </details>
        <details className="qa">
          <summary>Q3. Does the IP address change at every router?</summary>
          <div><strong>Normally no.</strong> Source/destination IP remain the same end-to-end, except things like NAT can modify them.</div>
        </details>
        <details className="qa">
          <summary>Q4. Which device uses MAC addresses for forwarding?</summary>
          <div>
            <strong>Switch.</strong>
          </div>
        </details>
        <details className="qa">
          <summary>Q5. Which device uses IP addresses for routing?</summary>
          <div>
            <strong>Router.</strong>
          </div>
        </details>
        <details className="qa">
          <summary>Q6. Why TCP before TLS?</summary>
          <div>For the traditional TLS-over-TCP setup used by HTTPS with HTTP/1.1 and HTTP/2, <strong>TCP provides the reliable transport first</strong>; TLS needs an ordered, reliable byte stream to run its handshake on. HTTP/3 is different: it uses <strong>QUIC over UDP</strong>.</div>
        </details>
        <details className="qa">
          <summary>Q7. Where does DNS fit if the IP is already cached? <span className="add">+ Added</span></summary>
          <div>It is skipped: a browser/OS/resolver cache hit returns the IP immediately, until the record's TTL expires.</div>
        </details>
        <details className="qa">
          <summary>Q8. What does the server see as the client's IP? <span className="add">+ Added</span></summary>
          <div>Your router's <strong>public</strong> IP (after NAT), or a carrier-grade NAT address, or the VPN server's IP if you use a VPN. Never 192.168.x.x.</div>
        </details>
      </section>
      <section>
        <h2 id="jr-diagram"><span className="num">19.18</span>One diagram to remember</h2>
        <pre className="dg">{"              DNS\n               ↓\n       Find Server IP\n               ↓\n        Is it remote?\n               ↓\n       ARP Gateway MAC\n               ↓\n        TCP 3-Way Handshake\n               ↓\n          TLS Handshake\n               ↓\n        HTTP Request\n               ↓\n      ┌─────────────────┐\n      │ "}<b>Ethernet Frame</b>{"  │\n      │   "}<b>IP Packet</b>{"     │\n      │  "}<b>TCP Segment</b>{"    │\n      │  "}<b>HTTP Data</b>{"      │\n      └─────────────────┘\n               ↓\n            Switch\n               ↓\n            Router\n               ↓\n       Router → Router\n               ↓\n           Server\n               ↓\n        HTTP Response\n               ↓\n        TLS Decryption\n               ↓\n           Browser"}</pre>
        <p>Two shorter chains from your notes that say the same thing:</p>
        <div className="vs">
          <div>
            <h4>The big "type a URL" chain</h4>
            <div className="flow">
              <span>User types https://google.com</span>
              <span>DNS resolution</span>
              <span>Google IP obtained</span>
              <span>ARP → Default Gateway MAC</span>
              <span>TCP 3-way handshake</span>
              <span>TLS handshake</span>
              <span>HTTP request</span>
              <span>Router forwarding</span>
              <span>Google server</span>
              <span>HTTP response</span>
              <span>Browser renders page</span>
            </div>
          </div>
          <div>
            <h4>The protocol stack view</h4>
            <div className="flow">
              <span>Browser</span>
              <span>DNS</span>
              <span>TCP</span>
              <span>TLS</span>
              <span>HTTP</span>
              <span>Server</span>
            </div>
          </div>
        </div>
      </section>
      <section>
        <h2 id="jr-must"><span className="num">19.19</span>Placement must-remember</h2>
        <div className="co key">
          <span className="lb">The whole flow in 12 lines</span>
          <span className="fx">DNS → name → IP</span>
          <span className="fx">ARP → IP → MAC on local link</span>
          <span className="fx">Switch → MAC</span>
          <span className="fx">Router → IP</span>
          <span className="fx">TCP → reliable transport</span>
          <span className="fx">TLS → security</span>
          <span className="fx">HTTP → application data</span>
          <span className="fx">NAT → private ↔ public address translation</span>
          <span className="fx">MAC changes hop-by-hop</span>
          <span className="fx">IP normally stays end-to-end</span>
          <span className="fx">TTL decreases at routers</span>
          <span className="fx">Encapsulation → Data → Segment → Packet → Frame → Bits</span>
        </div>
        <p>This single flow ties together almost the entire CN revision.</p>
      </section>
    </>
  );
}

export function Quick() {
  return (
    <>
      <div className="quick-grid">
        <div>
          <h4>Order</h4>
          <ul>
            <li>URL → DNS → local/remote? → ARP gateway</li>
            <li>TCP handshake → TLS handshake → HTTP</li>
            <li>Switch → routers (+NAT) → LB → server</li>
            <li>Response back → decrypt → render → sub-resources</li>
          </ul>
        </div>
        <div>
          <h4>Addresses</h4>
          <ul>
            <li>ARP for the gateway, never Google</li>
            <li>MAC changes every hop, IP stays (except NAT)</li>
            <li>TTL −1 per router</li>
          </ul>
        </div>
        <div>
          <h4>Security</h4>
          <ul>
            <li>Certificate proves "this key is google.com"</li>
            <li>Asymmetric for auth + keys, symmetric for data</li>
          </ul>
        </div>
        <div>
          <h4>Variants</h4>
          <ul>
            <li>HTTP/3: QUIC over UDP, 1-RTT combined handshake</li>
            <li>Cached DNS skips resolution</li>
            <li>Keep-alive / HTTP/2 reuse connections</li>
          </ul>
        </div>
      </div>
    </>
  );
}
