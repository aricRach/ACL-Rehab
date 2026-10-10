import { useState } from 'react';
import {
  calculateDailyAverage,
  type AverageRange
} from '../../services/dailyAverage.service';
import type { DailyLog } from '../../models/DailyLog';
import './DailyAverage.scss';

interface Props {
  logs: Record<string, DailyLog>;
  surgeryDate: string;
  today: string;
}

const RANGES: { id: AverageRange; label: string }[] = [
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'all', label: 'All time' }
];

export default function DailyAverage({ logs, surgeryDate, today }: Props) {
  const [range, setRange] = useState<AverageRange>('week');

  const { totalMinutes, days, minutesPerDay } = calculateDailyAverage(
    logs,
    range,
    surgeryDate,
    today
  );

  return (
    <div className="daily-average p-4 bg-white rounded shadow">
      <h3 className="font-bold">Average Activity Per Day</h3>

      <div className="daily-average__ranges">
        {RANGES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`daily-average__range ${range === id ? 'active' : ''}`}
            aria-pressed={range === id}
            onClick={() => setRange(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="daily-average__value">
        {Math.round(minutesPerDay)} <span>min/day</span>
      </p>
      <p className="text-sm text-gray-600">
        {totalMinutes} minutes over {days} day{days === 1 ? '' : 's'}
      </p>
    </div>
  );
}
