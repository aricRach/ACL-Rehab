import type { DailyLog } from '../models/DailyLog';
import type { WeeklySummary } from '../models/WeeklySummary';


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
): WeeklySummary {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const totalMinutes = Object.entries(logs)
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

  const badge = getWeeklyBadge(totalMinutes);

  return {
    totalMinutes,
    badge
  };
}



function getWeeklyBadge(minutes: number) {
  if (minutes < 90) {
    return { label: 'Low activity', color: 'bg-red-100 text-red-700' };
  }
  if (minutes < 180) {
    return { label: 'On track', color: 'bg-orange-100 text-orange-700' };
  }
  if (minutes < 300) {
    return { label: 'Great consistency', color: 'bg-green-100 text-green-700' };
  }
  return { label: 'Outstanding', color: 'bg-blue-100 text-blue-700' };
}


