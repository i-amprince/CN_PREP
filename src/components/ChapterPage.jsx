import { Component, lazy, Suspense, useEffect, useMemo } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { CHAPTERS, CH_BY_ID, UNITS, layerVar, layerName } from '../data/chapters.js';
import { chapterModules } from '../chapters/index.js';
import { QA } from '../data/qa/index.js';
import { actions, useStore } from '../lib/store.js';
import FlashDeck from './FlashDeck.jsx';
import Quiz from './Quiz.jsx';

const cache = {};
function chapterParts(id) {
  if (!cache[id]) {
    cache[id] = {
      Notes: lazy(() => chapterModules[id]().then((m) => ({ default: m.Notes }))),
      Quick: lazy(() => chapterModules[id]().then((m) => ({ default: m.Quick }))),
    };
  }
  return cache[id];
}

const Loading = () => <p style={{ color: 'var(--muted)' }}>Loading…</p>;

class LoadBoundary extends Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (this.state.err) {
      return (
        <div className="co trap"><span className="lb">Couldn't load this chapter</span>
          <p>You may be offline and this chapter hasn't been cached yet. <button className="linkish" onClick={() => window.location.reload()}>Try again</button>.</p></div>
      );
    }
    return this.props.children;
  }
}

// scroll to a heading once the lazily loaded notes are in the DOM, then flash it
function useJumpTo(hid, deps) {
  useEffect(() => {
    if (!hid) return undefined;
    let tries = 0;
    let raf;
    const tick = () => {
      const el = document.getElementById(hid);
      if (el) {
        el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        el.classList.remove('flash');
        void el.offsetWidth;
        el.classList.add('flash');
      } else if (tries++ < 120) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default function ChapterPage() {
  const { id } = useParams();
  const ch = CH_BY_ID[id];
  const [params, setParams] = useSearchParams();
  const mode = useStore((s) => s.mode);
  const done = useStore((s) => !!s.done[id]);
  const best = useStore((s) => s.best[id]);
  const qa = QA[id] || { cards: [], quiz: [] };
  const tab = params.get('tab') || (mode === 'quick' ? 'quick' : 'notes');
  const hid = params.get('h');
  const cardIdx = Number(params.get('card') || 0);

  useEffect(() => { if (ch) document.title = `${ch.short} · Packet Notes`; }, [ch]);
  useJumpTo(hid, [hid, id]);

  const parts = useMemo(() => (ch ? chapterParts(id) : null), [id, ch]);
  if (!ch) return <Navigate to="/" replace />;
  const { Notes, Quick } = parts;
  const idx = CHAPTERS.indexOf(ch);
  const prev = CHAPTERS[idx - 1];
  const next = CHAPTERS[idx + 1];
  const unit = UNITS[ch.unit];

  const setTab = (t) => {
    const p = new URLSearchParams();
    p.set('tab', t);
    setParams(p, { replace: true });
  };

  const tabs = [
    ['notes', 'Notes'],
    ['quick', 'Quick sheet'],
    ['cards', 'Flashcards', qa.cards.length],
    ['quiz', 'Quiz', qa.quiz.length],
  ];

  return (
    <article className="ch" style={{ '--lc': layerVar(ch.layer) }} key={id}>
      <div className="ch-head">
        <div className="ch-meta">
          <span className="chip">Unit {unit.n} · {unit.name}</span>
          <span className="chip layer">{layerName(ch)}</span>
          <span className="chip">Chapter {ch.num}</span>
          {best && <span className="chip">Quiz best {best.score}/{best.total}</span>}
        </div>
        <h1>{ch.title}</h1>
        <p className="lede">{ch.lede}</p>
      </div>
      <div className="tabs" role="tablist">
        {tabs.map(([k, label, n]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            {label}{n != null && <span className="cnt">({n})</span>}
          </button>
        ))}
      </div>

      <LoadBoundary key={id + tab}>
      <Suspense fallback={<Loading />}>
        {tab === 'notes' && <div className="pane notes"><Notes /></div>}
        {tab === 'quick' && <div className="pane quick-sheet"><Quick /><p className="qs-more">Want the full explanation? <button className="linkish" onClick={() => setTab('notes')}>Open the notes</button>.</p></div>}
      </Suspense>
      </LoadBoundary>
      {tab === 'cards' && <div className="pane"><FlashDeck cards={qa.cards} start={cardIdx} key={id + cardIdx} /></div>}
      {tab === 'quiz' && (
        <div className="pane">
          <Quiz key={id} questions={qa.quiz} onFinish={(s, t) => actions.recordScore(id, s, t)} best={best} />
        </div>
      )}

      <div className="ch-foot">
        {prev ? <Link className="btn" to={`/ch/${prev.id}`}>← {prev.short}</Link> : <Link className="btn" to="/">← Home</Link>}
        <button className={'btn done-btn' + (done ? ' done' : '')} onClick={() => actions.toggleDone(id)} aria-pressed={done}>
          {done ? '✓ Done' : 'Mark as done'}
        </button>
        {next ? <Link className="btn" to={`/ch/${next.id}`}>{next.short} →</Link> : <Link className="btn" to="/practice">Practice →</Link>}
      </div>
    </article>
  );
}
