import type { Phase } from '../models/phase';

export const PHASES: Phase[] = [
  { id: 1, name: 'Early Rehab', minWeeks: 0, maxWeeks: 6, maxProgress: 15 },
  { id: 2, name: 'Strength & ROM', minWeeks: 6, maxWeeks: 12, maxProgress: 30 },
  { id: 3, name: 'Running Prep', minWeeks: 12, maxWeeks: 24, maxProgress: 55 },
  { id: 4, name: 'Return to Training', minWeeks: 24, maxWeeks: 36, maxProgress: 80 },
  { id: 5, name: 'Return to Play', minWeeks: 36, maxWeeks: Number.MAX_SAFE_INTEGER, maxProgress: 100 },
];
