import { beforeEach, describe, expect, it } from 'vitest';

import { clearSession, getSession, saveSession } from './session';

describe('session utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveSession', () => {
    it('saves session ID to localStorage', () => {
      saveSession('test123');
      expect(localStorage.getItem('calview_session')).toBe('test123');
    });

    it('overwrites existing session', () => {
      saveSession('first');
      saveSession('second');
      expect(localStorage.getItem('calview_session')).toBe('second');
    });
  });

  describe('getSession', () => {
    it('returns null when no session exists', () => {
      expect(getSession()).toBeNull();
    });

    it('returns saved session ID', () => {
      localStorage.setItem('calview_session', 'abc123');
      expect(getSession()).toBe('abc123');
    });
  });

  describe('clearSession', () => {
    it('removes session from localStorage', () => {
      localStorage.setItem('calview_session', 'test');
      clearSession();
      expect(localStorage.getItem('calview_session')).toBeNull();
    });
  });
});
