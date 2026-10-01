// Units and chapters. Layer colour keys map to the T568B pair tokens in design.css (--l1 … --l7).
export const UNITS = [
  { n: 0, name: 'Foundations', color: 'var(--l1)' },
  { n: 1, name: 'Architecture', color: 'var(--l6)' },
  { n: 2, name: 'Data Link', color: 'var(--l2)' },
  { n: 3, name: 'Network', color: 'var(--l3)' },
  { n: 4, name: 'Transport', color: 'var(--l4)' },
  { n: 5, name: 'Application & Security', color: 'var(--l7)' },
  { n: 6, name: 'Wireless, VPN & big picture', color: 'var(--accent)' },
];

const LAYER_NAME = { l1: 'Physical', l2: 'Data Link', l3: 'Network', l4: 'Transport', l7: 'Application', all: 'All layers' };

export const CHAPTERS = [
  { id: 'basics', num: 0, unit: 0, layer: 'l1', title: 'Network basics', short: 'Network basics', lede: 'Network types, topologies, transmission modes, circuit vs packet switching, the delay formulas and physical media.' },
  { id: 'osi', num: 1, unit: 1, layer: 'l7', chip: 'All layers', title: 'OSI & TCP/IP', short: 'OSI & TCP/IP', lede: 'The 7-layer and 4-layer models, encapsulation, devices by layer, and the IP vs MAC distinction everything else builds on.' },
  { id: 'datalink', num: 2, unit: 2, layer: 'l2', title: 'Data Link & Ethernet', short: 'Data Link & Ethernet', lede: 'Framing, MAC addresses, the Ethernet frame, how a switch learns, collision vs broadcast domains, VLANs and STP.' },
  { id: 'access', num: 3, unit: 2, layer: 'l2', title: 'Medium access', short: 'Medium access', lede: 'Who may transmit on a shared medium: ALOHA, CSMA, CSMA/CD with binary exponential backoff, CSMA/CA and the hidden terminal.' },
  { id: 'errors', num: 4, unit: 2, layer: 'l2', title: 'Error detection & correction', short: 'Error detection & correction', lede: 'Parity, checksum, CRC and Hamming code, with every XOR step shown.' },
  { id: 'ip', num: 5, unit: 3, layer: 'l3', title: 'IP, NAT, ARP & ICMP', short: 'IP, NAT, ARP & ICMP', lede: 'IP addressing, private ranges, NAT, ARP, hop-by-hop forwarding, longest prefix match, TTL, ping and traceroute.' },
  { id: 'subnet', num: 6, unit: 3, layer: 'l3', title: 'Subnetting, IPv4 header & IPv6', short: 'Subnetting & IPv6', lede: 'Classes, CIDR, subnet maths, VLSM, the IPv4 header, fragmentation and IPv6.' },
  { id: 'routing', num: 7, unit: 3, layer: 'l3', title: 'Routing algorithms & protocols', short: 'Routing', lede: 'Routing vs forwarding, distance vector vs link state, Bellman-Ford and Dijkstra, RIP, OSPF and BGP.' },
  { id: 'transport', num: 8, unit: 4, layer: 'l4', title: 'TCP vs UDP, ports & sockets', short: 'TCP vs UDP', lede: 'Ports, sockets, TCP vs UDP, segment headers, multiplexing, and flow vs congestion control.' },
  { id: 'handshake', num: 9, unit: 4, layer: 'l4', title: 'TCP 3-way handshake', short: '3-way handshake', lede: 'SYN, SYN-ACK, ACK: why three messages, sequence and ACK numbers, flags and SYN floods.' },
  { id: 'window', num: 10, unit: 4, layer: 'l4', title: 'Sliding window & flow control', short: 'Sliding window', lede: 'Sliding windows, rwnd, cumulative ACKs, RTO estimation, Go-Back-N vs Selective Repeat, and SACK.' },
  { id: 'congestion', num: 11, unit: 4, layer: 'l4', title: 'Congestion control', short: 'Congestion control', lede: 'cwnd and ssthresh, slow start, AIMD, fast retransmit and recovery, Tahoe vs Reno, CUBIC and BBR.' },
  { id: 'termination', num: 12, unit: 4, layer: 'l4', title: 'TCP termination & states', short: 'Termination & states', lede: 'FIN, ACK, FIN, ACK: half-close, TIME_WAIT, FIN vs RST and the full TCP state machine.' },
  { id: 'dns', num: 13, unit: 5, layer: 'l7', title: 'DNS, DHCP & app protocols', short: 'DNS, DHCP & ports', lede: 'The DNS hierarchy and record types, DHCP DORA, and FTP, SMTP, POP3, IMAP, SSH and friends with their ports.' },
  { id: 'http', num: 14, unit: 5, layer: 'l7', title: 'HTTP in depth', short: 'HTTP', lede: 'Methods, status codes, cookies, sessions and JWT, caching, HTTP/1.1 vs 2 vs 3, and WebSockets.' },
  { id: 'tls', num: 15, unit: 5, layer: 'l7', title: 'HTTPS & TLS', short: 'HTTPS & TLS', lede: 'Symmetric vs asymmetric crypto, certificates and CAs, the TLS 1.3 handshake, Diffie-Hellman and signatures.' },
  { id: 'security', num: 16, unit: 5, layer: 'l7', title: 'Network security & middleboxes', short: 'Security', lede: 'Firewalls, IDS/IPS, proxies, load balancers, CDNs and the common network attacks.' },
  { id: 'wireless', num: 17, unit: 6, layer: 'l2', title: 'Wi-Fi (IEEE 802.11)', short: 'Wi-Fi', lede: 'How wireless LANs share the air: CSMA/CA, hidden terminals and RTS/CTS, access points, bands, Wi-Fi generations and security.' },
  { id: 'vpn', num: 18, unit: 6, layer: 'l3', title: 'Tunneling & VPN', short: 'Tunneling & VPN', lede: 'A packet inside a packet: tunneling, VPNs, IPsec, GRE and WireGuard, remote-access vs site-to-site.' },
  { id: 'journey', num: 19, unit: 6, layer: 'l7', chip: 'All layers', title: 'What happens when you type https://google.com', short: 'Type google.com: the journey', lede: 'The most-asked CN interview question, step by step: every layer and every hop, from the URL bar to the rendered page.' },
  { id: 'cheatsheet', num: 20, unit: 6, layer: 'all', title: 'Master cheat sheet & interview bank', short: 'Cheat sheet & Q&A bank', lede: 'All the ports, formulas and X-vs-Y tables in one place, plus a bank of interview questions with answers.' },
];

export const CH_BY_ID = Object.fromEntries(CHAPTERS.map((c) => [c.id, c]));
export const layerVar = (layer) => (layer === 'all' ? 'var(--accent)' : `var(--${layer})`);
export const layerName = (c) => c.chip || LAYER_NAME[c.layer];
export const chaptersOfUnit = (n) => CHAPTERS.filter((c) => c.unit === n);
