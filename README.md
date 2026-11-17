# CardPress · Cloudflare edition

CardPress rebuilt for Cloudflare Workers, Static Assets, and D1. The previous Express application remains available in Git history. Published on Cloudflare Workers at https://cardpress.us, also available at https://www.cardpress.us. The Cloudflare-provided address remains available at https://cardpress.cardpress-cloudflare.workers.dev.

## Test locally

Requirements: Node.js 22.12+ (Node 24 recommended), npm, and an Internet connection for live WordPress.org profiles. A Cloudflare login, API token, or paid plan is **not** needed.

From this folder:

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:8787**. The dev command applies migrations to a local SQLite database, then starts the Worker using Cloudflare's actual local runtime. Data stays under `.wrangler/state/`; it persists across restarts. Live mode requests public WordPress.org profiles and their Gravatar images over the Internet.

For an offline sample-data session, stop the server with Ctrl+C and run:

```sh
npm run dev:demo
```

Demo mode accepts any valid username, displays **DEMO · SAMPLE DATA**, uses a fictional contributor, and never saves sample profiles to D1. The backend makes no external profile requests. The interface uses locally available fonts; it does not load a web font service.

Only run one development server at a time; both commands use port 8787. Stop it with Ctrl+C.

If npm reports a root-owned system cache, use `npm ci --cache .npm-cache` and add `.npm-cache/` to your local ignore list. Do not change system directory ownership just to run this application.

## Local acceptance checklist

1. Create a card for `rodrigodonini` or another public WordPress.org username.
2. Change colors, regenerate, and confirm the preview changes.
3. Toggle the avatar, header, and badges; test each combination.
4. Copy Image URL and Markdown. Verify the Markdown retains your settings.
5. Download SVG and open it independently; the avatar is embedded.
6. View JSON and compare it with `/json?username=rodrigodonini`.
7. Visit `/users`, then restart the server: the discovered profiles should remain.
8. Enter an unknown username to check the error state.
9. Use demo mode to exercise the studio without upstream services.

Copying a localhost link to GitHub will not make the image publicly accessible. Test the URL locally; public embeds will work after a future deployment.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local Worker + local D1, using real profiles |
| `npm run dev:demo` | Local Worker + explicit sample data |
| `npm run db:local` | Apply database migrations locally only |
| `npm run db:remote` | Apply migrations to the configured Cloudflare D1 database |
| `npm run deploy` | Build and publish to the configured Cloudflare account |
| `npm run typecheck` | Check TypeScript |
| `npm test` | Build and run integration tests in the Cloudflare runtime |
| `npm run check` | Typecheck, build, and integration tests |
| `npm run build` | Generate static pages and bundle the Worker; no deployment |
| `node scripts/pages.mjs` | Regenerate HTML after editing the page templates |

The dev server watches Worker and static asset changes. If you change `scripts/pages.mjs`, regenerate pages to see those changes.

## Architecture

- `src/worker.ts`: HTTP routing, API responses, status codes, and CORS.
- `src/profile.ts`: bounded upstream fetching, native HTMLRewriter parsing, Gravatar embedding, D1 cache, refresh cooldown, outage fallback.
- `src/card.ts`: synchronous SVG rendering, correct dimensions, escaped text, fallback badge icons.
- `src/options.ts`: username, color, and boolean validation.
- `src/icons.ts` / `src/badge-styles.ts`: original CardPress badge artwork and colors, bundled into the Worker.
- `public/static/app.js` / `app.css`: responsive studio, preview, share tabs, clipboard, download, and community pagination. No frontend framework. The official X embed script is loaded only on pages containing selected X posts.
- `scripts/pages.mjs`: shared layout and static page templates.
- `scripts/content.mjs`: safe rendering for upstream release notes, GitHub contributor credits, and optional X post embeds.
- `content/github.json`: checked-in GitHub contributor and changelog snapshot. Contributor photos are stored locally in `public/static/contributors/`.
- `content/posts.json`: selected public X post URLs; no X credentials are stored.
- `migrations/`: versioned D1 schema.
- `tests/`: integration tests using isolated in-memory D1, actual HTMLRewriter, and mocked external responses. Test-only controls never enter the production bundle.
- `wrangler.jsonc`: Worker, asset routing, bindings, and local configuration.

Static pages/assets bypass Worker execution. Only `/card`, `/json`, `/api/*`, and `/health` invoke the Worker. Backend dependencies are limited to an HTML entity decoder. There is no Express, EJS, Cheerio, native canvas, Puppeteer, runtime filesystem access, or separate API server.

## Routes and compatibility

| Route | Result |
| --- | --- |
| `/`, `/create` | Card studio |
| `/docs` | Embed and API guide |
| `/changelog` | Rebuild changes; original history is in `LEGACY_CHANGELOG.md` |
| `/users` | Discovered profiles from this installation |
| `/card?username=…` | SVG image |
| `/json?username=…` | Original JSON response schema |
| `/api/users?page=1` | Paginated community data, 24 profiles per page |
| `/health` | Database readiness and live/demo mode |

The original query parameters are supported: `username`, `badges`, `header`, `avatar`, `link`, `refresh`, `headerColor`, `nameColor`, `subHeaderColor`, `badgeLabelColor`, `foreground`. Boolean values must be `true` or `false`. Colors must be six-digit hex strings, optionally prefixed with a URL-encoded `#`. Default settings match the original API. The creator opts into profile links as the original creator did.

The JSON fields remain `userName`, `name`, `avatar`, `memberSince`, and `badges` (`class` and `name`). Missing/invalid input returns 400, unknown profiles 404, upstream failures 502, unsupported methods 405. Card errors are SVGs with the relevant HTTP error status; JSON errors use `{ "error": "…" }`. CORS is public for these read-only endpoints.

Legacy dynamic `/card` and `/json` links can retain the same paths after the domain is moved. Old `/static/avatar/.../card.svg` and `.json` files are not imported; use the dynamic endpoints. Original generated files and their first-seen dates are not present in the supplied project, so the new community list starts fresh. A data import can be added later if those files are available.

## Cache and free-tier behavior

Profile data and the embedded avatar are stored once per username in D1. Cards render from that snapshot for each requested style, avoiding the old single-SVG-per-user cache bug. Profiles expire after 24 hours (`PROFILE_TTL_SECONDS`). `refresh=true` bypasses that TTL with a 60-second cooldown. Refresh is not copied into permanent embed links.

Successful responses permit five minutes of client caching. Refresh and stale responses use `no-store`. Upstream failures can reuse a previously cached profile, identified by `X-CardPress-Cache: stale`. A real upstream 404 still returns 404. `X-CardPress-Fetched-At` reports the snapshot time. The cooldown applies to saved snapshots; simultaneous first requests can still perform duplicate upstream fetches.

D1 is used rather than per-request KV writes, keeping the community list durable without consuming KV's small free daily write allowance. There is no request-by-request activity tracking. The community page lists successfully requested public profiles, as the original app did; visitor IPs and request history are not stored by the application. Original Google Analytics IDs/secrets have not been copied. Cloudflare observability is configured separately and Wrangler itself has its own telemetry controls.

Local runtime timings do **not** certify Cloudflare Free's 10 ms CPU allowance. Cold profile extraction and hot SVG rendering should be measured on Cloudflare before public migration. Scraping remains dependent on the WordPress.org page structure and on access from Cloudflare's network. Upstream request limits, public refresh abuse, and any stronger rate limits should be assessed against actual traffic before launch.

## Website content and branding

The supplied CardPress coffee-mug icon is used in the header, home page, preview, and footer. The website palette is sampled from that logo: `#0973B3`, `#065B96`, `#03457A`, `#000000`, and `#FFFFFF`. The background stays light and typography uses locally available sans-serif fonts. Card API defaults remain compatible with the original project.

GitHub contributors and historical release notes are saved as static content so viewing the site does not consume GitHub API calls or Worker CPU. The contributor sync follows all pagination pages and includes anonymous contributors when reported by GitHub, omitting email addresses. It credits repository contributors across the whole repository, without the date filter in the supplied graph URL.

To refresh the GitHub snapshot and photos:

```sh
npm run sync:github
npm run build
```

This is a local read from public GitHub data; it does not change the repository or deploy the website. Normal builds and local development work offline using the saved snapshot.

The Change Log page renders every release in the upstream `changelog.md`, retaining issue and pull request links. The local 2.0.0 entry stays above the upstream history. Update that new-version entry in `scripts/pages.mjs`.

The footer-area X section replaces the former “Part of something bigger” section. It embeds the three post URLs supplied by Rodrigo, ordered newest first. Plain-text fallbacks are verified through X’s official oEmbed endpoint and saved locally, so the posts remain readable if the widget is blocked. The section also links to an X search for the project hashtags. X’s official widget cannot automatically discover or filter future posts; this is a curated selection, not a live filtered feed.

To update the featured posts, add public URLs from `@donini` to `content/posts.json`:

```json
{
  "author": "donini",
  "hashtags": ["CardPress", "WordPress"],
  "match": "both",
  "posts": ["https://x.com/donini/status/ACTUAL_POST_ID"]
}
```

Use actual numeric post IDs. The renderer validates the author and domain, sorts by post ID (newest first), and embeds up to three posts with X's official widget. Set `match` to `either` to adjust the fallback search link. Selected URLs must be checked for the intended hashtags; the widget cannot discover or filter future posts automatically. Run `npm run sync:posts` to refresh the official fallback text, then `npm run build`. Selected rich embeds require access to X to load; saved text and post links remain visible without its script. Nothing requires an X API token.

## Cloudflare deployment

Primary address: **https://cardpress.us**

Also served by the same Worker: https://www.cardpress.us and https://cardpress.cardpress-cloudflare.workers.dev.

The Worker is named `cardpress`. `wrangler.jsonc` includes the Cloudflare account ID, D1 database ID, and enabled `workers.dev` route. These IDs identify resources; they are not credentials. OAuth credentials remain in Wrangler’s user configuration and must not be committed.

To publish subsequent updates to the same account:

```sh
npx wrangler login
npm ci
npm run check
npm run db:remote
npm run deploy
```

Only run the remote migration command when applying new database migrations. `npm run dev`, `npm run dev:demo`, and `npm run db:local` continue to use local resources; the explicit `--local` flags prevent changes to the hosted database.

The initial deployment uses `DEMO_MODE=false` and the configured 24-hour profile cache. GitHub and X content snapshots remain static; use their sync commands before building when you want to refresh them. No GitHub-to-Cloudflare continuous deployment is configured by this repository.

The `cardpress.us` and `www.cardpress.us` custom domains are declared in `wrangler.jsonc`. Cloudflare manages their Worker DNS records and HTTPS certificates. Both hostnames serve the same application and D1 profile cache, and the creator generates embed links from the hostname being used. Deployments to another account require a D1 database in that account, the relevant Cloudflare zone, and updated IDs in `wrangler.jsonc`.

## Attribution

CardPress was created by Rodrigo Donini. This rebuild preserves the original badge SVG assets, badge color rules, project attribution, source link, and support link. The original package declared ISC licensing. WordPress and Gravatar remain their respective owners' trademarks/services.

References: [Workers local development](https://developers.cloudflare.com/workers/local-development/), [D1 local development](https://developers.cloudflare.com/d1/best-practices/local-development/), [Workers static assets](https://developers.cloudflare.com/workers/static-assets/).
