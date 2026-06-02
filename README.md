# SMEMR Photo Booth — Cu at the Mine 2026

## Deploy to Vercel (3 minutes)

1. Go to **vercel.com** → New Project → drag this folder into the upload zone → Deploy
2. You get a URL like `https://smemr-booth.vercel.app`

## Gallery works immediately — zero setup needed

Photos are saved to the **browser's IndexedDB** on the same device.
When someone takes a photo on the booth and opens `gallery.html` on the SAME device, they see all photos.

## Enable cross-device shared gallery (2 more clicks)

For photos to appear on ANY device/phone that visits the gallery URL:

1. Vercel dashboard → your project → **Storage** tab
2. Click **Create Database** → **KV** → **Create**
3. Click **Connect to Project** → **Connect**

That's it. Env vars are set automatically. Redeploy once. Now every photo appears for everyone.

## URLs

| Page | URL |
|---|---|
| Booth | `yoursite.vercel.app` |
| Gallery | `yoursite.vercel.app/gallery.html` |
| Admin | `yoursite.vercel.app/admin.html` |

## Admin credentials
- Default: `smemr2026`
- Change: Vercel → Settings → Environment Variables → `ADMIN_PASSWORD`

## iPad / iPhone as kiosk
Open booth URL in Safari → Share → Add to Home Screen → opens full-screen
