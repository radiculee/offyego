@AGENTS.md

# Off Ye Go - Session Primer

## Read these in order before doing anything

1. **MASTER_PROMPT.md** - full spec. Brand rules, the three gates, the
   11-state machine, Overpass query, definition of done. If a decision
   isn't in here, stop and ask.
2. **TIMELINE.md** - phased plan (0 through 6), Architect vs Builder
   split, per-phase done criteria.
3. **AGENTS.md** - auto-imported above. Covers Next.js version notes
   (this is Next 16, not the Next.js your training data knows).

## What this is

Off Ye Go is a sarcastic pub-randomiser for the Republic of Ireland.
Sole developer is Vedant, based in Dublin; he is the Architect on this
project. You (Claude Code) are the senior full-stack engineer; you
write the code, he drives the agenda.

## Current state

Driven from `git log --oneline` and the src tree.

| Phase | Status | What shipped |
|---|---|---|
| 0 | ✅ | `offyego.ie` registered, `offyego.com` defensive. GitHub repo exists (rename pending). Voice/challenge content drafted (60 strings/personality) and lives in `src/constants/`. |
| 1 | ✅ | Scaffold (Next 16 + React 19 + TS strict + Tailwind v4 + Vitest), `lib/geo.ts`, `lib/ireland-polygon.ts` (15-pt placeholder), three gates, 5-state `useReducer` machine, `Shell` 420px layout, three hooks, typed storage, prod-safe logger. 14/14 polygon tests pass. |
| 2 | ✅ | Overpass integration, Roulette animation, RadiusSlider, SpinButton, extended state machine. 24/24 tests pass. Deployed to Vercel. (Live Overpass was later removed; see Known Truths.) |
| 3 | ✅ | PubCard, GuiltTripModal, PubMap (Leaflet SSR-safe), Spin Again, Get Directions. Full flow verified on desktop browser in Dublin. |
| 4 Part 1 | ✅ | Voice files pasted, PersonalityToggle, usePersonality hook, all hardcoded strings removed. |
| 4 Part 2a | ✅ | Theme-neutral layout + typography foundation, CSS variable system, hydration-safe personality switching, voice routing audit. Build clean. |
| 4 Part 2 Prep | ✅ | Challenge prefix dropped, pool pruned to 41, Mapbox dark-v11 tiles, Mapbox Directions for walking time (FETCHING_WALKING_TIME state added). 33/33 tests pass. |
| 4 Part 2b | ⏭ | NEXT. Palette trial commits (four trials on branches, final pick cherry-picked into main). |
| 5-6 | ⏭ | Not started. |

## Non-negotiable rules (summary; full version in MASTER_PROMPT.md §2)

- Republic of Ireland only. Northern Ireland is excluded by design.
- Two personalities (Grumpy Barman, Local Lad), two themes, coupled.
- No emoji in user-facing copy. No em-dashes in user-facing copy.
- Mobile-first, 420px max-width centred column. No separate desktop.
- TypeScript strict. No `any` - use `unknown` and narrow.
- No new dependencies without asking the Architect first.
- All user-facing strings come from `src/constants/voices.*.ts`. Never
  hardcoded inline in a component. Grep for English in components
  should return nothing user-facing.

## Where things live

```text
src/
├── app/
│   ├── favicon.ico                  (scaffold default)
│   ├── globals.css                  🟡 scaffold default; brand theme is Phase 4
│   ├── layout.tsx                   ✅ Off Ye Go metadata, lang="en-IE"
│   ├── not-found.tsx                ✅ minimal sarcastic 404
│   └── page.tsx                     ✅ useReducer machine, 11-state machine (adds FETCHING_WALKING_TIME)
├── components/
│   ├── gates/                       ✅ AgeGate, IrelandGate, LocationGate
│   ├── layout/                      ✅ Shell (420px column)
│   ├── map/PubMap.tsx               ✅ Mapbox dark-v11 tiles via react-leaflet TileLayer
│   ├── modals/GuiltTripModal.tsx    ✅ fires at spin 5
│   ├── roulette/                    ✅ Roulette (animation + reduced-motion), PubCard
│   └── ui/                          ✅ RadiusSlider, SpinButton. 🟡 PersonalityToggle (Phase 4)
├── constants/
│   ├── challenges.ts                ✅ 41 challenges (pruned from 51)
│   ├── config.ts                    ✅ radius bounds, geolocation opts, pub cap
│   ├── voices.grumpyBarman.ts       ✅ 60 strings + spinButton
│   ├── voices.localLad.ts           ✅ 60 strings + spinButton
│   └── voices.ts                    ✅ Record<Personality, Voice> index
├── hooks/
│   ├── useGeolocation.ts            ✅ Permissions API pre-check, 10s timeout, 60s maxAge
│   ├── usePersonality.ts            ✅ localStorage-backed
│   └── useSpinCount.ts              ✅ increment/reset + shouldShowGuiltTrip derived
├── data/pubs.json                   ✅ GENERATED. 5,232 ROI pubs, ~100 KB gzipped.
│                                       Never hand-edit; see Known Truths.
├── lib/
│   ├── geo.ts                       ✅ haversineMeters, walkingMinutes (min 5), ROI_BBOX
│   ├── ireland-polygon.ts           ✅ real Natural Earth MultiPolygon, 2,394 pts
│   ├── ireland-polygon.test.ts      ✅ 14 tests
│   ├── logger.ts                    ✅ prod-safe console wrapper
│   ├── directions.ts                ✅ Mapbox Directions API wrapper (walking profile, 2500ms timeout)
│   ├── directions.test.ts           ✅ 9 tests (success, each failure mode)
│   ├── pub-dataset.ts               ✅ findPubsWithin + prefetchPubDataset. Local
│   │                                   radius filter over data/pubs.json. No network.
│   ├── pub-dataset.test.ts          ✅ 16 tests (dataset integrity + radius filter)
│   └── storage.ts                   ✅ typed `offyego:` localStorage wrapper, SSR-safe
└── types/pub.ts                     ✅ Pub, Personality, Voice

scripts/
└── build-pub-dataset.mjs            ✅ regenerates src/data/pubs.json from Overpass

.github/workflows/
└── refresh-pub-data.yml             ✅ monthly cron, opens a PR when the data moves
```

There is no `src/app/api/` directory. The app makes no server calls of its own.

## Working agreements

- One logical change per commit. Conventional prefixes (`feat:`, `fix:`,
  `chore:`, `docs:`).
- `Co-Authored-By: Claude` trailer stays on ALL commits for this project.
  This is a per-project decision; do not omit it.
- TypeScript errors are blockers. Fix before moving on.
- Flag, don't decide. If the spec doesn't cover it, raise a numbered
  flag and wait for the Architect. Do not pick a "reasonable default"
  silently.
- Read before editing. Run the Read tool before Edit. Re-read after a
  meaningful edit; your in-context view goes stale.
- Test as you ship. New logic gets a test in the same session.
- For any commit that touches user-visible behaviour, Playwright headless
  verification is the standard. CLI build + test alone is insufficient
  for components, gates, interaction logic, or visual rendering. The
  pattern is: code-verify with `tsc + npm test`, then drive the actual
  app with Playwright to confirm the user-facing behaviour.
- Never paste secrets, tokens, API keys, or `.env` file contents in chat
  or commit. Screenshots of secret-management pages also count as leaks.
  If a secret is potentially exposed, rotate immediately.
- When asked for a status report or audit, the agent stays strictly
  within agreed scope. Recommendations must be tied to v1 launch
  readiness, ranked, and bounded. The agent does not propose
  v2-deferred ideas (see the v2-deferred section) as next steps.
- Sentry is integrated as of commit 44aaa20. The end-to-end smoke
  test (deploy, trigger error, confirm in dashboard) is deferred to
  post-launch. Until verified, assume Sentry MAY OR MAY NOT be
  capturing errors in production. Treat this as a known unknown.

## How to start a phase

1. Re-read the phase section in TIMELINE.md and the matching MASTER_PROMPT.md
   sections.
2. List the files you will create or modify, in order.
3. List the open flags or ambiguities. Wait for the Architect's resolution
   before coding.
4. Build incrementally. Run `npm run build` and `npm test` after each
   meaningful chunk.
5. End of phase: summarise what shipped, what passes, what flags surfaced,
   what remains for the Architect before the next phase starts.

## Pending manual steps (Architect-only, blocking nothing in code)

- Rename local folder `C:\Users\vedan\Random-pub-finder-ireland` to
  `C:\Users\vedan\offyego` (close VS Code, rename, reopen). The GitHub
  repo rename is already done; only the local folder still has the old
  name.
- Install the GitHub CLI (`winget install GitHub.cli`). Without it an
  agent cannot open or merge PRs, only push branches.
- Fix `isInIreland()` coastal gating (see Known Truths). This one is a
  live user-facing bug, not housekeeping.

Done: GitHub repo renamed to `radiculee/offyego`, Vercel reconnected,
`offyego.ie` DNS cut over in `5fbc530`.

## Known truths worth remembering across sessions

- **Next.js 16.2.6**, **React 19.2.4**, **Tailwind v4**, **Turbopack**
  (Next 16 default for both `dev` and `build`; no scaffold opt-out).
  If anyone tells you Turbopack is opt-in or that React 19 doesn't work
  with X, verify against current docs, not training data.
- **`lucide-react ^1.16.0` IS the current lucide-icons package.** The
  0.x line was renamed to 1.x in March 2026. Do not "fix" this; do not
  downgrade.
- **The ROI polygon at `src/lib/ireland-polygon.ts` is the real Natural
  Earth 1:10m MultiPolygon** (7 polygons, 2,394 coordinate pairs),
  generated by `scripts/extract-ireland-polygon.mjs`. This note
  previously claimed it was a 15-point hand-drawn placeholder; that was
  stale and cost a session's worth of wrong assumptions. Read the file
  header before trusting any description of it.
- **OPEN BUG: `isInIreland()` rejects coastal users.** Natural Earth
  1:10m has a coarse coastline and omits small islands, so 192 of the
  5,232 real ROI pubs (3.7%) fall outside it: Cobh, Kinsale, Dingle,
  Howth, Skerries, Malahide, Cape Clear, the Aran Islands, Blackrock
  (Louth). Those are inhabited places, so the same polygon that excludes
  the pub excludes the user standing next to it, gating them to
  `OUT_OF_IRELAND`. Measured 2026-08-03, not yet fixed. The fix is a
  better polygon source, NOT filtering those pubs out of the dataset and
  NOT loosening the gate: OSM's `area["ISO3166-1"="IE"][admin_level=2]`
  is the better authority and was verified clean on Northern Ireland (of
  654 pub entries inside the UK boundary within the ROI bounding box,
  zero appear in our dataset). `src/lib/pub-dataset.test.ts` therefore
  asserts only that >95% of rows sit inside the polygon.
- **User-facing strings live ONLY in `src/constants/voices.*.ts`.** If
  you see hardcoded English in a component, that is a bug.
- **The repo rename is DONE.** Origin is `radiculee/offyego`. DNS cutover
  to `offyego.ie` shipped in `5fbc530`. The site is live on the real
  domain, so pushes to `main` deploy to production, not to a preview.
- **`vercel.json` exists at repo root** to force Next.js framework
  detection. It worked around stale project settings during Phase 2
  deployment. Check this file before changing Vercel configuration.
- **Pubs come from a build-time dataset. There is NO live Overpass call.**
  `src/data/pubs.json` holds all 5,232 ROI pubs (246 KB raw, ~100 KB
  gzipped, next to a 412 KB spin GIF we already ship). `lib/pub-dataset.ts`
  filters it locally by haversine; a spin touches no server. Do not
  reintroduce a runtime Overpass call, and do not add an API route for
  this. Why it went: Overpass enforces a per-IP slot quota
  (`overpass-api.de/api/status` reports `Rate limit: 2`) and Vercel
  serverless shares outbound IPs across customers, so we exhausted it far
  faster than our traffic implied and roughly a third of spins died at the
  abort with "The map server's down". Timeout tuning cannot fix that;
  serverless duration caps and mobile timeouts both impose a ceiling.
- **Regenerating the dataset:** `node scripts/build-pub-dataset.mjs`,
  or the monthly `refresh-pub-data.yml` workflow which opens a PR. The
  script refuses to write data that is below a row-count floor, more than
  5% smaller than the committed file, or **older** than it. That last
  guard is not theoretical: `kumi.systems` served a two-month-old snapshot
  during development, so the primary mirror is exhausted with patient
  retries before any fallback is tried. Never hand-edit `pubs.json`.
- **Never add a regional Overpass mirror.** `overpass.osm.ch` was trialled
  and rejected: it answers a Dublin query in 0.16s with `elements: []`
  because it only holds Swiss extracts. Fast and empty, it would win any
  race and silently ship a gutted dataset. Only full-planet mirrors qualify.
- **Query pubs with `nwr`, never `node`.** The original query asked for
  nodes only and so never saw the 1,739 ways and 14 relations mapped as
  building polygons: a third of Irish pubs were invisible. `nwr` with
  `out center` is what takes 3,479 rows to 5,232.
- **`MAX_PUBS_IN_MEMORY` is a random sample, not a truncation.** It used
  to be `slice(0, 50)` over id-ordered Overpass output, which quietly
  biased every spin in a dense area toward the oldest-mapped pubs. It is
  now a partial Fisher-Yates sample so any pub in range can come up. Do
  not "simplify" it back to a slice; that breaks the random-spin promise.
- **Real-device QA passed** on desktop browser (Dublin) during Phase 2.
  Full golden path verified: age gate → location → Ireland check →
  radius slider → spin → Roulette → result (The Oarsman, 9 min walk).
- **`NO_PUBS_FOUND` uses a `messageIndex`-stabilised pattern.** Index is
  computed once at state transition (in the fetch effect before
  dispatch), stored in state, and read at render time. Phase 4 will
  introduce `useVoiceMessage()` to generalise this; the two
  `pickRandom` inline duplications at `page.tsx` and `Roulette.tsx`
  are marked `// TODO(phase-4)`.
- **Mapbox tiles + Directions.** We use Mapbox dark-v11 raster tiles
  (NOT Mapbox GL JS) via `react-leaflet` TileLayer. Walking time comes
  from Mapbox Directions API (walking profile), called once per spin on
  the final selected pub. Token in `NEXT_PUBLIC_MAPBOX_TOKEN`. Free tier
  covers v1 traffic. Do not downgrade to OSM tiles; the Mapbox decision
  is final for v1.
- **Haversine is the fallback, not the primary.** `lib/geo.ts`
  `walkingMinutes()` is still used for: (a) the initial estimate on every
  pub returned from the dataset, and (b) the tilde fallback when
  Directions times out or errors. The tilde ("~X min walk") signals to the
  user that the time is an estimate. Never remove the haversine fallback
  path: it is what lets a spin still produce a result when Mapbox is
  unreachable, verified under `context.setOffline(true)`.
- **Spin animation GIF carries the Guinness harp trademark.** The asset
  at `public/spin/stout-pour.gif` contains the Guinness harp. Decision
  made on 2026-06-09 by the architect to accept this risk for v1 launch.
  The asset is swappable: the file path is referenced as a single
  constant (`GIF_SRC`) in `src/components/roulette/Roulette.tsx`, so a
  generic stout-pour alternative can be substituted with a single file
  replacement and one constant update if Diageo flags it or before
  scaling beyond a hobby or portfolio audience.

## v2-deferred ideas (do NOT propose for v1)

These ideas have been considered and explicitly deferred to v2 by the
architect. Do not propose them as Phase 5 or Phase 6 work, even when
asked open-ended questions like "what should we do next?":

- Time-of-day theming (replacing personality switching with a
  clock-driven theme)
- ErrorBoundary component wrapping the app (Sentry already handles
  error reporting; ErrorBoundary is UX polish for post-launch)
- Haptic feedback via navigator.vibrate (Android-only, fragments
  user experience across platforms)
- Lazy-load Leaflet only after first spin (Lighthouse 99 means
  there is nothing to optimise; premature optimisation)
- Underdog-pub claims / pub-side editorial weighting (would violate
  the random-spin brand promise)
- Walk-time-based spin filter (slider currently labels in walk-time
  but operates on radius internally; converting the operation itself
  to walk-time requires per-pub Directions calls and is v2 work)

## Project state milestones (rolling)

Most recent first.

- 2026-08-03: Post-launch reliability fix. Production was failing
  roughly a third of spins with "The map server's down"; the cause was
  Overpass's per-IP slot quota amplified by Vercel's shared outbound
  IPs, not an outage. Shipped a hotfix, then removed live Overpass
  entirely in favour of a build-time dataset. Fixed two data bugs found
  on the way: `node`-only querying hid a third of Irish pubs, and the
  50-pub cap was an id-ordered truncation that biased every spin.
  Tests 54/54, lint clean, Playwright 5/5 online and 5/5 offline.
  Found and documented an unrelated open bug: `isInIreland()` gates out
  coastal users (see Known Truths).
- 2026-06-02: Phase 5 builder work complete (10 commits, ending at
  6d17ea4). Tests 43/43, lint 0/0, Lighthouse mobile 99/98/100/100
  on commit 6d17ea4. Sentry integrated but end-to-end smoke test
  deferred to post-launch. Architect verifications remaining:
  Android device test.

## What NOT to do

- Do not pre-emptively scan the repo or suggest refactors when the
  Architect hasn't asked. He drives the agenda.
- Do not start a phase without being told to.
- Do not add dependencies without explicit approval.
- Do not assume the previous session's end-of-turn summary is accurate.
  Read the disk.
- Do not write user-facing strings inline. They come from
  `voices.*.ts` only.
- Do not write CLAUDE.md, MASTER_PROMPT.md, or TIMELINE.md without
  being asked.
