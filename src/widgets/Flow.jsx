// Generic step-through flowchart with decision branches (CSMA/CD, CSMA/CA, TCP congestion control).
import { useEffect, useRef, useState } from 'react';
import { Card } from './common.jsx';

export function FlowStepper({ title, nodes, start, scenario = [], tagColors = {} }) {
  const [path, setPath] = useState([start]);
  const [playing, setPlaying] = useState(false);
  const choiceIdx = useRef(0);
  const listRef = useRef(null);
  const curId = path[path.length - 1];
  const cur = nodes[curId];

  const advance = (to) => setPath((p) => [...p, to].slice(-24));
  const stepAuto = () => {
    if (cur.end) { setPlaying(false); return; }
    if (cur.options) {
      if (choiceIdx.current >= scenario.length) { setPlaying(false); return; }
      const want = scenario[choiceIdx.current];
      choiceIdx.current += 1;
      const opt = cur.options.find((o) => o.label === want) || cur.options[0];
      advance(opt.to);
    } else advance(cur.next);
  };

  useEffect(() => {
    if (!playing) return undefined;
    if (cur.end) { setPlaying(false); return undefined; }
    const t = setTimeout(stepAuto, 1300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, path]);

  useEffect(() => {
    const el = listRef.current?.lastElementChild;
    if (el && listRef.current.scrollHeight > listRef.current.clientHeight) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [path]);

  const reset = () => { setPlaying(false); setPath([start]); choiceIdx.current = 0; };

  return (
    <Card title={title} tag="flowchart">
      <ol className="steps" ref={listRef} style={{ maxHeight: '26rem', overflowY: 'auto' }}>
        {path.map((id, k) => {
          const nd = nodes[id];
          const isCur = k === path.length - 1;
          return (
            <li key={k} className={isCur ? 'cur' : 'past'} onClick={() => !playing && setPath(path.slice(0, k + 1))} title={isCur ? '' : 'Go back to this step'}>
              <div>
                <div className="st">{nd.title}{nd.tag && <span className="tag" style={{ '--tc': tagColors[nd.tag] || 'var(--muted)' }}>{nd.tag}</span>}</div>
                <div className="sd">{nd.desc}</div>
                {isCur && nd.options && !playing && (
                  <div className="decision">
                    {nd.options.map((o) => <button key={o.label} className="btn sm" onClick={(e) => { e.stopPropagation(); advance(o.to); }}>{o.label}</button>)}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="wg-ctl">
        <button className="btn sm pri" disabled={!!cur.options || cur.end || playing} onClick={() => advance(cur.next)}>Next →</button>
        <button className="btn sm" onClick={() => { if (!playing && (cur.end || choiceIdx.current >= scenario.length)) { setPath([start]); choiceIdx.current = 0; } setPlaying((p) => !p); }}>{playing ? '❚❚ Pause' : '▶ Play scenario'}</button>
        <button className="btn sm" onClick={reset}>Reset</button>
        <span className="muted small">{cur.options ? 'Decision: pick a branch.' : cur.end ? 'Finished.' : 'Click a past step to rewind.'}</span>
      </div>
    </Card>
  );
}

const TAGC = { sense: 'var(--l3)', send: 'var(--l4)', collision: 'var(--bad)', wait: 'var(--warn)', done: 'var(--good)', loss: 'var(--bad)', grow: 'var(--l4)' };

const CSMACD = {
  listen: { title: 'Listen to the medium', tag: 'sense', desc: 'Carrier sense: is anyone else transmitting?', next: 'busy' },
  busy: { title: 'Medium busy?', desc: 'Decide based on what was sensed.', options: [{ label: 'Busy', to: 'wait' }, { label: 'Free', to: 'tx' }] },
  wait: { title: 'Wait', tag: 'wait', desc: 'Keep sensing until the medium is idle (1-persistent Ethernet sends as soon as it is).', next: 'listen' },
  tx: { title: 'Transmit and keep listening', tag: 'send', desc: 'While sending, compare what is on the wire with what is being sent.', next: 'coll' },
  coll: { title: 'Collision detected?', desc: 'Signal on the wire differs from what we send → collision.', options: [{ label: 'No', to: 'done' }, { label: 'Yes', to: 'jam' }] },
  done: { title: 'Frame sent', tag: 'done', desc: 'Whole frame transmitted with no collision. Reset the collision counter.', end: true },
  jam: { title: 'Stop and send a jam signal', tag: 'collision', desc: 'Abort the frame and send a 32-bit jam so every station notices the collision.', next: 'beb' },
  beb: { title: 'Binary exponential backoff', tag: 'wait', desc: 'n = n + 1. Pick K ∈ {0 … 2^min(n,10) − 1}, wait K × 51.2 µs. If n reaches 16, give up.', next: 'listen' },
};

const CSMACA = {
  sense: { title: 'Sense the channel', tag: 'sense', desc: 'Physical carrier sense + virtual carrier sense (NAV).', next: 'busy' },
  busy: { title: 'Is it busy?', desc: 'Has the channel been idle for DIFS?', options: [{ label: 'Busy', to: 'wait' }, { label: 'Free', to: 'backoff' }] },
  wait: { title: 'Wait', tag: 'wait', desc: 'Defer until the channel has been idle for DIFS.', next: 'sense' },
  backoff: { title: 'Random backoff', tag: 'wait', desc: 'Pick a random number of slots in [0, CW] and count down only while the channel stays idle. Even an idle channel gets a backoff, so waiting stations don\'t all jump in together.', next: 'tx' },
  tx: { title: 'Transmit the frame', tag: 'send', desc: '(Optionally preceded by RTS/CTS for large frames.)', next: 'ack' },
  ack: { title: 'ACK received?', desc: 'The receiver ACKs after SIFS. No ACK in time = assume a collision or error.', options: [{ label: 'Yes', to: 'done' }, { label: 'No', to: 'retry' }] },
  done: { title: 'Done', tag: 'done', desc: 'Success. Reset CW to its minimum (15).', end: true },
  retry: { title: 'Backoff + retry', tag: 'collision', desc: 'Double the contention window (15 → 31 → 63 … 1023) and try again; drop after the retry limit.', next: 'sense' },
};

const CC = {
  start: { title: 'Connection starts', desc: 'cwnd = 1 MSS (10 in modern stacks), ssthresh = large / initial value.', next: 'ss' },
  ss: { title: 'Slow start', tag: 'grow', desc: 'cwnd += 1 MSS per ACK → doubles every RTT (exponential).', next: 'thr' },
  thr: { title: 'cwnd ≥ ssthresh?', desc: 'Time to switch to cautious growth?', options: [{ label: 'No', to: 'ss' }, { label: 'Yes', to: 'ca' }] },
  ca: { title: 'Congestion avoidance', tag: 'grow', desc: 'cwnd += ~1 MSS per RTT (linear: additive increase).', next: 'loss' },
  loss: { title: 'Packet loss?', desc: 'How did the sender find out?', options: [{ label: 'No', to: 'ca' }, { label: 'Timeout', to: 'to' }, { label: '3 dup ACKs', to: 'fr' }] },
  to: { title: 'Timeout: severe reaction', tag: 'loss', desc: 'ssthresh = cwnd / 2, cwnd = 1 MSS, back to slow start (Tahoe and Reno alike).', next: 'ss' },
  fr: { title: 'Fast retransmit', tag: 'loss', desc: 'Resend the missing segment immediately, without waiting for the RTO. ssthresh = cwnd / 2.', next: 'var' },
  var: { title: 'Tahoe or Reno?', desc: 'This is where they differ.', options: [{ label: 'Tahoe', to: 'tahoe' }, { label: 'Reno', to: 'reno' }] },
  tahoe: { title: 'Tahoe: cwnd = 1 MSS', tag: 'loss', desc: 'No fast recovery: back to slow start.', next: 'ss' },
  reno: { title: 'Reno: fast recovery', tag: 'grow', desc: 'cwnd = ssthresh (+3), skip slow start (multiplicative decrease) and continue in congestion avoidance.', next: 'ca' },
};

export const FlowCsmaCd = () => <FlowStepper title="CSMA/CD: step through" nodes={CSMACD} start="listen" scenario={['Busy', 'Free', 'Yes', 'Free', 'No']} tagColors={TAGC} />;
export const FlowCsmaCa = () => <FlowStepper title="CSMA/CA: step through" nodes={CSMACA} start="sense" scenario={['Free', 'No', 'Busy', 'Free', 'Yes']} tagColors={TAGC} />;
export const FlowCC = () => <FlowStepper title="TCP congestion control flow" nodes={CC} start="start" scenario={['No', 'No', 'Yes', 'No', '3 dup ACKs', 'Reno', 'No', 'Timeout', 'No', 'Yes']} tagColors={TAGC} />;
