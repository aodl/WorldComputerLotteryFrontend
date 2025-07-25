import { HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { ICManagementCanister } from '@dfinity/ic-management';

const DRAW_RE     = /WORLD COMPUTER LOTTERY, Draw No\.(\d+)/i;
const NUMBERS_RE  = /^NUMBERS,\s*\[([^\]]*)\]/i;
const TICKETS_RE  = /^TICKETS COLLECTED,\s*(\d+)\s*\(up to transaction (\d+)\)/i;
const WINNERS_RE_NONE     = /^WINNERS,\s*none/i;
const WINNERS_RE_COUNTS   = /^WINNERS,\s*(.+)$/i;  // e.g. "🎯: 3   🎯🎯: 1"
const JACKPOT_ROLLOVER_RE = /^JACKPOT ROLLOVER,\s*([\d.]+)\s*ICP/i;
const JACKPOT_WIN_RE      = /^JACKPOT,\s*([\d.]+)\s*ICP/i;
const TIER_RE             = /^Tier\s+\d+\s+([🎯]+):.*?between\s+(\d+)\s+winner/i;

export function extractLatestDraw(lines) {
  if (!lines?.length) return null;

  // find last header
  let start = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (DRAW_RE.test(lines[i].msg)) { start = i; break; }
  }
  if (start === -1) return null;

  // grab until next header or end
  const seg = [];
  for (let i = start; i < lines.length; i++) {
    if (i !== start && DRAW_RE.test(lines[i].msg)) break;
    seg.push(lines[i]);
  }

  const headerMatch = lines[start].msg.match(DRAW_RE);
  const drawNo = headerMatch ? Number(headerMatch[1]) : undefined;

  let numbers = [];
  let ticketsCollected, lastTx;
  let winners;// { none: boolean, counts: { '🎯': n, '🎯🎯': n, ... } }
  let jackpot, jackpotWon = false;
  let tierWinners;
  for (const { msg } of seg) {
    let m;
    if ((m = msg.match(NUMBERS_RE))) {
      numbers = m[1].split(',').map(s => Number(s.trim()));
    } else if (WINNERS_RE_NONE.test(msg)) {
      winners = { none: true, counts: {} };
    } else if ((m = msg.match(WINNERS_RE_COUNTS))) {
      const counts = {};
      // use matchAll so we don't loop forever
      for (const [, icons, num] of m[1].matchAll(/([🎯]+)\s*:\s*(\d+)/g)) {
        counts[icons] = Number(num);
      }
      winners = { none: false, counts };
    } else if ((m = msg.match(JACKPOT_ROLLOVER_RE))) {
      jackpot = parseFloat(m[1]);
      jackpotWon = false;
    } else if ((m = msg.match(JACKPOT_WIN_RE))) {
      jackpot = parseFloat(m[1]);
      jackpotWon = true;
    } else if ((m = msg.match(TIER_RE))) {
      tierWinners = tierWinners || {};
      tierWinners[m[1]] = Number(m[2]); // e.g. '🎯🎯' -> 1
    } else if ((m = msg.match(TICKETS_RE))) {
      ticketsCollected = Number(m[1]);
      lastTx = Number(m[2]);
    }
  }

  const missing = {
    numbers: numbers === undefined,
    ticketsCollected: ticketsCollected === undefined,
    winners: winners === undefined,
    jackpot: jackpot === undefined,
  };
  const complete = !Object.values(missing).some(Boolean);

  return {
    drawNo,
    numbers,
    ticketsCollected,
    lastTx,
    winners,
    jackpot,
    jackpotWon,
    tierWinners,
    startedAt: lines[start].ts,
    complete,
    missing,
    raw: seg,
  };
}

export async function getLogs(canisterIdText) {
  const agent = new HttpAgent({ host: 'https://icp0.io' });

  // for local development only
  if (process.env.DFX_NETWORK !== "ic") {
    agent.fetchRootKey().catch((err) => {
      console.warn("Unable to fetch root key. Is your local replica running?");
      console.error(err);
    });
  }

  const management = ICManagementCanister.create({ agent });
  const result = await management.fetchCanisterLogs(Principal.fromText(canisterIdText));
  const d = new TextDecoder();
  return result.canister_log_records.map(r => ({
    id: Number(r.idx),
    ts: new Date(Number(r.timestamp_nanos / 1_000_000n)),
    msg: d.decode(new Uint8Array(r.content)),
  }));  
}
