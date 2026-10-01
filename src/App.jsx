import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Rail from './components/Rail.jsx';
import TopBar from './components/TopBar.jsx';
import Home from './components/Home.jsx';
import ChapterPage from './components/ChapterPage.jsx';
import Practice from './components/Practice.jsx';

export default function App() {
  const [railOpen, setRailOpen] = useState(false);
  const loc = useLocation();

  // close the mobile drawer and go to the top on every route change (unless jumping to a heading)
  useEffect(() => {
    setRailOpen(false);
    if (!new URLSearchParams(loc.search).get('h')) window.scrollTo({ top: 0 });
  }, [loc.pathname, loc.search]);

  useEffect(() => {
    if (!railOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setRailOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [railOpen]);

  return (
    <div className="app">
      <Rail open={railOpen} />
      {railOpen && <div className="scrim" onClick={() => setRailOpen(false)} />}
      <div className="main">
        <TopBar onMenu={() => setRailOpen(true)} />
        <main className="content" id="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ch/:id" element={<ChapterPage />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/cheatsheet" element={<Navigate to="/ch/cheatsheet" replace />} />
            <Route path="/journey" element={<Navigate to="/ch/journey" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
