// AUTO-GENERATED from content/15_ch_wireless_vpn.html by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run `npm run content` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
      <section>
        <h2 id="vpn-tunnel"><span className="num">18.1</span>Tunneling</h2>
        <p>Tunneling means <strong>encapsulating one protocol's packet inside another protocol so it can travel through a network</strong>.</p>
        <div className="flow">
          <span>Original Packet</span>
          <span>Encapsulate inside another packet</span>
          <span>Travel through network</span>
          <span>Decapsulate</span>
          <span>Original Packet</span>
        </div>
        <h3 id="vpn-example">Example</h3>
        <p>Two private networks, A and B, are connected only through the Internet. We can create a tunnel between them:</p>
        <pre className="dg">{"Private network A\n      |\n      | Internet\n      |\nPrivate network B\n\nOriginal IP packet\n       ↓\n["}<b>New outer IP header</b>{"\n Original IP packet]\n       ↓\n     Internet\n       ↓\nRemove outer header\n       ↓\nOriginal packet"}</pre>
        <p>The intermediate Internet routers mainly deal with the <strong>outer packet</strong>: they route on the outer header and never look inside. The far end <strong>decapsulates</strong> (removes the outer header) and forwards the original packet as if it had never left the private network.</p>
        <W name="tunnel" />
        <p><span className="add">+ Added</span> Tunneling is everywhere, not just in VPNs: <strong>6in4</strong> carries IPv6 inside IPv4 (see IPv6 transition), <strong>GRE</strong> carries almost anything inside IP, <strong>VXLAN</strong> carries Ethernet frames inside UDP in data centres, and <strong>MPLS</strong> adds labels in front of IP.</p>
        <div className="co qa">
          <span className="lb">One-line interview answer</span>
          <p><strong>What is tunneling?</strong> Encapsulating one protocol packet inside another packet to carry it across a network.</p>
        </div>
      </section>
      <section>
        <h2 id="vpn-what"><span className="num">18.2</span>VPN: Virtual Private Network</h2>
        <p>A VPN uses <strong>tunneling plus security mechanisms</strong> to create a secure connection over an untrusted network such as the Internet.</p>
        <div className="flow">
          <span>Your device</span>
          <span>VPN encryption / tunnel</span>
          <span>Internet</span>
          <span>VPN server</span>
          <span>Destination</span>
        </div>
        <h3 id="vpn-why-vpn">Why VPN?</h3>
        <ul>
          <li><strong>Secure communication over public networks</strong> (café, airport, hostel Wi-Fi)</li>
          <li><strong>Remote access to private company networks</strong> (work from home)</li>
          <li><strong>Protecting traffic from local network observers</strong> (the Wi-Fi owner, your ISP)</li>
          <li><strong>Connecting geographically separated private networks</strong> (branch offices)</li>
        </ul>
        <h3 id="vpn-vpn-tunneling">VPN tunneling</h3>
        <div className="vs">
          <div>
            <h4>Without VPN</h4>
            <pre className="dg" style={{ margin: ".4rem 0 0" }}>Your Device ── Internet ── Server</pre>
          </div>
          <div>
            <h4>With VPN</h4>
            <pre className="dg" style={{ margin: ".4rem 0 0" }}>{"Your Device\n     ↓\n"}<b>Encrypted VPN tunnel</b>{"\n     ↓\nInternet\n     ↓\nVPN Server\n     ↓\nDestination"}</pre>
          </div>
        </div>
        <p>The <strong>original packet is encapsulated inside another packet</strong>. Observers on the path see only encrypted traffic between your device and the VPN server; the destination sees the VPN server's IP, not yours.</p>
        <div className="co qa">
          <span className="lb">One-line interview answer</span>
          <p><strong>What is a VPN?</strong> A secure logical connection over an untrusted network, commonly using tunneling plus encryption/authentication.</p>
        </div>
      </section>
      <section>
        <h2 id="vpn-vs-tunnel"><span className="num">18.3</span>VPN vs tunneling</h2>
        <p>Don't treat them as exactly the same.</p>
        <div className="vs">
          <div><h4>Tunneling</h4>A <strong>technique</strong>: packet inside another packet. On its own it gives <em>no</em> confidentiality.</div>
          <div><h4>VPN</h4>A <strong>networking service / architecture</strong> that commonly uses <strong>tunneling + authentication + encryption/integrity</strong>.</div>
        </div>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Tunneling</th>
                <th>VPN</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>What it is</td>
                <td>Encapsulation technique</td>
                <td>Secure private network built on top of a public one</td>
              </tr>
              <tr>
                <td>Encryption</td>
                <td>Not necessarily (GRE has none)</td>
                <td>Yes (normally)</td>
              </tr>
              <tr>
                <td>Authentication</td>
                <td>Not necessarily</td>
                <td>Yes: both ends prove who they are</td>
              </tr>
              <tr>
                <td>Example</td>
                <td>GRE, 6in4, VXLAN</td>
                <td>IPsec, OpenVPN, WireGuard</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 id="vpn-protocols"><span className="num">18.4</span>VPN protocol examples</h2>
        <p>You may hear: <strong>IPsec, OpenVPN, WireGuard, GRE</strong>.</p>
        <div className="co key">
          <span className="lb">Important distinction</span>
          <p><strong>GRE</strong> provides tunneling/encapsulation but by itself does <strong>not</strong> provide encryption. <strong>IPsec</strong> can provide <strong>authentication, integrity and encryption</strong> depending on the configuration.</p>
        </div>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Protocol</th>
                <th>Layer / transport</th>
                <th>Security</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>GRE</td>
                <td>IP protocol 47</td>
                <td>None</td>
                <td>Generic Routing Encapsulation: carries multicast and routing protocols; often run <strong>inside IPsec</strong> (GRE over IPsec) to get both.</td>
              </tr>
              <tr>
                <td>IPsec</td>
                <td>Network layer; ESP = IP protocol 50, AH = 51; IKE on UDP 500/4500</td>
                <td>Auth + integrity + encryption</td>
                <td>Standard for site-to-site VPNs between routers/firewalls. Protects every IP packet transparently.</td>
              </tr>
              <tr>
                <td>OpenVPN <span className="add">+ Added</span></td>
                <td>Userspace, over UDP or TCP (default 1194)</td>
                <td>TLS for the handshake</td>
                <td>Flexible, open source, works through most firewalls (can run on TCP 443).</td>
              </tr>
              <tr>
                <td>WireGuard <span className="add">+ Added</span></td>
                <td><strong>UDP only</strong> (commonly 51820)</td>
                <td>Modern fixed crypto: Curve25519, ChaCha20-Poly1305</td>
                <td>~4,000 lines of code vs hundreds of thousands, built into Linux; very fast, roams cleanly between networks.</td>
              </tr>
              <tr>
                <td>L2TP/IPsec, SSTP, PPTP <span className="add">+ Added</span></td>
                <td>various</td>
                <td>PPTP is broken</td>
                <td>Older remote-access protocols. L2TP alone has no encryption, hence "L2TP/IPsec".</td>
              </tr>
              <tr>
                <td>SSL/TLS VPN <span className="add">+ Added</span></td>
                <td>HTTPS (443)</td>
                <td>TLS</td>
                <td>Remote access through a browser portal or client; passes firewalls easily.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 id="vpn-ipsec"><span className="num">18.5</span>IPsec in more depth <span className="add">+ Added</span></h2>
        <div className="vs">
          <div>
            <h4>AH: Authentication Header</h4>
            <ul>
              <li>IP protocol 51</li>
              <li>Authentication + integrity (including most of the outer IP header)</li>
              <li><strong>No encryption</strong></li>
              <li>Breaks through NAT (NAT changes the header AH protects)</li>
            </ul>
          </div>
          <div>
            <h4>ESP: Encapsulating Security Payload</h4>
            <ul>
              <li>IP protocol 50</li>
              <li><strong>Encryption</strong> + integrity + authentication of the payload</li>
              <li>What almost everyone uses</li>
              <li>Works through NAT using <strong>NAT-T</strong> (ESP inside UDP 4500)</li>
            </ul>
          </div>
        </div>
        <div className="vs">
          <div><h4>Transport mode</h4>Protects only the <strong>payload</strong>; the original IP header stays. Host-to-host.<pre className="dg" style={{ margin: ".5rem 0 0" }}>[IP hdr][<b>ESP</b>][TCP + data 🔒][ESP trailer]</pre></div>
          <div><h4>Tunnel mode</h4>The <strong>whole original packet</strong> is encrypted and wrapped in a <strong>new outer IP header</strong>. Gateway-to-gateway (site-to-site VPNs).<pre className="dg" style={{ margin: ".5rem 0 0" }}>[<b>New IP</b>][<b>ESP</b>][orig IP + TCP + data 🔒][trailer]</pre></div>
        </div>
        <ul>
          <li><strong>IKE</strong> (Internet Key Exchange, v2 today, UDP 500): the two ends authenticate each other (pre-shared key or certificates) and run Diffie-Hellman to agree on keys.</li>
          <li>The agreed parameters form a <strong>Security Association (SA)</strong>: algorithms, keys and lifetime, one per direction, identified by an SPI number in each ESP packet.</li>
          <li>Classic two phases: Phase 1 builds a secure channel for IKE itself; Phase 2 negotiates the SAs that protect the data.</li>
        </ul>
      </section>
      <section>
        <h2 id="vpn-types"><span className="num">18.6</span>VPN types</h2>
        <div className="vs">
          <div><h4>Remote-access VPN</h4>An <strong>individual user</strong> connects to an organisation.<pre className="dg" style={{ margin: ".5rem 0 0" }}>Employee → Internet → Company Network</pre></div>
          <div><h4>Site-to-site VPN</h4><strong>Two networks</strong> are connected.<pre className="dg" style={{ margin: ".5rem 0 0" }}>Office A ←── VPN ──→ Office B</pre></div>
        </div>
        <W name="vpntypes" />
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Remote access</th>
                <th>Site-to-site</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Who connects</td>
                <td>One device (laptop, phone)</td>
                <td>Two gateways (routers / firewalls)</td>
              </tr>
              <tr>
                <td>Client software</td>
                <td>Needed on the device</td>
                <td>None on hosts: transparent to users</td>
              </tr>
              <tr>
                <td>Typical protocol</td>
                <td>SSL/TLS VPN, OpenVPN, WireGuard, IKEv2</td>
                <td>IPsec tunnel mode</td>
              </tr>
              <tr>
                <td>Always on?</td>
                <td>When the user connects</td>
                <td>Permanently</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p><span className="add">+ Added</span> <strong>Split tunneling</strong>: only traffic for the company network goes through the VPN; everything else (YouTube, updates) goes straight to the Internet. Saves bandwidth, but that traffic isn't protected or inspected. <strong>Full tunnel</strong> sends everything through the VPN.</p>
      </section>
      <section>
        <h2 id="vpn-proxy"><span className="num">18.7</span>VPN vs proxy, and common misconceptions <span className="add">+ Added</span></h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>VPN</th>
                <th>Proxy</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Layer</td>
                <td>Network (all IP traffic of the device)</td>
                <td>Application (one app or protocol, e.g. the browser)</td>
              </tr>
              <tr>
                <td>Encryption</td>
                <td>Yes, device ↔ VPN server</td>
                <td>Usually not (an HTTP proxy just forwards)</td>
              </tr>
              <tr>
                <td>Setup</td>
                <td>OS-level client / virtual network interface</td>
                <td>Per-application setting</td>
              </tr>
              <tr>
                <td>Hides your IP from the site</td>
                <td>Yes</td>
                <td>Yes</td>
              </tr>
              <tr>
                <td>Typical use</td>
                <td>Security on untrusted networks, corporate access</td>
                <td>Filtering, caching, simple IP masking</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul>
          <li>A VPN does <strong>not</strong> make you anonymous: the VPN provider sees all your traffic metadata, and the site still sees cookies and logins.</li>
          <li>The VPN only encrypts up to the VPN server. From there to the website you still need <strong>HTTPS</strong>.</li>
          <li><strong>MTU overhead</strong>: every tunnel adds headers (IPsec ~50–70 bytes, WireGuard 60–80), so the inner MTU shrinks. VPN gateways clamp TCP MSS to avoid fragmentation.</li>
        </ul>
      </section>
      <section>
        <h2 id="vpn-must"><span className="num">18.8</span>Placement must-remember</h2>
        <div className="co key">
          <span className="lb">{"Tunneling & VPN"}</span>
          <span className="fx">Tunneling → packet inside another packet</span>
          <span className="fx">VPN → secure private communication over a public network</span>
          <span className="fx">VPN = tunneling + authentication + encryption/integrity</span>
          <span className="fx">GRE → tunneling only, no encryption</span>
          <span className="fx">IPsec → authentication + integrity + encryption</span>
          <span className="fx">Remote-access (user → company) vs site-to-site (office ↔ office)</span>
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
          <h4>Tunneling</h4>
          <ul>
            <li>Packet inside another packet</li>
            <li>Outer IP header; routers only see the outer one</li>
            <li>Decapsulate at the far end</li>
            <li>GRE, 6in4, VXLAN</li>
          </ul>
        </div>
        <div>
          <h4>VPN</h4>
          <ul>
            <li>Tunnel + authentication + encryption/integrity</li>
            <li>Public Wi-Fi, remote access, hide from local observers, connect sites</li>
            <li>Not anonymity; still need HTTPS</li>
          </ul>
        </div>
        <div>
          <h4>Protocols</h4>
          <ul>
            <li>GRE (proto 47): no encryption</li>
            <li>IPsec: ESP (50) encrypts, AH (51) auth only; IKE UDP 500</li>
            <li>WireGuard: UDP; OpenVPN: TLS</li>
          </ul>
        </div>
        <div>
          <h4>IPsec modes</h4>
          <ul>
            <li>Transport: payload only, host-to-host</li>
            <li>Tunnel: whole packet + new IP header, site-to-site</li>
          </ul>
        </div>
        <div>
          <h4>Types</h4>
          <ul>
            <li>Remote access: user → company</li>
            <li>Site-to-site: office ↔ office</li>
            <li>Split vs full tunnel</li>
            <li>VPN (L3, all traffic) vs proxy (L7, one app)</li>
          </ul>
        </div>
      </div>
    </>
  );
}
