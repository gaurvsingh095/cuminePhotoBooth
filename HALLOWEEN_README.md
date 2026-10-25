# Cu at the Mine — Halloween 2026

Seasonal experience deployed as a separate route `/halloween.html`, linked from the attract and mode screens. The existing single, collage, strip, wide, animated GIF, boomerang, gallery, and admin flows remain in place.

## Features
- Front-facing camera or local photo upload; JPG, PNG, WebP, browser-supported HEIC.
- Up to three real visitor faces, automatically detected when MediaPipe models load.
- Adjustable manual multi-face crop as a fallback, plus pose-matched or standing skeletons.
- Haunted Shaft, Copper Crypt, Moon Mine, Pumpkin Pit.
- 1200 × 1500 PNG download, entirely local: the Halloween route never posts to gallery APIs.
- Model proxy routes in Vercel require working internet; test on the actual event Wi-Fi.

## Verification
GitHub Actions runs the three browser suites from `tests/` on Ubuntu 24.04. Real hardware camera/permissions, Safari, print quality, and event throughput require field testing. Do not confuse deployment success with kiosk QA.

## Known non-Halloween risks
- Existing admin.html does not implement server-verifiable authentication; replace before using admin for sensitive actions.
- Existing gallery API uses legacy Vercel KV or ephemeral /tmp persistence; the npm dependency is declared to make API functions importable, but durable cross-device retention needs configured storage and data migration planning.
- Never assume gallery deletion is permanent across client/server caches until storage backend is reconciled.
- Visitors should be shown photo/consent policies; the Halloween page keeps its results on device.

## Maintenance
Main booth source is not replaced with the photo-station project. Both apps remain separate. The Halloween assets were ported from `smemrPhotoStation`'s tested October 25 release, with the CI browser suites mirrored here.
