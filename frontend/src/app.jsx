import { useEffect, useState, useMemo } from 'react';
import { getLogs, extractLatestDraw } from './logs';
import SummaryPanel from './summary_panel.jsx';
import Heading from './heading.jsx'
import LogViewer from './log_viewer.jsx'
import Particles from './particles.jsx'
import Balls from './balls.jsx';

export default function App() {
  const canister = "yabps-hqaaa-aaaar-qbsha-cai";
  const schedulingMethod = 'inOneMinute'; // or 'nextFriday8pm'

  const [lines, setLines] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    let stop = false;
    const poll = async () => {
      try {
        const data = await getLogs(canister);
        if (!stop) {
          setLines(data);
          setErr('');
        }
      } catch (e) {
        if (!stop) setErr(e.message || String(e));
        console.error(e);
      }
    };
    poll();
    const h = setInterval(poll, 10000);// refresh every 10s
    return () => { stop = true; clearInterval(h); };
  }, [canister]);

  const latestDraw = useMemo(() => extractLatestDraw(lines), [lines]);

  const nextDrawAt = useMemo(() => {
    if (!latestDraw) return null;
    if (schedulingMethod === 'inOneMinute') {
      if (!latestDraw.startedAt) return null;
      return new Date(latestDraw.startedAt.getTime() + 60_000);
    }
    // nextFriday8pm UTC
    const now = new Date();
    const day = now.getUTCDay(); // 0 Sun ... 5 Fri
    let add = (5 - day + 7) % 7;
    if (add === 0 && now.getUTCHours() >= 20) add = 7;
    return new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + add,
      20, 0, 0, 0
    ));
  }, [latestDraw, schedulingMethod]);

  // keep last completed draw numbers (to show on load / between draws)
  const [prevNumbers, setPrevNumbers] = useState([]);
  useEffect(() => {
    if (latestDraw?.complete && Array.isArray(latestDraw.numbers)) {
      setPrevNumbers(latestDraw.numbers);
    }
  }, [latestDraw]);
  
  // tick 'now' every second to know when countdown hits zero
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  
  const hasNumbers =
    Array.isArray(latestDraw?.numbers) && latestDraw.numbers.length > 0;
  
  const shouldSpin = !hasNumbers || (nextDrawAt && now >= nextDrawAt.getTime());

  useEffect(() => {
    console.log('[App] latestDraw changed', latestDraw);
  }, [latestDraw]);

  console.log('[App] shouldSpin?', shouldSpin, {
    now,
    nextDrawAtISO: nextDrawAt ? nextDrawAt.toISOString() : null,
    latestDrawHasNumbers: !!(latestDraw && latestDraw.numbers),
    drawKey: latestDraw ? latestDraw.drawNo : null,
  });

  return (
    <div>
      <Particles />
      <Heading />
      <section className="hero">
      
        <h1 className="hero__title">WORLD COMPUTER LOTTERY</h1>

        <Balls
          drawKey={latestDraw?.drawNo}       
          currentNumbers={prevNumbers}       
          drawNumbers={latestDraw?.numbers}  
          shouldSpin={shouldSpin}
          debug={false}
        />        

        <div className="row">
          <div className="card card--left">
            <p className="hero__lede">
              TODO - description of the World Computer Lottery, its purpose, mission, and how to use it... Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
          <SummaryPanel draw={latestDraw} nextDrawAt={nextDrawAt} />
        </div>
      
      </section>

      <LogViewer lines={lines} />

      <section style={{width: '100%', textAlign: 'center', fontSize: '0.8em'}}>
        Established in 2025, as an entry for WCHL25. 
        <br/>
        100% of any funds awarded by WCHL25 will be used to bootstrap the initial lottery jackpot, and backend control will be handed to the NNS, or blackholed.
      </section>
    </div>
  );
}
