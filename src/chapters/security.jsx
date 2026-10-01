// AUTO-GENERATED from content/14_ch_dns_http_tls_security.html by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run `npm run content` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
      <div className="co added">
        <span className="lb">+ Added chapter</span>
        <p>Your notes touch on SYN floods and MITM. Interviews (especially for backend/SDE roles) also ask about firewalls, proxies, load balancers, CDNs and common attacks. All of this is new.</p>
      </div>
      <section>
        <h2 id="sec-cia"><span className="num">16.1</span>CIA triad</h2>
        <div className="vs">
          <div><h4>Confidentiality</h4>Only authorised parties read data. Encryption, access control.</div>
          <div><h4>Integrity</h4>Data isn't altered undetected. Hashes, MACs, signatures.</div>
          <div><h4>Availability</h4>Service stays up. Redundancy, DDoS protection.</div>
        </div>
      </section>
      <section>
        <h2 id="sec-fw"><span className="num">16.2</span>Firewalls, IDS/IPS, DMZ</h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Layer</th>
                <th>Looks at</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Packet filter (stateless)</td>
                <td>3–4</td>
                <td>Each packet alone: IPs, ports, protocol (ACL rules)</td>
              </tr>
              <tr>
                <td>Stateful firewall</td>
                <td>3–4</td>
                <td>Tracks connections; allows replies to outbound traffic automatically</td>
              </tr>
              <tr>
                <td>Application firewall / WAF</td>
                <td>7</td>
                <td>HTTP content: SQL injection, XSS patterns</td>
              </tr>
              <tr>
                <td>Next-gen firewall</td>
                <td>3–7</td>
                <td>Stateful + deep packet inspection + app awareness + IPS</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul>
          <li><strong>IDS</strong> (Intrusion Detection System) detects and alerts (passive). <strong>IPS</strong> sits inline and blocks.</li>
          <li><strong>DMZ</strong>: a separate network segment for public-facing servers (web, mail) between the Internet and the internal LAN.</li>
        </ul>
      </section>
      <section>
        <h2 id="sec-proxy"><span className="num">16.3</span>Proxy, reverse proxy, load balancer, CDN</h2>
        <W name="proxy" />
        <div className="vs">
          <div><h4>Forward proxy</h4>Acts for <strong>clients</strong>. The server sees the proxy, not you. Uses: content filtering, caching, bypassing geo-blocks, corporate egress control.</div>
          <div><h4>Reverse proxy</h4>Acts for <strong>servers</strong>. Clients see one endpoint. Uses: load balancing, TLS termination, caching, compression, hiding backends (Nginx, HAProxy).</div>
        </div>
        <h3 id="security-load-balancer">Load balancer</h3>
        <ul>
          <li><strong>L4</strong> balances by IP/port (fast, can't see URLs). <strong>L7</strong> reads HTTP: route by path/host/cookie, sticky sessions.</li>
          <li>Algorithms: <strong>round robin</strong>, weighted round robin, <strong>least connections</strong>, <strong>IP hash</strong> (same client → same server), least response time.</li>
          <li>Health checks remove dead servers from the pool.</li>
        </ul>
        <h3 id="security-cdn-content-delivery-network">CDN (Content Delivery Network)</h3>
        <p>Caches content at <strong>edge servers</strong> close to users (often reached via DNS or anycast). Lower latency, less origin load, absorbs DDoS. Examples: Cloudflare, Akamai, CloudFront.</p>
      </section>
      <section>
        <h2 id="sec-attacks"><span className="num">16.4</span>Common network attacks</h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Attack</th>
                <th>Layer</th>
                <th>What happens</th>
                <th>Defence</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>DoS / DDoS</td>
                <td>3–7</td>
                <td>Flood a target so real users can't reach it; DDoS uses many machines (botnet)</td>
                <td>Rate limiting, CDN/scrubbing, anycast</td>
              </tr>
              <tr>
                <td>SYN flood</td>
                <td>4</td>
                <td>Half-open connections fill the backlog</td>
                <td>SYN cookies</td>
              </tr>
              <tr>
                <td>ARP spoofing</td>
                <td>2</td>
                <td>Fake ARP replies → traffic goes via attacker</td>
                <td>Dynamic ARP Inspection, static ARP</td>
              </tr>
              <tr>
                <td>MAC flooding</td>
                <td>2</td>
                <td>Fill switch CAM table → switch floods like a hub</td>
                <td>Port security</td>
              </tr>
              <tr>
                <td>DNS spoofing / cache poisoning</td>
                <td>7</td>
                <td>Fake DNS answers send users to a malicious IP</td>
                <td>DNSSEC, DoH/DoT</td>
              </tr>
              <tr>
                <td>IP spoofing</td>
                <td>3</td>
                <td>Forged source IP (for reflection/amplification)</td>
                <td>Ingress filtering (BCP 38)</td>
              </tr>
              <tr>
                <td>MITM</td>
                <td>any</td>
                <td>Intercept/alter traffic between two parties</td>
                <td>TLS with certificate validation, HSTS</td>
              </tr>
              <tr>
                <td>Smurf / amplification</td>
                <td>3/7</td>
                <td>Small spoofed request → big response sent to victim (DNS, NTP)</td>
                <td>Disable open resolvers, rate limit</td>
              </tr>
              <tr>
                <td>Session hijacking / XSS / CSRF</td>
                <td>7</td>
                <td>Steal or ride a user's session cookie</td>
                <td>HttpOnly, Secure, SameSite, CSRF tokens</td>
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
          <h4>Firewalls</h4>
          <ul>
            <li>Stateless filter → per packet</li>
            <li>Stateful → tracks connections</li>
            <li>WAF → L7 HTTP</li>
            <li>IDS detects, IPS blocks</li>
          </ul>
        </div>
        <div>
          <h4>Middleboxes</h4>
          <ul>
            <li>Forward proxy → for clients</li>
            <li>Reverse proxy → for servers</li>
            <li>LB: L4 vs L7; round robin, least conn, IP hash</li>
            <li>CDN → edge caching</li>
          </ul>
        </div>
        <div>
          <h4>Attacks</h4>
          <ul>
            <li>SYN flood → SYN cookies</li>
            <li>ARP spoof → DAI</li>
            <li>DNS poison → DNSSEC</li>
            <li>MITM → TLS + HSTS</li>
          </ul>
        </div>
      </div>
    </>
  );
}
