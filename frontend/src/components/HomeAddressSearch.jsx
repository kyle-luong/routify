import { useEffect, useRef, useState } from 'react';

export default function HomeAddressSearch({ onPick, onClear, current }) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const abortRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!q.trim()) {
      setItems([]);
      setErr('');
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setErr('');
        const url = new URL(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json`
        );
        url.searchParams.set('access_token', import.meta.env.VITE_MAPBOX_TOKEN);
        url.searchParams.set('autocomplete', 'true');
        url.searchParams.set('limit', '6');
        url.searchParams.set('types', 'address,place,poi');
        url.searchParams.set('country', 'us'); // adjust as needed

        const res = await fetch(url.toString(), { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const feats = data.features || [];
        setItems(
          feats.map((f) => ({
            id: f.id,
            name: f.text,
            full: f.place_name,
            center: f.center, // [lng, lat]
          }))
        );
      } catch (e) {
        if (e.name !== 'AbortError') {
          setErr('Search failed.');
          console.error('Geocoding search error', e);
        }
      } finally {
        setLoading(false);
      }
    }, 250); // debounce

    return () => clearTimeout(t);
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
    onPick({
      title: 'Home',
      location: it.full,
      longitude: lng,
      latitude: lat,
      isHome: true,
    });
  };

  return (
    <div ref={boxRef} className="relative w-full">
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={current ? current.location : 'Enter home address'}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {current && (
          <button
            onClick={onClear}
            className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
          >
            Clear
          </button>
        )}
      </div>
      {loading && <div className="mt-1 text-xs text-slate-500">Searching…</div>}
      {err && <div className="mt-1 text-xs text-red-600">{err}</div>}
      {items.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow">
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
  );
}
