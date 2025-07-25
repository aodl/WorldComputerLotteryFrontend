import { useState, useEffect } from 'react';

export default function SummaryPanel({ draw, nextDrawAt }) {
  if (!draw) return null;

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const nextAt = nextDrawAt || null;
  const msLeft = nextAt ? nextAt - now : NaN;
  const countdown = Number.isFinite(msLeft) && msLeft > 0
    ? new Date(msLeft).toISOString().substr(11, 8)
    : (nextAt ? '00:00:00' : '—');
 
  const P = (v) => (v === undefined ? 'pending…' : v);

  return (
    <div className="card card--right">
      <div className="stats">
        <div className="stat">
          <div className="stat__number">
            {draw.jackpot === undefined
              ? 'Pending…'
              : `${draw.jackpot.toFixed(6)} ICP`}
          </div>
          <div className="stat__label">
            {draw.jackpot === undefined || draw.jackpotWon
              ? 'Jackpot'
              : 'Jackpot Rollover'}
          </div>
        </div>
        <div className="stat">
          <div className="stat__number">
            {draw.winners === undefined
              ? 'Pending…'
              : draw.winners.none
                ? 'None'
                : Object.entries(draw.winners.counts)
                    .map(([icon, n]) => `${icon}×${n}`)
                    .join('  |  ')}
          </div>
          <div className="stat__label">Winners</div>
        </div>
        <div className="stat">
          <div className="stat__number">{countdown}</div>
          <div className="stat__label">Next Draw</div>
        </div>
      </div>
    </div>
  );
}
