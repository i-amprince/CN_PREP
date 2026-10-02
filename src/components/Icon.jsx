// Small inline line icons (lucide-style) so the site needs no icon library.
const P = {
  arrowUpRight: 'M7 17 17 7M8 7h9v9',
  terminal: 'm4 17 6-6-6-6M12 19h8',
  check: 'M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4 12 14l-3-3',
  bot: 'M12 8V4H8M4 12h16v8H4zM2 14h2M20 14h2M9 13v2M15 13v2',
  layers: 'm12 2 10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  cards: 'M3 7h13v13H3zM8 3h13v13',
  help: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01',
  route: 'M6 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM9 16h6.5a3.5 3.5 0 0 0 0-7H12',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5',
  zap: 'M13 2 3 14h9l-1 8 10-12h-9z',
  chevron: 'm9 18 6-6-6-6',
};

export default function Icon({ name, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      <path d={P[name]} />
    </svg>
  );
}
