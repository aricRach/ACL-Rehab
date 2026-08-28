import { useEffect, useState } from 'react';
import DailyLogForm from '../daily-log/DailyLogForm';
import { upsertLog, loadLogs } from '../../services/storage.service';
import {
  aggregateWeekly,
  getWeekStart
} from '../../services/weeklyAggregation.service';
import ProgressBar from '../progress/ProgressBar';
import { aggregateSinceSurgery, calculateProgress } from '../../services/progress.service';
import type { RomStatus } from '../../models/RomStatus';
import RomInput from '../rom/RomInput';
import { loadRom, saveRom } from '../../services/rom.service';
import type { DailyLog } from '../../models/DailyLog';
import './Dashboard.scss';
import { loadSurgeryDate, saveSurgeryDate } from '../../services/surgeryDate.service';
import { buildWeeklyConsistency } from '../../services/consistency.service';
import ConsistencyChart from '../progress/ConsistencyChart';
import BackupControls from '../backup/BackupControls';

export default function Dashboard() {

const today = new Date().toISOString().slice(0, 10);
const [selectedDate, setSelectedDate] = useState(today);
const [surgeryDate, setSurgeryDate] = useState(() => loadSurgeryDate());
const SURGERY_DATE = new Date(surgeryDate);


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


  const weekStart = getWeekStart(new Date());
  const weeklyTotal = aggregateWeekly(logs, weekStart);


const totalActivity = aggregateSinceSurgery(logs, SURGERY_DATE);
const weeklyConsistency = buildWeeklyConsistency(logs, SURGERY_DATE);

const weeksFromSurgery = calcWeeksFromSurgery() || 1;
const avgWeeklyActivity = totalActivity / weeksFromSurgery;

const { phase, progress, gate } = calculateProgress(
  weeksFromSurgery,
  avgWeeklyActivity,
  rom
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
  <BackupControls />
      </header>
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
  <h3 className="font-bold">This Week</h3>
  <p className="text-sm text-gray-600">
    {weeklyTotal.totalMinutes} minutes total
  </p>
  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${weeklyTotal.badge.color}`}>
    {weeklyTotal.badge.label}
  </span>
</div>

<ConsistencyChart data={weeklyConsistency} />
</div>
 </>
  );
}
