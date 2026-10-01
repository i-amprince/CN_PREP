// Units 5–6: dns, http, tls, security, wireless, vpn, journey, cheatsheet

export const dns = {
  cards: [
    ['DNS port and transport?', 'Port 53. UDP for normal queries; TCP for zone transfers and large responses.'],
    ['DNS hierarchy?', 'Root → TLD (.com, .org, .in) → authoritative server for the domain.'],
    ['Recursive vs iterative query?', 'Recursive: client asks the resolver for the final answer.\nIterative: servers reply with referrals ("ask this server") that the resolver follows.'],
    ['A vs AAAA vs CNAME?', 'A: name → IPv4.\nAAAA: name → IPv6.\nCNAME: alias → another name.'],
    ['MX, NS, TXT, PTR?', 'MX: mail server. NS: authoritative name server. TXT: text (SPF, verification). PTR: reverse lookup IP → name.'],
    ['DNS TTL vs IP TTL?', 'DNS TTL: how many seconds a record may be cached.\nIP TTL: hop count to stop loops.'],
    ['DHCP DORA?', 'Discover → Offer → Request → Acknowledge.'],
    ['DHCP ports?', 'UDP 67 (server) and 68 (client).'],
    ['What does DHCP give a host?', 'IP address, subnet mask, default gateway, DNS server, and a lease time.'],
    ['POP3 vs IMAP?', 'POP3 (110): download and usually delete from server, one device.\nIMAP (143): mail stays on the server, folders sync across devices.'],
  ],
  quiz: [
    { q: 'Record type for a domain\'s mail server:', o: ['A', 'MX', 'NS', 'CNAME'], a: 1, e: 'MX = mail exchanger.' },
    { q: 'Which DHCP messages does the client broadcast?', o: ['Offer and ACK', 'Discover and Request', 'Only ACK', 'None'], a: 1, e: 'No IP yet for Discover; Request is broadcast so other servers know.' },
    { q: 'Correct lookup order:', o: ['Root → browser cache → OS cache', 'Browser cache → OS cache → resolver → root/TLD/authoritative', 'Resolver → browser → TLD', 'Authoritative → root → TLD'], a: 1, e: 'Caches first, then the hierarchy.' },
    { q: 'SMTP is used for:', o: ['Receiving mail', 'Sending mail', 'Name resolution', 'File transfer'], a: 1, e: 'POP3/IMAP receive.' },
    { q: 'FTP control connection port:', o: ['20', '21', '22', '23'], a: 1, e: '21 control, 20 data (active mode).' },
    { q: 'Reverse DNS (IP → name) uses which record?', o: ['PTR', 'SOA', 'SRV', 'AAAA'], a: 0, e: 'Under in-addr.arpa.' },
    { q: 'A DHCP client first tries to renew its lease at:', o: ['25% of the lease', '50% (T1)', '87.5% (T2)', '100%'], a: 1, e: 'Unicast renewal at T1; broadcast rebind at T2.' },
  ],
};

export const http = {
  cards: [
    ['"HTTP is stateless" means?', 'Each request is independent; the server keeps no memory. State is added with cookies, sessions or tokens.'],
    ['Which methods are idempotent?', 'GET, PUT, DELETE, HEAD, OPTIONS.\nNot POST; PATCH not guaranteed.'],
    ['401 vs 403?', '401: "Who are you?" (authentication missing/failed).\n403: "I know who you are, but you can\'t do this." (authorisation).'],
    ['301 vs 302 vs 307/308?', '301 permanent, 302 temporary (may change POST to GET).\n307/308: temporary/permanent but keep the method.'],
    ['When is 304 Not Modified sent?', 'On cache revalidation (If-None-Match / If-Modified-Since) when the resource hasn\'t changed: no body.'],
    ['Cookie vs session?', 'Cookie: stored in the browser.\nSession: state stored on the server, found via a session-ID cookie.'],
    ['JWT structure and its trap?', 'header.payload.signature (Base64URL). Signed, NOT encrypted: anyone can read the payload.'],
    ['Secure, HttpOnly, SameSite?', 'Secure: HTTPS only. HttpOnly: no JavaScript access (XSS). SameSite: limits cross-site sending (CSRF).'],
    ['HTTP/1.1 vs HTTP/2 vs HTTP/3?', '1.1: persistent connections, text.\n2: binary frames, multiplexed streams, HPACK, over TCP.\n3: QUIC over UDP, no TCP head-of-line blocking, QPACK.'],
    ['How does a WebSocket start?', 'HTTP request with Upgrade: websocket → 101 Switching Protocols → full-duplex channel on the same TCP connection.'],
  ],
  quiz: [
    { q: 'Which method is NOT idempotent?', o: ['GET', 'PUT', 'DELETE', 'POST'], a: 3, e: 'Two POSTs can create two orders.' },
    { q: 'Status code for "resource created":', o: ['200', '201', '204', '202'], a: 1, e: '201 Created (with a Location header).' },
    { q: 'A proxy received an invalid response from the upstream server:', o: ['500', '502', '503', '504'], a: 1, e: '502 Bad Gateway. 504 is a timeout.' },
    { q: 'HTTP/2 header compression is:', o: ['QPACK', 'HPACK', 'gzip', 'Brotli'], a: 1, e: 'HTTP/3 uses QPACK.' },
    { q: 'Cookie attribute that stops JavaScript reading it:', o: ['Secure', 'SameSite', 'HttpOnly', 'Path'], a: 2, e: 'document.cookie can\'t see HttpOnly cookies.' },
    { q: 'HTTP/3 runs over:', o: ['TCP', 'QUIC over UDP', 'SCTP', 'TLS over TCP'], a: 1, e: 'QUIC adds reliability and encryption on top of UDP.' },
    { q: 'Rate limiting returns:', o: ['403', '409', '429', '503'], a: 2, e: '429 Too Many Requests, often with Retry-After.' },
    { q: '"POST is more secure than GET." This is:', o: ['True', 'False: HTTPS encrypts both; the method doesn\'t encrypt anything', 'True only with HTTP/2', 'True for cookies'], a: 1, e: 'GET params do leak into logs/history, but neither is encrypted without TLS.' },
  ],
};

export const tls = {
  cards: [
    ['What does TLS provide?', 'Confidentiality (encryption), integrity, authentication (certificates).'],
    ['Symmetric vs asymmetric encryption?', 'Symmetric: one shared key, fast (AES, ChaCha20).\nAsymmetric: public/private pair, slow (RSA, ECC).'],
    ['Does HTTPS encrypt the data with the server\'s public key?', 'No. Public-key crypto authenticates and establishes keys; the data uses symmetric session keys.'],
    ['What is in a certificate?', 'Domain name, public key, validity period, issuer, and the CA\'s digital signature.'],
    ['Certificate chain?', 'Root CA (in your trust store) → intermediate CA → server certificate.'],
    ['Forward secrecy?', 'Fresh ephemeral (EC)DHE keys per session: stealing the server\'s long-term key later can\'t decrypt recorded sessions.'],
    ['TLS 1.3 vs TLS 1.2?', '1.3: 1-RTT handshake (0-RTT resumption), only ephemeral DH, encrypted certificate, AEAD ciphers only. 1.2: 2-RTT.'],
    ['How does a digital signature work?', 'Hash the message, sign the hash with the sender\'s PRIVATE key; anyone verifies with the sender\'s PUBLIC key.'],
    ['Encryption vs hashing?', 'Encryption is reversible with a key. Hashing is a one-way fixed-size digest (SHA-256).'],
    ['What is SNI?', 'Server Name Indication: the hostname in ClientHello, so one IP can serve many HTTPS sites.'],
  ],
  quiz: [
    { q: 'Bulk HTTPS data is encrypted with:', o: ['The server\'s RSA public key', 'Symmetric session keys', 'SHA-256', 'The CA\'s private key'], a: 1, e: 'Symmetric crypto is far faster.' },
    { q: 'To send Bob something only he can read, encrypt with:', o: ['Your private key', 'Bob\'s public key', 'Bob\'s private key', 'Your public key'], a: 1, e: 'Only Bob\'s private key can decrypt it.' },
    { q: 'A digital signature is created with the:', o: ['Receiver\'s public key', 'Sender\'s private key', 'Shared session key', 'CA\'s public key'], a: 1, e: 'Verified with the sender\'s public key.' },
    { q: 'A full TLS 1.3 handshake takes:', o: ['0 RTT', '1 RTT', '2 RTT', '3 RTT'], a: 1, e: 'Key shares go in the first flight.' },
    { q: 'DH with p = 23, g = 5, a = 6, b = 15. The shared secret is:', o: ['2', '8', '19', '5'], a: 0, e: 'A = 5⁶ mod 23 = 8, B = 5¹⁵ mod 23 = 19, B^a = 19⁶ mod 23 = 2.' },
    { q: 'HSTS protects against:', o: ['SYN floods', 'SSL stripping / downgrade to HTTP', 'ARP spoofing', 'DNS amplification'], a: 1, e: 'The browser refuses plain HTTP for that domain.' },
    { q: 'What gives forward secrecy?', o: ['RSA key exchange', 'Ephemeral ECDHE', 'Longer certificates', 'SHA-3'], a: 1, e: 'Session keys never depend on the long-term key.' },
  ],
};

export const security = {
  cards: [
    ['CIA triad?', 'Confidentiality, Integrity, Availability.'],
    ['Stateless vs stateful firewall?', 'Stateless: judges each packet alone (ACL rules).\nStateful: tracks connections, allows replies automatically.'],
    ['IDS vs IPS?', 'IDS detects and alerts (passive). IPS sits inline and blocks.'],
    ['What is a DMZ?', 'A separate network segment for public-facing servers (web, mail) between the Internet and the internal LAN.'],
    ['Forward vs reverse proxy?', 'Forward proxy acts for clients (sites see the proxy).\nReverse proxy acts for servers (clients see one endpoint).'],
    ['L4 vs L7 load balancer?', 'L4: IP and port only, fast.\nL7: reads HTTP (path, host, cookies), can route and do sticky sessions.'],
    ['Load-balancing algorithms?', 'Round robin, weighted round robin, least connections, IP hash, least response time.'],
    ['What does a CDN do?', 'Caches content at edge servers near users: lower latency, less origin load, absorbs DDoS.'],
    ['ARP spoofing and defence?', 'Fake ARP replies make traffic flow via the attacker (MITM). Defence: Dynamic ARP Inspection, static entries.'],
    ['MAC flooding?', 'Filling a switch\'s MAC table so it floods every frame like a hub. Defence: port security.'],
  ],
  quiz: [
    { q: 'A WAF works at layer:', o: ['2', '3', '4', '7'], a: 3, e: 'It inspects HTTP content.' },
    { q: 'Which device sits inline and blocks attacks?', o: ['IDS', 'IPS', 'Hub', 'Repeater'], a: 1, e: 'IDS only alerts.' },
    { q: 'Load-balancing method that sends the same client to the same backend:', o: ['Round robin', 'Least connections', 'IP hash', 'Random'], a: 2, e: 'The hash of the client IP picks the server.' },
    { q: 'Defence against DNS cache poisoning:', o: ['SYN cookies', 'DNSSEC', 'Port security', 'STP'], a: 1, e: 'DNSSEC signs records.' },
    { q: 'Nginx in front of application servers is acting as a:', o: ['Forward proxy', 'Reverse proxy', 'Hub', 'DNS resolver'], a: 1, e: 'It represents the servers to clients.' },
    { q: 'Amplification attacks usually abuse:', o: ['TCP handshakes', 'Open DNS/NTP servers and spoofed source IPs', 'ARP caches', 'VLAN tags'], a: 1, e: 'Small spoofed request → big response at the victim.' },
  ],
};

export const wireless = {
  cards: [
    ['Wi-Fi standard and layers?', 'IEEE 802.11; Physical + Data Link layers.'],
    ['Why CSMA/CA and not CSMA/CD?', 'Collisions can\'t be detected while transmitting wirelessly, so Wi-Fi avoids them and relies on ACKs.'],
    ['CSMA/CA steps?', 'Sense → busy? wait : random backoff → transmit → ACK? done : backoff (CW doubles) + retry.'],
    ['Fix for the hidden terminal problem?', 'RTS/CTS: nodes that hear the receiver\'s CTS set their NAV and stay silent.'],
    ['What does an access point do?', 'Connects wireless devices to the wired network (a Layer-2 bridge).'],
    ['Infrastructure vs ad hoc mode?', 'Infrastructure: through an AP (BSS).\nAd hoc: directly device to device (IBSS).'],
    ['SSID vs BSSID?', 'SSID: the network name.\nBSSID: the MAC address of one AP radio.'],
    ['Non-overlapping 2.4 GHz channels?', '1, 6 and 11.'],
    ['Wi-Fi 4 / 5 / 6 / 6E / 7?', '802.11n / ac / ax / ax in 6 GHz / be.'],
    ['Wi-Fi security history?', 'WEP (RC4, broken) → WPA (TKIP) → WPA2 (AES-CCMP) → WPA3 (SAE).'],
    ['How many MAC addresses can an 802.11 header carry?', 'Up to 4 (receiver, transmitter, destination/source, and a 4th for AP-to-AP relaying).'],
  ],
  quiz: [
    { q: 'Wi-Fi uses:', o: ['CSMA/CD', 'CSMA/CA', 'Token passing', 'Pure TDMA'], a: 1, e: 'Collision avoidance.' },
    { q: 'Which set of 2.4 GHz channels doesn\'t overlap?', o: ['1, 2, 3', '1, 6, 11', '1, 5, 9', '2, 7, 12'], a: 1, e: 'Channels are 5 MHz apart but ~20 MHz wide.' },
    { q: 'WPA3 replaces the pre-shared-key handshake with:', o: ['TKIP', 'SAE', 'WEP', 'RADIUS'], a: 1, e: 'Simultaneous Authentication of Equals resists offline guessing.' },
    { q: 'Wi-Fi 6 is:', o: ['802.11n', '802.11ac', '802.11ax', '802.11be'], a: 2, e: 'Wi-Fi 7 = 802.11be.' },
    { q: 'Which band has the longest range?', o: ['2.4 GHz', '5 GHz', '6 GHz', 'All the same'], a: 0, e: 'Lower frequency travels further and through walls.' },
    { q: 'Beacon frames are sent by:', o: ['Stations', 'Access points', 'Routers', 'DHCP servers'], a: 1, e: 'About every 102.4 ms, announcing the SSID.' },
    { q: 'SIFS is shorter than DIFS so that:', o: ['New stations get priority', 'ACK and CTS responses get priority', 'Beacons go faster', 'Collisions are detected'], a: 1, e: 'Responses always win against new transmissions.' },
  ],
};

export const vpn = {
  cards: [
    ['What is tunneling?', 'Encapsulating one packet inside another (new outer header) to carry it across a network.'],
    ['What is a VPN?', 'A secure logical connection over an untrusted network: tunneling + authentication + encryption/integrity.'],
    ['GRE vs IPsec?', 'GRE: encapsulation only, no encryption.\nIPsec: authentication, integrity and encryption.'],
    ['AH vs ESP?', 'AH (IP proto 51): authentication + integrity, no encryption.\nESP (50): encryption + integrity.'],
    ['IPsec transport vs tunnel mode?', 'Transport: protects the payload, keeps the original IP header (host-to-host).\nTunnel: encrypts the whole packet, adds a new IP header (site-to-site).'],
    ['What does IKE do?', 'Authenticates the peers and runs Diffie-Hellman to agree on keys (Security Associations). UDP 500, NAT-T on 4500.'],
    ['Remote-access vs site-to-site VPN?', 'Remote access: one user → company network.\nSite-to-site: office ↔ office via gateways.'],
    ['Split tunneling?', 'Only company traffic goes through the VPN; everything else goes directly to the Internet.'],
    ['WireGuard transport?', 'UDP only (commonly port 51820), modern fixed crypto.'],
    ['VPN vs proxy?', 'VPN: network layer, all traffic, encrypted.\nProxy: application layer, one app, usually unencrypted.'],
  ],
  quiz: [
    { q: 'Which provides encryption by itself?', o: ['GRE', 'IPsec ESP', '6in4', 'VXLAN'], a: 1, e: 'The others are pure encapsulation.' },
    { q: 'Site-to-site VPNs usually use IPsec in:', o: ['Transport mode', 'Tunnel mode', 'AH only', 'No mode'], a: 1, e: 'The whole packet is wrapped between gateways.' },
    { q: 'Inside a tunnel, Internet routers forward based on:', o: ['The inner IP header', 'The outer IP header', 'MAC addresses', 'Port numbers'], a: 1, e: 'They never look inside.' },
    { q: 'WireGuard runs over:', o: ['TCP', 'UDP', 'ICMP', 'GRE'], a: 1, e: 'UDP only.' },
    { q: 'ESP is IP protocol number:', o: ['47', '50', '51', '89'], a: 1, e: '47 GRE, 51 AH, 89 OSPF.' },
    { q: 'An employee connecting to the office from home uses a:', o: ['Site-to-site VPN', 'Remote-access VPN', 'Reverse proxy', 'CDN'], a: 1, e: 'One device joins the company network.' },
  ],
};

export const journey = {
  cards: [
    ['First network step after typing a URL?', 'Check caches, then DNS resolution to get the IP.'],
    ['Whose MAC does your PC look up to reach google.com?', 'The default gateway\'s, via ARP. Never Google\'s.'],
    ['How does the PC know Google is remote?', 'It ANDs its own IP and Google\'s IP with the subnet mask: different network → send to the gateway.'],
    ['TCP or TLS first?', 'TCP 3-way handshake, then the TLS handshake (HTTP/1.1, HTTP/2). HTTP/3 uses QUIC over UDP instead.'],
    ['What happens at each router?', 'Strip the frame, longest-prefix lookup, TTL − 1, build a new frame: MACs change, IPs stay (except NAT).'],
    ['What does home NAT change?', 'Source 192.168.1.10:5000 → public IP:30001, and the reverse on replies.'],
    ['Which device forwards by MAC, which by IP?', 'Switch by MAC; router by IP.'],
    ['Encapsulation order on the way out?', 'HTTP → TLS → TCP segment → IP packet → Ethernet frame → bits.'],
    ['What does the certificate prove in the TLS step?', 'That the public key really belongs to google.com (signed by a CA the browser trusts).'],
    ['After the first response, what next?', 'The browser decrypts, renders, and fetches CSS, JS, images, fonts and APIs, reusing connections.'],
  ],
  quiz: [
    { q: 'Your PC (192.168.1.10/24) sends to Google. The destination MAC in the first frame is:', o: ['Google server\'s MAC', 'The default gateway\'s MAC', 'FF:FF:FF:FF:FF:FF', 'The DNS server\'s MAC'], a: 1, e: 'MACs only matter on the local link.' },
    { q: 'Which happens first?', o: ['TLS handshake', 'TCP 3-way handshake', 'HTTP GET', 'Page rendering'], a: 1, e: 'TLS needs the reliable TCP stream (except HTTP/3).' },
    { q: 'What source IP does Google see?', o: ['192.168.1.10', 'Your router\'s public IP', 'Google\'s own IP', '127.0.0.1'], a: 1, e: 'NAT rewrote it.' },
    { q: 'Which field decreases at each router?', o: ['Source IP', 'Destination port', 'TTL', 'Sequence number'], a: 2, e: 'TTL − 1 per hop.' },
    { q: 'HTTP/3 replaces TCP + TLS with:', o: ['UDP alone', 'QUIC over UDP', 'SCTP', 'IPsec'], a: 1, e: 'QUIC has TLS 1.3 built in.' },
    { q: 'Which device reads only MAC addresses?', o: ['Router', 'Switch', 'Load balancer', 'DNS resolver'], a: 1, e: 'Layer 2.' },
    { q: 'The ARP request for the gateway is sent as:', o: ['Unicast', 'Broadcast', 'Multicast', 'Anycast'], a: 1, e: 'The PC doesn\'t know the gateway\'s MAC yet.' },
  ],
};

export const cheatsheet = {
  cards: [
    ['SSH / Telnet ports?', '22 / 23.'],
    ['SMTP ports?', '25 (server relay), 587 (submission, STARTTLS), 465 (implicit TLS).'],
    ['POP3 / IMAP ports?', 'POP3 110 (995 with TLS) / IMAP 143 (993 with TLS).'],
    ['DHCP / DNS / NTP ports?', 'UDP 67–68 / 53 / UDP 123.'],
    ['SNMP / BGP / RIP ports?', 'UDP 161–162 / TCP 179 / UDP 520.'],
    ['RDP / HTTPS / HTTP ports?', '3389 / 443 / 80.'],
    ['IP protocol numbers to know?', 'ICMP 1, TCP 6, UDP 17, GRE 47, ESP 50, AH 51, OSPF 89.'],
    ['FTP ports?', '21 control, 20 data (active mode).'],
    ['Debug ladder for "site won\'t load"?', 'Valid IP? → ping gateway → ping 8.8.8.8 → nslookup → port open (curl/nc) → TLS/HTTP (curl -v).'],
    ['What does netstat / ss show?', 'Open sockets and their TCP states (LISTEN, ESTABLISHED, TIME_WAIT…).'],
  ],
  quiz: [
    { q: 'Port 3389 is:', o: ['SSH', 'RDP', 'MySQL', 'SNMP'], a: 1, e: 'Windows Remote Desktop.' },
    { q: 'BGP uses:', o: ['UDP 179', 'TCP 179', 'TCP 520', 'IP protocol 89'], a: 1, e: 'Reliable TCP sessions between peers.' },
    { q: 'Port 123 is:', o: ['NTP', 'IMAP', 'NetBIOS', 'POP3'], a: 0, e: 'Network Time Protocol, UDP.' },
    { q: 'IMAP over TLS uses:', o: ['993', '995', '465', '587'], a: 0, e: '995 is POP3S.' },
    { q: 'OSPF is identified by:', o: ['TCP port 89', 'UDP port 89', 'IP protocol 89', 'EtherType 89'], a: 2, e: 'It runs directly on IP.' },
    { q: 'Tool that shows the routers along a path:', o: ['nslookup', 'traceroute', 'arp -a', 'netstat'], a: 1, e: 'TTL trick + ICMP Time Exceeded.' },
    { q: 'nslookup / dig test:', o: ['The physical link', 'DNS resolution', 'ARP', 'TCP congestion control'], a: 1, e: 'They query DNS servers.' },
    { q: 'SNMP traps use port:', o: ['161', '162', '514', '69'], a: 1, e: '161 for queries, 162 for traps.' },
  ],
};
