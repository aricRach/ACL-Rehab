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

export function calculateProgress(
  weeksFromSurgery: number,
  weeklyActivity: number,
  rom: RomStatus
) {
  
  if(weeksFromSurgery < 0) {
    return {progress: 0, phase: { id: 0, name: 'Rehab not started', minWeeks: -1, maxWeeks: -1, maxProgress: 0 }, gate: { passed: false, reason: 'Rehab not started', cap: 15 }}
  }
  const phase = PHASES.find(
    p => weeksFromSurgery >= p.minWeeks && weeksFromSurgery <= p.maxWeeks
  )!;

  const timeScore = Math.min(phase.maxProgress, weeksFromSurgery * 2);
  const activityScore = Math.min(phase.maxProgress, weeklyActivity / 10);

  let progress = Math.min(phase.maxProgress, timeScore * 0.65 + activityScore * 0.35);

  const gate = checkRomGate(phase.id, rom);
  if (!gate.passed) {
    progress = Math.min(progress, gate.cap);
  }

  return { phase, progress, gate };
}
