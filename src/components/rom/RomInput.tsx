import { useState, useEffect } from 'react';
import type { RomStatus } from '../../models/RomStatus';

export default function RomInput({
  value,
  onSave
}: {
  value: RomStatus;
  onSave: (rom: RomStatus) => void;
}) {

  const [draft, setDraft] = useState<RomStatus>(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const errors = {
    extension: draft.extension < 0 || draft.extension > 40,
    flexion: draft.flexion < 0 || draft.flexion > 140
  };

  const hasError = Object.values(errors).some(Boolean);

  return (
    <div className="p-4 border rounded space-y-2">
      <h3 className="font-bold">ROM</h3>

      <label>Extension (°)</label>
      <input
        type="number"
        value={draft.extension}
        onChange={e =>
          setDraft({ ...draft, extension: +e.target.value })
        }
        className={`input ${
          errors.extension ? 'border-red-500' : ''
        }`}
      />
      {errors.extension && (
        <p className="text-sm text-red-600">
          Extension must be between 0° and 40°
        </p>
      )}

      <label>Flexion (°)</label>
      <input
        type="number"
        value={draft.flexion}
        onChange={e =>
          setDraft({ ...draft, flexion: +e.target.value })
        }
        className={`input ${
          errors.flexion ? 'border-red-500' : ''
        }`}
      />
      {errors.flexion && (
        <p className="text-sm text-red-600">
          Flexion must be between 0° and 140°
        </p>
      )}

      <button
        disabled={hasError}
        onClick={() => onSave(draft)}
        className={`mt-2 px-4 py-2 rounded text-white
          ${hasError ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600'}
        `}
      >
        Save ROM
      </button>
    </div>
  );
}
