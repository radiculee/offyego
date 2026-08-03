/**
 * Generates src/data/pubs.json: every pub and bar in the Republic of Ireland.
 *
 * Run: node scripts/build-pub-dataset.mjs
 * Also runs monthly from .github/workflows/refresh-pub-data.yml.
 *
 * Why this exists: Overpass enforces a per-IP slot quota (/api/status reports
 * "Rate limit: 2") and Vercel serverless shares outbound IPs across customers,
 * so querying it on the user's critical path failed roughly a third of the
 * time. The whole country is only ~5,200 rows, so we fetch it once here and
 * ship it as a static asset. Overpass is a build-time dependency now, never a
 * runtime one.
 *
 * This is the one place where "however long it takes" is genuinely free: no
 * user is waiting, so we retry patiently rather than aborting.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Mirrors, most reliable first. overpass.osm.ch is deliberately absent: it
// answers a Dublin query in 0.16s with an empty result because it only holds
// Swiss extracts, so it would look like a fast success and ship a gutted file.
const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

const ATTEMPTS = 12;
const BACKOFF_MS = 30_000;
const REQUEST_TIMEOUT_MS = 600_000;

// Republic of Ireland bounding box. Mirrors ROI_BBOX in src/lib/geo.ts; kept
// duplicated because this script is plain .mjs and cannot import the TS source.
const ROI_BBOX = { north: 55.45, south: 51.35, west: -10.7, east: -5.9 };

// A real drop below this means Overpass returned a partial result. Shipping a
// gutted dataset would silently break the app in whole regions, so we refuse
// to write instead. Measured 5,232 on 2026-08-03.
const MIN_EXPECTED_ROWS = 4_500;

// OSM ids are only unique within a type, so a node and a way can share one.
// Offsetting by type keeps Pub.id a plain unique number. OSM node ids are
// ~1.2e10 today, so 1e12 spacing has decades of headroom and stays far inside
// Number.MAX_SAFE_INTEGER.
const TYPE_OFFSET = { node: 0, way: 1e12, relation: 2e12 };

const QUERY = `[out:json][timeout:600];
area["ISO3166-1"="IE"][admin_level=2]->.roi;
nwr["amenity"~"^(pub|bar)$"](area.roi);
out center tags;`;

/**
 * Overpass signals failure three ways and only one is an HTTP error code:
 * 429/504 with an HTML body, and - the dangerous one - HTTP 200 carrying
 * `remark: "runtime error: ..."` alongside an empty elements array. Treating
 * that third case as success is how you ship an empty dataset.
 */
async function fetchOnce(endpoint) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${endpoint}?data=${encodeURIComponent(QUERY)}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'OffYeGo/1.0 (https://offyego.ie)',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('json')) {
      throw new Error(`non-JSON response (content-type: ${contentType || 'none'})`);
    }
    const raw = await res.json();
    if (typeof raw?.remark === 'string' && raw.remark.length > 0) {
      throw new Error(`overpass remark: ${raw.remark.slice(0, 160)}`);
    }
    if (!Array.isArray(raw?.elements)) throw new Error('payload has no elements array');
    return raw;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Mirrors do not all carry equally fresh data: on 2026-08-03 the primary was
 * current to the hour while kumi.systems was serving a two-month-old snapshot.
 * So we exhaust patient retries against the primary before touching a fallback,
 * rather than round-robining and taking whichever answers first. Being slow
 * here costs nothing; shipping stale data costs real pubs.
 */
async function fetchWithRetry() {
  const [primary, ...fallbacks] = MIRRORS;

  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      process.stdout.write(`  attempt ${attempt}/${ATTEMPTS} ${primary} ... `);
      const raw = await fetchOnce(primary);
      console.log(`ok (${raw.elements.length} elements)`);
      return raw;
    } catch (err) {
      console.log(`failed: ${err.message}`);
    }
    if (attempt < ATTEMPTS) {
      console.log(`  waiting ${BACKOFF_MS / 1000}s (rate limits are transient)`);
      await new Promise((resolve) => setTimeout(resolve, BACKOFF_MS));
    }
  }

  console.log(`\n  Primary exhausted after ${ATTEMPTS} attempts. Trying fallback mirrors.`);
  console.log('  WARNING: fallback data may lag the primary by weeks.');
  for (const endpoint of fallbacks) {
    try {
      process.stdout.write(`  fallback ${endpoint} ... `);
      const raw = await fetchOnce(endpoint);
      console.log(`ok (${raw.elements.length} elements)`);
      return raw;
    } catch (err) {
      console.log(`failed: ${err.message}`);
    }
  }
  throw new Error(`All mirrors failed after ${ATTEMPTS} attempts on the primary plus every fallback.`);
}

function toRow(el) {
  // Ways and relations have no lat/lon of their own; `out center` gives them a
  // representative point. Without this the dataset would miss the ~1,750 pubs
  // mapped as building polygons rather than points.
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;
  if (typeof el.id !== 'number') return null;
  const offset = TYPE_OFFSET[el.type];
  if (offset === undefined) return null;
  if (lat < ROI_BBOX.south || lat > ROI_BBOX.north) return null;
  if (lon < ROI_BBOX.west || lon > ROI_BBOX.east) return null;
  const name = el.tags?.name;
  return [
    offset + el.id,
    typeof name === 'string' && name.trim().length > 0 ? name.trim() : null,
    // 5 dp is ~1.1m. More precision would only inflate the file.
    Number(lat.toFixed(5)),
    Number(lon.toFixed(5)),
  ];
}

console.log('Fetching all ROI pubs and bars from Overpass...');
const raw = await fetchWithRetry();

const rows = raw.elements.map(toRow).filter((r) => r !== null);
const dropped = raw.elements.length - rows.length;

// Sorting by id makes the output deterministic, so a month with no real
// changes produces an empty diff and the refresh workflow opens no PR.
rows.sort((a, b) => a[0] - b[0]);

const ids = new Set(rows.map((r) => r[0]));
if (ids.size !== rows.length) {
  console.error(`ERROR: ${rows.length - ids.size} duplicate ids after type offsetting.`);
  process.exit(1);
}
if (rows.length < MIN_EXPECTED_ROWS) {
  console.error(
    `ERROR: only ${rows.length} rows, expected at least ${MIN_EXPECTED_ROWS}.\n` +
      'Overpass likely returned a partial result. Refusing to write a gutted dataset.',
  );
  process.exit(1);
}

const generated = raw.osm3s?.timestamp_osm_base ?? new Date().toISOString();
const outPath = join(root, 'src', 'data', 'pubs.json');

// A fallback mirror can be weeks behind the primary. Without this guard, one
// unlucky run would quietly replace current data with an older snapshot and
// the committed timestamp would travel backwards.
if (existsSync(outPath)) {
  const previous = JSON.parse(readFileSync(outPath, 'utf8'));
  if (previous.generated && Date.parse(generated) < Date.parse(previous.generated)) {
    console.error(
      `ERROR: fetched snapshot (${generated}) is older than the committed one ` +
        `(${previous.generated}).\nThat means a lagging mirror answered. Refusing to ` +
        'regress the dataset; re-run when the primary mirror is reachable.',
    );
    process.exit(1);
  }
  // The absolute floor above only catches a catastrophic truncation. Pubs do
  // close, but they do not close 5% at a time in a month, so a drop that size
  // is far more likely a partial upstream response than real-world churn.
  if (typeof previous.count === 'number' && rows.length < previous.count * 0.95) {
    console.error(
      `ERROR: row count fell from ${previous.count} to ${rows.length} ` +
        `(${(100 - (rows.length / previous.count) * 100).toFixed(1)}% drop).\n` +
        'That is too steep to be genuine churn. Refusing to write; re-run, and if ' +
        'the drop is real, lower the threshold deliberately.',
    );
    process.exit(1);
  }
}

const ageDays = (Date.now() - Date.parse(generated)) / 86_400_000;
if (ageDays > 14) {
  console.warn(`WARNING: snapshot is ${ageDays.toFixed(0)} days old (${generated}).`);
}

const byType = { node: 0, way: 0, relation: 0 };
for (const el of raw.elements) if (byType[el.type] !== undefined) byType[el.type] += 1;
const named = rows.filter((r) => r[1] !== null).length;

// Compact rows, but one per line so git diffs stay reviewable instead of
// showing the whole file as a single changed line.
const body = rows.map((r) => JSON.stringify(r)).join(',\n');
const json = `{"generated":${JSON.stringify(generated)},"count":${rows.length},"pubs":[\n${body}\n]}\n`;

mkdirSync(join(root, 'src', 'data'), { recursive: true });
writeFileSync(outPath, json, 'utf8');

console.log(`\nSource: nodes ${byType.node}, ways ${byType.way}, relations ${byType.relation}`);
console.log(`Rows written: ${rows.length} (${named} named, ${rows.length - named} unnamed)`);
if (dropped > 0) console.log(`Dropped ${dropped} element(s) with no usable coordinates or outside the ROI bbox.`);
console.log(`Wrote ${outPath} (${(json.length / 1024).toFixed(0)} KB uncompressed)`);
console.log('Done.');
