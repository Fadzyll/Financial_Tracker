# Provider logos

Optional real logos for banks / providers. Without a file, the app shows a
brand-coloured badge with the provider's short code (e.g. "MAY").

To add a logo:
1. Save it here, named by the provider id from `src/lib/providers.ts`,
   e.g. `maybank.svg`. SVG is best (sharp, tiny); WebP or PNG also work.
   Use a square image, at least 96×96, with some padding.
2. In `src/lib/providers.ts`, add `logo: "/providers/maybank.svg"` to that
   provider's entry.
3. Commit and push. Vercel serves it from its CDN automatically.

Logos are trademarks of their owners. Only use files you are allowed to use
(e.g. from the provider's official press/media kit).
