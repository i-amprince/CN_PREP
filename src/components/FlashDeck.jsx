import { useCallback, useEffect, useMemo, useState } from 'react';
import { CH_BY_ID, layerVar } from '../data/chapters.js';

function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}

// cards: [[front, back]] or [[front, back, chapterId]]
export default function FlashDeck({ cards, start = 0, showChapter = false }) {
  const [order, setOrder] = useState(() => cards.map((_, i) => i));
  const [i, setI] = useState(Math.min(start, Math.max(cards.length - 1, 0)));
  const [flip, setFlip] = useState(false);
  const [known, setKnown] = useState(() => new Set());

  useEffect(() => { setOrder(cards.map((_, k) => k)); setI(0); setFlip(false); setKnown(new Set()); }, [cards]);

  const go = useCallback((d) => { setFlip(false); setI((x) => (x + d + order.length) % order.length); }, [order.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === ' ' && e.target.closest('.fc-wrap')) { e.preventDefault(); setFlip((f) => !f); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const card = cards[order[i]];
  const ch = card && card[2] ? CH_BY_ID[card[2]] : null;
  const pct = useMemo(() => (cards.length ? Math.round((known.size / cards.length) * 100) : 0), [known, cards.length]);
  if (!cards.length) return <p>No flashcards yet.</p>;

  const markKnown = () => { setKnown((s) => new Set(s).add(order[i])); go(1); };

  return (
    <div className="fc-wrap" style={ch ? { '--lc': layerVar(ch.layer) } : undefined}>
      <div
        className={'fc' + (flip ? ' flip' : '')}
        role="button"
        tabIndex={0}
        aria-label={flip ? 'Answer side. Press Enter to flip back.' : 'Question side. Press Enter to see the answer.'}
        onClick={() => setFlip((f) => !f)}
        onKeyDown={(e) => { if (e.key === 'Enter') setFlip((f) => !f); }}
      >
        <div className="fc-in">
          <div className="fc-face f">
            <span className="tagl">{showChapter && ch ? ch.short : 'Question'} · tap to flip</span>
            <div className="q">{card[0]}</div>
          </div>
          <div className="fc-face b">
            <span className="tagl">Answer</span>
            <div className="a">{card[1]}</div>
          </div>
        </div>
      </div>
      <div className="fc-bar">
        <button className="btn sm" onClick={() => go(-1)} aria-label="Previous card">← Prev</button>
        <span className="fc-count">{i + 1} / {order.length}</span>
        <button className="btn sm" onClick={() => go(1)} aria-label="Next card">Next →</button>
      </div>
      <div className="fc-bar">
        <button className="btn sm" onClick={() => setFlip((f) => !f)}>Flip</button>
        <button className="btn sm" onClick={markKnown} title="Mark as known and move on">I knew it ✓</button>
        <button className="btn sm" onClick={() => { setOrder(shuffle(order)); setI(0); setFlip(false); }}>Shuffle</button>
        <span className="fc-count">Known {known.size} ({pct}%)</span>
      </div>
      <p className="fc-hint">Keys: ← → to move, Space or Enter to flip.</p>
    </div>
  );
}
