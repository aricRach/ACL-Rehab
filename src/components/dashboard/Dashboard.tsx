import { useEffect, useState } from 'react';
import DailyLogForm from '../daily-log/DailyLogForm';
import { upsertLog, loadLogs } from '../../services/storage.service';
import {
  aggregateWeekly,
  getWeekStart
} from '../../services/weeklyAggregation.service';
import ProgressBar from '../progress/ProgressBar';
import { calculateProgress } from '../../services/progress.service';
import type { RomStatus } from '../../models/RomStatus';
import RomInput from '../rom/RomInput';
import { loadRom, saveRom } from '../../services/rom.service';
import type { DailyLog } from '../../models/DailyLog';
import './Dashboard.scss';

export default function Dashboard() {

const today = new Date().toISOString().slice(0, 10);
const [selectedDate, setSelectedDate] = useState(today);

    const SURGERY_DATE = new Date('2025-08-07');
    const surgeryDate = SURGERY_DATE.toISOString().slice(0, 10);
    const [rom, setRom] = useState<RomStatus>(
  () => loadRom() ?? { extension: 40, flexion: 0 }
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

  const weekStart = getWeekStart(new Date());
  const weeklyTotal = aggregateWeekly(logs, weekStart);
    const { phase, progress, gate } = calculateProgress(calcWeeksFromSurgery(), weeklyTotal.totalMinutes, rom );

const handleSave = (log: DailyLog) => {
  const updated = upsertLog(selectedDate, log);
  setLogs(updated);
};

  return (
    <>
    <h2>Suregery Date: {surgeryDate}</h2>
    <h3 className="font-bold">Phase: {phase.name}</h3>
    <ProgressBar percent={progress} />
       
       {!gate.passed && (
         <p className="text-red-600 mt-6">Blocked: {gate.reason}</p>
       )}
<RomInput
  value={rom}
  onSave={handleRomChange}
/>

  <div className="p-4 bg-white rounded shadow">

<label className="block font-bold mb-1">Select date</label>
<input
  type="date"
  value={selectedDate}
  min={surgeryDate}
  max={today}
  onChange={e => handleDateChange(e.target.value)}
  className="input"/>       
  </div>

  <div className="max-w-xl mx-auto space-y-4">
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

 <div className="p-4 bg-white rounded shadow space-y-2">
  <h3 className="font-bold">This Week</h3>
  <p className="text-sm text-gray-600">
    {weeklyTotal.totalMinutes} minutes total
  </p>
  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${weeklyTotal.badge.color}`}>
    {weeklyTotal.badge.label}
  </span>
</div>
</div>
 </>
  );
}
