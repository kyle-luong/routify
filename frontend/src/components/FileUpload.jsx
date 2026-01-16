import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { apiFetch } from '../lib/api';
import { logger } from '../lib/logger';
import { saveSession } from '../lib/session';

export default function FileUpload() {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [shortId, setShortId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [filename, setFilename] = useState('');
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setFilename(file.name);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await apiFetch('/api/sessions', {
        method: 'POST',
        headers: {},
        body: formData,
      });

      if (data.short_id) {
        setShortId(data.short_id);
        saveSession(data.short_id);
      } else {
        setError('Upload failed. Please try again.');
      }
    } catch (err) {
      logger.error('Upload failed:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center">
      <input ref={inputRef} type="file" accept=".ics" onChange={handleUpload} className="hidden" />

      <div className="w-full space-y-2">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-full rounded-md bg-sky-600 px-6 py-3 text-base font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Upload a calendar file'}
        </button>

        <button
          onClick={() => navigate(`/view/${shortId}`)}
          disabled={!shortId || isUploading}
          className="w-full rounded-md bg-slate-900 px-6 py-3 text-base font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          See your map
        </button>

        <div className="mt-2 min-h-[1.5rem] text-center text-sm">
          {filename && !error && <span className="text-slate-500">Selected: {filename}</span>}
          {error && <span className="text-red-600">{error}</span>}
        </div>
      </div>
    </div>
  );
}
