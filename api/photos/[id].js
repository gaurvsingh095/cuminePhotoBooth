import { getPhotos, deletePhoto, isAdmin } from '../_store.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { id } = req.query;

  if (req.method === 'GET') {
    const photos = await getPhotos();
    const photo  = photos.find(p => p.id === id);
    return photo ? res.status(200).json(photo) : res.status(404).json({ error: 'Not found' });
  }

  if (req.method === 'DELETE') {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Admin required' });
    const ok = await deletePhoto(id);
    return res.status(ok ? 200 : 404).json(ok ? { ok: true } : { error: 'Not found' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
