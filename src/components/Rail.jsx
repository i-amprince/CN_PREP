import { Link, NavLink } from 'react-router-dom';
import { UNITS, CHAPTERS, chaptersOfUnit } from '../data/chapters.js';
import { useStore } from '../lib/store.js';

export function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect x=".5" y=".5" width="31" height="31" rx="9" fill="none" stroke="var(--line-2)" />
      <path d="M5 20h5l2.5-8 4 12 3-9 2 5H27" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="27" cy="20" r="1.8" fill="var(--accent)" />
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
        <span><b>CN Prep</b><small>packet notes</small></span>
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
      <Link className="btn sm" to="/practice" style={{ justifyContent: 'center' }}>Practice arena ↗</Link>
    </aside>
  );
}
