# Off Ye Go

Can't pick a pub? Off ye go. We'll pick one for you.

## What it does

Dublin has over 700 pubs. The island has over 7,000. None of that helps when you're standing on a footpath at six on a Friday and someone asks where you want to go.

Off Ye Go picks one for you, at random, within walking distance of where you're standing. You get the name, a walking time, a map, and a small dare to do once you arrive. The app talks to you in one of two Irish voices, neither of which is impressed with you. Republic of Ireland only, by design.

## Status

In active development. Targeted launch on offyego.ie when ready.

## Stack

Built on Next.js 16 with React 19 and the App Router, written in TypeScript with strict mode on, styled with Tailwind v4, tested with Vitest. The map is Leaflet on top of OpenStreetMap tiles, so there's no Google Maps key, no quota, no billing setup. Pub data comes from the Overpass API against OpenStreetMap. Hosted on Vercel. No backend. No database. No accounts. Just a button and a pub.

## Running it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Browser geolocation requires HTTPS in production, so you'll need to allow location on localhost for development.

## Contributing

PRs welcome. The project has a strong opinionated voice, so please read MASTER_PROMPT.md before opening one. No em-dashes in user-facing copy. No emoji in UI. If you're adding a challenge or voice variant, follow the existing tone.

## Licence

MIT. See LICENSE.
