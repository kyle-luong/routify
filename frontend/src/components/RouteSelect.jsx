export default function RouteSelect({ isSelected, onSelect }) {
  return (
    <div className="my-2 flex justify-center">
      <button
        onClick={onSelect}
        className={`rounded-md border px-3 py-1 text-sm transition ${
          isSelected
            ? 'border-sky-600 bg-sky-600 text-white'
            : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
        } `}
      >
        {isSelected ? 'Deselect Segment' : 'Select Segment'}
      </button>
    </div>
  );
}
