# Off Ye Go - Build Timeline

> Solo developer with AI pair-programmers. You are the Architect. Claude Code is the Builder. This timeline assumes ~2 hours of focused work per evening, weekdays, with longer weekend sessions. Total target: **ship to production in 10 working days.**

---

## Role Definitions

**You (the Architect)** - own decisions, set direction, write specs, verify behaviour, manage infrastructure (domain, Vercel, GitHub, Revolut). You write very little production code yourself. You write copy, you make design calls, you test on real devices.

**Claude Code (the Builder)** - writes the React/TypeScript code, sets up the Next.js scaffold, implements components and hooks, fixes bugs you flag. Operates from `MASTER_PROMPT.md`. Asks you when a decision isn't in the spec.

**The Builder does not:** decide brand voice, pick the personality copy, choose challenges, sign up for services, push to production. Those are yours.

---

## Phase 0 - Pre-Build (Day 1, ~1 hour)

Everything that must exist before any code is written.

### Architect tasks (you)

- [ ] Check `offyego.ie` availability at `https://www.weare.ie` or `https://blacknight.com`
- [ ] If available, register it. Budget €15–25/year. You'll need to verify Irish connection (passport or utility bill)
- [ ] If unavailable, register `offyego.com` instead (no verification, ~€25/year)
- [ ] Create GitHub repo: `vedantgaikwad/offyego` (or similar). Public. MIT licence template.
- [ ] Create Vercel account if you don't have one. Connect to the repo (don't deploy yet)
- [ ] Confirm Revolut.me username is set and shareable: `https://revolut.me/YOURNAME`
- [ ] Commit `MASTER_PROMPT.md` and `TIMELINE.md` to repo root
- [ ] Decide on personality copy: write 10 variants for each personality, each category (loading, no-pubs, result-intro, guilt-trip, out-of-ireland, location-denied). This is the single highest-leverage thing only you can do well. **About 120 strings total.** Do this in a Google Doc, paste into the codebase later.

### Builder tasks (Claude Code)

- Nothing yet. Don't let it start coding until Phase 0 is complete.

### Phase 0 done when

- Domain registered, repo created, Vercel linked, all copy drafted in a doc.

---

## Phase 1 - Scaffold & Core Logic (Days 2–3, ~4 hours)

The skeleton. No styling yet, no roulette, no personality - just the state machine and the gates working.

### Architect tasks

- [ ] In the repo, run `npx create-next-app@latest .` (TypeScript ✓, ESLint ✓, Tailwind ✓, App Router ✓, no src/ - actually yes use src/, no Turbopack)
- [ ] Open `MASTER_PROMPT.md` in your editor alongside Claude Code
- [ ] Brief Claude Code: *"Read MASTER_PROMPT.md in full. We're starting Phase 1: scaffold the folder structure exactly as specified in section 4, create stub files (empty exports), and implement `lib/geo.ts` and `lib/ireland-polygon.ts` with the bounding box + polygon point-in-polygon check. Install `@turf/boolean-point-in-polygon` and `@turf/helpers`. Don't build any UI yet."*
- [ ] Source the ROI polygon: download from Natural Earth (`https://www.naturalearthdata.com/downloads/10m-cultural-vectors/`) or use the OSM Boundary endpoint. Simplify to ~50–100 points using `https://mapshaper.org` (drag-drop, set simplification to ~98%, export GeoJSON). Hand the JSON to Claude Code to embed in `ireland-polygon.ts`
- [ ] Verify the polygon: ask Claude Code to write a quick test - points in Dublin, Cork, Galway should return true; Belfast, London, Paris should return false. Run it. Eyeball it.

### Builder tasks

- Scaffold folder structure per spec section 4
- Install dependencies: `leaflet`, `react-leaflet`, `leaflet-defaulticon-compatibility`, `@turf/boolean-point-in-polygon`, `@turf/helpers`, `lucide-react`
- Implement `lib/geo.ts`: haversine, walking time, bounds check
- Implement `lib/ireland-polygon.ts`: polygon constant + check function
- Implement `lib/storage.ts`: typed localStorage wrapper
- Write the polygon test suite, run it
- Set up `useReducer` in `app/page.tsx` for the state machine (see spec section 4)
- Implement the three gate components as **placeholder** UI (just text, no styling)
- Implement `hooks/useGeolocation.ts`
- Wire it all up: refresh page → age gate → click → location gate → on success → ROI check → on success → "READY (placeholder)" text

### Phase 1 done when

- You can load the dev server, accept the age gate, grant location, and see "READY" if you're in Dublin
- You can spoof your location in Chrome DevTools to a London coordinate and see the out-of-Ireland gate
- You can spoof to Belfast and correctly see the out-of-Ireland gate (this is the polygon test passing)

---

## Phase 2 - Overpass & Roulette Logic (Day 4, ~2 hours)

The "find pubs and spin" engine, still no styling.

### Architect tasks

- [ ] Brief Claude Code: *"Phase 2. Implement `lib/overpass.ts` per spec section 12, and `components/roulette/Roulette.tsx` per section 7.2. The roulette is just a div that cycles through pub names rapidly - no animation polish yet, just the logic. Wire it into `page.tsx` so I can click a placeholder spin button and see it work."*
- [ ] Watch Claude Code work. Verify the Overpass query matches spec exactly (both `amenity=pub` and `amenity=bar`)
- [ ] Test it: from your Dublin location, set radius to 1km, click spin. Should see pub names cycling and one final pick logged
- [ ] Test edge cases: set radius low enough to get 0 pubs (try going to a rural coordinate via DevTools), confirm the no-pubs state triggers
- [ ] Decide: pick the final list of 40–60 challenges. Write them in a Google Doc. **Only you can do this - Claude Code will write generic ones.**

### Builder tasks

- Implement Overpass fetch with the fallback mirror retry
- Parse Overpass response into `Pub[]` type (handle missing `name` tag → fallback string)
- Implement Roulette component (basic - full polish later): cycles names every ~80ms for ~2 seconds, decelerates over the last 500ms, settles
- Respect `prefers-reduced-motion`: skip animation, just show result immediately
- Implement `useSpinCount` hook with localStorage persistence
- Wire the no-pubs-found state path

### Phase 2 done when

- Spin button (unstyled) triggers a real Overpass fetch
- Roulette cycles pub names and lands on one
- Zero-pubs state shows correctly
- Spin count increments and persists across page refreshes

---

## Phase 3 - Result Card, Map, Guilt Trip (Day 5, ~2.5 hours)

The user-facing result experience.

### Architect tasks

- [ ] Brief Claude Code: *"Phase 3. Build the PubCard component (spec 7.3), the PubMap component (spec 11), and the GuiltTripModal (spec 7.5). Use the challenges from `constants/challenges.ts` (I'll paste them in). Test the SSR-safe dynamic import for the map carefully."*
- [ ] Paste the challenge list into `constants/challenges.ts`
- [ ] Test on real mobile: open the dev server URL on your phone via your laptop's local IP (`http://192.168.x.x:3000`). Confirm Leaflet renders, marker appears, Get Directions opens Google Maps app on iOS/Android correctly
- [ ] Test the guilt-trip trigger: spin exactly 5 times → modal appears → dismiss → spin 5 more → modal appears again. Click Get Directions → spin count resets → no modal at next spin

### Builder tasks

- PubCard with walking time, name fallback, challenge string
- PubMap with the SSR fix (dynamic import, leaflet-defaulticon-compatibility)
- Get Directions deep link
- GuiltTripModal with Revolut link
- Backdrop click and ESC key dismiss the modal
- Focus trap inside modal
- Wire all of it into the state machine

### Phase 3 done when

- Full unstyled flow works end-to-end: age gate → location → spin → result card → directions OR spin again
- Guilt trip fires at correct spin counts
- Map loads on mobile and desktop without errors

---

## Phase 4 - Personality & Theme (Days 6–7, ~3 hours)

The brand. This is where the app stops looking like a college project.

> **Phase 4 Part 1 - COMPLETE.** Voice files pasted, PersonalityToggle built,
> usePersonality hook wired to localStorage, all hardcoded strings removed.
>
> **Phase 4 Part 2a - COMPLETE.** Theme-neutral layout and typography foundation,
> CSS variable system, hydration-safe personality switching, voice routing audit.
> Build clean, 33/33 tests passing.
>
> **Phase 4 Part 2 Prep - COMPLETE (commits 5cbba8b through e1845b2).**
> Status snapshot, challenge prefix dropped, pool pruned to 41, Mapbox tiles
> (dark-v11), Mapbox Directions for walking time, this docs sweep.
>
> **Phase 4 Part 2b - NEXT.** Palette trial commits (four trial commits on
> temporary branches, final pick cherry-picked into main). Visual leap.
> Existing architect homework: nothing new -- Mapbox token is in place,
> routing is complete.

### Architect tasks

- [x] Paste the 120 personality strings (from Phase 0 doc) into `constants/voices.grumpyBarman.ts` and `constants/voices.localLad.ts`
- [ ] Brief Claude Code: *"Phase 4 Part 2b. Palette trials per the Phase 4 plan."*
- [ ] After Claude Code finishes the themes, **open Claude Design** (claude.ai) and paste screenshots of each theme. Ask for visual refinement notes. Specifically: "Does the Grumpy Barman feel like a dim Dublin snug? Does the Local Lad feel like a warm Sunday fireside?" Iterate.
- [x] Write the sarcastic loading messages for each personality
- [x] Personally test every single user-facing string for tone.

### Builder tasks

- [x] Implement theme switching via CSS variables on root class
- [x] Implement PersonalityToggle as two pill buttons
- [x] Hook up `usePersonality` to read/write localStorage
- [x] Replace every hardcoded string in the app with a call to the active voice config
- [ ] Add subtle theme-specific touches: amber underline accents for Grumpy Barman, slightly rounded corners for Local Lad (Phase 4 Part 2b)
- [ ] Build the typography hierarchy (font sizes, weights) per theme (Phase 4 Part 2b)

### Phase 4 done when

- Toggling personality visibly changes the entire app's mood
- Every string the user sees comes from the voice files (grep for hardcoded English in components → should return nothing user-facing)
- Both themes feel cohesive on real mobile

---

## Phase 5 - Polish, Roulette Animation, Edge Cases (Day 8, ~2 hours)

The pre-launch checklist.

> **Note (Phase 4 Part 2 Prep):** We are already on Mapbox tiles and Directions;
> no tile-provider migration is needed in Phase 5. Phase 5 owns: real-device test (iPhone + Android),
> the four `react-hooks/exhaustive-deps` lint fixes (known, deferred), expansion
> of the four under-10-variant voice arrays, and the ROI polygon replacement.
> Cloudflare layer remains planned for Phase 6.

### Architect tasks

- [ ] Brief Claude Code: *"Phase 5. Polish pass. (a) Make the roulette animation feel satisfying - deceleration curve, optional subtle haptic on mobile via vibration API, sound off by default. (b) Add the loading state UX - sarcastic message shows during Overpass fetch. (c) Implement reduced-motion bypass. (d) Add an ErrorBoundary at the root. (e) Make sure the 420px column constraint is real on desktop and that the wider screen has subtle pub-aesthetic decoration outside the column (your choice - dark wood gradient, dim spotlight effect, whatever fits)."*
- [ ] Test on real iOS Safari and Android Chrome. Note any bugs. List them.
- [ ] Hand the bug list back to Claude Code one at a time
- [ ] Run Lighthouse on mobile. Target 90+ Performance, 95+ Accessibility. Fix what doesn't hit
- [ ] Test the location-denied flow on real Safari - click Block, see the gate. Then in Settings, re-enable. Confirm app recovers on refresh

### Builder tasks

- Polish roulette deceleration with `requestAnimationFrame` and easing
- Add haptic feedback via `navigator.vibrate` (gated to mobile, brief 10ms tap on result reveal)
- ErrorBoundary component wrapping the page
- Sarcastic loading state with rotating messages from voice files
- Performance pass: lazy-load Leaflet only after first spin (it's the heaviest dep)
- Accessibility pass: keyboard nav through every interactive element

### Phase 5 done when

- Lighthouse mobile: 90+ Performance, 95+ Accessibility
- Roulette feels good - at minimum, it doesn't feel cheap
- All bugs from real-device testing closed

---

## Phase 6 - Launch (Days 9–10, ~3 hours total)

Domain pointed, deployed, announced.

### Architect tasks

- [ ] Deploy to Vercel: link GitHub repo, set `main` as the production branch, deploy
- [ ] Add domain in Vercel: point `offyego.ie` (or `offyego.com`) to the deployment via the DNS records Vercel gives you. Update at your registrar
- [ ] Wait for DNS propagation (can take up to 24 hours; usually 1–2)
- [ ] Test the production URL on multiple devices and networks
- [ ] Write the README:
  - One-paragraph pitch
  - Screenshots of both themes
  - Local dev setup instructions
  - Contribution guide (one paragraph - "PRs welcome, match the voice, no em-dashes")
  - Tech stack list
  - MIT licence link
- [ ] Set Vercel Analytics on
- [ ] Final smoke test in production: full flow on iOS Safari with location enabled, location denied, and outside-Ireland (VPN to London)
- [ ] Write the launch posts:
  - **LinkedIn:** lead with the story (choice paralysis in Dublin, why you built it, two-week solo build, what you learned). Include screenshot. End with the link and "Built with Next.js, Leaflet, OpenStreetMap. Source on GitHub."
  - **Twitter/X:** punchier - "Spent 2 weeks building Off Ye Go. It picks a random Dublin pub for you and dares you to do something stupid there. [link]"
  - **Reddit r/ireland:** very different tone. They'll smell self-promotion. Lead with the joke, not the build. "Made a thing that picks pubs for you when you can't decide. Roasts you in two Irish accents. Off Ye Go - [link]." Be ready for some sarcasm in return, lean into it
- [ ] Post all three within a few hours of each other
- [ ] Pin the LinkedIn post - it's the portfolio piece

### Builder tasks

- Fix any production-only bugs that surface
- Generate the OG image (one static PNG) - can be skipped to v1.1 if time-crunched

### Phase 6 done when

- Live on `offyego.ie` (or `.com`) with HTTPS
- Repo is public with a README that doesn't read like a template
- All three launch posts are up
- At least one human you don't know has used it (post on Reddit, watch hits in Vercel Analytics)

---

## Daily Cadence Summary

| Day | Phase | Time | Focus |
|---|---|---|---|
| 1 | 0 | 1h | Domain, repo, copy drafting |
| 2 | 1 | 2h | Scaffold + geo logic |
| 3 | 1 | 2h | Gates wired up |
| 4 | 2 | 2h | Overpass + roulette |
| 5 | 3 | 2.5h | Result card + map + guilt trip |
| 6 | 4 | 1.5h | Personality copy + voice files |
| 7 | 4 | 1.5h | Theme implementation + Claude Design pass |
| 8 | 5 | 2h | Polish + Lighthouse + real-device QA |
| 9 | 6 | 2h | Deploy + DNS + README |
| 10 | 6 | 1h | Launch posts + monitor |

**Total: ~17.5 hours over 10 days.** Real-world it'll be 25–30 hours because debugging always overruns. Budget accordingly.

---

## Risk Register

Things that will eat your time if you ignore them:

| Risk | Mitigation |
|---|---|
| Leaflet SSR errors on Vercel | Spec section 11 covers this; test on Vercel preview, not just localhost |
| `.ie` domain verification slow | Have `offyego.com` ready as fallback so you don't block on bureaucracy |
| Overpass API down on launch day | Fallback mirror is implemented; also: don't launch on a Friday night |
| Personality copy sounds generic | The only fix is you writing it yourself, not the AI. Budget time in Phase 0 |
| Scope creep ("just one more feature") | Re-read spec section 17 every time you're tempted |
| Real-device bugs only show on iOS Safari | Test on your phone every phase, not just at the end |
| You hate the design after Phase 4 | Use Claude Design with screenshots - don't redesign in code |

---

## Post-Launch (v1.1, optional, no timeline)

If launch goes well and you want to keep going:

- OG image generation (per-pub shareable card)
- Pint counter (the v2 feature dropped from v1)
- Saved favourites
- Google Places integration toggle (paid users only? or just a v2 fork)
- Multi-city focus filters (Dublin/Cork/Galway/Limerick tabs)
- A truly stupid feature like "barman roulette" that picks a random barman to ask a question

**But don't plan these until v1 has been live for two weeks.** Launch first, measure, then decide.

---

*End of timeline. Last update: project kickoff.*
