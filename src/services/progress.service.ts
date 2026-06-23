import { PHASES } from '../data/phases';
import { checkRomGate } from '../data/aclGates';
import type { RomStatus } from '../models/RomStatus';
import type { DailyLog } from '../models/DailyLog';


export function aggregateSinceSurgery(
  logs: Record<string, DailyLog>,
  surgeryDate: Date
) {
  const surgeryTime = surgeryDate.getTime();

  return Object.entries(logs)
    .filter(([date]) => {
      const d = new Date(date).getTime();
      return d >= surgeryTime;
    })
    .reduce((sum, [, log]) => {
      return (
        sum +
        log.physioMinutes +
        log.gymMinutes +
        log.footballMinutes
      );
    }, 0);
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

  // 280 min/week (40 min/day) = full activity score
  const activityScore = Math.min(
    phase.maxProgress,
    (weeklyActivity / 280) * 100
  );

  let progress = Math.min(
    phase.maxProgress,
    timeScore * 0.6 + activityScore * 0.4
  );

  const gate = checkRomGate(phase.id, rom);
  if (!gate.passed) {
    progress = Math.min(progress, gate.cap);
  }

  return { phase, progress, gate };
}
