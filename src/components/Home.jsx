import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UNITS, CHAPTERS, chaptersOfUnit } from '../data/chapters.js';
import { QA } from '../data/qa/index.js';
import { useStore, actions } from '../lib/store.js';
import { Encap } from '../widgets/Encap.jsx';
import Icon from './Icon.jsx';

const N_CARDS = Object.values(QA).reduce((s, q) => s + q.cards.length, 0);
const N_QUIZ = Object.values(QA).reduce((s, q) => s + q.quiz.length, 0);

const TIPS = [
  'Switch learns from the SOURCE MAC and forwards on the DESTINATION MAC.',
  'ARP request is broadcast; the reply is unicast.',
  'SYN with Seq = 100 → the server ACKs 101. SYN consumes one number.',
  'MAC addresses change at every hop. IP stays end to end (except NAT).',
  'Effective window = min(rwnd, cwnd).',
  'Tahoe drops to 1 MSS on 3 dup ACKs. Reno halves and fast-recovers.',
  'You never ARP for Google. You ARP for your default gateway.',
  'RIP: 15 hops max, 16 = infinity.',
];

const TICKER = [
  ['53', 'DNS · UDP + TCP'], ['443', 'HTTPS'], ['67/68', 'DHCP'], ['22', 'SSH'], ['179', 'BGP over TCP'],
  ['SYN', 'consumes 1 seq'], ['ARP', 'request = broadcast'], ['/26', '62 usable hosts'], ['TTL', '−1 per router'],
  ['FIN', 'graceful · RST abrupt'], ['CRC', 'XOR long division'], ['OSPF', 'Dijkstra · IP proto 89'],
  ['cwnd', 'protects the network'], ['rwnd', 'protects the receiver'], ['2MSL', 'TIME_WAIT'], ['QUIC', 'HTTP/3 over UDP'],
];

function useRotating(list, ms) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => setI((x) => (x + 1) % list.length), ms);
    return () => clearInterval(t);
  }, [list.length, ms]);
  return list[i];
}

export default function Home() {
  const done = useStore((s) => s.done);
  const best = useStore((s) => s.best);
  useEffect(() => { document.title = 'CN Prep · Computer Networks revision'; }, []);
  const next = CHAPTERS.find((c) => !done[c.id]);
  const nDone = CHAPTERS.filter((c) => done[c.id]).length;
  const quizzes = Object.keys(best).filter((k) => k !== 'practice').length;
  const tip = useRotating(TIPS, 4200);
  const startTo = `/ch/${next && nDone > 0 ? next.id : 'osi'}`;

  return (
    <div className="home">
      {/* ---------- hero ---------- */}
      <section className="hero">
        <div className="hero-copy">
          <span className="pill-badge"><span className="pulse" />Placement season · CN revision</span>
          <h1>Every layer.<br /><span className="dim">One packet</span><br /><span className="sig">at a time.</span></h1>
          <p className="lede">All my notes, reorganised into 21 chapters with the gaps filled in. Every chapter has full notes, a one-page quick sheet, flashcards and a quiz, and the ASCII art is replaced by diagrams you can click through.</p>
          <div className="hero-actions">
            <Link className="bracket" to={startTo}>
              <span className="d1" /><span className="d2" />
              {nDone > 0 && next ? `Continue: ${next.short}` : 'Start revising'}
              <Icon name="arrowUpRight" />
            </Link>
            <Link className="text-link" to="/ch/journey">Type google.com →</Link>
            <Link className="text-link" to="/ch/cheatsheet">Cheat sheet →</Link>
          </div>
        </div>

        <div className="stage" aria-hidden="true">
          <div className="float term">
            <div className="fh"><Icon name="terminal" />traceroute google.com</div>
            <div>1&nbsp; 192.168.1.1&nbsp;&nbsp; 1.2 ms</div>
            <div>2&nbsp; 10.10.0.1&nbsp;&nbsp;&nbsp;&nbsp; 8.5 ms</div>
            <div>3&nbsp; 72.14.215.85&nbsp; 14.1 ms</div>
            <div className="ok">4&nbsp; 142.250.1.1&nbsp;&nbsp; 15.0 ms ✓</div>
          </div>

          <div className="float center">
            <span className="tag-sys">LIVE</span>
            <div className="lbl-mono" style={{ color: 'var(--muted)' }}>Chapters done</div>
            <div className="big">{String(nDone).padStart(2, '0')}<span style={{ color: 'var(--faint)' }}>/{CHAPTERS.length}</span></div>
            <div className="strike">{quizzes ? `${quizzes} quizzes attempted` : 'no quizzes attempted yet'}</div>
            <div className="meter"><i style={{ width: `${Math.max(3, (nDone / CHAPTERS.length) * 100)}%` }} /></div>
          </div>

          <div className="float chip-v">
            <b><Icon name="check" />ACK 101 verified</b>
            SYN Seq=100 consumed one number.
          </div>

          <div className="float bot">
            <div className="av"><Icon name="bot" /></div>
            <p key={tip}>{tip}</p>
          </div>
        </div>

        <div className="stats">
          <div className="stat"><Icon name="layers" /><b>{CHAPTERS.length}</b><span>Chapters</span></div>
          <div className="stat"><Icon name="activity" /><b>51</b><span>Live diagrams</span></div>
          <div className="stat"><Icon name="cards" /><b>{N_CARDS}</b><span>Flashcards</span></div>
          <div className="stat"><Icon name="help" /><b>{N_QUIZ}</b><span>Quiz questions</span></div>
        </div>
      </section>

      {/* ---------- encapsulation console ---------- */}
      <section className="sec">
        <div className="sec-head">
          <div>
            <span className="eyebrow">Interactive, not static</span>
            <h2>The diagram is the explanation.</h2>
            <p>Instead of ASCII art, every hard idea is something you can step through: headers stacking up, a switch learning MACs, cwnd climbing and crashing.</p>
          </div>
        </div>
        <div className="bento">
          <div className="panel glowy">
            <div className="session"><span className="pulse" />Encapsulation · sender side · auto-playing</div>
            <Encap auto compact />
          </div>
          <div className="tools-card">
            <h3>Jump in <em>shortcuts</em></h3>
            <p>The pages I open most before an interview.</p>
            <Link className="tool-link hot" to="/ch/journey"><span><Icon name="route" />Type google.com: the journey</span><Icon name="chevron" /></Link>
            <Link className="tool-link" to="/ch/cheatsheet"><span><Icon name="book" />Cheat sheet + Q&amp;A bank</span><Icon name="chevron" /></Link>
            <Link className="tool-link" to="/practice"><span><Icon name="zap" />Practice arena</span><Icon name="chevron" /></Link>
            <Link className="tool-link" to="/ch/congestion"><span><Icon name="activity" />cwnd: Tahoe vs Reno</span><Icon name="chevron" /></Link>
          </div>
        </div>
      </section>

      {/* ---------- units ---------- */}
      <section className="sec">
        <div className="panel">
          <div className="split">
            <div>
              <span className="eyebrow">The syllabus</span>
              <div className="sec-head" style={{ marginBottom: 0 }}><h2>Seven units. One stack.</h2></div>
              <p style={{ color: 'var(--muted)', margin: '1rem 0 0', fontWeight: 300 }}>Bottom to top, following the packet: foundations, architecture, data link, network, transport, application and security, then Wi-Fi, VPNs and the full journey.</p>
              <div className="timeline">
                <div className="tl"><i /><div><b>01 · Study mode</b><p>Full notes, worked examples and interactive diagrams. Use it the first time through.</p></div></div>
                <div className="tl"><i /><div><b>02 · Quick mode</b><p>Every chapter opens on its quick sheet: just the must-remember lines. Use it the night before.</p></div></div>
                <div className="tl"><i /><div><b>03 · Flashcards &amp; quiz</b><p>Every chapter has both. The <Link to="/practice">Practice</Link> page mixes all of them.</p></div></div>
                <div className="tl"><i /><div><b>04 · + Added</b><p>Anything with this tag wasn't in my original notes. It fills a gap.</p></div></div>
              </div>
            </div>
            <div className="units">
              {UNITS.map((u) => (
                <div className="ucard" key={u.n} style={{ '--uc': u.color }}>
                  <span className="bgnum">{u.n}</span>
                  <div className="k">Unit {u.n}<em>{chaptersOfUnit(u.n).filter((c) => done[c.id]).length}/{chaptersOfUnit(u.n).length}</em></div>
                  <h3>{u.name}</h3>
                  <ul>
                    {chaptersOfUnit(u.n).map((c) => (
                      <li key={c.id}>
                        <Link to={`/ch/${c.id}`} className={done[c.id] ? 'dn' : ''}>
                          <span>{c.short}</span>
                          <small>{best[c.id] ? `${best[c.id].score}/${best[c.id].total}` : String(c.num).padStart(2, '0')}</small>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...TICKER, ...TICKER].map(([k, v], i) => <span key={i}><b>{k}</b>{v}</span>)}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="cta-band">
        <span className="pill-badge">Interview mode</span>
        <h2>Answer it before they finish asking.</h2>
        <p>
          {nDone} of {CHAPTERS.length} chapters done · {quizzes} chapter quizzes attempted
          {best.practice ? ` · best mixed quiz ${best.practice.score}/${best.practice.total}` : ''}.
          {(nDone > 0 || Object.keys(best).length > 0) && <> <button className="linkish" onClick={() => { if (window.confirm('Reset all progress and quiz scores?')) actions.resetProgress(); }}>Reset progress</button></>}
        </p>
        <Link className="bracket" to="/practice"><span className="d1" /><span className="d2" />Open the practice arena<Icon name="arrowUpRight" /></Link>
      </section>

      <footer className="foot">
        <span>CN Prep · built for placement season</span>
        <span><Link to="/ch/osi">Start</Link> · <Link to="/ch/cheatsheet">Cheat sheet</Link> · <Link to="/practice">Practice</Link></span>
      </footer>
    </div>
  );
}
