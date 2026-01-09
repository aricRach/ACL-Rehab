import type { RomStatus } from '../models/RomStatus';

const KEY = 'acl_rom';

export function loadRom(): RomStatus | null {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveRom(rom: RomStatus) {
  localStorage.setItem(KEY, JSON.stringify(rom));
}
