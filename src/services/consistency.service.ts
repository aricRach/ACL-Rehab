import type { DailyLog } from '../models/DailyLog';
import { aggregateWeekly, getWeekStart } from './weeklyAggregation.service';

export interface WeeklyConsistencyPoint {
  weekStart: string;
  totalMinutes: number;
}

export function buildWeeklyConsistency(
  logs: Record<string, DailyLog>,
  surgeryDate: Date,
  today: Date = new Date()
): WeeklyConsistencyPoint[] {
  const points: WeeklyConsistencyPoint[] = [];
  const lastWeekStart = getWeekStart(today);
  let weekStart = getWeekStart(surgeryDate);

  while (weekStart <= lastWeekStart) {
    points.push({
      weekStart: weekStart.toISOString().slice(0, 10),
      totalMinutes: aggregateWeekly(logs, weekStart).totalMinutes
    });

    weekStart = new Date(weekStart);
    weekStart.setDate(weekStart.getDate() + 7);
  }

  return points;
}
