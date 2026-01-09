import { useEffect, useState } from 'react';
import type { DailyLog } from '../../models/DailyLog';
import {NumberInput} from '../ui/NumberInput';
import './DailyLogForm.scss';

export default function DailyLogForm({
  date,
  value,
  onSave
}: {
  date: string;
  value: DailyLog;
  onSave: (log: DailyLog) => void;
}) {
    const [formData, setFormData] = useState(value ?? {
        physioMinutes: 0,
        gymMinutes: 0,
           footballMinutes: 0
    });

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

 <form className='daily-log' onSubmit={handleSubmit}>
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
       <NumberInput 
        label="Football (min):"
        name="footballMinutes"
        value={formData.footballMinutes ? formData.footballMinutes : ''}
        onChange={handleFieldChange}
      />
        </section>
        <button type="submit">Submit</button>

 </form>
    </>
  );
}
