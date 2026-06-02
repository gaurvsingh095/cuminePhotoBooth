/**
 * Gallery persistence — two layers:
 * 1. /tmp/gallery.json  — fast, survives within same warm Vercel instance
 * 2. @vercel/kv         — cross-device, cross-instance (connect in Vercel dashboard)
 *
 * Without KV: photos persist within same warm instance (works for single booth)
 * With KV:    photos persist everywhere, visible on all devices
 */
import { readFileSync, writeFileSync } from 'fs';
import { kv } from '@vercel/kv';

const TMP     = '/tmp/smemr_gallery.json';
const KV_KEY  = 'smemr_photos_v2';
const MAX     = 5000;
export const ADMIN_PWD = process.env.ADMIN_PASSWORD || 'smemr2026';

const HAS_KV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// ── /tmp helpers (synchronous, instant, same-instance) ────────────────────
function tmpRead() {
  try { return JSON.parse(readFileSync(TMP, 'utf8')); } catch { return []; }
}
function tmpWrite(photos) {
  try { writeFileSync(TMP, JSON.stringify(photos), 'utf8'); } catch {}
}

// ── KV helpers (async, cross-instance) ───────────────────────────────────
async function kvRead() {
  if (!HAS_KV) return null;
  try { const v = await kv.get(KV_KEY); return Array.isArray(v) ? v : null; }
  catch { return null; }
}
async function kvWrite(photos) {
  if (!HAS_KV) return;
  try { await kv.set(KV_KEY, photos); } catch {}
}

// ── Public API ─────────────────────────────────────────────────────────────
export async function getPhotos() {
  // KV is authoritative when connected (cross-device truth)
  if (HAS_KV) {
    const photos = await kvRead();
    if (photos !== null) { tmpWrite(photos); return photos; }
  }
  // /tmp: works within same warm Vercel instance
  return tmpRead();
}

export async function addPhoto(photo) {
  const photos = await getPhotos();
  photos.unshift(photo);
  if (photos.length > MAX) photos.length = MAX;
  // Write to /tmp synchronously (instant)
  tmpWrite(photos);
  // Write to KV asynchronously (don't block the response)
  kvWrite(photos);
  return photo;
}

export async function deletePhoto(id) {
  const photos = await getPhotos();
  const next   = photos.filter(p => p.id !== id);
  if (next.length === photos.length) return false;
  tmpWrite(next);
  await kvWrite(next);
  return true;
}

export async function clearPhotos() {
  tmpWrite([]);
  await kvWrite([]);
}

export function isAdmin(req) {
  const auth = (req.headers['authorization'] || '').replace(/^Bearer\s*/i, '').trim();
  return auth === ADMIN_PWD;
}
