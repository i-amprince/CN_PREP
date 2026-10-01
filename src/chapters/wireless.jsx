// AUTO-GENERATED from content/15_ch_wireless_vpn.html by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run `npm run content` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
      <p>Now the important Wi-Fi concepts. Most of the access-control ideas were introduced in the <a href="#/ch/access">Medium access</a> chapter; here they come together for wireless LANs.</p>
      <section>
        <h2 id="wl-80211"><span className="num">17.1</span>IEEE 802.11: where Wi-Fi sits</h2>
        <p>Wireless LAN is commonly based on <strong>IEEE 802.11</strong>. Wi-Fi operates primarily at the <strong>Physical layer</strong> and the <strong>Data Link layer</strong>.</p>
        <div className="vs">
          <div><h4>Physical layer</h4>Radio: frequency bands, channels, modulation (OFDM), MIMO antennas, data rates.</div>
          <div><h4>Data Link layer</h4>802.11 MAC: framing, MAC addresses, CSMA/CA, ACKs, RTS/CTS, association with an access point. LLC on top, exactly like Ethernet.</div>
        </div>
        <p><span className="add">+ Added</span> Everything from IP upwards is identical on Wi-Fi and Ethernet. The access point converts 802.11 frames to Ethernet frames, so the rest of the network doesn't care that you're wireless.</p>
      </section>
      <section>
        <h2 id="wl-why-ca"><span className="num">17.2</span>Why Wi-Fi uses CSMA/CA instead of CSMA/CD</h2>
        <p>Ethernet historically used <strong>CSMA/CD</strong>. Wi-Fi uses <strong>CSMA/CA</strong>, because <strong>detecting collisions while transmitting wirelessly is difficult</strong>. So Wi-Fi tries to <strong>avoid</strong> collisions rather than detect them after they happen.</p>
        <div className="co added">
          <span className="lb">+ Added · the three reasons, precisely</span>
          <ul>
            <li><strong>Your own signal drowns everything else.</strong> A radio's transmitted power is millions of times stronger than any signal it could receive at the same moment, so it can't "listen while talking".</li>
            <li><strong>Radios are half-duplex.</strong> Most Wi-Fi radios can't transmit and receive on the same channel simultaneously.</li>
            <li><strong>Hidden terminals.</strong> Even if the sender could listen, the collision happens at the <em>receiver</em>, which the sender may not be able to hear (see 17.4).</li>
          </ul>
          <p>Consequence: every unicast data frame must be <strong>acknowledged</strong>. A missing ACK is the only way the sender learns that something went wrong.</p>
        </div>
        <div className="co qa">
          <span className="lb">One-line interview answer</span>
          <p><strong>Why CSMA/CA?</strong> Because collision detection is difficult in wireless networks, so Wi-Fi tries to avoid collisions.</p>
        </div>
      </section>
      <section>
        <h2 id="wl-ca"><span className="num">17.3</span>CSMA/CA process</h2>
        <p>Basic flow: sense the channel; if it is busy, wait; if it is free, do a random backoff, then transmit and wait for the ACK. If the ACK comes back, done; if not, back off again and retry. Step through it:</p>
        <W name="flow-csmaca" />
        <pre className="dg">{"Sense channel\n      ↓\nIs it busy?\n  ↓         ↓\n "}<b>YES</b>       <b>NO</b>{"\n  ↓         ↓\nWait     Random Backoff\n             ↓\n          Transmit\n             ↓\n           ACK?\n          /    \\\n        Yes     No\n        ↓        ↓\n      Done    Backoff + Retry"}</pre>
        <p><strong>Random backoff is important</strong> because otherwise multiple waiting devices could transmit simultaneously: they would all see the channel go idle at the same instant and all jump in together.</p>
        <div className="co added">
          <span className="lb">+ Added · timing details (DIFS, SIFS, NAV, contention window)</span>
          <ul>
            <li><strong>DIFS</strong> (DCF Inter-Frame Space): how long the channel must be idle before a station may start its backoff countdown.</li>
            <li><strong>SIFS</strong>{" (Short IFS): the shorter gap before an ACK, CTS or the next fragment. Because SIFS < DIFS, responses always win the race against new transmissions."}</li>
            <li><strong>Backoff</strong>: pick a random number of slots in [0, CW]. The counter only decrements while the channel is idle and freezes when it's busy. CW starts at 15 and roughly doubles after each failed attempt (31, 63 … 1023), just like binary exponential backoff.</li>
            <li><strong>NAV</strong> (Network Allocation Vector): "virtual carrier sense". Every frame carries a Duration field; stations that hear it set a timer and stay silent until it expires, even if they can't physically sense the carrier.</li>
          </ul>
        </div>
      </section>
      <section>
        <h2 id="wl-hidden"><span className="num">17.4</span>Hidden terminal problem and RTS/CTS</h2>
        <p>Very important interview question. <strong>A and C cannot hear each other, but both can communicate with B.</strong> A thinks "channel is free"; C also thinks "channel is free". Both transmit to B → <strong>collision at B</strong>. This is the hidden terminal problem.</p>
        <pre className="dg">{"A -----> B <----- C\n\nA ───────→ B\nC ───────→ B\n       "}<b>COLLISION</b></pre>
        <W name="hidden" />
        <p>Wi-Fi can use <strong>RTS = Request To Send</strong> and <strong>CTS = Clear To Send</strong>:</p>
        <div className="flow">
          <span>Sender → RTS → Receiver</span>
          <span>Sender ← CTS ← Receiver</span>
          <span>Sender → DATA → Receiver</span>
          <span>Sender ← ACK ← Receiver</span>
        </div>
        <p>Other devices hearing the CTS know: <strong>don't transmit now</strong>. This helps reduce the hidden terminal problem. C can't hear A's RTS, but it <em>can</em> hear B's CTS.</p>
        <W name="seq-rtscts" />
        <div className="co added">
          <span className="lb">+ Added · RTS/CTS in practice, and the exposed terminal recap</span>
          <ul>
            <li>RTS/CTS costs two extra frames, so it is optional and usually only used for frames larger than the <strong>RTS threshold</strong>.</li>
            <li><strong>Exposed terminal</strong> (the opposite problem): B is sending to A; C hears B and wrongly stays silent, even though C's transmission to D would not interfere at A. Capacity is wasted. RTS/CTS doesn't fully solve this one.</li>
          </ul>
        </div>
      </section>
      <section>
        <h2 id="wl-ap"><span className="num">17.5</span>Wi-Fi access point</h2>
        <p>An <strong>Access Point (AP)</strong> connects wireless devices to a wired network. The AP provides wireless network access.</p>
        <pre className="dg">{"Laptop ))))\n          \\\n           "}<b>AP</b>{" ─── Switch ─── Router ─── Internet\n          /\nPhone ))))"}</pre>
        <p><span className="add">+ Added</span> An AP is a <strong>Layer-2 bridge</strong> between 802.11 and Ethernet: it doesn't route. The box at home called a "Wi-Fi router" is really several devices in one: <strong>router + switch + AP + DHCP server + NAT + firewall</strong>.</p>
      </section>
      <section>
        <h2 id="wl-modes"><span className="num">17.6</span>Infrastructure mode vs ad hoc mode</h2>
        <div className="vs">
          <div><h4>Infrastructure mode</h4>Devices communicate <strong>through an AP</strong>.<pre className="dg" style={{ margin: ".5rem 0 0" }}>{"Laptop ──┐\nPhone ───┼── "}<b>AP</b>{"\nTablet ──┘"}</pre></div>
          <div><h4>Ad hoc mode</h4>Devices communicate <strong>directly with each other</strong> without a central AP (IBSS). <span className="add">+ Added</span> Modern equivalents: Wi-Fi Direct (phone-to-printer, screen casting).</div>
        </div>
        <W name="wlanmodes" />
        <div className="co added">
          <span className="lb">+ Added · SSID, BSSID, BSS, ESS, roaming</span>
          <ul>
            <li><strong>SSID</strong>: the network name you see ("CampusWiFi"). Up to 32 bytes.</li>
            <li><strong>BSSID</strong>: the MAC address of one AP's radio. One SSID can have many BSSIDs.</li>
            <li><strong>BSS</strong> (Basic Service Set): one AP and its associated stations. Ad hoc = IBSS (independent BSS).</li>
            <li><strong>ESS</strong> (Extended Service Set): several APs with the same SSID joined by a wired distribution system, e.g. a campus.</li>
            <li><strong>Roaming</strong>: as you walk, your device re-associates to the AP with the stronger signal, keeping the same IP because the whole ESS is one Layer-2 network. 802.11r/k/v make it faster.</li>
          </ul>
        </div>
      </section>
      <section>
        <h2 id="wl-bands"><span className="num">17.7</span>Frequency bands and channels <span className="add">+ Added</span></h2>
        <W name="wifibands" />
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Band</th>
                <th>Range</th>
                <th>Speed</th>
                <th>Channels</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2.4 GHz</td>
                <td>Longest, best through walls</td>
                <td>Lowest</td>
                <td>Only <strong>3 non-overlapping</strong>: 1, 6, 11 (20 MHz)</td>
                <td>Crowded: microwaves, Bluetooth, neighbours</td>
              </tr>
              <tr>
                <td>5 GHz</td>
                <td>Medium</td>
                <td>High</td>
                <td>Many (20/40/80/160 MHz)</td>
                <td>Some channels need DFS (radar detection)</td>
              </tr>
              <tr>
                <td>6 GHz</td>
                <td>Shortest</td>
                <td>Highest</td>
                <td>Lots of clean spectrum, 320 MHz wide in Wi-Fi 7</td>
                <td>Wi-Fi 6E and 7 only; WPA3 required</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>Rule of thumb: <strong>higher frequency = more bandwidth and speed, but shorter range and worse wall penetration</strong>. Wider channels carry more data but there are fewer of them, so they interfere more.</p>
      </section>
      <section>
        <h2 id="wl-gen"><span className="num">17.8</span>Wi-Fi generations <span className="add">+ Added</span></h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Standard</th>
                <th>Year</th>
                <th>Bands</th>
                <th>Max rate (theoretical)</th>
                <th>Key idea</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>(legacy)</td>
                <td>802.11b / a / g</td>
                <td>1999–2003</td>
                <td>2.4 / 5 / 2.4</td>
                <td className="n">11 / 54 / 54 Mbps</td>
                <td>DSSS (b), OFDM (a, g)</td>
              </tr>
              <tr>
                <td>Wi-Fi 4</td>
                <td>802.11n</td>
                <td>2009</td>
                <td>2.4 + 5</td>
                <td className="n">600 Mbps</td>
                <td>MIMO, 40 MHz channels</td>
              </tr>
              <tr>
                <td>Wi-Fi 5</td>
                <td>802.11ac</td>
                <td>2013</td>
                <td>5</td>
                <td className="n">~3.5–6.9 Gbps</td>
                <td>MU-MIMO (downlink), 80/160 MHz</td>
              </tr>
              <tr>
                <td>Wi-Fi 6</td>
                <td>802.11ax</td>
                <td>2019</td>
                <td>2.4 + 5</td>
                <td className="n">~9.6 Gbps</td>
                <td><strong>OFDMA</strong> (many users per transmission), target wake time, better in crowds</td>
              </tr>
              <tr>
                <td>Wi-Fi 6E</td>
                <td>802.11ax</td>
                <td>2020</td>
                <td>+ 6 GHz</td>
                <td className="n">~9.6 Gbps</td>
                <td>Same as Wi-Fi 6, new 6 GHz spectrum</td>
              </tr>
              <tr>
                <td>Wi-Fi 7</td>
                <td>802.11be</td>
                <td>2024</td>
                <td>2.4 + 5 + 6</td>
                <td className="n">~46 Gbps</td>
                <td>320 MHz channels, <strong>Multi-Link Operation</strong>, 4096-QAM</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>Real throughput is typically a third to a half of the headline number: the air is shared, half-duplex, and full of ACKs and inter-frame gaps.</p>
      </section>
      <section>
        <h2 id="wl-security"><span className="num">17.9</span>Wi-Fi security <span className="add">+ Added</span></h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Protocol</th>
                <th>Encryption</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Open</td>
                <td>None</td>
                <td>Anyone nearby can read traffic (use HTTPS / VPN). OWE ("Enhanced Open") adds encryption without a password.</td>
              </tr>
              <tr>
                <td>WEP</td>
                <td>RC4 with a static key and 24-bit IV</td>
                <td><strong>Broken</strong>: cracked in minutes. Never use.</td>
              </tr>
              <tr>
                <td>WPA</td>
                <td>TKIP (RC4 with per-packet keys)</td>
                <td>Stop-gap from 2003; deprecated.</td>
              </tr>
              <tr>
                <td>WPA2</td>
                <td><strong>AES-CCMP</strong></td>
                <td>Standard since 2004. Uses a 4-way handshake to derive per-session keys. Weakness: offline dictionary attacks on captured handshakes (PSK), KRACK (patched).</td>
              </tr>
              <tr>
                <td>WPA3</td>
                <td>AES (GCMP-256 in Enterprise)</td>
                <td><strong>SAE</strong> (Simultaneous Authentication of Equals, "Dragonfly") replaces PSK: resists offline password guessing and gives forward secrecy. Required for 6 GHz.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul>
          <li><strong>Personal</strong> (PSK / SAE): one shared password. Home networks.</li>
          <li><strong>Enterprise</strong> (802.1X): each user logs in with their own credentials, checked by a RADIUS server using EAP. Campus and office networks (e.g. eduroam).</li>
          <li>MAC filtering and hiding the SSID are <strong>not</strong> security: MACs are trivially spoofed and hidden SSIDs still appear in probe requests.</li>
        </ul>
      </section>
      <section>
        <h2 id="wl-frame"><span className="num">17.10</span>The 802.11 frame, beacons and joining a network <span className="add">+ Added</span></h2>
        <p>An 802.11 frame header has up to <strong>four MAC address fields</strong> (Ethernet has two):</p>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Address 1</td>
                <td>Receiver (the next radio to receive it: AP or station)</td>
              </tr>
              <tr>
                <td>Address 2</td>
                <td>Transmitter (the radio sending it right now)</td>
              </tr>
              <tr>
                <td>Address 3</td>
                <td>The other end: the final destination (or original source) on the wired side, or the BSSID</td>
              </tr>
              <tr>
                <td>Address 4</td>
                <td>Only used when frames are relayed AP-to-AP (wireless distribution system / mesh)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>The <strong>Frame Control</strong> field has <em>To DS / From DS</em> bits that say which addresses mean what; the <strong>Duration</strong> field sets other stations' NAV; the frame ends with a CRC-32 <strong>FCS</strong>.</p>
        <ul>
          <li><strong>Management frames</strong>: beacon, probe request/response, authentication, association.</li>
          <li><strong>Control frames</strong>: RTS, CTS, ACK.</li>
          <li><strong>Data frames</strong>: your actual packets.</li>
        </ul>
        <p><strong>Beacon frames</strong>: an AP broadcasts a beacon about every 102.4 ms announcing its SSID, supported rates, security and timing. Devices find networks by <strong>passive scanning</strong> (listen for beacons) or <strong>active scanning</strong> (send probe requests).</p>
        <div className="flow">
          <span>Scan (beacons / probes)</span>
          <span>Authenticate (open system, or SAE in WPA3)</span>
          <span>Associate with the AP (gets an association ID)</span>
          <span>WPA2/WPA3 4-way handshake → encryption keys</span>
          <span>DHCP → IP address, gateway, DNS</span>
          <span>Ready: ARP, DNS, TCP… as on any LAN</span>
        </div>
      </section>
      <section>
        <h2 id="wl-must"><span className="num">17.11</span>Placement must-remember</h2>
        <div className="co key">
          <span className="lb">Wireless</span>
          <span className="fx">Wi-Fi → IEEE 802.11</span>
          <span className="fx">Wi-Fi → CSMA/CA</span>
          <span className="fx">Ethernet → historically CSMA/CD</span>
          <span className="fx">Hidden terminal → RTS/CTS</span>
          <span className="fx">AP → connects wireless devices to network</span>
        </div>
        <div className="co added">
          <span className="lb">+ Added · also good to know</span>
          <ul>
            <li><strong>Bluetooth</strong> = IEEE 802.15.1, a PAN technology in the 2.4 GHz band (frequency hopping, ~10 m). Bluetooth Low Energy for wearables and sensors.</li>
            <li><strong>Cellular</strong> (4G LTE, 5G) is a WAN technology run by carriers; your phone gets an IP from the carrier, usually behind carrier-grade NAT.</li>
            <li>Wi-Fi throughput drops for everyone when one slow, distant client is connected, because airtime is shared (the "rate anomaly").</li>
          </ul>
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
          <h4>Basics</h4>
          <ul>
            <li>Wi-Fi = IEEE 802.11, Physical + Data Link</li>
            <li>CSMA/CA, not CD: can't hear collisions while sending</li>
            <li>Every unicast frame is ACKed</li>
          </ul>
        </div>
        <div>
          <h4>CSMA/CA</h4>
          <ul>
            <li>Sense → busy? wait : random backoff → transmit → ACK?</li>
            <li>No ACK → backoff (CW doubles) + retry</li>
            <li>{"SIFS < DIFS; NAV = virtual carrier sense"}</li>
          </ul>
        </div>
        <div>
          <h4>Hidden terminal</h4>
          <ul>
            <li>A and C can't hear each other → collide at B</li>
            <li>RTS → CTS → DATA → ACK</li>
            <li>Others hear CTS and stay quiet</li>
            <li>Exposed terminal = needless silence</li>
          </ul>
        </div>
        <div>
          <h4>Topology</h4>
          <ul>
            <li>AP = L2 bridge wireless ↔ wired</li>
            <li>Infrastructure (via AP) vs ad hoc (direct)</li>
            <li>SSID name · BSSID = AP MAC · ESS = many APs, roaming</li>
          </ul>
        </div>
        <div>
          <h4>{"Bands & generations"}</h4>
          <ul>
            <li>2.4 GHz: range, channels 1/6/11</li>
            <li>5/6 GHz: speed, shorter range</li>
            <li>Wi-Fi 4/5/6/6E/7 = n/ac/ax/ax/be</li>
          </ul>
        </div>
        <div>
          <h4>Security</h4>
          <ul>
            <li>WEP broken → WPA (TKIP) → WPA2 (AES-CCMP) → WPA3 (SAE)</li>
            <li>Personal (password) vs Enterprise (802.1X)</li>
            <li>802.11 frame: up to 4 MAC addresses</li>
          </ul>
        </div>
      </div>
    </>
  );
}
