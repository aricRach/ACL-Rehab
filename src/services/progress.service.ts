import { PHASES } from '../data/phases';
import { checkRomGate } from '../data/aclGates';
import type { RomStatus } from '../models/RomStatus';
import type { DailyLog } from '../models/DailyLog';


const WEEK_MS = 1000 * 60 * 60 * 24 * 7;

// Best weekly average reached at any point since surgery.
// A plain running average drops every time a new week starts, so we keep the peak instead.
export function peakWeeklyAverage(
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

  let total = 0;
  let peak = 0;

  for (let week = 0; week < minutesByWeek.length; week++) {
    total += minutesByWeek[week] ?? 0;
    peak = Math.max(peak, total / (week || 1));
  }

  return peak;
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


export function calculateProgress(
  weeksFromSurgery: number,
  weeklyActivity: number,
  rom: RomStatus
) {
  // Surgery in the future
  if (weeksFromSurgery < 0) {
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

  // Find current phase
  const phase = PHASES.find(
    p =>
      weeksFromSurgery >= p.minWeeks &&
      weeksFromSurgery <= p.maxWeeks
  )!;

  const timeScore = calculateTimeScore(
    weeksFromSurgery,
    phase.maxProgress
  );

  // 280 min/week (40 min/day) = full activity score, in every phase
  const activityScore =
    phase.maxProgress * Math.min(1, weeklyActivity / 280);

  let progress = Math.min(
    phase.maxProgress,
    timeScore * 0.6 + activityScore * 0.4
  );

  // Same week and ROM, but with a full activity score
  let optimalProgress = Math.min(
    phase.maxProgress,
    timeScore * 0.6 + phase.maxProgress * 0.4
  );

  const gate = checkRomGate(phase.id, rom);
  if (!gate.passed) {
    progress = Math.min(progress, gate.cap);
    optimalProgress = Math.min(optimalProgress, gate.cap);
  }

  return { phase, progress, optimalProgress, gate };
}
