# Packet Notes: Computer Networks Revision Website · Handoff Brief

This brief is for Claude Code. It describes a revision website for **Computer Networks** (placement / interview / GATE-style prep) that was planned and partly written in a claude.ai chat. Read this whole file first, then the files it points to.

---

## 1. Goal

A beautiful, simple, engaging website for revising **all of Computer Networks**, built from the owner's notes. It should:

- keep **every** point from the owner's notes (nothing dropped),
- fill gaps with missing concepts (already done for 17 chapters; marked **"+ Added"**),
- highlight important points (must-remember boxes, interview traps),
- replace ASCII art with **real diagrams and interactive/animated visuals** wherever useful,
- have a **Study mode** (full notes) and a **Quick mode** (one-page quick sheet per chapter),
- have **flashcards and a quiz for every chapter**, plus a mixed Practice page,
- track progress (chapters done, quiz best scores),
- look good on phone and laptop, in light and dark themes.

## 2. What's in this folder

| Path | What it is |
|---|---|
| `source-notes/original-notes.txt` | The owner's complete original notes. **Source of truth.** Every point here must appear somewhere on the site. |
| `content-draft/00_design-tokens-and-css.html` | Finished design system: colour tokens (light + dark), fonts, and CSS for every component. Port these tokens; keep the look. |
| `content-draft/01_layout-shell.html` | Layout markup: sidebar, top bar (search, Study/Quick toggle, theme toggle), home hero, Practice view. |
| `content-draft/10_…` to `14_…` | **Finished chapter content** for 17 chapters, as HTML. Each `<article data-ch="id">` has a `.notes` pane and a `.quick-sheet` pane. Interactive widgets are placeholders: `<div class="wg" data-wg="name">`. |

The chapter HTML is final, reviewed content. **Convert it into components rather than rewriting it.** Keep the wording, tables, callouts and "+ Added" tags.

## 3. Recommended stack

Default: **React + Vite + TypeScript, static build** (deploy free on Vercel / Netlify / GitHub Pages). No backend is needed for reading notes.

- Routing: `react-router` (hash routes are fine), one route per chapter plus `/`, `/practice`, `/cheatsheet`.
- Styling: port the CSS from `00_design-tokens-and-css.html` into a global stylesheet or CSS modules. Keep the token names. Don't switch to a generic UI kit look.
- Content: one component (or MDX file) per chapter. Flashcards and quiz questions in `src/data/<chapter>.ts`.
- Progress: `localStorage`, wrapped in try/catch.

**Optional phase (only if the owner wants it): MERN.** Add Express + MongoDB + auth (JWT in an HttpOnly cookie) **only** to sync progress, quiz scores and bookmarks across devices. The content itself stays static in the frontend. Build the static site first and add the backend afterwards.

## 4. Design system (already decided, see the CSS file)

- **Concept**: the 5 main layers use the **T568B Ethernet cable pair colours**: Application = orange, Transport = green, Network = blue, Data Link = brown, Physical = slate. Each chapter is tinted by its layer colour (`--lc`).
- **Fonts** (Google Fonts): Bricolage Grotesque (display), IBM Plex Sans (body), IBM Plex Mono (diagrams/data).
- **Neutrals**: cool green-grey, not cream. Light and dark palettes are both defined.
- **Components**: callouts `.co.key` (MUST REMEMBER), `.co.trap` (INTERVIEW TRAP), `.co.added` (+ ADDED), `.co.formula`, `.co.qa`; comparison tables `.tbl`; side-by-side `.vs`; CSS tree diagrams `.tree`; flow chains `.flow`; widget card `.wg`; step timeline `.steps`; flip flashcards `.fc`; quiz `.qq`.
- Respect `prefers-reduced-motion`. No horizontal page scroll at 400 px width.

## 5. Chapters (21) and status

| Unit | # | id | Title | Layer colour | Status |
|---|---|---|---|---|---|
| 0 Foundations | 0 | basics | Network basics (types, topologies, switching, delays, media) | l1 | ✅ written (all + Added) |
| 1 Architecture | 1 | osi | OSI & TCP/IP | l7 | ✅ written |
| 2 Data Link | 2 | datalink | Data Link & Ethernet (frame, MAC, switch learning, domains, VLAN, STP) | l2 | ✅ written |
| | 3 | access | Medium access (ALOHA, CSMA/CD, BEB, CSMA/CA, hidden terminal) | l2 | ✅ written |
| | 4 | errors | Error detection & correction (parity, checksum, CRC, Hamming) | l2 | ✅ written |
| 3 Network | 5 | ip | IP, NAT, ARP, hop-by-hop, LPM, TTL, ICMP | l3 | ✅ written |
| | 6 | subnet | Subnetting, classes, CIDR, VLSM, IPv4 header, fragmentation, IPv6 | l3 | ✅ written (all + Added) |
| | 7 | routing | Routing algorithms & protocols (DV/LS, RIP, OSPF, BGP) | l3 | ✅ written |
| 4 Transport | 8 | transport | TCP vs UDP, ports, sockets, headers, mux/demux | l4 | ✅ written |
| | 9 | handshake | 3-way handshake, seq/ACK numbers, flags, SYN flood | l4 | ✅ written |
| | 10 | window | Sliding window, flow control, RTO, GBN vs SR, SACK | l4 | ✅ written |
| | 11 | congestion | Congestion control (slow start, AIMD, Tahoe, Reno, CUBIC, BBR) | l4 | ✅ written |
| | 12 | termination | 4-way close, TIME_WAIT, FIN vs RST, TCP states | l4 | ✅ written |
| 5 Application & Security | 13 | dns | DNS, DHCP, FTP/SMTP/POP3/IMAP/SSH etc. | l7 | ✅ written |
| | 14 | http | HTTP methods, status, cookies/sessions/JWT, caching, versions, WebSockets | l7 | ✅ written |
| | 15 | tls | HTTPS & TLS 1.3, certificates, DH, signatures | l7 | ✅ written |
| | 16 | security | Firewalls, proxies, load balancers, CDN, attacks (+ Added chapter) | l7 | ✅ written |
| 6 Wireless, VPN & big picture | 17 | wireless | Wi-Fi | l2 | ❌ TODO |
| | 18 | vpn | Tunneling & VPN | l3 | ❌ TODO |
| | 19 | journey | "What happens when you type https://google.com" | l7 | ❌ TODO |
| | 20 | cheatsheet | Master cheat sheet + interview Q&A bank | — | ❌ TODO |

### What the 4 TODO chapters must contain

**17 · wireless** (from notes sections 21–27, plus additions):
IEEE 802.11 works at Physical + Data Link; why CSMA/CA instead of CSMA/CD; CSMA/CA flow (sense → busy? wait : random backoff → transmit → ACK? done : backoff + retry); hidden terminal + RTS/CTS (link back to the Medium Access chapter); Access Point (Laptop/Phone → AP → Switch → Router → Internet); Infrastructure vs Ad hoc mode.
*+ Added*: SSID/BSSID, BSS/ESS, roaming; 2.4 / 5 / 6 GHz trade-offs (range vs speed, channels 1/6/11); Wi-Fi 4/5/6/6E/7 = 802.11n/ac/ax/ax/be; security WEP (broken) → WPA → WPA2 (AES-CCMP) → WPA3 (SAE); 802.11 frame has up to 4 MAC addresses; beacon frames; DIFS/SIFS/NAV; exposed terminal recap.

**18 · vpn** (from notes sections 16–20):
Tunneling = packet inside another packet (outer IP header + original packet; intermediate routers only see the outer header; decapsulate at the far end); VPN = tunneling + authentication + encryption/integrity over an untrusted network; why VPN (secure public Wi-Fi, remote access to company network, hide traffic from local observers, connect sites); tunneling vs VPN; protocols IPsec, OpenVPN, WireGuard, GRE (GRE = tunneling only, no encryption; IPsec can provide auth + integrity + encryption); Remote-access VPN vs Site-to-site VPN.
*+ Added*: IPsec AH vs ESP, transport vs tunnel mode, IKE; split tunneling; VPN vs proxy; WireGuard over UDP.

**19 · journey** (notes section 14, the most important interview answer):
All 14 steps from the notes: URL → caches/DNS → local or remote? (AND with mask) → ARP for gateway MAC (not Google's!) → TCP 3-way handshake → TLS handshake (certificate validation, symmetric session keys) → encrypted HTTP request → encapsulation (HTTP → TLS → TCP segment → IP packet → Ethernet frame → bits) → switch forwards by MAC → router: strip L2, LPM, new frame, MAC changes, IP stays, TTL−1 → NAT → load balancer/Google frontend → response travels back (TCP ordering/ACK/retransmit/flow/congestion) → browser decrypts, renders, fetches sub-resources reusing connections.
Include the 12-point interview answer, all 6 "Placement Traps" Q&As, the one-diagram summary, and the must-remember list. Note that HTTP/3 uses QUIC over UDP instead of TCP + TLS.
**Main widget**: an animated step-by-step journey with layer-coloured tags, Prev/Next/Play, and a packet travelling across a diagram (PC → switch → home router (NAT) → ISP routers → Google LB → server) showing the headers at each hop.

**20 · cheatsheet**:
Master ports table (20/21 FTP, 22 SSH, 23 Telnet, 25/587/465 SMTP, 53 DNS, 67/68 DHCP, 80 HTTP, 110/995 POP3, 123 NTP, 143/993 IMAP, 161/162 SNMP, 179 BGP, 443 HTTPS, 520 RIP, 3389 RDP, OSPF = IP proto 89). All formulas (delays, efficiency, ALOHA, CSMA/CD min frame, subnet, Hamming, GBN/SR windows, RTO, Nyquist/Shannon). All "X vs Y" tables in one place (TCP/UDP, hub/switch/router, CSMA CD/CA, DV/LS, RIP/OSPF/BGP, Tahoe/Reno, flow/congestion, FIN/RST, GET/POST, 401/403, cookie/session, HTTP/1.1 vs 2 vs 3, symmetric/asymmetric, DNS/DHCP, tunneling/VPN, IPv4/IPv6). An **interview Q&A bank of 40+ questions** as expandable `<details>` items, covering every chapter.

## 6. Interactive widgets to build

Every `data-wg="…"` placeholder in the chapter files needs a component. Specs:

| Widget | Chapter | Behaviour |
|---|---|---|
| `encap` (also auto-plays in the home hero) | osi | Rows build up: Data → [TCP][Data] → [IP][TCP][Data] → [Eth][IP][TCP][Data][FCS] → bits. Step buttons, Sender/Receiver toggle (receiver strips headers bottom-up). Layer colours. |
| `osi` | osi | Clickable 7-layer stack. Detail panel: job, PDU, address, devices, protocols, interview line. |
| `osimap` | osi | OSI 7 ↔ TCP/IP 4 mapping drawn with SVG connectors. |
| `topology` | basics | Tabs for bus/star/ring/mesh/tree drawn in SVG; mesh shows n(n−1)/2 with an n slider. |
| `delay` | basics | Inputs L (bytes), R (Mbps), d (km), v. Outputs Tt, Tp, RTT, a, stop-and-wait η, BDP, window needed (1+2a). |
| `macaddr` | datalink | Split a MAC into OUI / NIC; show unicast/multicast and global/local bits for an input MAC. |
| `ethframe` | datalink | Proportional bar of frame fields with byte sizes; hover/tap explains each field. |
| `switchsim` | datalink | 4 hosts on ports 1–4. Pick src/dst (or broadcast) and send. Animate flood vs forward; MAC table fills in (learn from SOURCE, forward on DESTINATION). Hub mode toggle (always floods, no table). |
| `domains` | datalink | Diagram: hub vs switch vs router with collision domains and broadcast domains shaded. |
| `flow-csmacd`, `flow-csmaca`, `flow-cc` | access, congestion | Step-through flowcharts (reuse one generic stepper). |
| `backoff` | access | Collision number n slider → range 0…2^min(n,10)−1, "roll" a K, wait = K × 51.2 µs; abort at 16. |
| `hidden` | access | A, B, C with radio ranges as circles; A and C both transmit → collision at B. |
| `seq-*` (rtscts, arp, handshake, fin, dns, dhcp, tls) | various | **One generic sequence-diagram component**: N vertical lanes, arrows appear one by one with Prev/Next/Play, a note panel explains each message, lane state labels update (e.g. CLOSED → SYN-SENT → ESTABLISHED). `seq-handshake` has editable ISNs x and y; the numbers in the labels update. `seq-fin` ends in TIME_WAIT (2MSL). `seq-dns` lanes: Client, Resolver, Root, TLD, Authoritative. |
| `parity` | errors | Type bits → even/odd parity bit; flip bits to see detection, including the missed 2-bit case. |
| `checksum` | errors | 16-bit words → 1's complement sum with carry wrap → checksum; receiver verify. |
| `crc` | errors | Data + generator → full XOR long division shown step by step, remainder, transmitted codeword. **Test: 101101 / 1101 → remainder 010, send 101101010. 1101011011 / 10011 → remainder 1110.** |
| `hamming` | errors | 4 data bits → Hamming(7,4) codeword (P1 P2 D1 P4 D2 D3 D4). Click a bit to flip; show syndrome and corrected bit. **Test: data 1011 → codeword 0110011.** |
| `nat` | ip | Animated PAT translation table: 192.168.1.10:5000 → 49.x.x.x:30001 and back. |
| `hops` | ip | Laptop → R1 → R2 → Server. Per link: src/dst MAC, src/dst IP, TTL; highlight changed fields. NAT toggle rewrites source IP at R1. |
| `lpm` | ip | Routing table (10.0.0.0/8, 10.1.0.0/16, 10.1.2.0/24, 172.16.0.0/16, 0.0.0.0/0). Enter destination IP; highlight all matches and the longest-prefix winner. |
| `traceroute` | ip | TTL = 1, 2, 3… probes; each router replies Time Exceeded; the destination replies at the end. |
| `subnetcalc` | subnet | IP/prefix → mask, wildcard, network, broadcast, first/last host, host count, class, private/public, and a 32-bit binary view with network bits coloured. |
| `subnetsplit` | subnet | Base network + number of subnets → list of subnets. |
| `ipv4hdr` | subnet | 32-bit-wide IPv4 header grid; click a field for its explanation. |
| `frag` | subnet | Packet size + MTU → fragments with length, offset (÷8), MF flag. **Test: 4000 B packet (20 B header), MTU 1500 → 3 fragments: data 1480/1480/1020, offsets 0/185/370, MF 1/1/0.** |
| `cti` | routing | Count-to-infinity stepper for A–B–C with C failing; toggle split horizon to show the fix. |
| `dijkstra` | routing | 6-node weighted SVG graph; step through: current node, distance table, visited set, final shortest-path tree. |
| `tcphdr` | transport | TCP header grid (32-bit rows) and UDP header grid side by side; click a field to see its explanation. |
| `mux` | transport | Chrome/Spotify/Discord streams merge (mux) and split by port (demux). |
| `seqcalc` | handshake | Given ISN and segment sizes, compute Seq/ACK for each segment, including SYN/FIN consuming 1. |
| `slidewin` | window | Row of byte blocks (acked / in-flight / usable / not yet); Send and ACK buttons slide the window bracket. |
| `effwin` | window | rwnd and cwnd sliders → effective window = min, labelled "receiver-limited" or "network-limited". |
| `gbnsr` | window | Window N, total packets, lost packet k → transmissions row for GBN vs SR with counts. |
| `cwnd` | congestion | **Key widget.** Inputs: initial ssthresh, round of 3-dup-ACK, round of timeout, number of rounds. SVG line chart with Tahoe and Reno together, ssthresh dashed line, events marked, tooltip per round. Rules: start cwnd = 1; SS doubles (cap at ssthresh), CA +1; dup → ssthresh = max(⌊cwnd/2⌋, 2), Tahoe cwnd = 1, Reno cwnd = ssthresh; timeout → ssthresh = max(⌊cwnd/2⌋, 2), cwnd = 1. |
| `tcpstates` | termination | Clickable TCP state diagram (client path, server path, active vs passive close, TIME_WAIT). |
| `status` | http | Searchable HTTP status-code explorer grouped 1xx–5xx (include 100, 101, 200, 201, 204, 301, 302, 304, 307, 308, 400, 401, 403, 404, 405, 409, 429, 500, 502, 503, 504). |
| `dh` | tls | Small-number Diffie-Hellman playground (p = 23, g = 5, pick a and b → both compute the same secret). |
| `proxy` | security | Diagram contrasting forward proxy, reverse proxy / load balancer, and CDN. |

## 7. Flashcards & quiz

For **every** chapter: **8–10 flashcards** (front: question/term, back: crisp answer) and **5–8 MCQs** (4 options, correct index, one-line explanation). Base them on the notes' "Placement Must-Remember" sections and interview traps. Examples of the expected tone:
- Q: Switch learns from ___ and forwards on ___? → Source MAC; destination MAC.
- Q: ARP request vs reply? → Request broadcast, reply unicast.
- Q: SYN with Seq=100, server's Ack? → 101 (SYN consumes 1).
- MCQ: RIP max usable hop count → 15 (16 = unreachable).

Practice page: all flashcards shuffled (filter by unit) + "New quiz" of 15 random MCQs. Save best score per chapter.

## 8. App features checklist

- Sidebar grouped by the 7 units, with a layer-colour dot per unit, a done tick per chapter, and an overall progress bar. Drawer on mobile.
- Top bar: **search** (indexes chapter titles, h2/h3 headings and flashcards; clicking jumps to the heading and flashes it), **Study / Quick** toggle (Quick opens chapters on their quick sheet), **theme toggle** (light/dark/system).
- Chapter page: header (unit, layer chip, title, one-line lede), sticky tabs **Notes · Quick sheet · Flashcards (n) · Quiz (n)**, footer with Prev / "Mark as done" / Next.
- Home: hero with the auto-playing encapsulation widget, unit cards listing chapters, "how to use" strip.
- Deep links per chapter (`#/ch/osi`), keyboard focus states, reduced motion support, works offline once loaded.

## 9. Build order

1. Scaffold Vite + React + TS. Port the CSS tokens and components. Build the layout shell, routing, theme and progress.
2. Convert the 17 written chapters into components (keep content verbatim). Leave the widgets as placeholders.
3. Write the 4 TODO chapters.
4. Build the generic components (SequenceDiagram, Stepper, FlipCard, Quiz), then the other widgets. Verify the test values listed above.
5. Flashcard and quiz data for all 21 chapters, plus the Practice page.
6. Search, Quick mode, polish, mobile check at 400 px, light/dark check.
7. Cross-check against `source-notes/original-notes.txt`: every heading/point in the notes must be findable on the site.
8. (Optional) MERN phase: Express + MongoDB + auth to sync progress.
