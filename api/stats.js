import { getPhotos, KV_OK } from './_store.js';
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();
  const photos = await getPhotos();
  res.status(200).json({ total: photos.length, kv: KV_OK });
}
