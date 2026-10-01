import { Link, NavLink } from 'react-router-dom';
import { UNITS, CHAPTERS, chaptersOfUnit } from '../data/chapters.js';
import { useStore } from '../lib/store.js';

export function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 34 34" aria-hidden="true">
      <rect x="1" y="1" width="32" height="32" rx="8" fill="var(--ink)" />
      <rect x="7" y="8" width="20" height="3.2" rx="1.6" fill="var(--l7)" />
      <rect x="7" y="13.2" width="20" height="3.2" rx="1.6" fill="var(--l4)" />
      <rect x="7" y="18.4" width="20" height="3.2" rx="1.6" fill="var(--l3)" />
      <rect x="7" y="23.6" width="20" height="3.2" rx="1.6" fill="var(--l2)" />
    </svg>
  );
}

export default function Rail({ open }) {
  const done = useStore((s) => s.done);
  const n = CHAPTERS.filter((c) => done[c.id]).length;
  return (
    <aside className={'rail' + (open ? ' open' : '')} aria-label="Chapters">
      <Link className="brand" to="/">
        <BrandMark />
        <span><b>Packet Notes</b><small>CN revision</small></span>
      </Link>
      <div className="prog">
        <div className="prog-row"><span>Chapters done</span><span>{n} / {CHAPTERS.length}</span></div>
        <div className="bar"><i style={{ width: `${(n / CHAPTERS.length) * 100}%` }} /></div>
      </div>
      <nav className="nav">
        {UNITS.map((u) => (
          <div key={u.n}>
            <div className="unit-h" style={{ '--uc': u.color }}>{u.n} · {u.name}</div>
            {chaptersOfUnit(u.n).map((c) => (
              <NavLink key={c.id} to={`/ch/${c.id}`} className={({ isActive }) => (isActive ? 'on' : '')}>
                <span className="n">{String(c.num).padStart(2, '0')}</span>
                <span>{c.short}</span>
                <span className={'ok' + (done[c.id] ? ' done' : '')} aria-label={done[c.id] ? 'done' : 'not done'}>✓</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <Link className="btn sm" to="/practice" style={{ justifyContent: 'center' }}>Practice: all flashcards &amp; quiz</Link>
    </aside>
  );
}
