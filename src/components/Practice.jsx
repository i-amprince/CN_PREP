import { useEffect, useMemo, useState } from 'react';
import { UNITS, CH_BY_ID } from '../data/chapters.js';
import { QA } from '../data/qa/index.js';
import { actions, useStore } from '../lib/store.js';
import FlashDeck from './FlashDeck.jsx';
import Quiz from './Quiz.jsx';

function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}

const ALL_CARDS = Object.entries(QA).flatMap(([id, qa]) => qa.cards.map((c) => [c[0], c[1], id]));
const ALL_QUIZ = Object.entries(QA).flatMap(([id, qa]) => qa.quiz.map((q) => ({ ...q, ch: id })));

export default function Practice() {
  const [tab, setTab] = useState('fc');
  const [unit, setUnit] = useState('all');
  const [seed, setSeed] = useState(0);
  const best = useStore((s) => s.best.practice);
  useEffect(() => { document.title = 'Practice · Packet Notes'; }, []);

  const cards = useMemo(() => shuffle(ALL_CARDS.filter((c) => unit === 'all' || String(CH_BY_ID[c[2]].unit) === unit)), [unit]);
  const quiz = useMemo(() => {
    const pool = ALL_QUIZ.filter((q) => unit === 'all' || String(CH_BY_ID[q.ch].unit) === unit);
    return shuffle(pool).slice(0, 15);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, seed]);

  return (
    <div className="ch">
      <div className="ch-head">
        <div className="ch-meta"><span className="chip">All chapters</span><span className="chip">{ALL_CARDS.length} flashcards · {ALL_QUIZ.length} questions</span></div>
        <h1>Practice</h1>
        <p className="lede">Mixed flashcards from every chapter, and a fresh 15-question quiz each time you press “New quiz”.</p>
      </div>
      <div className="wg-ctl" style={{ marginTop: 0 }}>
        <label>Unit
          <select value={unit} onChange={(e) => setUnit(e.target.value)} className="sel">
            <option value="all">All units</option>
            {UNITS.map((u) => <option key={u.n} value={String(u.n)}>{u.n} · {u.name}</option>)}
          </select>
        </label>
      </div>
      <div className="tabs" role="tablist">
        <button className={tab === 'fc' ? 'on' : ''} onClick={() => setTab('fc')} role="tab" aria-selected={tab === 'fc'}>Flashcards<span className="cnt">({cards.length})</span></button>
        <button className={tab === 'qz' ? 'on' : ''} onClick={() => setTab('qz')} role="tab" aria-selected={tab === 'qz'}>Mixed quiz<span className="cnt">({quiz.length})</span></button>
      </div>
      {tab === 'fc' && <FlashDeck cards={cards} showChapter key={unit} />}
      {tab === 'qz' && (
        <Quiz key={unit + seed} questions={quiz} showChapter best={best}
          onFinish={(s, t) => actions.recordScore('practice', s, t)}
          onNew={() => setSeed((x) => x + 1)} />
      )}
    </div>
  );
}
