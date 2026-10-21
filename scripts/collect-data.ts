import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { geoAzimuthalEqualArea } from 'd3-geo';
import { unzipSync, strFromU8 } from 'fflate';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { XMLParser } from 'fast-xml-parser';
import {
  sources,
  flagChecks,
  type SourceLock,
  type DownloadSource,
  type FlagSource,
} from './collection-sources.ts';
import { properties } from '../src/domain/properties.ts';
import {
  stateAssetPath,
  type Dataset,
  type StateRecord,
} from '../src/domain/data.ts';
import { cleanFlagSvg } from './svg.ts';
import { validateData, stateCodes, factsDigest } from './validate-data.ts';
import { writeGallery } from './data-gallery.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const cache = resolve(root, '.cache/collection');
const lockPath = resolve(root, 'scripts/source-lock.json');
const hash = (bytes: Uint8Array | string) =>
  createHash('sha256').update(bytes).digest('hex');
const plain = (s: string) =>
  s
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
// The unqualified Georgia file depicts the country, not the US state.
const flagTitle = (fact: { name: string; abbreviation: string }) =>
  `File:Flag of ${fact.abbreviation === 'GA' ? 'Georgia (U.S. state)' : fact.name}.svg`;

async function download(
  url: string,
  expected?: DownloadSource,
): Promise<{ bytes: Uint8Array; source: DownloadSource }> {
  const path = resolve(cache, hash(url));
  if (existsSync(path) && !process.argv.includes('--no-cache')) {
    const bytes = readFileSync(path);
    if (expected && hash(bytes) !== expected.sha256)
      throw new Error(
        `Cached source changed: ${url}. Remove ${path} and retry.`,
      );
    return {
      bytes,
      source: expected ?? {
        url,
        sha256: hash(bytes),
        retrievedAt: statSync(path).mtime.toISOString(),
      },
    };
  }
  try {
    // Use the system network client consistently: it supports proxies, follows
    // redirects and honors Retry-After. Never interpolate a URL into a shell.
    if (new URL(url).hostname.endsWith('wikimedia.org')) await delay(1200);
    const bytes = new Uint8Array(
      execFileSync(
        'curl',
        [
          '--fail',
          '--location',
          '--silent',
          '--show-error',
          '--retry',
          '3',
          '--retry-max-time',
          '120',
          '--max-time',
          '180',
          url,
        ],
        { maxBuffer: 64 * 1024 * 1024 },
      ),
    );
    if (expected && hash(bytes) !== expected.sha256)
      throw new Error(
        'Source digest differs from reviewed source-lock.json. Review the upstream change before using --refresh-sources.',
      );
    writeFileSync(path, bytes);
    return {
      bytes,
      source: expected ?? {
        url,
        sha256: hash(bytes),
        retrievedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    throw new Error(`Could not collect ${url}: ${String(error)}`);
  }
}

interface Fact {
  name: string;
  abbreviation: string;
  fips: string;
  capital: string;
}
interface Ring {
  coordinates: string;
}
interface Polygon {
  outerBoundaryIs: { LinearRing: Ring };
  innerBoundaryIs?: { LinearRing: Ring }[] | { LinearRing: Ring };
}
type Position = [number, number];
type Shape = Position[][][];
const array = <T>(value: T | T[] | undefined): T[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

export async function capitalTable(
  bytes: Uint8Array,
): Promise<Map<string, string>> {
  const task = getDocument({
    data: new Uint8Array(bytes),
    useSystemFonts: true,
  });
  const document = await task.promise;
  try {
    // Printed page 515 of the 1975–76 Minnesota Legislative Manual, PDF page 517.
    const page = await document.getPage(517);
    const content = await page.getTextContent();
    const words = content.items
      .filter((item) => 'str' in item && item.str.trim())
      .map((item) => {
        if (!('str' in item)) throw new Error('Unexpected PDF item');
        return { text: item.str, x: item.transform[4], y: item.transform[5] };
      });
    const rows: { y: number; name: string[]; capital: string[] }[] = [];
    for (const word of words.filter(
      (w) => w.x < 170 && w.y < 570 && w.y > 60,
    )) {
      let row = rows.find((r) => Math.abs(r.y - word.y) < 2);
      if (!row) {
        row = { y: word.y, name: [], capital: [] };
        rows.push(row);
      }
      row.name.push(word.text);
    }
    const tidy = (s: string) =>
      s
        .replace(/\.{2,}/g, ' ')
        .replace(/^[.\s]+|[.\s]+$/g, '')
        .replace(/\s+/g, ' ');
    const result = new Map<string, string>();
    for (const row of rows.sort((a, b) => b.y - a.y)) {
      row.capital = words
        .filter((w) => w.x >= 180 && w.x < 310 && Math.abs(w.y - row.y) < 2)
        .sort((a, b) => a.x - b.x)
        .map((w) => w.text);
      const name = tidy(row.name.join(' '));
      let capital = tidy(row.capital.join(' '));
      // Explicit source/OCR corrections, checked against the respective state governments.
      if (name === 'Alabama' && capital === 'Montomgery')
        capital = 'Montgomery';
      if (name === 'Minnesota' && capital === '5t. Paul') capital = 'St. Paul';
      result.set(name, capital);
    }
    if (result.size !== 50 || [...result.values()].some((value) => !value))
      throw new Error(
        'Official capital table layout changed; review its extraction.',
      );
    return result;
  } finally {
    await task.destroy();
  }
}

function boundaries(
  bytes: Uint8Array,
): Map<string, { name: string; fips: string; geometry: Shape }> {
  const files = unzipSync(bytes);
  const file = Object.keys(files).find((name) => name.endsWith('.kml'));
  if (!file) throw new Error('Census archive has no KML.');
  const kml = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false,
  }).parse(strFromU8(files[file]));
  const result = new Map<
    string,
    { name: string; fips: string; geometry: Shape }
  >();
  for (const placemark of kml.kml.Document.Folder.Placemark) {
    const fields = Object.fromEntries(
      placemark.ExtendedData.SchemaData.SimpleData.map(
        (entry: Record<string, string>) => [entry['@_name'], entry['#text']],
      ),
    );
    if (!stateCodes.includes(fields.STUSPS)) continue;
    const polygons = array<Polygon>(
      placemark.MultiGeometry?.Polygon ?? placemark.Polygon,
    );
    const geometry = polygons.map((polygon) =>
      [polygon.outerBoundaryIs, ...array(polygon.innerBoundaryIs)].map(
        (boundary) =>
          boundary.LinearRing.coordinates
            .trim()
            .split(/\s+/)
            .map((tuple) => {
              const [longitude, latitude] = tuple.split(',').map(Number);
              if (!Number.isFinite(longitude) || !Number.isFinite(latitude))
                throw new Error('Invalid Census coordinate.');
              return [
                longitude > 0 && fields.STUSPS === 'AK'
                  ? longitude - 360
                  : longitude,
                latitude,
              ] as Position;
            }),
      ),
    );
    if (!geometry.length) throw new Error(`Missing polygons: ${fields.STUSPS}`);
    result.set(fields.STUSPS, {
      name: fields.NAME,
      fips: fields.STATEFP,
      geometry,
    });
  }
  if (result.size !== 50)
    throw new Error('Expected 50 Census state geometries.');
  return result;
}

export function outlineSvg(shape: Shape, abbreviation: string): string {
  // Center on the largest exterior ring. Direct projection + evenodd paths avoids
  // spherical winding assumptions and preserves every polygon and inner ring.
  const largest = [...shape].sort((a, b) => b[0].length - a[0].length)[0][0];
  const xs = largest.map((p) => p[0]);
  const ys = largest.map((p) => p[1]);
  const projection = geoAzimuthalEqualArea()
    .rotate([
      -(Math.min(...xs) + Math.max(...xs)) / 2,
      -(Math.min(...ys) + Math.max(...ys)) / 2,
    ])
    .scale(1)
    .translate([0, 0]);
  function draw(group: Shape, box: [number, number, number, number]) {
    if (!group.length) return '';
    const projected = group.map((polygon) =>
      polygon.map((ring) => ring.map((p) => projection(p)!)),
    );
    const all = projected.flat(2);
    const minX = Math.min(...all.map((p) => p[0]));
    const minY = Math.min(...all.map((p) => p[1]));
    const w = Math.max(...all.map((p) => p[0])) - minX;
    const h = Math.max(...all.map((p) => p[1])) - minY;
    const scale = Math.min(box[2] / w, box[3] / h);
    const x = box[0] + (box[2] - w * scale) / 2;
    const y = box[1] + (box[3] - h * scale) / 2;
    return projected
      .map(
        (polygon) =>
          `<path d="${polygon.map((ring) => ring.map((p, i) => `${i ? 'L' : 'M'}${(x + (p[0] - minX) * scale).toFixed(2)},${(y + (p[1] - minY) * scale).toFixed(2)}`).join('') + 'Z').join('')}"/>`,
      )
      .join('');
  }
  const remote =
    abbreviation === 'HI'
      ? shape.filter((p) => p[0].every((point) => point[0] < -160.5))
      : [];
  const main = remote.length ? shape.filter((p) => !remote.includes(p)) : shape;
  const artwork = remote.length
    ? draw(main, [16, 16, 608, 300]) + draw(remote, [16, 350, 608, 74])
    : draw(main, [16, 16, 608, 408]);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440"><g fill="#164e45" stroke="#164e45" stroke-width="0.8" stroke-linejoin="round" fill-rule="evenodd">${artwork}</g></svg>\n`;
}

async function flagSource(
  name: string,
  abbreviation: string,
  info:
    | {
        url: string;
        descriptionurl: string;
        timestamp: string;
        extmetadata: Record<string, { value: string }>;
      }
    | undefined,
): Promise<FlagSource> {
  const filename = `Flag of ${name}.svg`;
  if (!info) throw new Error(`Missing Commons file: ${filename}`);
  const metadata = info.extmetadata;
  const value = (key: string) => plain(metadata[key]?.value ?? '');
  const license = value('LicenseShortName');
  if (
    ![
      'Public domain',
      'CC0',
      'CC BY-SA 4.0',
      'CC BY-SA 3.0',
      'CC BY 4.0',
      'Copyrighted free use',
    ].includes(license)
  )
    throw new Error(`Review license for ${filename}: ${license}`);
  const url = new URL(info.url);
  url.search = '';
  const { source } = await download(url.href);
  return {
    ...source,
    abbreviation,
    page: info.descriptionurl,
    revision: info.timestamp,
    license,
    licenseUrl: value('LicenseUrl'),
    author: value('Artist'),
    credit: value('Credit'),
    attributionRequired: value('AttributionRequired') === 'true',
  };
}

async function collect() {
  const refresh = process.argv.includes('--refresh-sources');
  const replace = process.argv.includes('--replace');
  const target = resolve(root, 'data');
  if (existsSync(target) && !replace)
    throw new Error(
      'data/ already exists. Use --replace to replace it after successful collection; the previous directory will be kept as a backup.',
    );
  if (!existsSync(lockPath) && !refresh)
    throw new Error(
      'Missing reviewed source lock. Maintainers must research sources and run --refresh-sources.',
    );
  mkdirSync(cache, { recursive: true });
  const previous: SourceLock | undefined = !refresh
    ? JSON.parse(readFileSync(lockPath, 'utf8'))
    : undefined;
  const downloaded = {} as Record<
    keyof typeof sources,
    Awaited<ReturnType<typeof download>>
  >;
  for (const key of Object.keys(sources) as (keyof typeof sources)[]) {
    console.log(`Reading ${key}…`);
    downloaded[key] = await download(sources[key], previous?.sources[key]);
  }
  const shapes = boundaries(downloaded.boundaries.bytes);
  const capitals = await capitalTable(downloaded.capitals.bytes);
  const codeRows = new TextDecoder()
    .decode(downloaded.codes.bytes)
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split('|'));
  const facts: Fact[] = [...shapes]
    .map(([abbreviation, state]) => {
      const code = codeRows.find((row) => row[1] === abbreviation);
      const capital = capitals.get(state.name);
      if (!code || code[0] !== state.fips || code[2] !== state.name || !capital)
        throw new Error(`Official sources disagree for ${abbreviation}.`);
      return { name: state.name, abbreviation, fips: state.fips, capital };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));
  const checks: SourceLock['checks'] = [];
  for (const check of flagChecks) {
    const existing = previous?.checks.find((c) => c.id === check.id);
    // A normal rerun reproduces the reviewed snapshot; mutable government HTML
    // is rechecked only during an explicit source refresh and human review.
    if (existing) {
      checks.push(existing);
      continue;
    }
    const { bytes, source } = await download(check.url, existing);
    if (
      !new TextDecoder()
        .decode(bytes)
        .toLowerCase()
        .includes(check.contains.toLowerCase())
    )
      throw new Error(
        `Official reference changed for ${check.id}; review ${check.url}.`,
      );
    checks.push({ ...source, id: check.id, note: check.note });
  }
  let flags = previous?.flags ?? [];
  if (!previous) {
    flags = [];
    const endpoint = new URL('https://commons.wikimedia.org/w/api.php');
    endpoint.search = new URLSearchParams({
      action: 'query',
      titles: facts.map(flagTitle).join('|'),
      prop: 'imageinfo',
      iiprop: 'url|extmetadata|timestamp',
      iilimit: '1',
      format: 'json',
      redirects: '1',
    }).toString();
    const { bytes } = await download(endpoint.href);
    type Info = Parameters<typeof flagSource>[2];
    const response = JSON.parse(new TextDecoder().decode(bytes)) as {
      query: {
        pages: Record<string, { title: string; imageinfo?: Info[] }>;
        redirects?: { from: string; to: string }[];
      };
    };
    if (!response.query?.pages)
      throw new Error('Commons metadata response is incomplete.');
    for (const fact of facts) {
      console.log(`Reviewing Commons source: ${fact.name}`);
      let title = flagTitle(fact);
      title =
        response.query.redirects?.find((item) => item.from === title)?.to ??
        title;
      const info = Object.values(response.query.pages).find(
        (page) => page.title === title,
      )?.imageinfo?.[0];
      flags.push(await flagSource(fact.name, fact.abbreviation, info));
    }
  }
  const lock: SourceLock = {
    schemaVersion: 1,
    reviewedAt: previous?.reviewedAt ?? new Date().toISOString(),
    factsSha256: factsDigest(facts),
    sources: Object.fromEntries(
      Object.entries(downloaded).map(([key, value]) => [key, value.source]),
    ) as SourceLock['sources'],
    checks,
    flags,
  };
  if (previous && lock.factsSha256 !== previous.factsSha256)
    throw new Error(
      'Factual reference changed. Review extraction and the source lock.',
    );
  const stage = mkdtempSync(resolve(root, '.data-staging-'));
  try {
    mkdirSync(resolve(stage, 'assets/shapes'), { recursive: true });
    mkdirSync(resolve(stage, 'assets/flags'), { recursive: true });
    const assets: {
      path: string;
      sha256: string;
      source: string;
      transformation: string;
    }[] = [];
    const states: StateRecord[] = [];
    for (const fact of facts) {
      console.log(`Collecting ${fact.name}…`);
      const flag = flags.find((f) => f.abbreviation === fact.abbreviation);
      if (!flag) throw new Error(`Missing reviewed flag: ${fact.abbreviation}`);
      const { bytes } = await download(flag.url, flag);
      const shape = stateAssetPath(fact.name, 'shape');
      const flagPath = stateAssetPath(fact.name, 'flag');
      const shapeText = outlineSvg(
        shapes.get(fact.abbreviation)!.geometry,
        fact.abbreviation,
      );
      const flagText = cleanFlagSvg(new TextDecoder().decode(bytes));
      writeFileSync(resolve(stage, shape), shapeText);
      writeFileSync(resolve(stage, flagPath), flagText);
      states.push({
        id: `us-${fact.abbreviation.toLowerCase()}`,
        ...fact,
        shape,
        flag: flagPath,
      });
      assets.push(
        {
          path: shape,
          sha256: hash(shapeText),
          source: lock.sources.boundaries.url,
          transformation:
            fact.abbreviation === 'HI'
              ? 'Equal-area projection; main islands above a separately fitted Northwestern Hawaiian Islands inset; all Census polygons retained.'
              : 'State-centered equal-area projection, uniform fit with padding; every Census polygon and inner ring retained.',
        },
        {
          path: flagPath,
          sha256: hash(flagText),
          source: flag.page,
          transformation:
            'Removed XML metadata, titles, descriptions, editor attributes and invalid nonfinite opacity attributes; preserved authentic flag artwork and native proportions. Obverse side.',
        },
      );
    }
    const dataset: Dataset = {
      schemaVersion: 1,
      sample: false,
      properties,
      states,
    };
    writeFileSync(
      resolve(stage, 'dataset.json'),
      JSON.stringify(dataset, null, 2) + '\n',
    );
    writeFileSync(
      resolve(stage, 'provenance.json'),
      JSON.stringify(
        {
          schemaVersion: 1,
          collectedAt: new Date().toISOString(),
          sourceLock: lock,
          assets,
        },
        null,
        2,
      ) + '\n',
    );
    validateData(stage, { complete: true, sourceLock: lock });
    writeGallery(stage);
    if (refresh) writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n');
    const backup = resolve(root, `.data-backup-${Date.now()}`);
    if (existsSync(target)) renameSync(target, backup);
    try {
      renameSync(stage, target);
    } catch (error) {
      if (existsSync(backup)) renameSync(backup, target);
      throw error;
    }
    console.log(
      `Validated and installed 50 states and 100 SVGs in data/.${existsSync(backup) ? ` Previous data preserved at ${backup}.` : ''}`,
    );
  } finally {
    if (existsSync(stage)) rmSync(stage, { recursive: true, force: true });
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  collect().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
