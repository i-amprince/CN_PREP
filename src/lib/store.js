// Tiny persisted store: progress (chapters done), quiz best scores, theme and study mode.
// Every storage access is wrapped in try/catch: private windows and blocked storage must not break the app.
import { useSyncExternalStore } from 'react';

const KEY = 'pn.state.v1';
const read = (k, fallback) => { try { const v = localStorage.getItem(k); return v == null ? fallback : JSON.parse(v); } catch { return fallback; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };

let state = {
  done: {},          // { [chapterId]: true }
  best: {},          // { [chapterId | 'practice']: { score, total, at } }
  mode: 'study',     // 'study' | 'quick'
  theme: 'system',   // 'system' | 'light' | 'dark'
  ...read(KEY, {}),
};
try { const t = localStorage.getItem('pn.theme'); if (t) state.theme = t; } catch { /* ignore */ }

const subs = new Set();
function set(patch) {
  state = { ...state, ...patch };
  write(KEY, { done: state.done, best: state.best, mode: state.mode });
  try { localStorage.setItem('pn.theme', state.theme); } catch { /* ignore */ }
  subs.forEach((f) => f());
}
const subscribe = (f) => { subs.add(f); return () => subs.delete(f); };

export function useStore(selector = (s) => s) {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

export const actions = {
  toggleDone(id) { const done = { ...state.done }; if (done[id]) delete done[id]; else done[id] = true; set({ done }); },
  setDone(id) { if (!state.done[id]) set({ done: { ...state.done, [id]: true } }); },
  recordScore(id, score, total) {
    const prev = state.best[id];
    if (!prev || score / total > prev.score / prev.total || (score / total === prev.score / prev.total && total > prev.total)) {
      set({ best: { ...state.best, [id]: { score, total, at: Date.now() } } });
      return true;
    }
    return false;
  },
  setMode(mode) { set({ mode }); },
  cycleTheme() {
    const order = ['system', 'light', 'dark'];
    const theme = order[(order.indexOf(state.theme) + 1) % 3];
    set({ theme });
    applyTheme(theme);
  },
  resetProgress() { set({ done: {}, best: {} }); },
};

export function applyTheme(theme = state.theme) {
  const el = document.documentElement;
  if (theme === 'light' || theme === 'dark') el.setAttribute('data-theme', theme);
  else el.removeAttribute('data-theme');
}

export const getState = () => state;
