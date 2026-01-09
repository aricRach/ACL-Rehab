import type { RomStatus } from '../models/RomStatus';

export function checkRomGate(phaseId: number, rom: RomStatus) {
  if (phaseId >= 2 && (rom.extension !== 0 || rom.flexion < 90)) {
    return { passed: false, reason: 'Need 0° extension and 90° flexion', cap: 15 };
  }
  if (phaseId >= 3 && rom.flexion < 120) {
    return { passed: false, reason: 'Need 120° flexion', cap: 30 };
  }
  if (phaseId >= 4 && rom.flexion < 135) {
    return { passed: false, reason: 'Need full ROM', cap: 55 };
  }
  return { passed: true, cap: 100 };
}
