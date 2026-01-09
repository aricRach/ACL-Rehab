import type { DailyLog } from '../models/DailyLog';

export function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sunday
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function aggregateWeekly(
  logs: Record<string, DailyLog>,
  weekStart: Date
) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return Object.entries(logs)
    .filter(([date]) => {
      const d = new Date(date);
      return d >= weekStart && d < weekEnd;
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


