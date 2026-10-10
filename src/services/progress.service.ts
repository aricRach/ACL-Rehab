import { PHASES } from '../data/phases';
import { checkRomGate } from '../data/aclGates';
import type { RomStatus } from '../models/RomStatus';
import type { DailyLog } from '../models/DailyLog';


const WEEK_MS = 1000 * 60 * 60 * 24 * 7;

// 280 min/week (40 min/day) = optimal training
const OPTIMAL_WEEKLY_MINUTES = 280;

// Minutes logged in each week since surgery (index 0 = the week of the surgery)
export function aggregateMinutesByWeek(
  logs: Record<string, DailyLog>,
  surgeryDate: Date
) {
  const surgeryTime = surgeryDate.getTime();
  const minutesByWeek: number[] = [];

  Object.entries(logs).forEach(([date, log]) => {
    const d = new Date(date).getTime();
    if (d < surgeryTime) return;

    const week = Math.floor((d - surgeryTime) / WEEK_MS);
    minutesByWeek[week] =
      (minutesByWeek[week] ?? 0) +
      log.physioMinutes +
      log.gymMinutes +
      log.footballMinutes;
  });

  return minutesByWeek;
}


function calculateTimeScore(
  weeksFromSurgery: number,
  phaseMax: number
) {
  let timeScore: number;

  if (weeksFromSurgery <= 4) {
    // Very slow start (swelling, ROM, protection)
    timeScore = weeksFromSurgery * 0.5;
  } else if (weeksFromSurgery <= 12) {
    // Moderate acceleration
    timeScore = 2 + (weeksFromSurgery - 4) * 1.2;
  } else {
    // Stronger progress phase (strength, control, sport prep)
    timeScore = 11.6 + (weeksFromSurgery - 12) * 2.0;
  }

  return Math.min(phaseMax, timeScore);
}


function findPhase(weeksFromSurgery: number) {
  return PHASES.find(
    p =>
      weeksFromSurgery >= p.minWeeks &&
      weeksFromSurgery <= p.maxWeeks
  )!;
}


// activityShare: 0 = no training, 1 = optimal training on average
function scoreWeek(weeksFromSurgery: number, activityShare: number) {
  const phase = findPhase(weeksFromSurgery);

  const timeScore = calculateTimeScore(
    weeksFromSurgery,
    phase.maxProgress
  );

  return Math.min(
    phase.maxProgress,
    timeScore * 0.6 + phase.maxProgress * activityShare * 0.4
  );
}


export function calculateProgress(
  weekIndex: number,
  minutesByWeek: number[],
  rom: RomStatus
) {
  // Surgery in the future
  if (weekIndex < 0) {
    return {
      progress: 0,
      optimalProgress: 0,
      phase: {
        id: 0,
        name: 'Rehab not started',
        minWeeks: -1,
        maxWeeks: -1,
        maxProgress: 0
      },
      gate: {
        passed: false,
        reason: 'Rehab not started',
        cap: 15
      }
    };
  }

  // Replay every week since surgery and keep the best score reached,
  // so a new week starting or a weak week never pulls progress down
  let progress = 0;
  let totalMinutes = 0;

  for (let week = 0; week <= weekIndex; week++) {
    totalMinutes += minutesByWeek[week] ?? 0;

    // Average since surgery, so strong weeks cover for weak ones
    const activityShare = Math.min(
      1,
      totalMinutes / ((week + 1) * OPTIMAL_WEEKLY_MINUTES)
    );

    progress = Math.max(
      progress,
      scoreWeek(week || 1, activityShare)
    );
  }

  const weeksFromSurgery = weekIndex || 1;
  const phase = findPhase(weeksFromSurgery);

  // Same week and ROM, but with optimal training every week
  let optimalProgress = scoreWeek(weeksFromSurgery, 1);

  const gate = checkRomGate(phase.id, rom);
  if (!gate.passed) {
    progress = Math.min(progress, gate.cap);
    optimalProgress = Math.min(optimalProgress, gate.cap);
  }

  return { phase, progress, optimalProgress, gate };
}
