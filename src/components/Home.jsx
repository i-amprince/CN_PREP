import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UNITS, CHAPTERS, chaptersOfUnit } from '../data/chapters.js';
import { useStore, actions } from '../lib/store.js';
import { Encap } from '../widgets/Encap.jsx';

export default function Home() {
  const done = useStore((s) => s.done);
  const best = useStore((s) => s.best);
  useEffect(() => { document.title = 'Packet Notes · CN revision'; }, []);
  const next = CHAPTERS.find((c) => !done[c.id]);
  const nDone = CHAPTERS.filter((c) => done[c.id]).length;

  return (
    <div>
      <div className="hero">
        <div>
          <div className="eyebrow">Computer Networks · placement &amp; interview revision</div>
          <h1>Every layer, <span>one packet</span> at a time.</h1>
          <p>All your notes, reorganised into 21 chapters, with the gaps filled in (subnetting, delays, ALOHA, VLANs, RTO, HTTP caching, security and more). Each chapter has full notes, a one-page quick sheet, flashcards and a quiz. Diagrams you can click through replace most of the ASCII art.</p>
          <div className="cta">
            <Link className="btn pri" to={`/ch/${next && nDone > 0 ? next.id : 'osi'}`}>{nDone > 0 && next ? `Continue: ${next.short}` : 'Start revising'}</Link>
            <Link className="btn" to="/ch/journey">Type google.com: the full journey</Link>
            <Link className="btn" to="/ch/cheatsheet">Cheat sheet</Link>
          </div>
        </div>
        <div className="encap-hero">
          <div className="wg-h" style={{ margin: '0 0 .6rem' }}><b>Encapsulation, live</b><span>sender side</span></div>
          <Encap auto compact />
        </div>
      </div>

      <div className="units">
        {UNITS.map((u) => (
          <div className="ucard" key={u.n} style={{ '--uc': u.color }}>
            <div className="k">Unit {u.n}</div>
            <h3>{u.name}</h3>
            <ul>
              {chaptersOfUnit(u.n).map((c) => (
                <li key={c.id}>
                  <Link to={`/ch/${c.id}`}>
                    <span>{done[c.id] ? '✓ ' : ''}{c.short}</span>
                    <small>{best[c.id] ? `${best[c.id].score}/${best[c.id].total}` : String(c.num).padStart(2, '0')}</small>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="home-sec">
        <h2>How to use this</h2>
        <div className="how">
          <div><b>Study mode</b>Full notes, worked examples and interactive diagrams. Use it the first time through.</div>
          <div><b>Quick mode</b>Every chapter opens on its quick sheet: just the must-remember lines. Use it the night before.</div>
          <div><b>Flashcards &amp; quiz</b>Every chapter has both. The <Link to="/practice">Practice</Link> page mixes all of them.</div>
          <div><b>+ Added</b>Anything marked with this tag was not in your notes. It was added to fill a gap.</div>
        </div>
      </div>
      <div className="home-sec">
        <h2>Your progress</h2>
        <p className="home-prog">{nDone} of {CHAPTERS.length} chapters done · {Object.keys(best).filter((k) => k !== 'practice').length} chapter quizzes attempted{best.practice ? ` · best mixed quiz ${best.practice.score}/${best.practice.total}` : ''}.{' '}
          {(nDone > 0 || Object.keys(best).length > 0) && <button className="linkish" onClick={() => { if (window.confirm('Reset all progress and quiz scores?')) actions.resetProgress(); }}>Reset progress</button>}
        </p>
      </div>
    </div>
  );
}
