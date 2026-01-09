import { useEffect, useRef, useState } from 'react';
import { FiNavigation, FiX } from 'react-icons/fi';

export default function HomeAddressSearch({ onPick, onClear, current }) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const abortRef = useRef(null);
  const boxRef = useRef(null);
  const inputRef = useRef(null);

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
        url.searchParams.set('country', 'us');

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
      {/* Styled search bar */}
      <div className="relative overflow-visible">
        {/* Left marker dot + downward line */}
        <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </span>
        </div>
        <div className="pointer-events-none absolute -bottom-6 left-[22px] h-6 w-px bg-slate-400/70" />

        <div className="flex items-center rounded-2xl bg-slate-100 px-4 py-3 shadow-sm ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-sky-400">
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={current ? current.location : 'Pickup location'}
            className="ml-8 flex-1 bg-transparent text-base text-slate-700 placeholder:text-slate-500 focus:outline-none"
          />

          {current && (
            <button
              type="button"
              onClick={onClear}
              className="mr-1 rounded-md p-1.5 text-red-500 hover:bg-red-50"
              aria-label="Clear home"
              title="Clear home"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            className="rounded-md p-2 text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 active:scale-[0.98]"
            aria-label="Search"
            title="Search"
          >
            <FiNavigation className="h-5 w-5" />
          </button>
        </div>
      </div>

      {loading && <div className="mt-1 text-xs text-slate-500">Searching…</div>}
      {err && <div className="mt-1 text-xs text-red-600">{err}</div>}

      {items.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow">
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
