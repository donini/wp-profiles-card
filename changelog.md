# CardPress

### Changelog

**2.0.0** (11/16/2026) — Cloudflare rebuild

- Rebuilt with TypeScript, Cloudflare Workers, Static Assets, and D1.
- Preserved the card and JSON endpoints, query parameters, and JSON response fields.
- Replaced filesystem caching with D1 profile snapshots; card options render independently.
- Added validated inputs, escaped SVG text, embedded avatars, fallback icons, and upstream outage handling.
- Updated the card creator with accurate Markdown, JSON sharing, and SVG downloads.
- Updated the website using the CardPress logo and its blue, black, and white palette.
- Added GitHub contributor photos and credits, imported release history, and selected X post embeds.
- Added local development, offline demo mode, and Worker integration tests.
- Published on Cloudflare Workers with D1 at https://cardpress.cardpress-cloudflare.workers.dev. The existing custom domain remains unchanged.

**1.0.8** (8/27/2025)
- [FIX Added missing Core AI Contributor and Core AI Team badges](https://github.com/donini/wp-profiles-card/issues/23)

**1.0.7** (8/20/2025)
- [FIX Added missing Playground Contributor badge](https://github.com/donini/wp-profiles-card/issues/21)

**1.0.6** (6/18/2025)

- [NEW Profile Creator Wizard](https://github.com/donini/wp-profiles-card/issues/19)

**1.0.5** (6/10/2025)

- [NEW Add option to link the card to WordPress profile page](https://github.com/donini/wp-profiles-card/issues/11)
- [NEW Display or not profile avatar](https://github.com/donini/wp-profiles-card/issues/3)

**1.0.4** (6/5/2025)

- NEW Move static path for avatars
- NEW Store JSON data
- FIX Optimize SEO image

**1.0.3** (6/3/2025)

- FIX Missing badges and wrong style
- [NEW Profile API - JSON Data](https://github.com/donini/wp-profiles-card/issues/12)
- FIX JSON resulting in a CORS security error

**1.0.2** (6/2/2025)

- FIX WordCamp volunteer badge issue 
- FIX Card Sample image width issue in Readme

**1.0.1** (6/1/2025)

- [FIX Badge Icons Overlap with Circular Containers](https://github.com/donini/wp-profiles-card/pull/6)
- [NEW Add header toggle functionality](https://github.com/donini/wp-profiles-card/pull/8)
- [NEW Custom Text Color](https://github.com/donini/wp-profiles-card/issues/1)
- [NEW Custom Foreground Color](https://github.com/donini/wp-profiles-card/issues/2)

**1.0.0** (5/26/2025)
- First release - CardPress launch