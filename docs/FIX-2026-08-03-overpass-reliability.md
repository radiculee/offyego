# Fix: "The map server's down" — 2026-08-03

Post-launch reliability fix. Production was failing roughly **one spin in
three** with `The map server's down. Not my problem. Try in a bit.`

## Diagnosis

Overpass was not down.

`overpass-api.de` enforces a per-IP slot quota. Its own status endpoint says so:

```
$ curl https://overpass-api.de/api/status
Rate limit: 2
2 slots available now.
```

Vercel serverless functions share outbound IPs across many customers, so we
burned that quota far faster than our own traffic implied. Under contention
Overpass either queues the request or rejects it outright:

```
HTTP 429 ... Dispatcher_Client::request_read_and_idx::rate_limited
```

Measured against the deployed app: **2 failures in 6 requests**, each landing
at exactly the 10s client abort.

Four defects turned a busy upstream into a hard failure:

| # | Defect | Consequence |
|---|---|---|
| 1 | 10s abort shorter than a queued-but-healthy response (8-10s) | Reported an outage on a server that was merely busy |
| 2 | 3 of 4 mirrors never responded; one global abort | `Promise.any` had no real failover; a hanging mirror ate the budget |
| 3 | Only `res.ok` checked | Overpass also fails as HTTP 200 + `remark` + `elements: []`, which rendered as "no pubs round here" — telling users their area was dry when the server had failed |
| 4 | No caching | Every spin was an uncached hit against a 2-slot quota |

## Why the hotfix was not enough

The hotfix (`7434561`) fixed all four and took the cold-path failure rate from
~33% to ~20%. It could not reach zero, because a live third-party call remained
in the user's critical path, governed by a quota we do not control. Serverless
duration caps and mobile browser timeouts both impose a ceiling, so no timeout
budget closes the gap.

## The fix

The decisive measurement:

| Asset | Size |
|---|---|
| Every pub in the Republic (5,232 rows, gzipped) | **~100 KB** |
| `public/spin/stout-pour.gif`, already shipping | 412 KB |

The entire national dataset is a quarter of one decorative asset. There was
never a reason to ask a rate-limited third party for it at runtime.

- `scripts/build-pub-dataset.mjs` fetches it once at build time, inheriting the
  hotfix's hardening plus retries measured in minutes — free, because no user
  is waiting.
- `src/data/pubs.json` is committed and loaded as a lazily-imported, hashed
  chunk, prefetched at `READY` so the download overlaps with the user choosing
  a radius.
- `src/lib/pub-dataset.ts` filters it by haversine. A spin touches no server.
- `/api/overpass`, `lib/overpass.ts` and its tests are deleted.
- `.github/workflows/refresh-pub-data.yml` regenerates monthly and opens a PR.

### Generator guards

The generator refuses to write a dataset that is below a row-count floor, more
than 5% smaller than the committed one, or **older** than it. The staleness
guard is not theoretical: `kumi.systems` served a two-month-old snapshot during
development, so the primary mirror is now exhausted with patient retries before
any fallback is tried. Both guards were tested and exit non-zero.

`overpass.osm.ch` was trialled as a mirror and rejected: it answers a Dublin
query in 0.16s with `elements: []` because it only holds Swiss extracts. Fast
and empty, it would win any race and silently ship a gutted dataset.

## Two data bugs found on the way

**A third of Irish pubs were invisible.** The query asked for `node` only, so
1,739 ways and 14 relations — pubs mapped as building polygons — were never
returned. `nwr` with `out center` takes the dataset from 3,479 to **5,232**.

**Every spin was biased.** `MAX_PUBS_IN_MEMORY` was applied as `slice(0, 50)`
over id-ordered output, so a dense area always surfaced the same oldest-mapped
pubs. It is now a uniform random sample. `Roulette` already picked uniformly,
so it needed no change.

## Verification

54/54 tests, `tsc` and `lint` clean. Playwright on iPhone 13 with Dublin
geolocation:

| Scenario | Result | `/api/` calls |
|---|---|---|
| Online ×5 | 5/5 RESULT, ~1.56s | none |
| Offline ×5 (`context.setOffline(true)`) | 5/5 RESULT | none |

Spinning with the network fully severed still returns a pub, which is the proof
that the failure mode is gone. Offline, the walk time correctly degrades to the
tilde estimate (`~5 MIN WALK`) when Mapbox Directions is unreachable.

Northern Ireland exclusion was verified against OSM rather than assumed: of
**654** pub entries inside the UK boundary within the ROI bounding box, **zero**
appear in the dataset.

## Open bug found, not fixed

`isInIreland()` uses the Natural Earth 1:10m polygon, whose coastline is too
coarse and which omits small islands. **192 of 5,232 real ROI pubs (3.7%)** fall
outside it: Cobh, Kinsale, Dingle, Howth, Skerries, Malahide, Cape Clear, the
Aran Islands, Blackrock (Louth).

Those are inhabited places, so the same polygon that excludes the pub excludes
the user standing next to it — coastal residents are told they are not in
Ireland and gated to `OUT_OF_IRELAND`.

The fix is a better polygon source, **not** filtering those pubs out of the
dataset and **not** loosening the gate. OSM's
`area["ISO3166-1"="IE"][admin_level=2]` is the better authority and was verified
clean on the Northern Ireland question above. `src/lib/pub-dataset.test.ts`
therefore asserts only that >95% of rows sit inside the polygon.

## Follow-up for the Architect

`voice.overpassErrorMessages` still says "The map server's down". That error now
fires only when the user is offline, so the wording is inherited from an
architecture that no longer exists. Voice strings are Architect-owned and were
left untouched.
