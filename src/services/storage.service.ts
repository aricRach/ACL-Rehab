import type { DailyLog } from "../models/DailyLog";

const KEY = 'acl-logs';

export type LogsByDate = Record<string, DailyLog>;

export function loadLogs(): LogsByDate {
  return JSON.parse(localStorage.getItem(KEY) || '{}');
}

export function saveLogs(logs: LogsByDate) {
  localStorage.setItem(KEY, JSON.stringify(logs));
}

export function upsertLog(date: string, log: DailyLog): LogsByDate {
  const logs = loadLogs();
  const updated = {
    ...logs,
    [date]: log
  };

  saveLogs(updated);
  return updated;
}
