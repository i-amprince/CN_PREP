// Widget registry: <W name="x" /> in a chapter loads the matching component on demand.
import { lazy, Suspense, Component } from 'react';

const g = {
  encap: () => import('./Encap.jsx'),
  osi: () => import('./osi.jsx'),
  basics: () => import('./basics.jsx'),
  datalink: () => import('./datalink.jsx'),
  flow: () => import('./Flow.jsx'),
  access: () => import('./access.jsx'),
  seq: () => import('./Seq.jsx'),
  errors: () => import('./errors.jsx'),
  ip: () => import('./ip.jsx'),
  subnet: () => import('./subnet.jsx'),
  routing: () => import('./routing.jsx'),
  transport: () => import('./transport.jsx'),
  window: () => import('./window.jsx'),
  congestion: () => import('./congestion.jsx'),
  termination: () => import('./termination.jsx'),
  app: () => import('./app.jsx'),
  journey: () => import('./journey.jsx'),
  vpn: () => import('./vpn.jsx'),
  wireless: () => import('./wireless.jsx'),
};

const REG = {
  encap: ['encap', 'Encap'],
  osi: ['osi', 'Osi'], osimap: ['osi', 'OsiMap'],
  topology: ['basics', 'Topology'], delay: ['basics', 'Delay'],
  macaddr: ['datalink', 'MacAddr'], ethframe: ['datalink', 'EthFrame'], switchsim: ['datalink', 'SwitchSim'], domains: ['datalink', 'Domains'],
  'flow-csmacd': ['flow', 'FlowCsmaCd'], 'flow-csmaca': ['flow', 'FlowCsmaCa'], 'flow-cc': ['flow', 'FlowCC'],
  backoff: ['access', 'Backoff'], hidden: ['access', 'Hidden'],
  parity: ['errors', 'Parity'], checksum: ['errors', 'Checksum'], crc: ['errors', 'Crc'], hamming: ['errors', 'Hamming'],
  nat: ['ip', 'Nat'], hops: ['ip', 'Hops'], lpm: ['ip', 'Lpm'], traceroute: ['ip', 'Traceroute'],
  subnetcalc: ['subnet', 'SubnetCalc'], subnetsplit: ['subnet', 'SubnetSplit'], ipv4hdr: ['subnet', 'Ipv4Hdr'], frag: ['subnet', 'Frag'],
  cti: ['routing', 'CountToInfinity'], dijkstra: ['routing', 'Dijkstra'],
  tcphdr: ['transport', 'TcpHdr'], mux: ['transport', 'Mux'], seqcalc: ['transport', 'SeqCalc'],
  slidewin: ['window', 'SlideWin'], effwin: ['window', 'EffWin'], gbnsr: ['window', 'GbnSr'],
  cwnd: ['congestion', 'Cwnd'],
  tcpstates: ['termination', 'TcpStates'],
  status: ['app', 'StatusCodes'], dh: ['app', 'DiffieHellman'], proxy: ['app', 'Proxy'],
  journey: ['journey', 'Journey'],
  tunnel: ['vpn', 'Tunnel'], vpntypes: ['vpn', 'VpnTypes'],
  wlanmodes: ['wireless', 'WlanModes'], wifibands: ['wireless', 'WifiBands'],
};

const cache = {};
function get(name) {
  if (name.startsWith('seq-')) {
    const key = name;
    if (!cache[key]) cache[key] = lazy(() => g.seq().then((m) => ({ default: (p) => <m.SeqWidget which={name.slice(4)} {...p} /> })));
    return cache[key];
  }
  const r = REG[name];
  if (!r) return null;
  if (!cache[name]) cache[name] = lazy(() => g[r[0]]().then((m) => ({ default: m[r[1]] || (() => <Missing name={name} />) })));
  return cache[name];
}

function Missing({ name }) {
  return <div className="wg"><div className="wg-h"><b>Widget “{name}”</b><span>coming soon</span></div></div>;
}

class Boundary extends Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (this.state.err) return <div className="wg"><div className="wg-h"><b>This diagram failed to load</b><span>error</span></div><p className="muted small">{String(this.state.err.message || this.state.err)}</p></div>;
    return this.props.children;
  }
}

export default function W({ name, ...rest }) {
  const C = get(name);
  if (!C) return <Missing name={name} />;
  return (
    <Boundary>
      <Suspense fallback={<div className="wg" style={{ minHeight: '8rem' }}><div className="wg-h"><b>Loading diagram…</b><span>{name}</span></div></div>}>
        <C {...rest} />
      </Suspense>
    </Boundary>
  );
}
