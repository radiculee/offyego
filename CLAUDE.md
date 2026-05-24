@AGENTS.md

# Off Ye Go - Session Primer

## Read these in order before doing anything

1. **MASTER_PROMPT.md** - full spec. Brand rules, the three gates, the
   10-state machine, Overpass query, definition of done. If a decision
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

Three commits in. Driven from `git log --oneline` and the src tree.

| Phase | Status | What shipped |
|---|---|---|
| 0 | ✅ | `offyego.ie` registered, `offyego.com` defensive. GitHub repo exists (rename pending). Voice/challenge content drafted (60 strings/personality, 50 challenges) and now lives in `src/constants/`. |
| 1 | ✅ | Scaffold (Next 16 + React 19 + TS strict + Tailwind v4 + Vitest), `lib/geo.ts`, `lib/ireland-polygon.ts` (15-pt placeholder), three gates, 5-state `useReducer` machine, `Shell` 420px layout, three hooks, typed storage, prod-safe logger. 14/14 polygon tests pass. Build clean. |
| 2 | ⏭ | NEXT. Overpass integration + Roulette logic. See TIMELINE.md "Phase 2". |
| 3-6 | ⏭ | Not started. Component stubs exist for `Roulette`, `PubCard`, `PubMap`, `GuiltTripModal`, `PersonalityToggle`, `RadiusSlider`, `SpinButton`, and `lib/overpass.ts`. |

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
│   └── page.tsx                     ✅ useReducer machine, 5 Phase-1 states
├── components/
│   ├── gates/                       ✅ AgeGate, IrelandGate, LocationGate
│   ├── layout/                      ✅ Shell (420px column)
│   ├── map/PubMap.tsx               🟡 stub (Phase 3)
│   ├── modals/GuiltTripModal.tsx    🟡 stub (Phase 3)
│   ├── roulette/                    🟡 Roulette stub (Phase 2), PubCard stub (Phase 3)
│   └── ui/                          🟡 PersonalityToggle (Phase 4), RadiusSlider + SpinButton (Phase 2)
├── constants/
│   ├── challenges.ts                ✅ 50 challenges
│   ├── config.ts                    ✅ radius bounds, geolocation opts, Overpass URLs
│   ├── voices.grumpyBarman.ts       ✅ 60 strings + spinButton
│   ├── voices.localLad.ts           ✅ 60 strings + spinButton
│   └── voices.ts                    ✅ Record<Personality, Voice> index
├── hooks/
│   ├── useGeolocation.ts            ✅ Permissions API pre-check, 10s timeout, 60s maxAge
│   ├── usePersonality.ts            ✅ localStorage-backed
│   └── useSpinCount.ts              ✅ increment/reset + shouldShowGuiltTrip derived
├── lib/
│   ├── geo.ts                       ✅ haversineMeters, walkingMinutes (min 5), ROI_BBOX
│   ├── ireland-polygon.ts           ✅ 15-pt placeholder polygon (see Known Truths)
│   ├── ireland-polygon.test.ts      ✅ 14 tests
│   ├── logger.ts                    ✅ prod-safe console wrapper
│   ├── overpass.ts                  🟡 Phase 2
│   └── storage.ts                   ✅ typed `offyego:` localStorage wrapper, SSR-safe
└── types/pub.ts                     ✅ Pub, Personality, Voice
```

## Working agreements

- One logical change per commit. Conventional prefixes (`feat:`, `fix:`,
  `chore:`, `docs:`).
- `Co-Authored-By: Claude` trailer stays on commits for this project.
- TypeScript errors are blockers. Fix before moving on.
- Flag, don't decide. If the spec doesn't cover it, raise a numbered
  flag and wait for the Architect. Do not pick a "reasonable default"
  silently.
- Read before editing. Run the Read tool before Edit. Re-read after a
  meaningful edit; your in-context view goes stale.
- Test as you ship. New logic gets a test in the same session.

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
  `C:\Users\vedan\offyego` (close VS Code, rename, reopen).
- Rename GitHub repo `radiculee/Random-pub-finder-ireland` to `offyego`.
  Consider also renaming the GitHub username.
- After repo rename: `git remote set-url origin https://github.com/<owner>/offyego.git`
  then `git push -u origin main` (first push).
- Point `offyego.ie` DNS at Vercel (defer to Phase 6).

## Known truths worth remembering across sessions

- **Next.js 16.2.6**, **React 19.2.4**, **Tailwind v4**, **Turbopack**
  (Next 16 default for both `dev` and `build`; no scaffold opt-out).
  If anyone tells you Turbopack is opt-in or that React 19 doesn't work
  with X, verify against current docs, not training data.
- **`lucide-react ^1.16.0` IS the current lucide-icons package.** The
  0.x line was renamed to 1.x in March 2026. Do not "fix" this; do not
  downgrade.
- **The ROI polygon at `src/lib/ireland-polygon.ts` is a 15-point
  hand-drawn placeholder.** Marked with `// TODO: REPLACE WITH REAL
  POLYGON.` It correctly excludes Belfast/Derry/Newry and includes
  Dublin/Cork/Galway/Limerick/Waterford/Sligo/Letterkenny (14/14 tests
  pass), but the Donegal/NI border is rough. Real Natural Earth GeoJSON
  is an Architect task before Phase 6 launch.
- **User-facing strings live ONLY in `src/constants/voices.*.ts`.** If
  you see hardcoded English in a component, that is a bug.
- **No commits push yet.** Origin still points at the old repo name.

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
