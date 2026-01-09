import { PHASES } from '../data/phases';
import { checkRomGate } from '../data/aclGates';
import type { RomStatus } from '../models/RomStatus';

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

  let progress = Math.min(phase.maxProgress, timeScore * 0.4 + activityScore * 0.6);

  const gate = checkRomGate(phase.id, rom);
  if (!gate.passed) {
    progress = Math.min(progress, gate.cap);
  }

  return { phase, progress, gate };
}
