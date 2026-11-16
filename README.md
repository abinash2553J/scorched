# Scorched

**Your YouTube likes, under review.** Scorched turns up to 200 of your liked videos into a shareable roast report, a 0–100 brainrot score, and a playful viewing-type label.

The rule behind every roast: **code computes the facts; Gemini writes the jokes.** Each burn must point to a computed number or a video title.

## What it does

- Sign in with Google and grant read-only access to your YouTube likes.
- Analyze up to 200 liked videos and calculate a deterministic brainrot score.
- Choose a gentle, medium, or savage roast.
- Stream the score first, then the evidence-backed report.
- Preview and export a square or story-shaped PNG card. The image is generated in your browser when you choose to export it.

## How scoring and roasting work

The score combines four code-computed signals:

| Signal | Weight | What it measures |
| --- | ---: | --- |
| Title patterns | 35% | Heuristic signals such as emoji, all-caps words, punctuation, and hashtags |
| Video categories | 25% | Share of selected YouTube categories among non-music likes |
| Repeat creators | 20% | Share of likes from the top three non-topic channels |
| Shorts proxy | 20% | Videos at most 180 seconds long or with `#shorts` in the title |

Each signal is normalized and weighted in code. These weights are uncalibrated heuristics, not scientific measurements; YouTube categories and duration are imperfect signals.

Gemini receives the computed stats and a sample of up to 40 video titles and channel names. Its output is validated, and every cited evidence ID must match a stat or title provided by the app. Gemini does not determine or change the score.

## Getting started

### Prerequisites

- Node.js and npm compatible with Next.js 16
- A Google Cloud project with the YouTube Data API v3 enabled
- A Google OAuth web client
- A Gemini API key

### Configure Google OAuth

1. In Google Cloud, enable **YouTube Data API v3** for your project.
2. Configure the OAuth consent screen. If the app is in testing mode, add your Google account as a test user.
3. Create an OAuth client ID for a **Web application**.
4. Add this authorized redirect URI for local development:

   ```text
   http://localhost:3000/api/auth/callback/google
   ```

For a deployed app, configure the corresponding callback URL for its domain too.

### Install and configure

```bash
npm install
```

Copy `.env.example` to `.env.local` (PowerShell: `Copy-Item .env.example .env.local`) and fill in the values:

| Variable | Description |
| --- | --- |
| `AUTH_SECRET` | Auth.js signing secret. Generate with `npx auth secret`. |
| `AUTH_GOOGLE_ID` | OAuth client ID from Google Cloud. |
| `AUTH_GOOGLE_SECRET` | OAuth client secret from Google Cloud. |
| `GEMINI_API_KEY` | API key used by the server to request roast text. |
| `GEMINI_MODEL` | Gemini model name; `.env.example` provides `gemini-3.5-flash-lite`. |

Keep `.env.local` private; never commit credentials or API keys.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with Google, choose a roast intensity, and generate your report.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Check TypeScript types |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |

Run `npm run build` before `npm run start`.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Landing page and signed-in report workspace |
| `/roast` | Redirects to `/` for older bookmarks |
| `/api/auth/*` | Auth.js Google sign-in and session handlers |
| `POST /api/roast` | Authenticated roast generation; streams progress and report events |
| `GET /api/debug/likes` | Development-only endpoint returning up to 50 liked-video records for the signed-in user |

The debug endpoint returns personal video metadata. It responds with 404 in production; do not expose it as a production feature.

## Project map

- [`src/auth.ts`](./src/auth.ts) — Google OAuth configuration and YouTube read-only scope.
- [`src/app/page.tsx`](./src/app/page.tsx) — Single-page landing and signed-in app.
- [`src/app/api/roast/route.ts`](./src/app/api/roast/route.ts) — Authenticated streaming endpoint.
- [`src/lib/youtube.ts`](./src/lib/youtube.ts) — YouTube API requests and liked-video normalization.
- [`src/lib/stats.ts`](./src/lib/stats.ts) — Deterministic stats and score.
- [`src/lib/gemini.ts`](./src/lib/gemini.ts) — Evidence construction and Gemini roast generation.
- [`src/lib/schema.ts`](./src/lib/schema.ts) — Zod validation for video data, stats, and roast output.
- [`src/app/scorched-brand.tsx`](./src/app/scorched-brand.tsx) — Shared Scorched wordmark.

## Data and privacy

Scorched requests the `youtube.readonly` permission and does not change your YouTube account. The app does not persist liked-video data or reports. To generate a roast, it sends computed stats and up to 40 sampled video titles and channel names to Gemini. Consider this data flow when choosing whether to connect an account.

The report is kept in page state and is not saved by Scorched; sharing or exporting happens only when you choose it. Exported PNGs are rendered in the browser, and Scorched does not create a public link or archive.
