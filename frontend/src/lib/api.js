const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export async function apiFetch(path, init) {
  const url = `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  const headers =
    init?.body instanceof FormData
      ? init?.headers
      : { 'Content-Type': 'application/json', ...(init?.headers || {}) };

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

