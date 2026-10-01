// Units 0–2: basics, osi, datalink, access, errors
// Card: [front, back]. Quiz: { q, o: [4 options], a: index of correct option, e: one-line explanation }.

export const basics = {
  cards: [
    ['The four components of per-hop delay?', 'Processing + queuing + transmission + propagation.'],
    ['Transmission delay: formula and what it depends on?', 'Tt = L / R.\nPacket size and bandwidth (not distance).'],
    ['Propagation delay: formula and what it depends on?', 'Tp = d / v.\nDistance and signal speed in the medium (not packet size).'],
    ['Stop-and-Wait efficiency?', 'η = 1 / (1 + 2a), where a = Tp / Tt.'],
    ['Bandwidth-delay product?', 'R × RTT: the bits that fit "in the pipe", i.e. how much must be in flight to keep the link busy.'],
    ['Links in a full mesh of n nodes?', 'n(n−1)/2 links, n−1 ports per device.\n6 nodes → 15 links.'],
    ['Circuit vs packet switching?', 'Circuit: a dedicated path is reserved first (old phone network).\nPacket: data split into packets on shared links, store-and-forward (the Internet).'],
    ['Unicast / broadcast / multicast / anycast?', 'One → one / one → all / one → subscribed group / one → nearest of many sharing an address (DNS root, CDNs).'],
    ['Nyquist vs Shannon capacity?', 'Nyquist (noiseless): C = 2B·log₂(L).\nShannon (noisy): C = B·log₂(1 + SNR).'],
    ['Bandwidth vs throughput vs latency?', 'Capacity of the link vs rate actually achieved vs time for one bit to arrive. Jitter = variation in latency.'],
  ],
  quiz: [
    { q: 'Which delay depends on the packet size?', o: ['Propagation delay', 'Transmission delay', 'Only queuing delay', 'None of them'], a: 1, e: 'Tt = L/R: a bigger packet takes longer to push onto the link.' },
    { q: 'A full mesh of 6 devices needs how many links?', o: ['12', '15', '30', '36'], a: 1, e: 'n(n−1)/2 = 6·5/2 = 15.' },
    { q: 'Tt = 1 ms and Tp = 10 ms. Stop-and-Wait efficiency is about:', o: ['50%', '9.1%', '4.8%', '1%'], a: 2, e: 'a = 10, η = 1/(1 + 20) = 1/21 ≈ 4.8%.' },
    { q: 'Which topology has a single central point of failure?', o: ['Full mesh', 'Ring', 'Star', 'Partial mesh'], a: 2, e: 'If the central hub/switch fails, every host is cut off.' },
    { q: 'Which is an example of anycast?', o: ['An ARP request', 'DNS root servers', 'IPTV', 'A normal web request'], a: 1, e: 'Many root-server instances share one address; routing delivers you to the nearest.' },
    { q: 'A walkie-talkie is:', o: ['Simplex', 'Half-duplex', 'Full-duplex', 'Multicast only'], a: 1, e: 'Both directions, but only one at a time.' },
    { q: 'Shannon capacity for B = 3000 Hz and SNR = 1023:', o: ['3 kbps', '30 kbps', '60 kbps', '10 kbps'], a: 1, e: 'C = 3000 · log₂(1024) = 3000 · 10 = 30,000 bps.' },
  ],
};

export const osi = {
  cards: [
    ['OSI layers from top (7) to bottom (1)?', 'Application, Presentation, Session, Transport, Network, Data Link, Physical.\n"All People Seem To Need Data Processing".'],
    ['The 4 layers of the TCP/IP model?', 'Application, Transport, Internet, Network Access.'],
    ['PDU name at each layer?', 'Data → Segment (TCP) / Datagram (UDP) → Packet → Frame → Bits.'],
    ['Which address is used at Transport, Network, Data Link?', 'Port number → IP address → MAC address.'],
    ['Scope of Transport vs Network vs Data Link?', 'Process-to-process vs host-to-host vs node-to-node (one hop).'],
    ['Hub, switch, router: which layer and what do they use?', 'Hub: L1, bits.\nSwitch: L2, MAC table.\nRouter: L3, IP routing table.'],
    ['The two sublayers of the Data Link layer?', 'LLC (Logical Link Control) and MAC (Media Access Control). CSMA/CD and CSMA/CA live in MAC.'],
    ['Across routers, what changes: IP or MAC?', 'MAC addresses change at every hop; source/destination IP stay end-to-end (except NAT).'],
    ['What is encapsulation?', 'Each layer adds its own header going down (the frame also adds an FCS trailer); the receiver strips them going up (decapsulation).'],
    ['OSI vs TCP/IP in one line?', 'OSI: 7-layer reference model (model first, protocols later).\nTCP/IP: 4-layer model the Internet actually runs on (protocols first).'],
  ],
  quiz: [
    { q: 'Which layer provides process-to-process delivery?', o: ['Network', 'Transport', 'Data Link', 'Session'], a: 1, e: 'Ports identify processes; that is the Transport layer\'s job.' },
    { q: 'The PDU at the Network layer is a:', o: ['Frame', 'Segment', 'Packet', 'Bit'], a: 2, e: 'IP header + segment = packet.' },
    { q: 'TLS encryption is usually mapped to which OSI layer?', o: ['Transport', 'Session', 'Presentation', 'Network'], a: 2, e: 'Presentation handles encryption, format and compression.' },
    { q: 'A normal Ethernet switch works at:', o: ['Layer 1', 'Layer 2', 'Layer 3', 'Layer 4'], a: 1, e: 'It forwards frames by destination MAC.' },
    { q: 'In TCP/IP, OSI Data Link + Physical map to:', o: ['Internet', 'Network Access', 'Transport', 'Application'], a: 1, e: 'Network Access (a.k.a. Link) covers both.' },
    { q: 'Which device separates broadcast domains?', o: ['Hub', 'Switch without VLANs', 'Router', 'Repeater'], a: 2, e: 'Routers don\'t forward Layer-2 broadcasts.' },
    { q: 'CSMA/CD operates in which sublayer?', o: ['LLC', 'MAC', 'Network', 'Physical'], a: 1, e: 'Medium access control is the MAC sublayer\'s job.' },
  ],
};

export const datalink = {
  cards: [
    ['A switch learns from ___ and forwards on ___?', 'Learns from the SOURCE MAC; forwards on the DESTINATION MAC.'],
    ['What does a switch do with an unknown destination MAC?', 'Floods the frame out of every port except the one it arrived on.'],
    ['MAC address size and parts?', '48 bits = 6 bytes.\nFirst 24 bits = OUI (vendor), last 24 = NIC-specific.'],
    ['Broadcast MAC address?', 'FF:FF:FF:FF:FF:FF'],
    ['Ethernet frame size limits?', '64–1518 bytes (1522 with a VLAN tag). Payload 46–1500, so MTU = 1500.'],
    ['What is the FCS?', 'Frame Check Sequence: a CRC-32 for error detection. Bad frames are silently dropped.'],
    ['Switch separates ___ domains; router separates ___ domains.', 'Switch → collision domains.\nRouter (or VLAN) → broadcast domains.'],
    ['What is a VLAN?', 'A logical Layer-2 network on a switch: its own broadcast domain, 802.1Q tag with a 12-bit VLAN ID. Inter-VLAN traffic needs a router or L3 switch.'],
    ['Why is STP needed?', 'Redundant switch links create loops; Ethernet has no TTL, so broadcasts circle forever. STP blocks ports to make a loop-free tree (root = lowest bridge ID).'],
    ['Store-and-forward vs cut-through switching?', 'Store-and-forward: receive the whole frame and check FCS first.\nCut-through: forward after reading the destination MAC (faster, may pass bad frames).'],
  ],
  quiz: [
    { q: 'A frame arrives on port 3 with source X and an unknown destination Y. The switch:', o: ['Drops it', 'Learns X → port 3 and floods it out every port except 3', 'Learns Y → port 3', 'Sends it only to port 1'], a: 1, e: 'Learn from the source, flood unknown destinations (never back out the incoming port).' },
    { q: 'Collision domains on a 24-port switch with all ports in use:', o: ['1', '2', '24', '48'], a: 2, e: 'Each switch port is its own collision domain.' },
    { q: 'EtherType 0x0806 means the payload is:', o: ['IPv4', 'ARP', 'IPv6', 'A VLAN tag'], a: 1, e: '0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6, 0x8100 VLAN.' },
    { q: 'Minimum Ethernet frame size:', o: ['46 bytes', '64 bytes', '1500 bytes', '18 bytes'], a: 1, e: '64 B frame (46 B minimum payload), needed for collision detection.' },
    { q: 'A VLAN ID has how many bits?', o: ['8', '10', '12', '16'], a: 2, e: '12 bits → 4094 usable VLANs.' },
    { q: 'Which protocol prevents Layer-2 loops?', o: ['OSPF', 'STP', 'ARP', 'RIP'], a: 1, e: 'Spanning Tree Protocol blocks redundant ports.' },
    { q: 'HDLC bit stuffing inserts a 0 after how many consecutive 1s in the data?', o: ['4', '5', '6', '8'], a: 1, e: 'So the flag 01111110 (six 1s) never appears inside data.' },
  ],
};

export const access = {
  cards: [
    ['CSMA/CD: what and where?', 'Carrier Sense Multiple Access with Collision Detection. Legacy shared, half-duplex Ethernet (hubs, coax).'],
    ['Binary exponential backoff rule?', 'After the n-th collision pick K ∈ [0, 2^min(n,10) − 1]; wait K × 51.2 µs. Give up after 16 attempts.'],
    ['Minimum frame size condition for CSMA/CD?', 'Tt ≥ 2·Tp, so L_min = 2·Tp·R. Classic Ethernet: 512 bits = 64 bytes.'],
    ['Pure vs slotted ALOHA maximum throughput?', 'Pure: 18.4% at G = 0.5 (S = G·e^−2G).\nSlotted: 36.8% at G = 1 (S = G·e^−G).'],
    ['Why does Wi-Fi use CSMA/CA, not CSMA/CD?', 'A radio can\'t detect collisions while transmitting (its own signal drowns others; collisions happen at the receiver), so it avoids them and relies on ACKs.'],
    ['Hidden terminal problem?', 'A and C can\'t hear each other but both reach B; both sense "free" and collide at B. Fix: RTS/CTS.'],
    ['Exposed terminal problem?', 'A node stays silent because it hears a transmission that wouldn\'t actually interfere with its own. Capacity is wasted.'],
    ['What is the NAV?', 'Network Allocation Vector: "virtual carrier sense", a timer set from the Duration field of RTS/CTS and other frames.'],
    ['1-persistent vs non-persistent vs p-persistent CSMA?', 'Send as soon as idle / if busy wait a random time then sense again / when idle send with probability p.'],
    ['Three families of multiple-access protocols?', 'Random access (ALOHA, CSMA), controlled access (polling, token passing), channelization (FDMA, TDMA, CDMA).'],
  ],
  quiz: [
    { q: 'Maximum throughput of slotted ALOHA:', o: ['18.4%', '36.8%', '50%', '100%'], a: 1, e: '1/e ≈ 36.8% at G = 1.' },
    { q: 'After the 3rd collision, K is chosen from:', o: ['0–3', '0–7', '0–15', '0–1023'], a: 1, e: '2^3 − 1 = 7.' },
    { q: 'Ethernet gives up on a frame after how many attempts?', o: ['10', '15', '16', '32'], a: 2, e: 'After 16 attempts it reports excessive collisions.' },
    { q: 'Why doesn\'t modern switched Ethernet need CSMA/CD?', o: ['It uses token passing', 'Links are full-duplex and point-to-point, so collisions can\'t happen', 'It uses RTS/CTS', 'CRC prevents collisions'], a: 1, e: 'Each switch port is a dedicated full-duplex link.' },
    { q: 'RTS/CTS mainly addresses:', o: ['The exposed terminal problem', 'The hidden terminal problem', 'Count to infinity', 'Silly window syndrome'], a: 1, e: 'Hidden nodes hear the receiver\'s CTS and stay quiet.' },
    { q: 'At 10 Mbps with Tp = 25.6 µs, the minimum CSMA/CD frame is:', o: ['256 bits', '512 bits', '1024 bits', '64 bits'], a: 1, e: '2 × 25.6 µs × 10 Mbps = 512 bits = 64 bytes.' },
    { q: 'Vulnerable time of pure ALOHA:', o: ['Tfr', '2·Tfr', 'Tfr / 2', '4·Tfr'], a: 1, e: 'Any frame starting within one frame time before or after collides.' },
  ],
};

export const errors = {
  cards: [
    ['Error detection vs correction?', 'Detection: knows something is wrong (ask again).\nCorrection: can recover the right data (forward error correction).'],
    ['Limitation of a single parity bit?', 'Detects any odd number of flipped bits; misses 2 (or any even number).'],
    ['How is the Internet checksum computed?', 'Add 16-bit words in 1\'s complement (wrap carries around), then complement. Receiver\'s sum including the checksum must be FFFF.'],
    ['Where is the 16-bit Internet checksum used?', 'IPv4 header, TCP, UDP and ICMP.'],
    ['CRC sender steps?', 'Append r zeros (r = generator degree), XOR-divide by the generator, the r-bit remainder is the CRC; send data + CRC.'],
    ['Data 101101, generator 1101: CRC and codeword?', 'Remainder 010 → transmit 101101010.'],
    ['Where are Hamming parity bits placed?', 'At the powers of 2: positions 1, 2, 4, 8, 16…'],
    ['What does the Hamming syndrome tell you?', 'Read as binary, it is the position of the wrong bit (0 = no error). Flip that bit to correct.'],
    ['Parity bits r needed for m data bits?', 'Smallest r with 2^r ≥ m + r + 1.\nm = 4 → r = 3; m = 7 → r = 4.'],
    ['Minimum Hamming distance to detect d / correct t errors?', 'Detect: d_min ≥ d + 1.\nCorrect: d_min ≥ 2t + 1.'],
  ],
  quiz: [
    { q: 'Which technique can correct a single-bit error?', o: ['Parity', 'Checksum', 'CRC', 'Hamming code'], a: 3, e: 'The syndrome locates the bad bit.' },
    { q: 'Ethernet\'s FCS uses:', o: ['A 16-bit checksum', 'CRC-32', 'Hamming code', 'Odd parity'], a: 1, e: 'A 32-bit CRC in the frame trailer.' },
    { q: 'Data 1011 → Hamming(7,4) codeword (P1 P2 D1 P4 D2 D3 D4, even parity):', o: ['1011010', '0110011', '0111100', '1100110'], a: 1, e: 'P1 = 1⊕0⊕1 = 0, P2 = 1⊕1⊕1 = 1, P4 = 0⊕1⊕1 = 0 → 0110011.' },
    { q: 'With generator 10011, how many zeros are appended to the data?', o: ['3', '4', '5', '2'], a: 1, e: 'Degree = number of bits − 1 = 4.' },
    { q: 'Hamming syndrome = 110₂ means:', o: ['No error', 'Bit 3 is wrong', 'Bit 6 is wrong', 'Two bits are wrong'], a: 2, e: '110₂ = 6.' },
    { q: 'Minimum parity bits for 7 data bits:', o: ['3', '4', '5', '7'], a: 1, e: '2^4 = 16 ≥ 7 + 4 + 1 = 12, while 2^3 = 8 < 11.' },
    { q: 'Which error can the Internet checksum miss?', o: ['A single flipped bit', 'Two 16-bit words swapped', 'A changed length field', 'Any odd number of bit errors'], a: 1, e: 'Addition is order-independent; CRC would catch reordering.' },
  ],
};
