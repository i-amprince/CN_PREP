// AUTO-GENERATED from content/14_ch_dns_http_tls_security.html by scripts/convert-chapters.mjs.
// Edit the HTML in content/ and run `npm run content` to regenerate.
/* eslint-disable */
import W from '../widgets/Widget.jsx';

export function Notes() {
  return (
    <>
      <p>Placement interviews go well beyond "GET vs POST". Here's the full picture.</p>
      <section>
        <h2 id="http-model"><span className="num">14.1</span>Request–response model and message structure</h2>
        <p>HTTP: client sends a <strong>request</strong>, server returns a <strong>response</strong>. Default port <strong>80</strong> (HTTPS 443).</p>
        <div className="vs">
          <div>
            <h4>Request</h4>
            <pre className="dg" style={{ margin: ".4rem 0" }}><b>POST /login HTTP/1.1</b>     <em>← method · path · version</em>{"\nHost: example.com           "}<em>← headers</em>{"\nContent-Type: application/json\n                            "}<em>← blank line</em>{"\n{\"username\":\"abc\",\"password\":\"xyz\"}  "}<em>← body</em></pre>
          </div>
          <div>
            <h4>Response</h4>
            <pre className="dg" style={{ margin: ".4rem 0" }}><b>HTTP/1.1 200 OK</b>         <em>← version · status</em>{"\nContent-Type: text/html\nContent-Length: 1024\n\n<html>...</html>"}</pre>
          </div>
        </div>
        <p>Example JSON exchange: <code>GET /users/10</code> → <code>200 OK</code>, <code>{"{\"id\":10,\"name\":\"Prince\"}"}</code>.</p>
        <p>The simplest exchange: <code>GET /index.html HTTP/1.1</code> + <code>Host: example.com</code> → <code>HTTP/1.1 200 OK</code> + <code>Content-Type: text/html</code>. Bodies for writes: <code>POST /users</code> with <code>{"{\"name\": \"Prince\"}"}</code> creates a user; <code>PUT /users/10</code> replaces user 10; <code>PATCH /users/10</code> with <code>{"{\"name\": \"Rahul\"}"}</code> changes only the name; <code>DELETE /users/10</code> removes it.</p>
      </section>
      <section>
        <h2 id="http-methods"><span className="num">14.2</span>Methods, safety and idempotency</h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Method</th>
                <th>Purpose</th>
                <th>Safe</th>
                <th>Idempotent</th>
                <th>Body</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>GET</td>
                <td>Retrieve</td>
                <td>✔</td>
                <td>✔</td>
                <td>No</td>
              </tr>
              <tr>
                <td>POST</td>
                <td>Submit / create / process</td>
                <td>✘</td>
                <td>✘</td>
                <td>Yes</td>
              </tr>
              <tr>
                <td>PUT</td>
                <td>Replace whole resource (or create at known URL)</td>
                <td>✘</td>
                <td>✔</td>
                <td>Yes</td>
              </tr>
              <tr>
                <td>PATCH</td>
                <td>Partial update</td>
                <td>✘</td>
                <td>✘ (not guaranteed)</td>
                <td>Yes</td>
              </tr>
              <tr>
                <td>DELETE</td>
                <td>Delete</td>
                <td>✘</td>
                <td>✔</td>
                <td>Optional</td>
              </tr>
              <tr>
                <td>HEAD <span className="add">+ Added</span></td>
                <td>GET without body (check headers, size)</td>
                <td>✔</td>
                <td>✔</td>
                <td>No</td>
              </tr>
              <tr>
                <td>OPTIONS <span className="add">+ Added</span></td>
                <td>Which methods are allowed? (CORS preflight)</td>
                <td>✔</td>
                <td>✔</td>
                <td>No</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p><strong>Safe</strong> = doesn't change server state. <strong>Idempotent</strong> = doing it once or 10 times leaves the same final state (DELETE twice: still deleted; the second may return 404, but the state is the same). POST twice creates two orders, which is why "Resubmit form?" warnings exist.</p>
        <h3 id="http-get-vs-post">GET vs POST</h3>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>GET</th>
                <th>POST</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Retrieve data</td>
                <td>Submit / process data</td>
              </tr>
              <tr>
                <td>Parameters in URL query string</td>
                <td>Data in body</td>
              </tr>
              <tr>
                <td>Safe, idempotent</td>
                <td>Neither</td>
              </tr>
              <tr>
                <td>Cacheable, bookmarkable, stays in history/logs</td>
                <td>Usually not cached, not bookmarkable</td>
              </tr>
              <tr>
                <td>URL length limits (~2–8 KB in practice)</td>
                <td>Large bodies OK</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="co trap">
          <span className="lb">Don't say "POST is secure and GET is insecure"</span>
          <p>Both are plain text over HTTP and both are encrypted over HTTPS. <strong>TLS provides encryption, not the choice of method.</strong> GET parameters do leak into logs, history and Referer headers, so never put secrets in a URL.</p>
        </div>
      </section>
      <section>
        <h2 id="http-status"><span className="num">14.3</span>Status codes</h2>
        <W name="status" />
        <div className="co key">
          <span className="lb">401 vs 403</span>
          <span className="fx">401 Unauthorized → "Who are you?" (authentication missing or failed)</span>
          <span className="fx">403 Forbidden → "I know who you are, but you can't do this." (authorisation)</span>
        </div>
      </section>
      <section>
        <h2 id="http-state"><span className="num">14.4</span>HTTP is stateless: cookies, sessions, tokens</h2>
        <p>HTTP itself doesn't remember previous requests; each request is independent. But sites need login, carts and preferences, so we add state on top with <strong>cookies, sessions and tokens</strong>.</p>
        <h3 id="http-cookies">Cookies</h3>
        <p>Small data the browser stores per domain. Server sends <code>Set-Cookie: sessionId=abc123</code>; the browser sends <code>Cookie: sessionId=abc123</code> back on later requests to that site. Uses: session tracking, auth state, preferences, carts, analytics.</p>
        <h3 id="http-session-based-authentication">Session-based authentication</h3>
        <div className="flow">
          <span>Login: server verifies credentials</span>
          <span>Server creates a session (data stored server-side)</span>
          <span>Sends Session ID in a cookie</span>
          <span>Later requests: browser sends cookie → server looks up session → identifies user</span>
        </div>
        <p>The cookie may contain only the session ID; the actual data stays on the server.</p>
        <div className="vs">
          <div><h4>Cookie</h4>Stored on the <strong>client/browser</strong>. A transport mechanism.</div>
          <div><h4>Session</h4><strong>Server-side</strong> state associated with a client (via the session ID).</div>
        </div>
        <h3 id="http-jwt-json-web-token">JWT (JSON Web Token)</h3>
        <p><code>header.payload.signature</code> (each Base64URL-encoded), sent as <code>{"Authorization: Bearer <token>"}</code>. The server <strong>verifies the signature</strong> instead of storing a session per client, so it's <strong>stateless</strong> and scales across servers.</p>
        <div className="co trap">
          <span className="lb">Trap</span>
          <p>A JWT is <strong>signed, not encrypted</strong> by default. Anyone can Base64-decode the payload, so never put secrets in it. <span className="add">+ Added</span> Downside: hard to revoke before expiry (use short expiry + refresh tokens, or a deny-list).</p>
        </div>
        <h3 id="http-cookie-security-attributes">Cookie security attributes</h3>
        <ul>
          <li><strong>Secure</strong>: only sent over HTTPS.</li>
          <li><strong>HttpOnly</strong>: JavaScript can't read it via <code>document.cookie</code>, which reduces theft by XSS.</li>
          <li><strong>SameSite</strong> (Strict / Lax / None): controls sending on cross-site requests, which mitigates CSRF.</li>
          <li><span className="add">+ Added</span> <strong>Domain / Path / Expires / Max-Age</strong> scope and lifetime. No expiry = session cookie (deleted when the browser closes).</li>
        </ul>
      </section>
      <section>
        <h2 id="http-caching"><span className="num">14.5</span>HTTP caching <span className="add">+ Added</span></h2>
        <ul>
          <li><code>Cache-Control: max-age=3600</code> fresh for an hour; <code>no-cache</code> = revalidate first; <code>no-store</code> = never store; <code>private</code>/<code>public</code>.</li>
          <li><strong>Validation</strong>: server sends <code>ETag</code> or <code>Last-Modified</code>; browser later asks with <code>If-None-Match</code> / <code>If-Modified-Since</code>; if unchanged, server replies <strong>304 Not Modified</strong> with no body.</li>
          <li>Caches exist in the browser, proxies and CDNs.</li>
        </ul>
      </section>
      <section>
        <h2 id="http-versions"><span className="num">14.6</span>Keep-alive and HTTP versions</h2>
        <p>A new TCP (and TLS) connection per request is expensive. <strong>Keep-alive / persistent connections</strong> reuse one connection for many requests.</p>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>HTTP/1.0</th>
                <th>HTTP/1.1</th>
                <th>HTTP/2</th>
                <th>HTTP/3</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Transport</td>
                <td>TCP</td>
                <td>TCP</td>
                <td>TCP (+TLS)</td>
                <td>QUIC over UDP</td>
              </tr>
              <tr>
                <td>Connections</td>
                <td>New per request</td>
                <td>Persistent by default</td>
                <td>One, multiplexed</td>
                <td>One, multiplexed</td>
              </tr>
              <tr>
                <td>Framing</td>
                <td>Text</td>
                <td>Text</td>
                <td>Binary frames</td>
                <td>Binary frames</td>
              </tr>
              <tr>
                <td>Multiplexing</td>
                <td>No</td>
                <td>Limited (pipelining, rarely used)</td>
                <td>Yes (streams)</td>
                <td>Yes (independent streams)</td>
              </tr>
              <tr>
                <td>Header compression</td>
                <td>No</td>
                <td>No</td>
                <td>HPACK</td>
                <td>QPACK</td>
              </tr>
              <tr>
                <td>Other</td>
                <td></td>
                <td>Host header, chunked transfer encoding</td>
                <td>Stream priority, server push (deprecated)</td>
                <td>0/1-RTT setup, connection migration</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="co added">
          <span className="lb">+ Added · head-of-line blocking (why HTTP/3 exists)</span>
          <p>HTTP/1.1: a slow response blocks the ones behind it on that connection, so browsers open ~6 connections per host. HTTP/2 fixes that at the HTTP layer by multiplexing streams, but all streams share one <strong>TCP</strong> byte stream, so a single lost TCP packet stalls every stream until it's retransmitted (<strong>TCP-level HOL blocking</strong>). HTTP/3 runs on <strong>QUIC</strong>, where each stream is delivered independently, so loss on one stream doesn't block others.</p>
        </div>
        <p>Don't say "HTTP/3 is unreliable because it uses UDP": <strong>QUIC adds reliability, encryption (TLS 1.3 built in), stream multiplexing and faster setup on top of UDP</strong>.</p>
      </section>
      <section>
        <h2 id="http-realtime"><span className="num">14.7</span>Real-time: polling, long polling, SSE, WebSockets <span className="add">+ Added</span></h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Technique</th>
                <th>How</th>
                <th>Direction</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Short polling</td>
                <td>Ask every N seconds</td>
                <td>Client pulls; wasteful</td>
              </tr>
              <tr>
                <td>Long polling</td>
                <td>Server holds the request open until there's news</td>
                <td>Pseudo-push</td>
              </tr>
              <tr>
                <td>Server-Sent Events</td>
                <td>One long HTTP response streaming events</td>
                <td>Server → client only</td>
              </tr>
              <tr>
                <td>WebSocket</td>
                <td>HTTP <code>Upgrade</code> → <strong>101 Switching Protocols</strong> → persistent full-duplex channel over the same TCP connection (ws:// / wss://)</td>
                <td>Both ways; chat, games, live trading</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p><strong>REST</strong>: architectural style using resources (URLs), standard methods, stateless requests, representations (JSON). <strong>CORS</strong>: browsers block cross-origin JS requests unless the server allows them with <code>Access-Control-Allow-Origin</code>; non-simple requests trigger an OPTIONS preflight.</p>
      </section>
      <section>
        <h2 id="http-vs"><span className="num">14.8</span>HTTP vs HTTPS</h2>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>HTTP</th>
                <th>HTTPS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Plain HTTP</td>
                <td>HTTP over TLS</td>
              </tr>
              <tr>
                <td>Port 80</td>
                <td>Port 443</td>
              </tr>
              <tr>
                <td>No encryption</td>
                <td>Encrypted with TLS</td>
              </tr>
              <tr>
                <td>No server authentication</td>
                <td>Server authenticated by certificate</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>HTTPS doesn't change HTTP's request/response model; it secures the channel. Order: <strong>DNS → TCP → TLS → HTTP</strong>.</p>
      </section>
    </>
  );
}

export function Quick() {
  return (
    <>
      <div className="quick-grid">
        <div>
          <h4>Methods</h4>
          <ul>
            <li>GET retrieve · POST create/process</li>
            <li>PUT replace · PATCH partial · DELETE</li>
            <li>Idempotent: GET PUT DELETE HEAD OPTIONS</li>
            <li>Safe: GET HEAD OPTIONS</li>
          </ul>
        </div>
        <div>
          <h4>Status</h4>
          <ul>
            <li>1xx info · 2xx ok · 3xx redirect · 4xx client · 5xx server</li>
            <li>200 201 204 · 301 302 304</li>
            <li>400 401 403 404 429 · 500 502 503 504</li>
          </ul>
        </div>
        <div>
          <h4>State</h4>
          <ul>
            <li>HTTP stateless</li>
            <li>Cookie client-side · session server-side</li>
            <li>JWT signed not encrypted</li>
            <li>Secure · HttpOnly · SameSite</li>
          </ul>
        </div>
        <div>
          <h4>Versions</h4>
          <ul>
            <li>1.1 persistent + Host header</li>
            <li>2 binary + multiplexing + HPACK</li>
            <li>3 QUIC/UDP, no TCP HOL blocking</li>
            <li>WebSocket: 101 Switching Protocols</li>
          </ul>
        </div>
      </div>
    </>
  );
}
