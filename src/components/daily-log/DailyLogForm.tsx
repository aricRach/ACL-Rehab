import { useEffect, useState } from 'react';
import type { DailyLog } from '../../models/DailyLog';
import {NumberInput} from '../ui/NumberInput';
import './DailyLogForm.scss';
import type { Phase } from '../../models/phase';

export default function DailyLogForm({
  date,
  value,
  phase,
  onSave
}: {
  phase: Phase;
  date: string;
  value: DailyLog;
  onSave: (log: DailyLog) => void;
}) {
    const [formData, setFormData] = useState(value);

       useEffect(() => {
    setFormData(value)
   }, [value])

  const handleFieldChange = (name, newValue) => {
    setFormData((prev) => ({
      ...prev,
      [name]: +newValue
    }));
  };
   const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted Data:", formData);
    onSave(formData)
  };
  
  return (

<>
<h3 className="font-bold">Daily Log – {date}</h3>

 <form onSubmit={handleSubmit}>
  <section>
 <NumberInput 
        label="Physio (min):"
        name="physioMinutes"
        value={formData.physioMinutes? formData.physioMinutes : ''}
        onChange={handleFieldChange}
      />
       <NumberInput 
        label="Gym (min):"
        name="gymMinutes"
        value={formData.gymMinutes ? formData.gymMinutes : ''}
        onChange={handleFieldChange}
      />
       {phase.id >= 4 && <NumberInput 
        label="Football (min):"
        name="footballMinutes"
        value={formData.footballMinutes ? formData.footballMinutes : ''}
        onChange={handleFieldChange}
      />}
        </section>
        <button type="submit">Save Activity</button>

 </form>
    </>
  );
}
