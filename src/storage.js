// Firebase storage adapter
// Private data → localStorage. Shared (group) data → Firebase Realtime Database.
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set as fbSet, get as fbGet, remove as fbRemove, onValue } from 'firebase/database';

// ⚠ REPLACE THIS BLOCK WITH YOUR OWN FIREBASE CONFIG (see README)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

let db = null;
try {
  if (firebaseConfig.databaseURL) {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
  }
} catch (e) {
  console.warn('Firebase init failed — group sharing will be disabled.', e);
}

// Sanitize keys for Firebase (no . # $ [ ] /)
const safeKey = (k) => k.replace(/[.#$/[\]]/g, '_');

export const storage = {
  async get(key, shared = false) {
    if (!shared) {
      const v = localStorage.getItem(key);
      return v ? { key, value: v, shared: false } : null;
    }
    if (!db) return null;
    const snap = await fbGet(ref(db, safeKey(key)));
    return snap.exists() ? { key, value: snap.val(), shared: true } : null;
  },

  async set(key, value, shared = false) {
    if (!shared) {
      localStorage.setItem(key, value);
      return { key, value, shared: false };
    }
    if (!db) return null;
    await fbSet(ref(db, safeKey(key)), value);
    return { key, value, shared: true };
  },

  async delete(key, shared = false) {
    if (!shared) {
      localStorage.removeItem(key);
      return { key, deleted: true, shared: false };
    }
    if (!db) return null;
    await fbRemove(ref(db, safeKey(key)));
    return { key, deleted: true, shared: true };
  },

  async list(prefix = '', shared = false) {
    if (!shared) {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) keys.push(k);
      }
      return { keys, prefix, shared: false };
    }
    if (!db) return { keys: [], prefix, shared: true };
    // For group lookups we know the prefix structure: group:CODE:member:NAME
    // Fetch the parent path and list children
    const parts = prefix.split(':').filter(Boolean);
    if (parts.length >= 3 && parts[0] === 'group' && parts[2] === 'member') {
      const parentPath = safeKey(`group:${parts[1]}:member:`).replace(/_$/, '');
      const snap = await fbGet(ref(db, parentPath));
      if (!snap.exists()) return { keys: [], prefix, shared: true };
      const keys = Object.keys(snap.val()).map(k => `group:${parts[1]}:member:${k}`);
      return { keys, prefix, shared: true };
    }
    return { keys: [], prefix, shared: true };
  },

  // Subscribe to live updates of a group's members. Returns an unsubscribe function.
  subscribeToGroup(groupCode, callback) {
    if (!db) return () => {};
    // Keys are stored flat at root (e.g. "group:mundial2026-greenwich:member:Dani L"),
    // so listen at root and filter by prefix.
    const prefix = `group:${groupCode}:member:`;
    const rootRef = ref(db, '/');
    const unsub = onValue(rootRef, (snap) => {
      const data = snap.val() || {};
      const members = Object.entries(data)
        .filter(([k]) => k.startsWith(prefix))
        .map(([, v]) => {
          try { return typeof v === 'string' ? JSON.parse(v) : v; }
          catch { return null; }
        })
        .filter(Boolean);
      callback(members);
    });
    return unsub;
  },

  isShared: () => !!db,
};
