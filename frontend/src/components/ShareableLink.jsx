import { useState } from 'react';
import { FiLink } from 'react-icons/fi';

export default function ShareableLink({ shortId }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/${shortId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // revert after 2s
  };

  return (
    <div className="mb-2 flex items-center justify-between rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
      <div className="flex items-center space-x-2 overflow-hidden">
        <FiLink className="shrink-0 text-sky-600" />
        <span className="truncate">{shareUrl}</span>
      </div>
      {copied ? (
        <span className="ml-3 font-medium text-sky-600">Link copied!</span>
      ) : (
        <button
          onClick={handleCopy}
          className="ml-3 text-sm font-medium text-sky-600 hover:underline"
        >
          Copy
        </button>
      )}
    </div>
  );
}
