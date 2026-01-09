import { useState } from 'react';
import type { RomStatus } from '../../models/RomStatus';
import { NumberInput } from '../ui/NumberInput';
import './RomInput.scss';

export default function RomInput({
  value,
  onSave
}: {
  value: RomStatus;
  onSave: (rom: RomStatus) => void;
}) {

  const [draft, setDraft] = useState<RomStatus>(value);

  const handleFieldChange = (name: string, newValue: number) => {
    setDraft((prev) => ({
      ...prev,
      [name]: newValue
    }));
  };

  const errors = {
    extension: draft.extension < 0 || draft.extension > 40,
    flexion: draft.flexion < 0 || draft.flexion > 140
  };
  const hasError = Object.values(errors).some(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasError) {
      onSave(draft);
    }
  };

  return (
    <form className="rom-form p-4 border rounded" onSubmit={handleSubmit}>
      <h3 className="font-bold mb-4">ROM</h3>

      <NumberInput
        label="Extension (°)"
        name="extension"
        value={draft.extension}
        onChange={handleFieldChange}
        min={0}
        max={40}
      />
      {errors.extension && (
        <p className="text-sm text-red-600 mb-2">Extension: 0° to 40°</p>
      )}

      <NumberInput
        label="Flexion (°)"
        name="flexion"
        value={draft.flexion}
        onChange={handleFieldChange}
        min={0}
        max={140}
      />
      {errors.flexion && (
        <p className="text-sm text-red-600 mb-2">Flexion: 0° to 140°</p>
      )}

      <button
        type="submit"
        disabled={hasError}
        className={`submit-btn ${hasError ? 'disabled' : 'active'}`}
      >
        Save ROM
      </button>
    </form>
  );
}
