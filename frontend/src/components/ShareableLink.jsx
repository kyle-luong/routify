import { useState } from 'react';
import { FiLink } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

export default function ShareableLink({ shortId }) {
  const [copied, setCopied] = useState(false);
  const location = useLocation();

  // Include /calendar suffix if on calendar page
  const isCalendarPage = location.pathname.endsWith('/calendar');
  const suffix = isCalendarPage ? '/calendar' : '';

  const shareUrl = `${window.location.origin}/view/${shortId}${suffix}`;
  const displayUrl = `/view/${shortId}${suffix}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center rounded-md bg-slate-100 px-2 py-1.5 text-sm text-slate-700">
      <FiLink className="mr-2 h-3.5 w-3.5 shrink-0 text-sky-600" />

      <span className="mr-3 truncate">{displayUrl}</span>

      <button
        onClick={handleCopy}
        className="ml-auto w-[50px] shrink-0 text-sm font-medium text-sky-600 hover:underline"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
