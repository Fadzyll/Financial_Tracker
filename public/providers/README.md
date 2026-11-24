# Provider logos

Bank / provider logos. Without a logo, the app shows a brand-coloured badge
with the provider's short code (e.g. "MAY").

## Download them automatically (needs internet)

    npm run logos

This fetches each provider's icon from its official website (domains are in
`scripts/provider-domains.json`), saves it here as `<id>.png`, and records it
in `src/lib/provider-logos.json`. Check the images, then commit and push.
Use `npm run logos -- --force` to download everything again.

## Add or replace one by hand

1. Save the image here named by the provider id from `src/lib/providers.ts`,
   e.g. `maybank.png` (PNG or WebP, square, at least 96×96).
2. Add it to `src/lib/provider-logos.json`, e.g. `"maybank": "/providers/maybank.png"`.

Logos are trademarks of their owners and are used here only to identify which
bank an account belongs to.
