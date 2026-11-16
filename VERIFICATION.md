# Local verification · November 16, 2026

- `npm run check`: passed TypeScript checks, production bundle generation, and all **15 integration tests** in the actual Cloudflare local runtime.
- Live profile: `rodrigodonini` returned Rodrigo Donini, membership date December 18th, 2013, and all eight current badges.
- Live SVG: HTTP 200, well-formed XML, 500 × 296 pixels, with a self-contained Gravatar image.
- Browser: successful card creation, Markdown retaining customization parameters, clipboard confirmation, JSON tab, and community list containing the requested profile.
- Responsive check: 390 px viewport, 390 px document width (no horizontal overflow), single-column studio, visible card and sharing controls.
- Local D1 migrations applied successfully. Live cached data exists under `.wrangler/state/`, excluded from the source archive.
- The preview server was stopped after verification. Start your own session with `npm run dev`.

The tests cover current and legacy profile markup, HTML entities, custom/unknown badges, correct card dimensions, visibility options, independent color variants, shared profile caching, refresh cooldown, timestamp preservation, upstream outage fallback, 404 behavior, invalid input, avatar host restrictions, community pagination, HTTP methods, and demo isolation.

Cloudflare resources, remote database migrations, DNS changes, and deployment were **not** performed. Cloudflare-hosted CPU usage and upstream access from its network remain future deployment checks. Local timing does not establish compliance with the Free plan's CPU limit.

## Branding and content update · November 16, 2026

- `npm run check` passed after the styling and GitHub import changes. The final `npm test` run passed all **20 tests**, including the supplied X posts.
- Replaced the generated monogram, serif headings, decorative numbering, and green palette with the supplied coffee-mug logo, its three sampled blues, black, and white. Removed the external font service.
- Imported all four contributors returned by GitHub, including an anonymous-inclusive paginated query; downloaded their public avatars locally.
- Imported all nine historical releases from GitHub's `changelog.md`, preserving every issue/pull request link, with the local 2.0.0 release above them.
- Updated the navigation label to “Change Log” and footer attribution to `https://donini.me/`.
- Verified the three user-supplied post URLs through X's official oEmbed endpoint. Saved plain-text fallbacks and ordered the official embeds newest first: May 4, 2026; February 23, 2026; September 1, 2025.
- Visually confirmed real X widgets loaded, including post media, without browser console errors.
- Confirmed successful live card creation after the style update.
- Checked the 390px mobile layout: document width was 390px, with no horizontal overflow. Reset the temporary viewport override afterward.
- Reused the user's existing local server; no remote resources or deployment changes were made.

## Git branch preparation · November 16, 2026

- Prepared `cloudflare-rebuild` from the latest upstream `main`.
- Preserved upstream release history in `changelog.md` and added the local-preview 2.0.0 entry.
- Added a regression test preventing a duplicated 2.0.0 website entry after a future GitHub content refresh.
- `npm run check` passed: TypeScript, build, and all **21 tests**.
- Reviewed staged files: local dependencies, generated build output, Wrangler state, and credential files are excluded.
