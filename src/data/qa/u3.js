// Unit 3: ip, subnet, routing

export const ip = {
  cards: [
    ['ARP request vs ARP reply?', 'Request: broadcast (FF:FF:FF:FF:FF:FF).\nReply: unicast.'],
    ['What does ARP do?', 'Finds the MAC address for an IPv4 address on the local link, and caches it.'],
    ['Destination is outside your subnet. Whose MAC do you ARP for?', 'The default gateway\'s (router\'s). Never the remote server\'s.'],
    ['What changes at each router hop?', 'MACs change (new frame), source/destination IP stay (except NAT), TTL − 1, header checksum recomputed.'],
    ['Private IPv4 ranges?', '10.0.0.0/8\n172.16.0.0/12\n192.168.0.0/16'],
    ['What is PAT / NAT overload?', 'Many private IPs share one public IP; the router tells them apart by source port and keeps a translation table.'],
    ['Longest prefix match?', 'Of all matching routes, the most specific (longest prefix) wins. 0.0.0.0/0 (default route) matches only if nothing else does.'],
    ['Why does TTL exist?', 'To stop packets looping forever: each router decrements it; at 0 the packet is dropped and ICMP Time Exceeded is sent.'],
    ['What does ping use?', 'ICMP Echo Request (type 8) and Echo Reply (type 0).'],
    ['How does traceroute work?', 'Sends probes with TTL = 1, 2, 3…; each router where TTL hits 0 replies ICMP Time Exceeded (type 11), revealing the path.'],
  ],
  quiz: [
    { q: 'An ARP reply is normally sent as:', o: ['Broadcast', 'Multicast', 'Unicast', 'Anycast'], a: 2, e: 'The responder knows exactly who asked.' },
    { q: 'Routes: 10.0.0.0/8, 10.1.0.0/16, 10.1.2.0/24, 0.0.0.0/0. Destination 10.1.2.50 uses:', o: ['10.0.0.0/8', '10.1.0.0/16', '10.1.2.0/24', '0.0.0.0/0'], a: 2, e: 'All three match; /24 is the longest prefix.' },
    { q: 'Which address is private?', o: ['172.32.1.1', '172.20.5.5', '11.0.0.1', '192.169.1.1'], a: 1, e: '172.16.0.0/12 covers 172.16–172.31.' },
    { q: 'A host with 169.254.x.x usually means:', o: ['It has a public IP', 'DHCP failed and it self-assigned (APIPA)', 'It is the loopback', 'It joined a multicast group'], a: 1, e: '169.254.0.0/16 is link-local.' },
    { q: 'ICMP "Time Exceeded" is type:', o: ['0', '3', '8', '11'], a: 3, e: '0 echo reply, 3 unreachable, 8 echo request, 11 time exceeded.' },
    { q: 'A packet crosses 3 routers (no NAT). What stays the same?', o: ['Source MAC', 'Destination MAC', 'Source and destination IP', 'TTL'], a: 2, e: 'MACs are rewritten per hop and TTL drops; IPs are end-to-end.' },
    { q: 'IPv6 replaces ARP with:', o: ['RARP', 'NDP (Neighbor Discovery)', 'DHCPv6', 'ICMPv4'], a: 1, e: 'NDP runs over ICMPv6.' },
  ],
};

export const subnet = {
  cards: [
    ['Usable hosts in a /26?', '2^6 − 2 = 62.'],
    ['Block size for /27?', '256 − 224 = 32.'],
    ['Which subnet is 192.168.10.77/26 in?', '192.168.10.64/26: broadcast .127, usable .65 – .126.'],
    ['Class A/B/C first-octet ranges?', 'A 1–126 (/8), B 128–191 (/16), C 192–223 (/24).\nD 224–239 multicast, E 240–255 reserved.'],
    ['How to get the network and broadcast address?', 'Network = IP AND mask.\nBroadcast = network OR wildcard (all host bits 1).'],
    ['IPv4 header size?', '20 bytes minimum, 60 maximum (IHL 5–15 words of 4 bytes).'],
    ['Unit of the fragment offset field?', '8 bytes. So every fragment\'s data except the last must be a multiple of 8.'],
    ['4000-byte packet (20 B header), MTU 1500: fragments?', '3 fragments: data 1480, 1480, 1020.\nOffsets 0, 185, 370. MF = 1, 1, 0.'],
    ['IPv6 header and key differences from IPv4?', '40 B fixed header. No checksum, no broadcast, no router fragmentation; NDP instead of ARP; SLAAC.'],
    ['Shorten 2001:0db8:0000:0000:0000:0000:0000:0001', '2001:db8::1 (drop leading zeros; "::" only once).'],
  ],
  quiz: [
    { q: 'Subnet mask for /28:', o: ['255.255.255.224', '255.255.255.240', '255.255.255.248', '255.255.255.0'], a: 1, e: '28 ones → last octet 11110000 = 240.' },
    { q: 'Usable hosts in a /30:', o: ['0', '2', '4', '6'], a: 1, e: '4 addresses − network − broadcast = 2 (point-to-point links).' },
    { q: 'Splitting a /24 into 8 equal subnets gives:', o: ['/25', '/26', '/27', '/28'], a: 2, e: 'Borrow 3 bits (2³ = 8) → /27.' },
    { q: 'The IPv4 Protocol field value for TCP:', o: ['1', '6', '17', '89'], a: 1, e: '1 ICMP, 6 TCP, 17 UDP, 89 OSPF.' },
    { q: 'Who reassembles IPv4 fragments?', o: ['Every router', 'The next router', 'The destination host', 'The source host'], a: 2, e: 'Only the destination reassembles.' },
    { q: 'Aggregate 192.168.0.0/24 to 192.168.3.0/24 into one route:', o: ['192.168.0.0/23', '192.168.0.0/22', '192.168.0.0/21', '192.168.0.0/16'], a: 1, e: '4 contiguous /24s = one /22.' },
    { q: '4000 B packet, MTU 1500: fragment offset field of the 3rd fragment:', o: ['370', '2960', '185', '296'], a: 0, e: 'Data before it = 2960 bytes; 2960 / 8 = 370.' },
  ],
};

export const routing = {
  cards: [
    ['Routing vs forwarding?', 'Routing: decide paths, build the table (control plane).\nForwarding: send each packet out the right interface (data plane).'],
    ['Distance vector: algorithm and example?', 'Bellman-Ford; RIP.'],
    ['Link state: algorithm and example?', 'Dijkstra (SPF); OSPF.'],
    ['RIP metric and limit?', 'Hop count. Max usable = 15; 16 = infinity (unreachable).'],
    ['Fixes for count-to-infinity?', 'Split horizon, poison reverse, route poisoning, triggered updates, hold-down timers.'],
    ['OSPF metric?', 'Cost based on bandwidth (reference bandwidth ÷ interface bandwidth).'],
    ['IGP vs EGP?', 'IGP: inside an AS (RIP, OSPF, IS-IS, EIGRP).\nEGP: between ASes (BGP).'],
    ['BGP: type, transport, loop prevention?', 'Path-vector protocol over TCP 179. Rejects any route whose AS_PATH already contains its own AS number.'],
    ['Why does OSPF converge faster than RIP?', 'Every OSPF router has the full topology and recomputes as soon as an LSA arrives; DV spreads distances iteratively on timers and can count to infinity.'],
    ['The Bellman-Ford equation?', 'D_x(y) = min over neighbours v of { c(x,v) + D_v(y) }.'],
  ],
  quiz: [
    { q: 'RIP\'s maximum usable hop count:', o: ['15', '16', '255', '30'], a: 0, e: '16 means infinity / unreachable.' },
    { q: 'OSPF computes routes with:', o: ['Bellman-Ford', 'Dijkstra', 'Kruskal', 'Prim'], a: 1, e: 'Shortest Path First = Dijkstra.' },
    { q: 'The routing protocol between autonomous systems:', o: ['RIP', 'OSPF', 'BGP', 'EIGRP'], a: 2, e: 'BGP is the Internet\'s inter-AS protocol.' },
    { q: 'OSPF runs over:', o: ['TCP 179', 'UDP 520', 'IP protocol 89', 'UDP 53'], a: 2, e: 'Directly on IP, no TCP/UDP.' },
    { q: 'Which suffers from count-to-infinity?', o: ['Link state', 'Distance vector', 'Path vector', 'Static routing'], a: 1, e: 'Routers believe each other\'s stale distances.' },
    { q: 'Split horizon means:', o: ['Advertise every route with metric ∞', 'Don\'t advertise a route back out of the interface you learned it from', 'Flood LSAs to all routers', 'Keep two routing tables'], a: 1, e: 'Poison reverse instead advertises it back as ∞.' },
    { q: 'RIP sends its full table every:', o: ['10 s', '30 s', '60 s', '180 s'], a: 1, e: 'Periodic 30-second updates over UDP 520.' },
  ],
};
