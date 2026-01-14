const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch(path, init) {
  const url = `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  const headers =
    init?.body instanceof FormData
      ? init?.headers
      : { 'Content-Type': 'application/json', ...(init?.headers || {}) };

  let res;
  try {
    res = await fetch(url, { ...init, headers });
  } catch {
    throw new ApiError('Network error. Please check your connection.', 0);
  }

  if (!res.ok) {
    let data = null;
    try {
      data = await res.json();
    } catch {
      // Response body is not JSON
    }
    const message = data?.message || data?.error || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function getCommuteTimes(origins, destinations, mode) {
  const data = await apiFetch('/api/distance-matrix', {
    method: 'POST',
    body: JSON.stringify({ origins, destinations, mode }),
  });
  return data.results;
}

