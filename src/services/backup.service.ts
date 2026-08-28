// Every localStorage key the app owns. Keep in sync with the individual services.
const BACKUP_KEYS = ['acl-logs', 'acl_rom', 'acl-surgery-date'] as const;

export interface BackupFile {
  app: 'acl-rehab';
  version: 1;
  exportedAt: string;
  data: Record<string, string>;
}

export function exportBackup(): BackupFile {
  const data: Record<string, string> = {};
  for (const key of BACKUP_KEYS) {
    const value = localStorage.getItem(key);
    if (value !== null) data[key] = value;
  }

  return {
    app: 'acl-rehab',
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function downloadBackup() {
  const backup = exportBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `acl-rehab-backup-${backup.exportedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Overwrites current data with the backup's. Returns how many keys were restored.
export function importBackup(raw: string): number {
  let parsed: Partial<BackupFile>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('That file is not valid JSON.');
  }

  if (
    !parsed ||
    parsed.app !== 'acl-rehab' ||
    typeof parsed.data !== 'object' ||
    parsed.data === null
  ) {
    throw new Error('That is not an ACL Rehab backup file.');
  }

  let restored = 0;
  for (const key of BACKUP_KEYS) {
    const value = parsed.data[key];
    if (typeof value === 'string') {
      localStorage.setItem(key, value);
      restored++;
    }
  }
  return restored;
}
