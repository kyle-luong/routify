const SESSION_KEY = 'calview_session';

export function saveSession(shortId) {
  if (shortId) {
    localStorage.setItem(SESSION_KEY, shortId);
  }
}

export function getSession() {
  return localStorage.getItem(SESSION_KEY);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
