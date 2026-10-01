import { useEffect, useState } from 'react';

export const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Widget card wrapper: same markup as the design system's .wg placeholder.
export function Card({ title, tag = 'interactive', children, className = '', style }) {
  return (
    <div className={'wg ' + className} style={style}>
      <div className="wg-h"><b>{title}</b><span>{tag}</span></div>
      {children}
    </div>
  );
}

// Step state with Prev / Next / Play (auto-advance) / Reset.
export function useStepper(n, { interval = 1500, loop = false, auto = false, start = 0 } = {}) {
  const [i, setI] = useState(start);
  const [playing, setPlaying] = useState(auto);
  useEffect(() => {
    if (!playing) return undefined;
    if (i >= n - 1 && !loop) { setPlaying(false); return undefined; }
    const t = setTimeout(() => setI((x) => (x >= n - 1 ? 0 : x + 1)), interval);
    return () => clearTimeout(t);
  }, [playing, i, n, loop, interval]);
  useEffect(() => { if (i > n - 1) setI(Math.max(0, n - 1)); }, [n, i]);
  return {
    i, n, playing,
    set: (k) => { setPlaying(false); setI(Math.max(0, Math.min(n - 1, k))); },
    next: () => { setPlaying(false); setI((x) => Math.min(n - 1, x + 1)); },
    prev: () => { setPlaying(false); setI((x) => Math.max(0, x - 1)); },
    reset: () => { setPlaying(false); setI(start); },
    toggle: () => { if (!playing && i >= n - 1) setI(start); setPlaying((p) => !p); },
    atEnd: i >= n - 1,
  };
}

export function StepControls({ st, label, children, showReset = true }) {
  return (
    <div className="wg-ctl">
      <button className="btn sm" onClick={st.prev} disabled={st.i === 0} aria-label="Previous step">← Prev</button>
      <button className="btn sm pri" onClick={st.next} disabled={st.atEnd} aria-label="Next step">Next →</button>
      <button className="btn sm" onClick={st.toggle} aria-label={st.playing ? 'Pause' : 'Play'}>{st.playing ? '❚❚ Pause' : '▶ Play'}</button>
      {showReset && <button className="btn sm" onClick={st.reset}>Reset</button>}
      <span className="muted small mono">{label ?? `Step ${st.i + 1} / ${st.n}`}</span>
      {children}
    </div>
  );
}

export function Tabs({ items, value, onChange }) {
  return (
    <div className="tabs-mini" role="tablist">
      {items.map(([k, label]) => (
        <button key={k} role="tab" aria-selected={value === k} className={value === k ? 'on' : ''} onClick={() => onChange(k)}>{label}</button>
      ))}
    </div>
  );
}

export function KV({ items }) {
  return (
    <div className="kv">
      {items.filter(Boolean).map(([k, v]) => <div key={k}><small>{k}</small><b>{v}</b></div>)}
    </div>
  );
}

export const LAYER_COLOR = { 7: 'var(--l7)', 6: 'var(--l6)', 5: 'var(--l5)', 4: 'var(--l4)', 3: 'var(--l3)', 2: 'var(--l2)', 1: 'var(--l1)' };

// SVG arrow marker defs, re-usable (ids must be unique per widget instance)
export function ArrowDefs({ id, color = 'var(--muted)' }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill={color} />
      </marker>
    </defs>
  );
}
