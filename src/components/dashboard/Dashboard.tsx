import { useEffect, useState } from 'react';
import DailyLogForm from '../daily-log/DailyLogForm';
import { upsertLog, loadLogs } from '../../services/storage.service';
import {
  aggregateWeekly,
  getWeekStart
} from '../../services/weeklyAggregation.service';
import ProgressBar from '../progress/ProgressBar';
import { aggregateMinutesByWeek, calculateProgress } from '../../services/progress.service';
import type { RomStatus } from '../../models/RomStatus';
import RomInput from '../rom/RomInput';
import { loadRom, saveRom } from '../../services/rom.service';
import type { DailyLog } from '../../models/DailyLog';
import './Dashboard.scss';
import { loadSurgeryDate, saveSurgeryDate } from '../../services/surgeryDate.service';
import { buildWeeklyConsistency } from '../../services/consistency.service';
import ConsistencyChart from '../progress/ConsistencyChart';
import DailyAverage from '../progress/DailyAverage';
import WeekCalendar from '../progress/WeekCalendar';
import BackupControls from '../backup/BackupControls';
import { loadDailyGoal, saveDailyGoal } from '../../services/dailyGoal.service';

export default function Dashboard() {

const today = new Date().toISOString().slice(0, 10);
const [selectedDate, setSelectedDate] = useState(today);
const [surgeryDate, setSurgeryDate] = useState(() => loadSurgeryDate());
const SURGERY_DATE = new Date(surgeryDate);
const [dailyGoal, setDailyGoal] = useState(() => loadDailyGoal());
// What's typed in the field; only valid values become the goal
const [dailyGoalInput, setDailyGoalInput] = useState(String(dailyGoal));


    const [rom, setRom] = useState<RomStatus>(
  () => loadRom() ?? { extension: 40, flexion: 40 }
);
  const [logs, setLogs] = useState(() => {
    const logs = loadLogs();
    return logs
  });

const selectedDateLog =
  logs[selectedDate] ?? {
    physioMinutes: 0,
    gymMinutes: 0,
    footballMinutes: 0
  };
  const [draftLog, setDraftLog] = useState(selectedDateLog);

useEffect(() => {
  setDraftLog(logs[selectedDate]);
}, [logs, selectedDate]);


const handleRomChange = (newRom: RomStatus) => {
  setRom(newRom);
  saveRom(newRom);
};

function calcWeeksFromSurgery() {
  const diffMs = Date.now() - SURGERY_DATE.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
}

const handleDateChange = (value: string) => {
  if (!value) return;

  if (value < surgeryDate) return;
  if (value > today) return;

  setSelectedDate(value);
};


  // Follow the week shown in the calendar (the week of the selected date).
  // Parse YYYY-MM-DD as a local date so the week doesn't shift by timezone.
  const [selY, selM, selD] = selectedDate.split('-').map(Number);
  const weekStart = getWeekStart(new Date(selY, selM - 1, selD));
  const weeklyTotal = aggregateWeekly(logs, weekStart);
  const isCurrentWeek =
    weekStart.getTime() === getWeekStart(new Date()).getTime();
  const weekLabel = isCurrentWeek
    ? 'This Week'
    : `Week of ${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;


const weeklyConsistency = buildWeeklyConsistency(logs, SURGERY_DATE);

const minutesByWeek = aggregateMinutesByWeek(logs, SURGERY_DATE);

const { phase, progress, optimalProgress, gate } = calculateProgress(
  calcWeeksFromSurgery(),
  minutesByWeek,
  rom,
  dailyGoal
);


const handleSave = (log: DailyLog) => {
  const updated = upsertLog(selectedDate, log);
  setLogs(updated);
};

  return (
    <>
    <header className="p-4 bg-white rounded shadow space-y-1">
    <label className="block font-bold mb-1">Suregery Date</label>

  <input
    type="date"
    value={surgeryDate}
    required
    onChange={e => {
      setSurgeryDate(e.target.value);
      saveSurgeryDate(e.target.value);
    }}
    className="input"
  />
  <label className="block font-bold mb-1">Daily Goal (minutes)</label>

  <input
    type="number"
    value={dailyGoalInput}
    min={1}
    max={600}
    onChange={e => {
      setDailyGoalInput(e.target.value);
      const minutes = Number(e.target.value);
      if (!(minutes > 0)) return;
      setDailyGoal(minutes);
      saveDailyGoal(minutes);
    }}
    onBlur={() => setDailyGoalInput(String(dailyGoal))}
    className="input"
  />
  <BackupControls />
      </header>
    <h3 className="font-bold">Phase: {phase.name}</h3>
    <ProgressBar percent={progress} optimalPercent={optimalProgress} />
       
       {!gate.passed && (
         <p className="text-red-600 mt-6">Blocked: {gate.reason}</p>
       )}
<RomInput
  value={rom}
  onSave={handleRomChange}
/>

  <div className="p-4 bg-white rounded shadow">



  <div className="max-w-xl mx-auto space-y-4">
    <h3 className="font-bold">Daily Log</h3>
    <section className="activity-date">
<input
  type="date"
  value={selectedDate}
  min={surgeryDate}
  max={today}
  onChange={e => handleDateChange(e.target.value)}
  className="input"/> 
    </section>
      
  </div>
      <DailyLogForm
        key={selectedDate} // Forces a total reset only when data is ready
        phase={phase}
        date={selectedDate}
        value={draftLog ?? { 
          physioMinutes: 0,
        gymMinutes: 0,
           footballMinutes: 0}}
        onSave={handleSave}
      />

 <div className="weekly-summary p-4 bg-white rounded shadow space-y-2">
  <h3 className="font-bold">{weekLabel}</h3>
  <p className="text-sm text-gray-600">
    {weeklyTotal.totalMinutes} minutes total
  </p>
  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${weeklyTotal.badge.color}`}>
    {weeklyTotal.badge.label}
  </span>
</div>

<WeekCalendar
  logs={logs}
  selectedDate={selectedDate}
  minDate={surgeryDate}
  maxDate={today}
  onSelectDate={handleDateChange}
/>

<DailyAverage logs={logs} surgeryDate={surgeryDate} today={today} />

<ConsistencyChart data={weeklyConsistency} />
</div>
 </>
  );
}
