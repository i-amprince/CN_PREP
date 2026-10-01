import { useEffect, useMemo, useRef, useState } from 'react';
import { CH_BY_ID } from '../data/chapters.js';

// shuffle the option order once per quiz instance so the answer position gives nothing away
function shuffled(q) {
  const idx = q.o.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return { ...q, o: idx.map((i) => q.o[i]), a: idx.indexOf(q.a) };
}

// questions: [{ q, o: [4 options], a: correctIndex, e: explanation, ch? }]
export default function Quiz({ questions: raw, onFinish, best, showChapter = false, onNew }) {
  const questions = useMemo(() => raw.map(shuffled), [raw]);
  const [picked, setPicked] = useState({});
  const [saved, setSaved] = useState(null);
  const reported = useRef(false);
  const answered = Object.keys(picked).length;
  const score = questions.reduce((s, q, i) => s + (picked[i] === q.a ? 1 : 0), 0);
  const finished = answered === questions.length && questions.length > 0;

  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      setSaved(onFinish ? onFinish(score, questions.length) : null);
    }
  }, [finished, score, questions.length, onFinish]);

  const reset = () => { setPicked({}); setSaved(null); reported.current = false; window.scrollTo({ top: 0 }); };
  if (!questions.length) return <p>No questions yet.</p>;

  return (
    <div className="qz">
      {best && <p className="qz-best">Your best on this quiz: <strong>{best.score} / {best.total}</strong></p>}
      {questions.map((q, i) => {
        const p = picked[i];
        const done = p != null;
        return (
          <div className="qq" key={i}>
            <h4><span>{i + 1}.</span>{q.q}</h4>
            {showChapter && q.ch && <div className="qq-ch">{CH_BY_ID[q.ch]?.short}</div>}
            <div className="opts">
              {q.o.map((opt, k) => {
                let cls = '';
                if (done && k === q.a) cls = 'right';
                else if (done && k === p) cls = 'wrong';
                return (
                  <button key={k} className={cls} disabled={done} onClick={() => setPicked((s) => ({ ...s, [i]: k }))}>
                    <span className="opt-k">{'ABCD'[k]}</span> {opt}
                  </button>
                );
              })}
            </div>
            {done && (
              <div className="expl">
                {p === q.a ? <b>Correct. </b> : <b className="x">Not quite. </b>}
                {q.e}
              </div>
            )}
          </div>
        );
      })}
      <div className="score" aria-live="polite">
        <span>Score {score} / {answered} answered · {questions.length} total</span>
        {finished && <span>{saved ? 'New best!' : 'Done'}</span>}
        <button onClick={reset}>Reset</button>
        {onNew && <button onClick={() => { reset(); onNew(); }}>New quiz</button>}
      </div>
    </div>
  );
}
