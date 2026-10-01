// AUTO-GENERATED from content/14_ch_dns_http_tls_security.html by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run `npm run content` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
      <p>Connects HTTP + cryptography + networking + security. The question: <strong>how does HTTPS securely talk to a server?</strong></p>
      <section>
        <h2 id="tls-goals"><span className="num">15.1</span>HTTPS = HTTP + TLS</h2>
        <p>TLS (Transport Layer Security, successor of SSL) sits between TCP and HTTP and provides:</p>
        <ul>
          <li><strong>Confidentiality</strong>: others can't read the data (encryption).</li>
          <li><strong>Integrity</strong>: modification is detected (MAC / AEAD).</li>
          <li><strong>Authentication</strong>: the client can verify the server's identity (certificates).</li>
        </ul>
        <p><span className="add">+ Added</span> SSL 2.0/3.0 and TLS 1.0/1.1 are deprecated; use TLS 1.2 or 1.3. Which OSI layer? Commonly placed at Presentation (encryption) or "between Transport and Application"; in TCP/IP it's part of the Application layer.</p>
      </section>
      <section>
        <h2 id="tls-crypto"><span className="num">15.2</span>Symmetric vs asymmetric encryption</h2>
        <div className="vs">
          <div><h4>Symmetric</h4>Same secret key encrypts and decrypts.<ul><li>AES, ChaCha20</li><li>✔ Very fast</li><li>✘ How do both sides get the same key securely?</li></ul></div>
          <div><h4>Asymmetric</h4>Key pair: <strong>public</strong> (share freely) + <strong>private</strong> (keep secret).<ul><li>RSA, ECC</li><li>✔ No shared secret needed in advance</li><li>✘ Much slower</li></ul></div>
        </div>
        <div className="co key">
          <span className="lb">The core idea</span>
          <div className="flow">
            <span>Asymmetric crypto → authenticate the server + establish keys securely</span>
            <span>Symmetric session keys</span>
            <span>Encrypt the actual HTTP data (fast)</span>
          </div>
        </div>
        <div className="co trap">
          <span className="lb">Interview trap</span>
          <p><strong>Q: Does HTTPS encrypt data using the server's public key?</strong><br />Not the bulk application data. TLS uses public-key mechanisms for authentication and/or key establishment, then <strong>symmetric session keys</strong> because symmetric encryption is far more efficient.</p>
        </div>
      </section>
      <section>
        <h2 id="tls-cert"><span className="num">15.3</span>Certificates and Certificate Authorities</h2>
        <p>How does your browser know a public key really belongs to google.com? The server presents a <strong>digital certificate</strong> (X.509) containing: domain identity, public key, validity period, issuer, and the issuer's <strong>digital signature</strong>.</p>
        <p>A <strong>Certificate Authority (CA)</strong> is a trusted entity that signs certificates. Browsers/OSes ship a list of trusted root CAs.</p>
        <ul className="tree">
          <li><span className="t">Root CA</span> <em>self-signed, pre-installed in your OS/browser</em><ul><li><span className="t">Intermediate CA</span> <em>signed by root</em><ul><li><span className="t">Server certificate</span> <em>google.com, signed by intermediate</em></li></ul></li></ul></li>
        </ul>
        <p>The browser validates the <strong>chain</strong>: each signature, validity dates, that the domain matches (SAN), and revocation (OCSP/CRL). Any failure → the red warning page.</p>
      </section>
      <section>
        <h2 id="tls-hs"><span className="num">15.4</span>TLS 1.3 handshake</h2>
        <W name="seq-tls" />
        <p>Modern TLS versions (especially 1.3) don't map exactly to older ones. Understand the purpose rather than memorising obsolete packet sequences.</p>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>TLS 1.2 <span className="add">+ Added</span></th>
                <th>TLS 1.3</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Handshake</td>
                <td>2 RTT</td>
                <td>1 RTT (0-RTT on resumption)</td>
              </tr>
              <tr>
                <td>Key exchange</td>
                <td>RSA or (EC)DHE</td>
                <td>Only ephemeral (EC)DHE → forward secrecy always</td>
              </tr>
              <tr>
                <td>Certificate</td>
                <td>Sent in plain text</td>
                <td>Encrypted</td>
              </tr>
              <tr>
                <td>Cipher suites</td>
                <td>Many, some weak</td>
                <td>5, all AEAD (AES-GCM, ChaCha20-Poly1305)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p><span className="add">+ Added</span> <strong>SNI</strong> (Server Name Indication) in ClientHello tells the server which site you want, so one IP can host many HTTPS sites. 0-RTT data can be replayed, so it's only for idempotent requests.</p>
      </section>
      <section>
        <h2 id="tls-dh"><span className="num">15.5</span>Diffie-Hellman and forward secrecy</h2>
        <p>Client has secret <em>a</em>, server has secret <em>b</em>. They exchange only public values (g^a and g^b), and each independently computes the <strong>same shared secret</strong> g^(ab). An eavesdropper who sees g^a and g^b can't feasibly compute it.</p>
        <W name="dh" />
        <p>Modern TLS uses <strong>ECDHE</strong> (Elliptic Curve Diffie-Hellman Ephemeral). <strong>Ephemeral</strong> = fresh keys per session. This gives <strong>forward secrecy</strong>: if the server's long-term private key leaks later, recorded past sessions still can't be decrypted, because their session keys never depended on that key.</p>
      </section>
      <section>
        <h2 id="tls-auth"><span className="num">15.6</span>Authentication vs encryption, MITM</h2>
        <div className="vs">
          <div><h4>Certificate</h4>"Who am I talking to?" → authentication.</div>
          <div><h4>Session key</h4>"How do we talk securely?" → symmetric encryption.</div>
        </div>
        <p><strong>Man-in-the-Middle</strong>: an attacker sits between client and server (Client ↔ Attacker ↔ Server) and impersonates each side. Without authentication, DH alone can be MITM'd (attacker does DH with both). With TLS correctly validated, the attacker can't present a valid certificate for google.com signed by a trusted CA, so validation fails.</p>
        <p><span className="add">+ Added</span> <strong>HSTS</strong> header forces browsers to use HTTPS for a domain, defeating SSL-stripping attacks. <strong>Certificate pinning</strong> (in apps) accepts only specific keys.</p>
      </section>
      <section>
        <h2 id="tls-hash"><span className="num">15.7</span>Hashing and digital signatures</h2>
        <div className="vs">
          <div><h4>Encryption</h4>Reversible with the right key. Plaintext ↔ ciphertext.</div>
          <div><h4>Hashing</h4>One-way, fixed-size digest. SHA-256, SHA-3. Used for integrity, passwords (with salt), signatures. Not reversible.</div>
        </div>
        <div className="flow">
          <span>Message</span>
          <span>Hash it (SHA-256)</span>
          <span>Sign the hash with the PRIVATE key → signature</span>
          <span>Receiver verifies with the PUBLIC key + recomputed hash</span>
        </div>
        <p>A digital signature gives <strong>authentication, integrity and non-repudiation</strong>. In certificates, the CA's signature is what makes the certificate trustworthy.</p>
        <div className="co key">
          <span className="lb">Key direction rules <span className="add">+ Added</span></span>
          <span className="fx">Confidentiality → encrypt with RECEIVER's public key</span>
          <span className="fx">Signature → sign with SENDER's private key, verify with sender's public key</span>
          <span className="fx">HMAC → hash + shared secret key = integrity + authenticity (used in TLS records)</span>
        </div>
        <p>If a private key is compromised, an attacker can impersonate that identity, so certificates get revoked.</p>
      </section>
      <section>
        <h2 id="tls-flow"><span className="num">15.8</span>HTTPS complete flow</h2>
        <div className="flow">
          <span>User enters https://example.com</span>
          <span>DNS → server IP</span>
          <span>TCP 3-way handshake</span>
          <span>TLS handshake: certificate validation + key establishment</span>
          <span>Symmetric session keys</span>
          <span>Encrypted HTTP request → server</span>
          <span>Encrypted HTTP response → browser decrypts</span>
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
          <h4>TLS gives</h4>
          <ul>
            <li>Confidentiality · Integrity · Authentication</li>
            <li>HTTPS = HTTP + TLS, port 443</li>
          </ul>
        </div>
        <div>
          <h4>Crypto</h4>
          <ul>
            <li>Symmetric: same key, fast, AES</li>
            <li>Asymmetric: public/private, RSA/ECC</li>
            <li>Asymmetric for auth + key exchange; symmetric for data</li>
          </ul>
        </div>
        <div>
          <h4>Certificates</h4>
          <ul>
            <li>Bind domain ↔ public key</li>
            <li>Signed by CA; chain root → intermediate → server</li>
          </ul>
        </div>
        <div>
          <h4>TLS 1.3</h4>
          <ul>
            <li>1-RTT, ECDHE only</li>
            <li>Forward secrecy</li>
            <li>SNI, HSTS</li>
          </ul>
        </div>
        <div>
          <h4>Signatures</h4>
          <ul>
            <li>Sign with private, verify with public</li>
            <li>Hashing ≠ encryption</li>
          </ul>
        </div>
      </div>
    </>
  );
}
