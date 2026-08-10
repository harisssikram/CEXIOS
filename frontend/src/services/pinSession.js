/**
 * Tracks the short-lived "PIN unlock" used to gate any data-changing action
 * (add/edit/delete/upload). Kept in memory only (not localStorage) -- it's meant
 * to expire fast and shouldn't survive a page reload anyway.
 */
let token = null;
let expiresAt = 0;
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn());
}

const pinSession = {
  unlock(pinToken, expiresInSeconds) {
    token = pinToken;
    expiresAt = Date.now() + expiresInSeconds * 1000;
    notify();
  },

  lock() {
    token = null;
    expiresAt = 0;
    notify();
  },

  /** Returns the token if still valid, otherwise null (and clears state if expired). */
  getValidToken() {
    if (token && Date.now() < expiresAt) return token;
    if (token) {
      token = null;
      expiresAt = 0;
      notify();
    }
    return null;
  },

  isUnlocked() {
    return Boolean(pinSession.getValidToken());
  },

  msRemaining() {
    return Math.max(0, expiresAt - Date.now());
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export default pinSession;
