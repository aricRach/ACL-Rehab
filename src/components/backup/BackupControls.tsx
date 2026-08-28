import { useRef, useState } from 'react';
import { downloadBackup, importBackup } from '../../services/backup.service';
import './BackupControls.scss';

export default function BackupControls() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleFile = async (file: File) => {
    const confirmed = window.confirm(
      'Importing replaces the data currently on this device. Continue?'
    );
    if (!confirmed) return;

    try {
      const text = await file.text();
      const count = importBackup(text);
      setIsError(false);
      setMessage(`Restored ${count} item(s). Reloading…`);
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : 'Import failed.');
    }
  };

  return (
    <div className="backup-controls">
      <div className="backup-controls__buttons">
        <button
          type="button"
          className="submit-btn active"
          onClick={downloadBackup}
        >
          Export data
        </button>
        <button
          type="button"
          className="submit-btn active"
          onClick={() => fileInputRef.current?.click()}
        >
          Import data
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />

      {message && (
        <p className={`text-sm ${isError ? 'text-red-600' : 'text-gray-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
