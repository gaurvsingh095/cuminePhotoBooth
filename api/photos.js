import { getPhotos, addPhoto, clearPhotos, isAdmin } from './_store.js';
export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'GET') {
    const photos = await getPhotos();
    return res.status(200).json({ total: photos.length, photos });
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (!body.thumbnail) return res.status(400).json({ error: 'thumbnail required' });
    const id = 'p' + Date.now() + Math.random().toString(36).slice(2, 7);
    const photo = await addPhoto({
      id,
      thumbnail:    body.thumbnail,
      templateName: body.templateName || 'SMEMR Photo',
      eventName:    body.eventName    || 'Cu at the Mine 2026',
      mode:         body.mode         || 'single',
      dateStr:      new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      createdAt:    Date.now(),
    });
    return res.status(201).json({ id: photo.id });
  }

  if (req.method === 'DELETE') {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Admin required' });
    await clearPhotos();
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
