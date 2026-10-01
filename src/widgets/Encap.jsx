import { useState } from 'react';
import { Card, useStepper, StepControls, reducedMotion } from './common.jsx';

const ROWS = [
  { lbl: 'Application', pdu: 'Data', parts: [['d', 'HTTP data']] },
  { lbl: 'Transport', pdu: 'Segment', parts: [['t', 'TCP hdr'], ['d', 'Data']] },
  { lbl: 'Network', pdu: 'Packet', parts: [['i', 'IP hdr'], ['t', 'TCP'], ['d', 'Data']] },
  { lbl: 'Data Link', pdu: 'Frame', parts: [['e', 'Eth hdr'], ['i', 'IP'], ['t', 'TCP'], ['d', 'Data'], ['f', 'FCS']] },
  { lbl: 'Physical', pdu: 'Bits', parts: [['bits', '10110010 01101…']] },
];

const SEND = [
  'Application creates the data (e.g. an HTTP request).',
  'Transport adds a TCP header (source/destination port, Seq, ACK, window) → segment.',
  'Network adds an IP header (source/destination IP, TTL, protocol) → packet.',
  'Data Link adds an Ethernet header (destination/source MAC, type) and the FCS trailer → frame.',
  'Physical sends the frame as bits (voltages, light or radio).',
];
const RECV = [
  'Physical receives bits and hands them up as a frame.',
  'Data Link checks the FCS, sees its own destination MAC, strips the Ethernet header + trailer → packet.',
  'Network sees its own destination IP, strips the IP header → segment.',
  'Transport reads the destination port, strips the TCP header → data for the right process.',
  'Application gets the original HTTP data.',
];

export function Encap({ auto = false, compact = false }) {
  const [side, setSide] = useState('send');
  const rm = reducedMotion();
  const st = useStepper(5, { interval: compact ? 1300 : 1600, loop: auto, auto: auto && !rm, start: auto && rm ? 4 : 0 });
  const s = st.i;
  const recv = side === 'recv';

  const body = (
    <>
      <div className="enc" aria-live="polite">
        {ROWS.map((r, k) => {
          // sender: rows 0..s built; receiver: rows from bottom (4) up to 4-s
          const active = recv ? k >= 4 - s : k <= s;
          const cur = recv ? k === 4 - s : k === s;
          const showParts = recv ? k >= 4 - s : k <= s;
          return (
            <div key={r.lbl} className={'enc-row' + (cur ? ' cur' : '') + (!active ? ' dim' : '')}>
              <div className="enc-lbl">{r.lbl}<br /><span style={{ textTransform: 'none', letterSpacing: 0 }}>{r.pdu}</span></div>
              {showParts ? (
                <div className="enc-pdu" key={side + s + k}>
                  {r.parts.map(([cls, t], j) => <span key={j} className={cls}>{t}</span>)}
                </div>
              ) : <div className="enc-pdu" style={{ boxShadow: 'none' }} />}
            </div>
          );
        })}
      </div>
      {!compact && <div className="note-box"><b>{recv ? 'Receiver' : 'Sender'} · step {s + 1}.</b> {(recv ? RECV : SEND)[s]}</div>}
      {compact ? (
        <p className="muted small" style={{ margin: '.6rem 0 0' }}>{SEND[s]}</p>
      ) : (
        <StepControls st={st}>
          <div className="seg" role="group" aria-label="Side">
            <button className={!recv ? 'on' : ''} onClick={() => { setSide('send'); st.set(0); }}>Sender</button>
            <button className={recv ? 'on' : ''} onClick={() => { setSide('recv'); st.set(0); }}>Receiver</button>
          </div>
        </StepControls>
      )}
    </>
  );
  if (compact) return body;
  return <Card title="Encapsulation and decapsulation" tag="step through">{body}</Card>;
}

export default Encap;
