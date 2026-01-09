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
export default function Dashboard() {

      const today = new Date().toISOString().slice(0, 10);
const [selectedDate, setSelectedDate] = useState(today);

    const SURGERY_DATE = new Date('2026-01-07');
    const surgeryDate = SURGERY_DATE.toISOString().slice(0, 10);
    const [rom, setRom] = useState<RomStatus>(
  () => loadRom() ?? { extension: 0, flexion: 90 }
);
  const [logs, setLogs] = useState(() => {

    const logs = loadLogs();
    console.log({logs});
    
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
  console.log('selectedDate', selectedDate);
  console.log({selectedDateLog});

  setDraftLog(logs[selectedDate]);
}, [logs, today, selectedDate]);


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
    const { phase, progress, gate } = calculateProgress(calcWeeksFromSurgery(), weeklyTotal, rom );

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
         <p className="text-red-600 mt-2">Blocked: {gate.reason}</p>
       )}
<RomInput
  value={rom}
  onSave={handleRomChange}
/>


  <div className="max-w-xl mx-auto space-y-4">

      <DailyLogForm
        key={selectedDate} // Forces a total reset only when data is ready
        date={selectedDate}
        value={draftLog}
        onSave={handleSave}
      />


              <div className="p-4 bg-white rounded shadow">
                  <h3 className="font-bold">This Week</h3>
                  <p>{weeklyTotal} minutes total</p>
              </div>
          </div>

          <div className="p-4 bg-white rounded shadow">







  <label className="block font-bold mb-1">Select date</label>
<input
  type="date"
  value={selectedDate}
  min={surgeryDate}
  max={today}
  onChange={e => handleDateChange(e.target.value)}
  className="input"
/>
</div>

          </>
  );
}
