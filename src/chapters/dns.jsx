// AUTO-GENERATED from content/14_ch_dns_http_tls_security.html by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run `npm run content` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
      <p>The Application layer is where the protocols apps actually use live. Starting with DNS + DHCP, because they explain how a device gets an address and finds a server.</p>
      <section>
        <h2 id="dns-what"><span className="num">13.1</span>DNS: Domain Name System</h2>
        <p>Humans prefer <code>google.com</code>; computers communicate using <code>142.x.x.x</code>. DNS maps <strong>domain name → IP address</strong> (name resolution). Think of it as the Internet's <strong>distributed, hierarchical phonebook</strong>.</p>
        <p><strong>Transport</strong>: DNS commonly uses <strong>UDP port 53</strong>; it also uses <strong>TCP port 53</strong> for zone transfers and for responses too large for UDP (and when the truncation flag is set). Don't say "DNS = UDP only".</p>
        <p><span className="add">+ Added</span> Modern encrypted variants: <strong>DoT</strong> (DNS over TLS, port 853) and <strong>DoH</strong> (DNS over HTTPS, 443).</p>
      </section>
      <section>
        <h2 id="dns-hier"><span className="num">13.2</span>Hierarchy and the resolution walk</h2>
        <ul className="tree">
          <li><span className="t">. (Root)</span> <em>13 root server identities, hundreds of anycast instances</em><ul><li><span className="t">.com</span> <em>TLD server</em><ul><li><span className="t">google.com</span> <em>authoritative server → A record</em></li></ul></li><li><span className="t">.org</span></li><li><span className="t">.in</span><ul><li>co.in · ac.in</li></ul></li></ul></li>
        </ul>
        <ul>
          <li><strong>Root servers</strong> know where the TLD servers are.</li>
          <li><strong>TLD servers</strong> (.com, .org, .in, .edu) point to the authoritative server for the domain.</li>
          <li><strong>Authoritative server</strong> holds the actual records: google.com → IP.</li>
          <li><strong>Recursive resolver</strong> (your ISP's, 8.8.8.8, 1.1.1.1) does the walking for you and caches the answers.</li>
        </ul>
        <W name="seq-dns" />
        <p>Cache order before any of this: <strong>browser cache → OS cache (and hosts file) → resolver cache → hierarchy</strong>.</p>
      </section>
      <section>
        <h2 id="dns-rec"><span className="num">13.3</span>Recursive vs iterative queries</h2>
        <div className="vs">
          <div><h4>Recursive</h4>Client asks the resolver: "Give me the <strong>final answer</strong>." The resolver does all the work. (Your laptop → resolver.)</div>
          <div><h4>Iterative</h4>The server replies with the best it has: "I don't know, but ask <em>this</em> server." The resolver follows the referrals. (Resolver → root → TLD → authoritative.)</div>
        </div>
      </section>
      <section>
        <h2 id="dns-cache"><span className="num">13.4</span>Caching and TTL</h2>
        <p>If you visited google.com recently, its IP may be cached → cache hit → no lookup. Every DNS record has a <strong>TTL in seconds</strong> that controls how long it may be cached. Don't confuse it with the IP packet TTL (hop count). <span className="add">+ Added</span> Low TTLs allow fast failover/migration; high TTLs reduce load. That is why DNS changes "take time to propagate".</p>
      </section>
      <section>
        <h2 id="dns-records"><span className="num">13.5</span>Record types</h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Maps</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>A</td>
                <td>Name → IPv4</td>
                <td className="n">google.com → 142.250.x.x</td>
              </tr>
              <tr>
                <td>AAAA</td>
                <td>Name → IPv6</td>
                <td className="n">google.com → 2404:6800::…</td>
              </tr>
              <tr>
                <td>CNAME</td>
                <td>Alias → another name</td>
                <td className="n">www.example.com → example.com</td>
              </tr>
              <tr>
                <td>MX</td>
                <td>Mail server for the domain (with priority)</td>
                <td className="n">gmail.com → 5 gmail-smtp-in…</td>
              </tr>
              <tr>
                <td>NS</td>
                <td>Authoritative name server</td>
                <td className="n">example.com → ns1.example.com</td>
              </tr>
              <tr>
                <td>TXT</td>
                <td>Free text: domain verification, SPF/DKIM/DMARC email policies</td>
                <td className="n">"v=spf1 include:…"</td>
              </tr>
              <tr>
                <td>PTR <span className="add">+ Added</span></td>
                <td>IP → name (reverse DNS, in-addr.arpa)</td>
                <td className="n">8.8.8.8 → dns.google</td>
              </tr>
              <tr>
                <td>SOA <span className="add">+ Added</span></td>
                <td>Start of authority: zone admin info, serial, timers</td>
                <td></td>
              </tr>
              <tr>
                <td>SRV <span className="add">+ Added</span></td>
                <td>Service location (host + port)</td>
                <td className="n">_sip._tcp.example.com</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p><span className="add">+ Added</span> A CNAME can't coexist with other records at the same name (so not at the zone apex). <strong>DNS spoofing / cache poisoning</strong> injects fake answers into a resolver's cache; <strong>DNSSEC</strong> signs records to prevent it.</p>
      </section>
      <section>
        <h2 id="dhcp"><span className="num">13.6</span>DHCP and DORA</h2>
        <p><strong>Dynamic Host Configuration Protocol</strong> automatically gives a device its network configuration: <strong>IP address, subnet mask, default gateway, DNS server</strong> (and a lease time). Without it you'd configure these manually.</p>
        <p>DHCP uses <strong>UDP: server port 67, client port 68</strong>.</p>
        <W name="seq-dhcp" />
        <p><strong>Why broadcast at first?</strong> The client has no IP address yet and doesn't know the DHCP server's IP, so it must shout on the local network (source 0.0.0.0, destination 255.255.255.255).</p>
        <div className="co added">
          <span className="lb">+ Added · leases and relays</span>
          <ul>
            <li>Addresses are <strong>leased</strong>. At <strong>T1 = 50%</strong> of the lease the client unicasts a renewal REQUEST to the same server; at <strong>T2 = 87.5%</strong> it broadcasts to any server.</li>
            <li>The REQUEST is broadcast so other servers that sent OFFERs know they weren't chosen.</li>
            <li><strong>DHCP relay agent</strong> (ip helper) on a router forwards broadcasts to a central DHCP server on another subnet.</li>
            <li>DHCP RELEASE gives the address back; DECLINE says "that IP is already in use".</li>
            <li>Attacks: <strong>rogue DHCP server</strong> (hands out a fake gateway) and <strong>DHCP starvation</strong>; defence = DHCP snooping on switches.</li>
          </ul>
        </div>
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
                <td>Resolves names</td>
                <td>Configures hosts</td>
              </tr>
              <tr>
                <td>Domain → IP</td>
                <td>Assigns IP + mask + gateway + DNS</td>
              </tr>
              <tr>
                <td>UDP/TCP 53</td>
                <td>UDP 67/68</td>
              </tr>
              <tr>
                <td>"What IP belongs to this domain?"</td>
                <td>"What network configuration should I use?"</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 id="app-other"><span className="num">13.7</span>Other application protocols</h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Protocol</th>
                <th>Port</th>
                <th>Purpose / notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>FTP</td>
                <td className="n">21 control, 20 data</td>
                <td>File transfer. Two connections ("out-of-band" control). <span className="add">+ Added</span> <strong>Active mode</strong>: server connects back to the client from port 20 (breaks behind NAT). <strong>Passive mode</strong>: client opens both connections. Credentials in plain text; use SFTP (over SSH) or FTPS.</td>
              </tr>
              <tr>
                <td>SSH</td>
                <td className="n">22</td>
                <td>Secure remote shell, encrypted. Also SFTP/SCP and port forwarding.</td>
              </tr>
              <tr>
                <td>Telnet <span className="add">+ Added</span></td>
                <td className="n">23</td>
                <td>Remote shell in plain text. Insecure; replaced by SSH.</td>
              </tr>
              <tr>
                <td>SMTP</td>
                <td className="n">25 / 587 / 465</td>
                <td>Sending email: client → server and server → server. 587 = submission with STARTTLS, 465 = implicit TLS.</td>
              </tr>
              <tr>
                <td>POP3 <span className="add">+ Added</span></td>
                <td className="n">110 / 995</td>
                <td>Receiving: downloads mail and (by default) deletes it from the server. One device.</td>
              </tr>
              <tr>
                <td>IMAP <span className="add">+ Added</span></td>
                <td className="n">143 / 993</td>
                <td>Receiving: mail stays on the server, folders sync across devices.</td>
              </tr>
              <tr>
                <td>SNMP <span className="add">+ Added</span></td>
                <td className="n">UDP 161 / 162</td>
                <td>Network device monitoring; 162 = traps.</td>
              </tr>
              <tr>
                <td>NTP <span className="add">+ Added</span></td>
                <td className="n">UDP 123</td>
                <td>Clock synchronisation.</td>
              </tr>
              <tr>
                <td>RDP <span className="add">+ Added</span></td>
                <td className="n">3389</td>
                <td>Windows remote desktop.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>Email flow: <strong>sender's client → (SMTP) → sender's mail server → (SMTP, found via MX record) → recipient's mail server → (IMAP/POP3) → recipient's client</strong>.</p>
      </section>
    </>
  );
}

export function Quick() {
  return (
    <>
      <div className="quick-grid">
        <div>
          <h4>DNS</h4>
          <ul>
            <li>Name → IP, port 53, UDP (TCP too)</li>
            <li>Root → TLD → Authoritative</li>
            <li>Client→resolver recursive; resolver→servers iterative</li>
            <li>DNS TTL = cache seconds</li>
          </ul>
        </div>
        <div>
          <h4>Records</h4>
          <ul>
            <li>A IPv4 · AAAA IPv6 · CNAME alias</li>
            <li>MX mail · NS name server · TXT text</li>
            <li>PTR reverse · SOA zone info</li>
          </ul>
        </div>
        <div>
          <h4>DHCP</h4>
          <ul>
            <li>UDP 67 server / 68 client</li>
            <li>Discover → Offer → Request → ACK</li>
            <li>Broadcast: no IP yet</li>
            <li>Renew at 50%, rebind at 87.5%</li>
          </ul>
        </div>
        <div>
          <h4>Ports</h4>
          <ul>
            <li>FTP 20/21 · SSH 22 · Telnet 23 · SMTP 25</li>
            <li>POP3 110 · IMAP 143 · SNMP 161 · NTP 123</li>
          </ul>
        </div>
      </div>
    </>
  );
}
