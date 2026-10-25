'use strict';
/**
 * GalleryStore
 *
 * save()   → IndexedDB (instant) + API upload (background, for cross-device)
 * getAll() → API first (shared gallery) → IndexedDB fallback (same device)
 *
 * Cross-device gallery requires Vercel KV connected (2 clicks).
 * Same-device gallery works with zero setup.
 */

// ── IndexedDB ──────────────────────────────────────────────────────────────
const IDB = (function() {
  let db = null;
  function open() {
    if (db) return Promise.resolve(db);
    return new Promise((ok, fail) => {
      const r = indexedDB.open('smemr_v2', 1);
      r.onupgradeneeded = e => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains('photos')) {
          const s = d.createObjectStore('photos', { keyPath: 'id' });
          s.createIndex('ts', 'createdAt', { unique: false });
        }
      };
      r.onsuccess  = e => { db = e.target.result; ok(db); };
      r.onerror    = ()  => fail(r.error);
    });
  }
  return {
    put(rec)  { return open().then(d => new Promise((ok,f)=>{ const tx=d.transaction('photos','readwrite'); tx.objectStore('photos').put(rec); tx.oncomplete=ok; tx.onerror=()=>f(tx.error); })); },
    all()     { return open().then(d => new Promise((ok,f)=>{ const req=d.transaction('photos','readonly').objectStore('photos').index('ts').getAll(); req.onsuccess=()=>ok((req.result||[]).reverse()); req.onerror=()=>f(req.error); })); },
    del(id)   { return open().then(d => new Promise((ok,f)=>{ const tx=d.transaction('photos','readwrite'); tx.objectStore('photos').delete(id); tx.oncomplete=ok; tx.onerror=()=>f(tx.error); })); },
    clear()   { return open().then(d => new Promise((ok,f)=>{ const tx=d.transaction('photos','readwrite'); tx.objectStore('photos').clear(); tx.oncomplete=ok; tx.onerror=()=>f(tx.error); })); },
  };
})();

// ── API ────────────────────────────────────────────────────────────────────
function apiFetch(path, opts) {
  return fetch('/api' + path, Object.assign({ signal: AbortSignal.timeout(12000) }, opts || {}))
    .then(r => r.ok ? r.json() : null)
    .catch(() => null);
}

// ── Public ─────────────────────────────────────────────────────────────────
window.GalleryStore = {

  async save(photo) {
    // Generate ID client-side
    photo.id = photo.id || ('p' + Date.now() + Math.random().toString(36).slice(2,6));
    photo.dateStr = photo.dateStr || new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    photo.createdAt = photo.createdAt || Date.now();

    // 1. Local IndexedDB — instant, never fails
    await IDB.put(photo).catch(() => {});

    // 2. API — for cross-device sharing (fire and forget)
    if (location.protocol !== 'file:') {
      fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photo),
      }).catch(() => {});
    }
    return photo.id;
  },

  async getAll() {
    // Try API — if it returns photos (KV connected), everyone sees the same gallery
    if (location.protocol !== 'file:') {
      const data = await apiFetch('/photos?limit=500');
      if (data && Array.isArray(data.photos) && data.photos.length > 0) {
        return data.photos;
      }
      // API returned 0: either KV not connected or truly empty.
      // Check IndexedDB — if it has photos, KV is not connected, use local.
    }
    // IndexedDB fallback — always works, same device/browser only
    return IDB.all().catch(() => []);
  },

  async get(id) {
    // Local cache is fastest and always has data if same device
    const locals = await IDB.all().catch(() => []);
    const found = locals.find(p => p.id === id);
    if (found) return found;
    // Try API
    return apiFetch('/photos/' + id);
  },

  async delete(id, pwd) {
    IDB.del(id).catch(() => {});
    if (location.protocol !== 'file:' && pwd) {
      await apiFetch('/photos/' + id, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + pwd },
      });
    }
  },

  async clearAll(pwd) {
    IDB.clear().catch(() => {});
    if (location.protocol !== 'file:' && pwd) {
      await apiFetch('/photos', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + pwd },
      });
    }
  },

  async count() {
    if (location.protocol !== 'file:') {
      const s = await apiFetch('/stats');
      if (s && s.total > 0) return s.total;
    }
    return IDB.all().then(a => a.length).catch(() => 0);
  },
};
