import type { DailyLog } from '../../models/DailyLog';
import './WeekCalendar.scss';

interface Props {
  logs: Record<string, DailyLog>;
  selectedDate: string; // YYYY-MM-DD; the calendar shows the week containing it
  minDate: string;
  maxDate: string;
  onSelectDate: (date: string) => void;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Parse YYYY-MM-DD as a local date (new Date('YYYY-MM-DD') is UTC and can shift the day)
function parseDate(value: string) {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(value: string, days: number) {
  const d = parseDate(value);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export default function WeekCalendar({
  logs,
  selectedDate,
  minDate,
  maxDate,
  onSelectDate
}: Props) {
  const selected = parseDate(selectedDate);
  const sunday = formatDate(
    new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() - selected.getDay())
  );
  const saturday = addDays(sunday, 6);

  const days = DAY_NAMES.map((name, i) => {
    const date = addDays(sunday, i);
    const log = logs[date];
    const total = log
      ? log.physioMinutes + log.gymMinutes + log.footballMinutes
      : 0;
    const inRange = date >= minDate && date <= maxDate;
    return { name, date, total, inRange };
  });

  const weekTotal = days.reduce((sum, d) => sum + d.total, 0);
  const activeDays = days.filter(d => d.total > 0).length;

  const goToWeek = (offset: number) => {
    let target = addDays(selectedDate, offset * 7);
    if (target < minDate) target = minDate;
    if (target > maxDate) target = maxDate;
    onSelectDate(target);
  };

  const rangeLabel = `${parseDate(sunday).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  })} – ${parseDate(saturday).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })}`;

  return (
    <div className="week-calendar p-4 bg-white rounded shadow">
      <div className="week-calendar__header">
        <button
          type="button"
          className="week-calendar__nav"
          onClick={() => goToWeek(-1)}
          disabled={sunday <= minDate}
          aria-label="Previous week"
        >
          ‹
        </button>
        <div>
          <h3 className="font-bold">Week View</h3>
          <p className="week-calendar__range">{rangeLabel}</p>
        </div>
        <button
          type="button"
          className="week-calendar__nav"
          onClick={() => goToWeek(1)}
          disabled={saturday >= maxDate}
          aria-label="Next week"
        >
          ›
        </button>
      </div>

      <div className="week-calendar__grid">
        {days.map(({ name, date, total, inRange }) => (
          <button
            key={date}
            type="button"
            className={[
              'week-calendar__day',
              date === selectedDate ? 'selected' : '',
              date === maxDate ? 'today' : '',
              total > 0 ? 'active' : ''
            ].join(' ')}
            disabled={!inRange}
            onClick={() => onSelectDate(date)}
          >
            <span className="week-calendar__dayname">{name}</span>
            <span className="week-calendar__daynum">{parseDate(date).getDate()}</span>
            <span className="week-calendar__total">
              {total > 0 ? (
                <>
                  {total}
                  <small>min</small>
                </>
              ) : inRange ? (
                <small>Rest</small>
              ) : null}
            </span>
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-600 week-calendar__summary">
        {weekTotal} minutes · {activeDays} active day{activeDays === 1 ? '' : 's'}
      </p>
    </div>
  );
}
