import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { actions, useStore } from '../lib/store.js';
import { buildIndex, searchIndex, loadBodyIndex } from '../lib/search.js';

const THEME_LABEL = { light: 'Switch to dark theme', dark: 'Switch to light theme' };

function ThemeIcon({ theme }) {
  if (theme === 'light') return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
  if (theme === 'dark') return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>;
}

export default function TopBar({ onMenu }) {
  const mode = useStore((s) => s.mode);
  const theme = useStore((s) => s.theme);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  const nav = useNavigate();
  const base = useMemo(buildIndex, []);
  const [body, setBody] = useState([]);
  const index = useMemo(() => base.concat(body), [base, body]);
  const results = useMemo(() => (q.trim().length > 1 ? searchIndex(index, q) : []), [index, q]);
  const warm = () => { if (!body.length) loadBodyIndex().then(setBody).catch(() => {}); };
  const inputRef = useRef(null);

  const go = (r) => {
    if (!r) return;
    setOpen(false); setQ('');
    inputRef.current?.blur();
    nav(r.to);
  };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); go(results[sel]); }
    else if (e.key === 'Escape') { setOpen(false); e.currentTarget.blur(); }
  };

  return (
    <header className="top">
      <button className="ibtn menu-btn" onClick={onMenu} aria-label="Open chapter list">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      <div className="search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input
          ref={inputRef}
          type="search"
          placeholder="Search topics: ARP, TIME_WAIT, subnet, port 53…"
          autoComplete="off"
          aria-label="Search notes"
          value={q}
          onChange={(e) => { setQ(e.target.value); setSel(0); setOpen(true); warm(); }}
          onFocus={() => { setOpen(true); warm(); }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKey}
        />
        {open && q.trim().length > 1 && (
          <div className="results" role="listbox">
            {results.length === 0 && <div className="empty">No matches for “{q}”.</div>}
            {results.map((r, i) => (
              <button key={r.key} className={i === sel ? 'sel' : ''} onMouseDown={(e) => e.preventDefault()} onClick={() => go(r)} onMouseEnter={() => setSel(i)}>
                <div className="rt">{r.title}</div>
                <div className="rc">{r.ctx}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="tools">
        <div className="seg" role="group" aria-label="Study mode">
          <button className={mode === 'study' ? 'on' : ''} title="Full notes with diagrams" onClick={() => actions.setMode('study')} aria-pressed={mode === 'study'}>Study</button>
          <button className={mode === 'quick' ? 'on' : ''} title="Open each chapter on its quick revision sheet" onClick={() => actions.setMode('quick')} aria-pressed={mode === 'quick'}>Quick</button>
        </div>
        <button className="ibtn" onClick={actions.cycleTheme} aria-label={THEME_LABEL[theme]} title={THEME_LABEL[theme]}>
          <ThemeIcon theme={theme} />
        </button>
      </div>
    </header>
  );
}
