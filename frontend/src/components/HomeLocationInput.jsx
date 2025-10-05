import { useEffect, useRef, useState } from 'react';

export default function HomeLocationInput({
  onSetLocation,
  currentLocation,
  isGeocoding = false,
  geoError = '',
  onClear,
}) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!q.trim()) {
      setItems([]);
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const id = setTimeout(async () => {
      try {
        setLoading(true);
        const url = new URL(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json`
        );
        url.searchParams.set('access_token', import.meta.env.VITE_MAPBOX_TOKEN);
        url.searchParams.set('autocomplete', 'true');
        url.searchParams.set('limit', '6');
        url.searchParams.set('types', 'address,place,poi');
        // url.searchParams.set('country', 'us');

        const res = await fetch(url.toString(), { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setItems(
          (data.features || []).map((f) => ({
            id: f.id,
            full: f.place_name,
            center: f.center, // [lng, lat]
          }))
        );
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('Geocoding search error', e);
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    }, 250); // debounce

    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setItems([]);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const pick = (it) => {
    setItems([]);
    setQ('');
    if (!it?.center) return;
    const [lng, lat] = it.center;
    onSetLocation({
      title: 'Home',
      location: it.full,
      longitude: lng,
      latitude: lat,
      isHome: true,
    });
  };

  return (
    <div ref={boxRef} className="relative w-full">
      <div className="mt-3 flex items-center gap-2">
        <span className="text-2xl leading-none" aria-hidden>🏠</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={currentLocation ? currentLocation.location : 'Enter home address or starting point'}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          disabled={isGeocoding}
        />
        {currentLocation && (
          <button
            type="button"
            onClick={onClear}
            className="rounded px-1 py-1 text-xs text-red-600 hover:text-red-700"
          >
            <span className="text-[18px] leading-none" aria-hidden>❌</span>
          </button>
        )}
      </div>

      {loading && <div className="mt-1 text-sm text-center text-slate-500 px-1 py-1">Searching...</div>}
      {geoError && <div className="mt-1 text-sm text-red-600">{geoError}</div>}

        <div className="">
            <span className="text-2xl leading-none" aria-hidden> </span>
            {items.length > 0 && (
                <ul className="absolute z-10 mt-3 left-8 right-1 overflow-hidden rounded-md border border-slate-200 bg-white shadow">
                    {items.map((it) => (
                    <li
                    key={it.id}
                    onClick={() => pick(it)}
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-slate-50"
                    title={it.full}
                    >
                    {it.full}
                    </li>
                ))}
                </ul>
            )}
        </div>
    </div>
  );
}
