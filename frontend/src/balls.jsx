// TODO, this logic is far from perfect and overly complex. Refactor when there's some more time, and work out the kinks

import { useEffect, useRef, useState } from 'react';

const CONFIG = {
  NUM_BALLS:       8,
  REVEAL_STAGGER:  500,   // 0.5s between each ball
  SPIN_START_PAD:  700,   // delay before first reveal kicks in after spin
  SPIN_ANIM_MS:    50,    // TODO, is this out of sync with CSS spin cycle
  TICK_MS:         100,   // random flicker rate
  BALL_SIZE_PX:    80,
};

const rand  = (max) => Math.floor(Math.random() * max);
const pad   = (n) => String(Number(n)).padStart(2, '0');
const colourForNum = (n) => `hsl(${n * 3.6}deg 78% 55%)`;

export default function Balls({ drawKey, currentNumbers, drawNumbers, shouldSpin, debug = false }) {
  // showPrevious | spinning | revealing | done
  const [phase, setPhase] = useState('showPrevious');

  // Each ball: { value: number|null, spinning: boolean, grey: boolean }
  const [balls, setBalls] = useState(() => seedFromPrev(currentNumbers));

  const prevDrawKeyRef = useRef(drawKey);
  const startedSpinRef = useRef(false);
  const intervalsRef   = useRef([]); // flicker intervals
  const timeoutsRef    = useRef([]); // reveal timeouts

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--ball-size',     CONFIG.BALL_SIZE_PX + 'px');
    root.style.setProperty('--spin-duration', CONFIG.SPIN_ANIM_MS + 'ms');
    if (debug) console.log('[Balls] CSS vars set');
  }, [debug]);

  useEffect(() => {
    if (!debug) return;
    console.log('[Balls] props', { drawKey, currentNumbers, drawNumbers, shouldSpin });
  }, [drawKey, currentNumbers, drawNumbers, shouldSpin, debug]);

  useEffect(() => {
    if (debug) console.log('[Balls] phase →', phase);
  }, [phase, debug]);

  useEffect(() => {
    if (drawKey !== prevDrawKeyRef.current) {
      if (debug) console.log('[Balls] new drawKey:', drawKey);
      resetTimers();
      startedSpinRef.current = false;

      const havePrev = Array.isArray(currentNumbers) && currentNumbers.length === CONFIG.NUM_BALLS;

      // If parent already telling us to spin, spin immediately; else show prev (if any) until spin trigger.
      if (shouldSpin) {
        startSpin(true); // force
      } else if (havePrev) {
        setBalls(seedFromPrev(currentNumbers));
        setPhase('showPrevious');
      } else {
        // No prev numbers AND no spin trigger yet → keep a gentle idle spin so nothing blank shows
        startSpin(true);
      }

      prevDrawKeyRef.current = drawKey;
    }
  }, [drawKey, currentNumbers, shouldSpin, debug]);

  useEffect(() => {
    if (shouldSpin && !startedSpinRef.current) {
      if (debug) console.log('[Balls] shouldSpin=true → startSpin()');
      startSpin();
    }
  }, [shouldSpin, debug]);

  useEffect(() => {
    if (!Array.isArray(drawNumbers) || drawNumbers.length === 0) return;

    if (phase === 'spinning' || phase === 'revealing') {
      if (debug) console.log('[Balls] numbers arrived → startReveal()');
      startReveal(drawNumbers);
    } else if (phase === 'showPrevious') {
      // We already know numbers (e.g., refresh after draw) → show final immediately
      if (debug) console.log('[Balls] numbers present immediately → render final');
      resetTimers();
      startedSpinRef.current = false;
      setBalls(finalBalls(drawNumbers));
      setPhase('done');
    }
  }, [drawNumbers, phase, debug]);

  useEffect(() => () => resetTimers(), []);

  function seedFromPrev(prevNums) {
    const nums = Array.isArray(prevNums) && prevNums.length === CONFIG.NUM_BALLS ? prevNums : null;

    if (nums) {
      // show previous (grey, not spinning)
      return nums.slice(0, CONFIG.NUM_BALLS).map((n) => ({
        value: Number(n),
        spinning: false,
        grey: true,
      }));
    }

    return Array(CONFIG.NUM_BALLS).fill(null).map(() => ({
      value: null,
      spinning: true,
      grey: true,
    }));
  }

  function finalBalls(finalNums) {
    return finalNums.slice(0, CONFIG.NUM_BALLS).map((n) => ({
      value: Number(n),
      spinning: false,
      grey: false,
    }));
  }

  function resetTimers() {
    intervalsRef.current.forEach(clearInterval);
    timeoutsRef.current.forEach(clearTimeout);
    intervalsRef.current = [];
    timeoutsRef.current  = [];
  }

  function startSpin(force = false) {
    if (startedSpinRef.current && !force) return; // already spinning
    startedSpinRef.current = true;
    setPhase('spinning');

    // All balls enter spinning state, regardless of previous values
    setBalls(Array(CONFIG.NUM_BALLS).fill(null).map(() => ({
      value: null,
      spinning: true,
      grey: true,
    })));

    const flicker = setInterval(() => {
      setBalls((prev) => prev); // trigger React to re-render labels (because we use rand() in render)
    }, CONFIG.TICK_MS);
    intervalsRef.current.push(flicker);
  }

  function startReveal(finalNums) {
    setPhase('revealing');

    finalNums.slice(0, CONFIG.NUM_BALLS).forEach((num, idx) => {
      const delay = CONFIG.SPIN_START_PAD + idx * CONFIG.REVEAL_STAGGER;

      const t = setTimeout(() => {
        setBalls((prev) => {
          const next = [...prev];
          next[idx] = {
            value: Number(num),
            spinning: false,
            grey: false,
          };
          return next;
        });

        // When the last ball is revealed, stop flicker & finish
        if (idx === Math.min(finalNums.length, CONFIG.NUM_BALLS) - 1) {
          resetTimers();
          setPhase('done');
          if (debug) console.log('[Balls] reveal complete');
        }
      }, delay);

      timeoutsRef.current.push(t);
    });
  }

  return (
    <div id="balls" aria-label="Lottery balls" className={`balls balls--${phase}`}>
      {balls.slice(0, CONFIG.NUM_BALLS).map((b, i) => {
        const isSpinning = b.spinning;
        const displayNum = isSpinning ? pad(rand(100)) : pad(b.value);
        const colour     = b.grey ? 'var(--grey-ball)' : colourForNum(b.value ?? 0);

        return (
          <div className="ball" key={i} style={{ '--ball-colour': colour }}>
            <div className={`label${isSpinning ? ' spinning' : ''}`}>{displayNum}</div>
          </div>
        );
      })}
    </div>
  );
}

