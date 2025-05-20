export default function CommuteDivider({ duration }) {
  return (
    <div className="flex items-center text-center text-sm text-slate-500">
      <div className="h-px flex-grow bg-slate-200" />
      <span className="px-2">{`Commute: ${duration}`}</span>
      <div className="h-px flex-grow bg-slate-200" />
    </div>
  );
}
