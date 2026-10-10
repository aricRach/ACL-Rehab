import type { DailyLog } from '../models/DailyLog';

export type AverageRange = 'week' | 'month' | 'all';

export interface DailyAverage {
  totalMinutes: number;
  days: number;
  minutesPerDay: number;
}

const DAY_MS = 1000 * 60 * 60 * 24;

// Dates are 'YYYY-MM-DD' strings, same as the log keys
function getRangeStart(range: AverageRange, surgeryDate: string, today: string) {
  let start = surgeryDate;

  if (range === 'week') {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - d.getUTCDay()); // 0=Sunday
    start = d.toISOString().slice(0, 10);
  } else if (range === 'month') {
    start = `${today.slice(0, 7)}-01`;
  }

  // Days before surgery don't count
  return start < surgeryDate ? surgeryDate : start;
}

export function calculateDailyAverage(
  logs: Record<string, DailyLog>,
  range: AverageRange,
  surgeryDate: string,
  today: string
): DailyAverage {
  const start = getRangeStart(range, surgeryDate, today);

  // Every day in the range counts, including days with nothing logged
  const days =
    Math.round((Date.parse(today) - Date.parse(start)) / DAY_MS) + 1;

  if (!(days > 0)) {
    return { totalMinutes: 0, days: 0, minutesPerDay: 0 };
  }

  const totalMinutes = Object.entries(logs)
    .filter(([date]) => date >= start && date <= today)
    .reduce((sum, [, log]) => {
      return (
        sum +
        log.physioMinutes +
        log.gymMinutes +
        log.footballMinutes
      );
    }, 0);

  return {
    totalMinutes,
    days,
    minutesPerDay: totalMinutes / days
  };
}
