import { useState } from 'react';

export default function LogViewer({ lines }) {
  const [open, setOpen] = useState(false);

  return (
    <section id="logSection">
      <button
        id="toggleLogs"
        aria-expanded={open}
        aria-controls="logContainer"
        onClick={() => setOpen(o => !o)}
      >
        {open ? 'Hide Raw Smart Contract Logs' : 'Show Raw Smart Contract Logs'}
      </button>

      <div
        id="logContainer"
        role="region"
        aria-label="Raw Smart Contract Logs"
        className={open ? 'open' : ''}
      >
        <pre id="logContent" style={{fontSize: '0.6rem'}}>
          {lines.map(l => (
            <span key={l.id} className="logLine">
              {l.ts.toLocaleString()}  {l.msg}
              {'\n'}
            </span>
          ))}
        </pre>
      </div>
    </section>
  );
}
