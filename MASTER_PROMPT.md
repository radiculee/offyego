# Off Ye Go - Master Build Spec

> Single source of truth for building Off Ye Go. Hand this file directly to Claude Code, Copilot, or any agent. If a decision isn't in here, ask before assuming.

---

## 1. The Pitch

**Off Ye Go** is a sarcastic, mobile-first web app that randomly picks a pub for you within walking distance, anywhere in the Republic of Ireland. It exists because choice paralysis is real and Dublin alone has 700+ pubs. The user hits a button, the app spins a roulette of nearby pubs, lands on one, gives them a sarcastic challenge to complete there, and shoves them out the door with walking directions. The brand voice is unapologetically Irish - cheeky, dry, slightly transgressive, never offensive.

**One-line:** *"Can't pick a pub? We'll pick one. Off ye go."*

**Live URL target:** `offyego.ie` (fallback `offyego.com` if `.ie` registration is held up).

---

## 2. Non-Negotiable Brand Rules

These are the rules that make Off Ye Go *Off Ye Go* and not "Random Pub Finder Ireland." Do not soften them.

- **Voice is sarcastic, not cruel.** Punches up at indecision, never down at people.
- **Republic of Ireland only.** Not "all of Ireland." Not "Ireland and the UK." The app proudly excludes Northern Ireland in v1 - this is a brand stance, not an oversight.
- **Two personalities, two themes.** Switching personality switches the visual theme too. They are coupled.
- **No emoji in UI copy.** Irish humour is dry. Emoji weakens it.
- **No em-dashes in user-facing copy.** Period.
- **Mobile-first, always.** Desktop is a 420px-max centred column. Do not build a separate desktop layout.

---

## 3. Tech Stack (Locked)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | TypeScript strict mode; Turbopack is default for both dev and build in Next.js 16 |
| Styling | Tailwind CSS v4 | CSS variables for the two themes |
| Map | `react-leaflet` + `leaflet` | Use `next/dynamic` with `{ ssr: false }` for SSR safety |
| Icons | `lucide-react` | Only where strictly needed; prefer text |
| Pub data | OpenStreetMap via Overpass API | No API key, no cost |
| Persistence | `localStorage` only | No DB in v1 |
| Hosting | Vercel | HTTPS required (geolocation API needs it) |
| Donations | Revolut.me link | No Stripe, no merchant account |
| Analytics | Vercel Analytics (free tier) | Privacy-friendly, no cookie banner needed |
| Repo | Public, MIT licence | PRs welcome |
| Maps & routing | Mapbox raster tiles (dark-v11) + Mapbox Directions API (walking profile) | Free tier covers v1 traffic. Token in `NEXT_PUBLIC_MAPBOX_TOKEN` env var. URL-restricted public token (pk.*). |

**Do not add:** state management libraries (Zustand/Redux), backend frameworks, databases, auth, or any paid SDK. If you feel like you need one of these, stop and ask.

Mapbox replaces the originally-specified OSM tiles and haversine-only walking time. OSM data still flows through Mapbox under the hood; the attribution credits both. This tile source is final for v1; no other tile provider should be substituted.

---

## 4. Architecture

### Folder structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout, theme class applied here
│   ├── page.tsx             # The only page (SPA)
│   ├── globals.css          # Tailwind + theme CSS variables
│   └── not-found.tsx        # Sarcastic 404
├── components/
│   ├── gates/
│   │   ├── AgeGate.tsx      # 18+ disclaimer, shows every visit
│   │   ├── LocationGate.tsx # Asks for geolocation permission
│   │   └── IrelandGate.tsx  # Sarcastic gate if outside ROI
│   ├── roulette/
│   │   ├── Roulette.tsx     # Spinning animation + final reveal
│   │   └── PubCard.tsx      # Result card (name, walking time, challenge, directions)
│   ├── map/
│   │   └── PubMap.tsx       # Leaflet map, dynamically imported
│   ├── modals/
│   │   └── GuiltTripModal.tsx
│   ├── ui/
│   │   ├── PersonalityToggle.tsx
│   │   ├── RadiusSlider.tsx
│   │   └── SpinButton.tsx
│   └── layout/
│       └── Shell.tsx        # The 420px column wrapper
├── lib/
│   ├── overpass.ts          # Fetch pubs from OSM
│   ├── geo.ts               # Haversine, walking time, Ireland bounds check
│   ├── storage.ts           # localStorage wrapper (typed)
│   └── ireland-polygon.ts   # ROI-only polygon points + point-in-polygon
├── constants/
│   ├── voices.ts            # All sarcastic copy, per personality
│   ├── challenges.ts        # Array of challenge strings
│   └── config.ts            # Radius bounds, spin count threshold, etc.
├── hooks/
│   ├── useGeolocation.ts    # Wraps navigator.geolocation
│   ├── useSpinCount.ts      # Tracks spins, persists to localStorage
│   └── usePersonality.ts    # Current persona + theme class
└── types/
    └── pub.ts               # Pub, Personality, Voice types
```

**Routing:** None. Everything renders conditionally on `app/page.tsx`. State machine in the page component (or a single `useReducer`) handles which screen is showing.

### Application state machine

States, in order:
1. `AGE_GATE` - always the first screen, every visit
2. `REQUESTING_LOCATION` - geolocation permission pending
3. `LOCATION_DENIED` - they refused; sarcastic dead-end with re-enable hint
4. `LOCATION_FAILED` - timeout or error; same gate, slightly different copy
5. `OUT_OF_IRELAND` - granted location, outside ROI polygon
6. `READY` - main app: slider + spin button
7. `SPINNING` - roulette animation, no pubs found yet
8. `FETCHING_WALKING_TIME` - roulette has settled visually on the final pub; PubCard waits for Mapbox Directions response (2500ms timeout) before rendering with accurate walking time
9. `NO_PUBS_FOUND` - Overpass returned zero pubs; sarcastic message + nudge to widen radius
10. `RESULT` - pub revealed, card showing
11. `GUILT_TRIP` - modal overlay on top of `RESULT` or `READY`

The user can move back from `RESULT` → `READY` (spin again button) or `RESULT` → external (Get Directions opens Google Maps).

---

## 5. The Republic-of-Ireland Gate

Bounding box alone is **not enough** - a naive box covering Donegal will also cover Belfast and Derry. Two-step check:

**Step 1 - Cheap bounding box (fast reject):**
```ts
const ROI_BBOX = { north: 55.45, south: 51.35, west: -10.70, east: -5.90 };
```
If outside this box, immediately fail.

**Step 2 - Polygon check (excludes NI):**
Use a simplified GeoJSON polygon of the Republic of Ireland's land border. Point-in-polygon test. There's no need for sub-kilometre precision - a coastline simplified to ~50–100 points is plenty.

**Source for the polygon:** Download from Natural Earth or OSM admin boundaries (`ISO3166-1:IE`), simplify with `turf.simplify` or similar to keep the JSON under ~20KB, commit as `src/lib/ireland-polygon.ts`. **Do not use a runtime API call** for this - it's a one-time data fetch, ship it as a constant.

**Use `@turf/boolean-point-in-polygon`** for the test. Don't roll your own - ray-casting edge cases will burn time.

---

## 6. The Three Gates (In Order)

### 6.1 Age / Disclaimer Gate
- Shows on every visit (no localStorage persistence - this is intentional, legal cover)
- Full-screen overlay, can't be dismissed except by the button
- Two buttons: **"I'm 18+"** (proceeds into the app) and **"I'm under 18"** (full-page navigation to `drinkaware.ie` via `window.location.assign`). Both use equal secondary-tier styling to avoid visually pre-selecting either path.
- Copy is dry, not preachy. Example: *"This app is for people over 18 with a sense of humour. If neither applies, the door's behind you."*
- Both personalities show the same age gate copy. `ageGateButtonAccept` and `ageGateButtonDecline` are intentionally identical strings in both voice files.

### 6.2 Location Gate
- After age gate, request `navigator.geolocation.getCurrentPosition()`
- High-accuracy: `{ enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }`
- Three failure modes, three distinct screens:
  - **Denied** (`PERMISSION_DENIED`): "We can't pick a pub if you won't tell us where you are. Enable location and try again."
  - **Timeout** (`TIMEOUT`): "Your phone is being shy. Try again."
  - **Unavailable** (`POSITION_UNAVAILABLE`): "GPS is having a moment. Try again in a sec."
- No fallback (no manual location entry, no default to Dublin). The constraint is the point.

### 6.3 Republic-of-Ireland Gate
- Only runs after location is granted
- Two-step check (bbox then polygon)
- If outside, show personality-specific sarcastic copy (see voices.ts)
- No way past this gate from this device. They have to physically be in ROI.

---

## 7. The Main App Flow

### 7.1 The Ready Screen

Above the fold, in order:
1. Brand mark "Off Ye Go" renders prominent at the top (`text-3xl font-bold tracking-tight`), under Phase 4 Part 2a typography scale.
2. Personality toggle: two pill buttons, **The Grumpy Barman** | **The Local Lad**
3. Radius slider: 0.5km to 10km, step 0.5, default 1km
4. Slider label updates live: "Find me a pub within **1km**"
5. Giant spin button - full-width, personality-coloured. Label varies by personality:
   - Grumpy Barman: "Get on with it"
   - Local Lad: "Spin the feckin' wheel"
6. Footer: originally specified but not implemented. Revisit before Phase 6 launch (could live in README links, or persist the omission).

### 7.2 The Spin

1. User taps spin button → fetch pubs from Overpass
2. Build a query for pubs **and bars** (some Irish pubs are tagged `amenity=bar` in OSM):
   ```
   [out:json][timeout:10];
   (
     node["amenity"="pub"](around:RADIUS_M, LAT, LNG);
     node["amenity"="bar"](around:RADIUS_M, LAT, LNG);
   );
   out body;
   ```
3. Cap returned pubs at 50 in memory (Overpass usually returns all; we filter)
4. If 0 pubs → state goes to `NO_PUBS_FOUND` with sarcastic copy
5. If >0 pubs → start roulette animation (~2 seconds, cycling pub names rapidly, decelerating to final pick)
6. Final pick is `Math.floor(Math.random() * pubs.length)`
7. Reveal: roulette stops, `PubCard` slides up

### 7.3 The Pub Card

Contents, top to bottom:
1. **Pub name** (or "Unnamed (probably grand)" if no `name` tag)
2. **Walking time:** real walking time via Mapbox Directions API (walking profile) on the selected pub. Tilde prepended ("~X min walk") when Directions fails or times out and the haversine estimate is used instead. Minimum 5 min walk always enforced.
3. **Mini Leaflet map** with a single pin
4. **The challenge:** one randomly selected string from `challenges.ts`. Challenge text stands alone, italic, no prefix.
5. **Two buttons:**
   - **Get Directions** → opens `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}` in new tab. **Resets `spinCount` to 0.**
   - **Spin Again** → goes back to `SPINNING` state, picks a new pub from the **already-fetched** list (do not re-fetch Overpass - that's slow and wasteful)

### 7.4 The Spin-Again Logic

- `spinCount` increments on every spin (including the first)
- Persists in `localStorage` under key `offyego:spinCount`
- When `spinCount > 0 && spinCount % 5 === 0`, show `GuiltTripModal` over the result
- Clicking Get Directions resets `spinCount = 0`
- "I'm just a cheapskate" or backdrop click dismisses the modal but doesn't reset the count

### 7.5 The Guilt Trip Modal

- Centred modal, dark backdrop
- Personality-specific copy (see voices.ts)
- Two buttons:
  - **Buy a Pint (€5)** → opens `https://revolut.me/USERNAME` in new tab
  - **I'm just a cheapskate** → dismiss
- Backdrop click also dismisses

### 7.6 The No-Pubs-Found Screen

- Reachable from any spin where Overpass returns zero
- Personality-specific copy
- Single button: "Widen the search" → returns to `READY` with slider focused

---

## 8. The Two Personalities

### The Grumpy Barman
- **Mood:** Annoyed you're here, wants you to hurry up, low patience
- **Theme:** Near-black background (`#0a0a0a`), warm amber accents (`#d4a574`), muted cream text (`#e8dcc4`). Single low pendant-light feel.
- **Typography:** Slightly condensed, sharp
- **Sample copy:**
  - Spin button: "Get on with it"
  - Loading: "Aye, hold on. I'm thinking."
  - No pubs found: "Nothing here. Either widen your search or accept your fate."
  - Result intro: "Right. Here. Don't make a scene."
  - Out of Ireland: "You're not in Ireland. We don't serve your kind. Off you go."

### The Local Lad
- **Mood:** Chaotic, friendly, wants the craic, slightly unhinged
- **Theme:** Deep forest green (`#1a3a2a`), cream (`#f4ecd8`), a touch of red (`#c44545`). Fire-in-the-snug feel.
- **Typography:** Looser, slightly rounded
- **Sample copy:**
  - Spin button: "Spin the feckin' wheel"
  - Loading: "Hold on now, finding somewhere with a bit of life..."
  - No pubs found: "Ah here, there's nothing 'round here. Try a wider net, lad."
  - Result intro: "Got it! You'll love this one. Probably."
  - Out of Ireland: "You're miles off, ya melt. Come back when you've crossed the sea."

**Each personality needs at least 10 variants for:** loading messages, no-pubs-found messages, result intros, guilt-trip messages, out-of-ireland messages, location-denied messages. Random pick from the array on each occurrence.

---

## 9. The Challenges

Single shared array in `challenges.ts`. ~40–60 entries. Tone: medium-risk, social, occasionally drinking-related. Examples:

- "Order a pint of Guinness and rate the head out of 10."
- "Ask the barman where the nearest other pub is. Then don't go."
- "Find someone wearing a GAA jersey and tell them their county is overrated."
- "Order a small one. Just to confuse them."
- "Compliment the barman's pour. Mean it or don't."
- "Ask a regular for a pub recommendation, then come back here anyway."
- "Sit at the bar, not a table. Tables are for cowards."
- "Read the entire whiskey menu out loud before ordering a Heineken."
- "Tip €2. Watch what happens."

**Hard exclusions:**
- No challenges involving other people non-consensually (no "kiss," "take a photo of," etc.)
- No illegal acts (no "steal," "leave without paying")
- No targeting staff abusively (tipping is fine, insulting is not)
- No driving-related dares
- No anything that could trigger an eating disorder or a self-harm pattern

Same challenge pool for both personalities. Challenge text stands alone with no personality prefix. Currently 41 entries (pruned from an initial 51 to remove tame or observation-only items). Personality-split challenge pool is deferred architect work.

---

## 10. Geolocation Details

- Request permission **after** age gate, **before** showing any pub UI
- Use the Permissions API to check state first (`navigator.permissions.query({ name: 'geolocation' })`) and skip the prompt if already granted
- High-accuracy mode, 10-second timeout
- Re-use coords for 1 minute (`maximumAge: 60000`) - no need to re-locate on every spin
- Don't watch position - single fetch per session is plenty

---

## 11. The Map Component

- Dynamically imported in `page.tsx`: `const PubMap = dynamic(() => import('@/components/map/PubMap'), { ssr: false })`
- Install `leaflet-defaulticon-compatibility` to fix the missing marker icon issue
- Tile layer: Mapbox dark-v11 raster tiles. URL template:
  `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
- Attribution required: `'&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'`
- Single marker on the chosen pub, centred map
- Zoom level 16 (good balance for "you can see the street")
- Disable scroll wheel zoom (mobile UX) - `scrollWheelZoom={false}`
- Map height: 192px (`h-48` in Tailwind v4), fits inside the 420px column

---

## 12. Data Handling Details

### Overpass query
```ts
const query = `
  [out:json][timeout:10];
  (
    node["amenity"="pub"](around:${radiusM},${lat},${lng});
    node["amenity"="bar"](around:${radiusM},${lat},${lng});
  );
  out body;
`;
const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
```

### Response shape (Overpass)
```ts
type OverpassNode = {
  type: 'node';
  id: number;
  lat: number;
  lon: number;
  tags?: {
    name?: string;
    amenity?: 'pub' | 'bar';
    'addr:street'?: string;
    'addr:city'?: string;
    // ...others, ignore for v1
  };
};
```

### Pub type (internal)
```ts
type Pub = {
  id: number;
  name: string;        // "Unnamed (probably grand)" if no name tag
  lat: number;
  lng: number;
  distanceMeters: number;
  walkingMinutes: number;
};
```

### Walking time calculation
```ts
const walkingMinutes = Math.max(5, Math.round((distanceKm / 5) * 60));
```
(5 km/h pace, minimum 5 minutes - never show "1 min walk")

### Overpass reliability strategy

Overpass mirrors go down semi-regularly and unpredictably. Rather
than waiting for a primary to fail before trying a fallback (which
doubles worst-case latency), `fetchPubs` races all four mirrors in
parallel using `Promise.any()`. The first mirror to return a
successful response wins; the rest are aborted. Mirrors:
- `overpass-api.de`
- `overpass.kumi.systems`
- `overpass.private.coffee`
- `overpass.openstreetmap.ru`

If all four fail, the rejection propagates to the caller and the
state machine routes to `NO_PUBS_FOUND { reason: 'ERROR' }`.

This is an intentional change from the originally-specified
primary-then-retry pattern. Accepted by the architect in Phase 3
close-out (see commit 3f3a685).

---

## 13. localStorage Schema

All keys prefixed with `offyego:`. Single typed wrapper in `lib/storage.ts`.

| Key | Type | Purpose |
|---|---|---|
| `offyego:spinCount` | `number` | Triggers guilt-trip modal |
| `offyego:personality` | `'GRUMPY_BARMAN' \| 'LOCAL_LAD'` | Last selected personality, restored on load |

**Not stored:** age-gate consent (intentional - every visit re-prompts).

---

## 14. Performance Targets

- Lighthouse mobile: Performance 90+, Accessibility 95+
- Time to first spin (from page load on mid-range mobile): under 3 seconds
- Bundle size: under 200KB initial JS (Leaflet is big - make sure it's only loaded on the main app, not the gates)

---

## 15. Accessibility

- All interactive elements keyboard-accessible
- Spin button has `aria-label` describing state
- Modal has focus trap
- Slider has `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
- Colour contrast: WCAG AA minimum for both themes
- Reduced-motion: respect `prefers-reduced-motion` and skip the roulette animation (just show the result)

---

## 16. SEO & Meta

- `<title>`: "Off Ye Go - Can't pick a pub? We'll pick one."
- `<meta description>`: "A sarcastic pub randomiser for the Republic of Ireland. Hit spin, get a pub, get a dare, go drink."
- Open Graph image: a stylised black-and-amber card with the tagline (build later, not v1 blocker)
- `robots.txt`: allow all
- Sitemap: single page, generate via Next.js

---

## 17. What's Explicitly Out of Scope for v1

- User accounts / auth
- Pint counter / visit history
- Saving favourite pubs
- Sharing a pub to social media (image generation)
- Google Places integration
- Reviews, photos, opening hours
- Multi-language (Irish/English toggle)
- Notifications
- A PWA install prompt
- Friend invites / multiplayer roulette
- An "I'm a tourist" mode that bypasses the Ireland gate

**These are v2+ ideas. Do not let scope creep eat the v1 launch.**

---

## 18. Definition of Done (v1)

The app is ready to launch when:

- [ ] All three gates work correctly (age, location, ROI polygon)
- [ ] Spin returns a pub within 2 seconds on 4G mobile
- [ ] Both personalities are visually and verbally distinct
- [ ] All sarcastic copy strings have at least 10 variants
- [ ] The Leaflet map loads without SSR errors on Vercel
- [ ] The guilt-trip modal triggers correctly at spin 5, 10, 15
- [ ] Get Directions opens Google Maps with the right coordinates
- [ ] Walking time displays correctly, minimum 5 min
- [ ] Lighthouse mobile scores 90+ Performance, 95+ Accessibility
- [ ] No console errors on production build
- [ ] Tested on iOS Safari, Android Chrome, desktop Chrome, desktop Safari
- [ ] Repo is public, MIT licence in place, README written
- [ ] `offyego.ie` (or `.com`) points to the Vercel deployment
- [ ] First post to LinkedIn / Twitter / Reddit r/ireland announcing launch

---

## 19. Agent Instructions

When you (the agent) work on this project:

1. **Read this entire spec before writing any code.** If a decision isn't here, stop and ask.
2. **Match the brand voice in code comments and commits too.** Boring code comments are fine; user-facing strings are sacred.
3. **One personality file per personality.** Do not merge `voices.ts` into a single mega-object - keep them as `voices.grumpyBarman.ts` and `voices.localLad.ts` for readability, then import both into an index.
4. **TypeScript strict mode is non-negotiable.** No `any`. Use `unknown` and narrow.
5. **No console.logs in production code.** Use a tiny `lib/logger.ts` wrapper that no-ops in production.
6. **Commits are conventional:** `feat:`, `fix:`, `chore:`, `docs:`. One logical change per commit.
7. **When in doubt about copy, lean drier and sharper.** Never softer.

---

*End of spec. If you have read this far and are about to start coding: good. Don't pre-write a README - we'll write it after the code works.*
