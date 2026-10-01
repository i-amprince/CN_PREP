// Unit 4: transport, handshake, window, congestion, termination

export const transport = {
  cards: [
    ['What uniquely identifies a TCP connection?', 'The 4-tuple: source IP, source port, destination IP, destination port (+ protocol = 5-tuple).'],
    ['What is a socket?', 'IP address + port, e.g. 192.168.1.10:5000.'],
    ['TCP vs UDP header size?', 'TCP: 20–60 bytes.\nUDP: 8 bytes.'],
    ['Flow control vs congestion control?', 'Flow control protects the RECEIVER (rwnd).\nCongestion control protects the NETWORK (cwnd).'],
    ['Why does DHCP use UDP?', 'The client has no IP address yet, so it can\'t set up a TCP connection; it must broadcast.'],
    ['Port ranges?', '0–1023 well-known · 1024–49151 registered · 49152–65535 ephemeral (client source ports).'],
    ['MSS on Ethernet?', '1500 (MTU) − 20 (IP) − 20 (TCP) = 1460 bytes.'],
    ['Multiplexing vs demultiplexing?', 'Mux (sender): many apps → one transport, tagged with ports.\nDemux (receiver): deliver each segment to the right socket by destination port.'],
    ['"UDP is always faster." Right?', 'No. UDP has lower overhead and skips handshake, reliability and congestion control, so it suits low latency or app-controlled reliability.'],
    ['TCP server socket calls in order?', 'socket() → bind() → listen() → accept() → recv()/send() → close().\nClient: socket() → connect() → send()/recv() → close().'],
  ],
  quiz: [
    { q: 'Which is NOT a feature of TCP?', o: ['Ordered delivery', 'Congestion control', 'Preserves message boundaries', 'Retransmission'], a: 2, e: 'TCP is a byte stream; UDP keeps datagram boundaries.' },
    { q: 'Normal DNS queries use:', o: ['TCP 53', 'UDP 53', 'UDP 67', 'TCP 80'], a: 1, e: 'UDP 53, with TCP 53 for zone transfers / big answers.' },
    { q: 'UDP header size:', o: ['8 bytes', '12 bytes', '20 bytes', '40 bytes'], a: 0, e: 'Source port, destination port, length, checksum: 4 × 2 bytes.' },
    { q: 'Which protocol runs over UDP?', o: ['SSH', 'SMTP', 'DHCP', 'HTTP/1.1'], a: 2, e: 'DHCP uses UDP 67/68.' },
    { q: 'rwnd is used for:', o: ['Congestion control', 'Flow control', 'Error detection', 'Routing'], a: 1, e: 'The receiver advertises how much buffer it has left.' },
    { q: 'How does one server on port 443 talk to thousands of clients at once?', o: ['Each client gets a different server IP', 'Each connection has a different 4-tuple (client IP/port differ)', 'The server switches to a new port per client', 'TCP serves them one at a time'], a: 1, e: 'accept() returns a new socket per 4-tuple.' },
    { q: 'Ephemeral (dynamic) port range:', o: ['0–1023', '1024–4096', '49152–65535', '80–443'], a: 2, e: 'IANA dynamic/private range.' },
  ],
};

export const handshake = {
  cards: [
    ['The 3-way handshake?', 'SYN (Seq = x)\nSYN+ACK (Seq = y, Ack = x+1)\nACK (Ack = y+1)'],
    ['Client SYN has Seq = 100. Server\'s Ack?', '101: the SYN consumes one sequence number.'],
    ['Why not a 2-way handshake?', 'The server must know the client got its SYN-ACK (and ISN y). It also stops old duplicate SYNs from opening ghost connections.'],
    ['What does the ACK number mean?', 'The next byte the receiver expects.'],
    ['Seq = 1000, 500 bytes sent. ACK?', '1500.'],
    ['What consumes sequence numbers?', 'Data bytes, SYN (1) and FIN (1). A pure ACK consumes 0.'],
    ['Why is the ISN random?', 'So segments from an old connection aren\'t mistaken as valid, and blind spoofing is hard.'],
    ['SYN flood and its defence?', 'Many SYNs never completed fill the half-open backlog → denial of service. Defence: SYN cookies (+ rate limits, bigger backlog).'],
    ['States during the handshake?', 'Client: CLOSED → SYN-SENT → ESTABLISHED.\nServer: LISTEN → SYN-RECEIVED → ESTABLISHED.'],
    ['The four most important TCP flags?', 'SYN (establish), ACK (acknowledge), FIN (graceful close), RST (reset). Also PSH, URG.'],
  ],
  quiz: [
    { q: 'Client SYN has Seq = 2000. The SYN-ACK carries Ack =', o: ['2000', '2001', '2002', 'a random number'], a: 1, e: 'SYN consumes 1.' },
    { q: 'Server SYN-ACK has Seq = 7000. The client\'s ACK carries Ack =', o: ['7000', '7001', '2001', '7002'], a: 1, e: 'The server\'s SYN also consumes 1.' },
    { q: 'Which flag aborts a connection immediately?', o: ['FIN', 'PSH', 'RST', 'URG'], a: 2, e: 'RST = reset.' },
    { q: 'Server state after receiving SYN and sending SYN-ACK:', o: ['LISTEN', 'SYN-SENT', 'SYN-RECEIVED', 'ESTABLISHED'], a: 2, e: 'It waits for the final ACK.' },
    { q: 'A segment with Seq = 1500 carries 200 bytes. The receiver ACKs:', o: ['1500', '1700', '1701', '1699'], a: 1, e: 'Next byte expected = 1500 + 200.' },
    { q: 'SYN cookies defend against:', o: ['Smurf attacks', 'SYN floods', 'ARP spoofing', 'DNS poisoning'], a: 1, e: 'No state is kept until a valid ACK returns.' },
    { q: 'Receiver has 1000–1099 and 1200–1299 but not 1100–1199. It sends ACK =', o: ['1100', '1200', '1300', '1099'], a: 0, e: 'Cumulative ACK: still waiting for byte 1100 (a duplicate ACK).' },
  ],
};

export const window = {
  cards: [
    ['Effective send window?', 'min(rwnd, cwnd).'],
    ['rwnd = 10 KB, cwnd = 6 KB. Effective window and limit?', '6 KB: network-limited (congestion control).'],
    ['What is a cumulative ACK?', 'One ACK confirms every byte before it; ACK = next byte expected.'],
    ['Two ways TCP detects loss?', 'Retransmission timeout (RTO) and 3 duplicate ACKs (fast retransmit).'],
    ['RTO formula?', 'RTO = EstimatedRTT + 4·DevRTT (EWMA with α = 1/8, β = 1/4).'],
    ['Karn\'s algorithm?', 'Don\'t take RTT samples from retransmitted segments, and double the RTO after each timeout.'],
    ['Go-Back-N vs Selective Repeat on a loss?', 'GBN resends the lost packet and everything after it. SR resends only the lost one (receiver buffers).'],
    ['Max window with k-bit sequence numbers?', 'GBN: 2^k − 1.\nSR: 2^(k−1).'],
    ['What is SACK?', 'Selective Acknowledgment: the receiver lists the blocks it has, so only the gaps are retransmitted.'],
    ['rwnd = 0 — what happens?', 'The sender stops and runs the persist timer, sending small window probes so a lost window update can\'t deadlock the connection.'],
  ],
  quiz: [
    { q: 'rwnd = 4 KB, cwnd = 6 KB. Effective window:', o: ['4 KB', '6 KB', '10 KB', '2 KB'], a: 0, e: 'min(4, 6): receiver-limited.' },
    { q: 'With 3-bit sequence numbers, maximum Go-Back-N window:', o: ['3', '4', '7', '8'], a: 2, e: '2^3 − 1 = 7.' },
    { q: 'With 3-bit sequence numbers, maximum Selective Repeat window:', o: ['3', '4', '7', '8'], a: 1, e: '2^(3−1) = 4.' },
    { q: 'Window N = 4; packet 3 of 8 is lost. Go-Back-N retransmits:', o: ['3 only', '3, 4, 5, 6', '3 to 8', '1 to 3'], a: 1, e: 'Packet 3 plus everything sent after it in the window (4, 5, 6).' },
    { q: 'Nagle\'s algorithm addresses:', o: ['Count to infinity', 'Silly window syndrome (tiny segments)', 'The hidden terminal', 'Head-of-line blocking'], a: 1, e: 'It buffers small writes while an ACK is outstanding.' },
    { q: 'Tt = 1 ms, Tp = 10 ms. Window needed for 100% utilisation:', o: ['10', '11', '21', '20'], a: 2, e: '1 + 2a = 1 + 20 = 21 packets.' },
    { q: 'Which is NOT part of TCP\'s reliability?', o: ['Sequence numbers', 'Checksum', 'Retransmission timer', 'Longest prefix match'], a: 3, e: 'LPM is IP routing.' },
  ],
};

export const congestion = {
  cards: [
    ['cwnd vs ssthresh?', 'cwnd (sender only) limits data in flight.\nssthresh is where slow start switches to congestion avoidance.'],
    ['How does cwnd grow in slow start?', 'Exponentially: doubles every RTT (1, 2, 4, 8, 16…).'],
    ['How does cwnd grow in congestion avoidance?', 'Linearly: about +1 MSS per RTT.'],
    ['AIMD?', 'Additive Increase, Multiplicative Decrease: +1 per RTT, halve on loss → sawtooth; converges to fairness.'],
    ['What triggers fast retransmit?', '3 duplicate ACKs → resend the missing segment without waiting for the timeout.'],
    ['Tahoe on 3 duplicate ACKs?', 'ssthresh = cwnd/2, cwnd = 1 MSS, slow start again.'],
    ['Reno on 3 duplicate ACKs?', 'ssthresh = cwnd/2, cwnd ≈ ssthresh, fast recovery (no slow start).'],
    ['Tahoe and Reno on a timeout?', 'Both: ssthresh = cwnd/2, cwnd = 1 MSS, slow start.'],
    ['cwnd = 16 and a timeout occurs. What next?', 'ssthresh = 8, cwnd: 1 → 2 → 4 → 8 (slow start) → 9 → 10 → 11 (CA).'],
    ['Default congestion control in Linux today?', 'CUBIC. Google\'s BBR models bandwidth and RTT instead of reacting to loss.'],
    ['Leaky bucket vs token bucket?', 'Leaky: constant output rate, smooths everything.\nToken: allows bursts up to the bucket size while keeping the average rate.'],
  ],
  quiz: [
    { q: 'Reno, cwnd = 20, 3 duplicate ACKs. New cwnd ≈', o: ['1', '10', '20', '5'], a: 1, e: 'Halve and enter fast recovery.' },
    { q: 'Tahoe, cwnd = 20, 3 duplicate ACKs. New cwnd =', o: ['1', '10', '20', '5'], a: 0, e: 'Tahoe has no fast recovery: back to 1 MSS.' },
    { q: 'Slow start ends when:', o: ['cwnd = rwnd', 'cwnd ≥ ssthresh', 'only when a timeout occurs', 'after exactly 3 RTTs'], a: 1, e: 'Then congestion avoidance takes over (or a loss event).' },
    { q: 'Which loss signal gets the more severe reaction?', o: ['3 duplicate ACKs', 'Timeout', 'An ECN mark', 'A delayed ACK'], a: 1, e: 'A timeout means even later packets aren\'t getting through.' },
    { q: 'cwnd is:', o: ['Advertised by the receiver', 'Kept by the sender', 'Set by routers', 'A TCP header field'], a: 1, e: 'Never sent on the wire; rwnd is the header field.' },
    { q: 'cwnd starts at 1, ssthresh = 8, no loss. cwnd in round 5:', o: ['8', '9', '16', '5'], a: 1, e: '1, 2, 4, 8 (hits ssthresh), then +1 → 9.' },
    { q: 'A token bucket differs from a leaky bucket because it:', o: ['Drops every burst', 'Allows bursts up to the bucket size', 'Has no rate limit', 'Only works for UDP'], a: 1, e: 'Saved-up tokens let a burst go out at full speed.' },
  ],
};

export const termination = {
  cards: [
    ['The 4-way close?', 'FIN → ACK → FIN → ACK.'],
    ['Why 4 steps and not 3?', 'TCP is full-duplex: each direction closes on its own (half-close). The server may keep sending after ACKing the client\'s FIN.'],
    ['FIN with Seq = 5000. The ACK?', '5001: FIN consumes one sequence number.'],
    ['Who enters TIME_WAIT, and for how long?', 'The active closer (whoever sent the first FIN), for 2 × MSL.'],
    ['Two reasons for TIME_WAIT?', '1. Let delayed old segments die before the 4-tuple is reused.\n2. Be able to re-send the final ACK if the peer\'s FIN is retransmitted.'],
    ['FIN vs RST?', 'FIN: graceful, remaining data delivered, ends in TIME_WAIT.\nRST: abrupt abort, buffered data discarded, no TIME_WAIT.'],
    ['What does CLOSE_WAIT mean?', 'The passive side got a FIN and is waiting for its own application to call close(). Lots of CLOSE_WAIT = an app bug.'],
    ['Active closer\'s states?', 'ESTABLISHED → FIN-WAIT-1 → FIN-WAIT-2 → TIME-WAIT → CLOSED.'],
    ['Passive closer\'s states?', 'ESTABLISHED → CLOSE-WAIT → LAST-ACK → CLOSED.'],
    ['When is RST sent?', 'Connecting to a port nobody listens on ("connection refused"), protocol errors, segments for unknown connections, or an app aborting.'],
  ],
  quiz: [
    { q: 'Which side enters TIME_WAIT?', o: ['Always the server', 'Always the client', 'The active closer', 'The passive closer'], a: 2, e: 'Whoever sends the first FIN sends the last ACK.' },
    { q: 'TIME_WAIT lasts:', o: ['1 RTT', '2 × MSL', 'until 3 duplicate ACKs', 'until the app closes'], a: 1, e: 'Twice the Maximum Segment Lifetime.' },
    { q: 'After receiving a FIN, the passive side enters:', o: ['FIN-WAIT-1', 'CLOSE-WAIT', 'TIME-WAIT', 'LAST-ACK'], a: 1, e: 'It ACKs and waits for its app to close.' },
    { q: 'Connecting to a port with no listening process gets back:', o: ['FIN', 'SYN-ACK', 'RST', 'ICMP Echo Reply'], a: 2, e: 'That\'s the "connection refused" error.' },
    { q: 'Can the server still send data after receiving the client\'s FIN?', o: ['No, never', 'Yes, until it sends its own FIN', 'Only urgent data', 'Only with RST set'], a: 1, e: 'Half-close: FIN only closes the client → server direction.' },
    { q: 'A capture shows FIN, FIN+ACK, ACK. Why only 3 segments?', o: ['A packet was lost', 'The server combined its ACK and FIN', 'RST was used', 'It is a handshake'], a: 1, e: 'With nothing left to send, the ACK and FIN go together.' },
  ],
};
