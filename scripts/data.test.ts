import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateData } from './validate-data.ts';
import { cleanFlagSvg, assertLocalSvg } from './svg.ts';
import { outlineSvg } from './collect-data.ts';
import type { Dataset } from '../src/domain/data.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
function temporary(run: (directory: string) => void) {
  const directory = mkdtempSync(resolve(tmpdir(), 'geotester-data-test-'));
  try {
    run(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
function fixture(directory: string) {
  cpSync(resolve(root, 'scripts/fixtures'), directory, { recursive: true });
}
function change(directory: string, fn: (dataset: Dataset) => void) {
  const path = resolve(directory, 'dataset.json');
  const dataset = JSON.parse(readFileSync(path, 'utf8')) as Dataset;
  fn(dataset);
  writeFileSync(path, JSON.stringify(dataset));
}
test('empty source allowed only when directory is absent', () =>
  temporary((directory) => {
    assert.equal(validateData(resolve(directory, 'absent')), null);
    assert.throws(() => validateData(directory), /Missing/);
    assert.throws(
      () => validateData(resolve(directory, 'absent'), { complete: true }),
      /Missing/,
    );
  }));
test('fictional fixture still validates but is not a complete dataset', () =>
  temporary((directory) => {
    fixture(directory);
    assert.equal(validateData(directory)?.states.length, 1);
    assert.throws(
      () => validateData(directory, { complete: true }),
      /50 states/,
    );
  }));
for (const [name, mutate, expected] of [
  [
    'duplicate ID',
    (data: Dataset) => data.states.push({ ...data.states[0] }),
    /Duplicate state ID/,
  ],
  [
    'missing capital',
    (data: Dataset) => {
      data.states[0].capital = '';
    },
    /missing capital/,
  ],
  [
    'unsafe asset',
    (data: Dataset) => {
      data.states[0].shape = 'assets/../../outside.svg';
    },
    /Missing or unsafe/,
  ],
  [
    'missing asset',
    (data: Dataset) => {
      data.states[0].flag = 'assets/missing.svg';
    },
    /Missing or unsafe/,
  ],
] as const)
  test(`rejects ${name}`, () =>
    temporary((directory) => {
      fixture(directory);
      change(directory, mutate);
      assert.throws(() => validateData(directory), expected);
    }));
test('rejects symlinks escaping data directory', () =>
  temporary((directory) => {
    fixture(directory);
    symlinkSync(
      resolve(root, 'README.md'),
      resolve(directory, 'assets/external.svg'),
    );
    change(directory, (data) => {
      data.states[0].shape = 'assets/external.svg';
    });
    assert.throws(() => validateData(directory), /Unsafe asset/);
  }));
test('SVG cleanup preserves painter order, references, and authentic text while removing metadata', () => {
  const svg = cleanFlagSvg(
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="60"><title>Answer</title><metadata>Answer</metadata><path id="back" d="M0 0H100V60Z"/><rect width="50" height="60"/><path d="M10 10H20V20Z"/><text x="5" y="30">AUTHENTIC MOTTO</text><use href="#back"/></svg>',
  );
  assert.ok(
    svg.indexOf('id="back"') < svg.indexOf('<rect') &&
      svg.indexOf('<rect') < svg.lastIndexOf('<path'),
  );
  assert.ok(!svg.includes('Answer'));
  assert.ok(svg.includes('AUTHENTIC MOTTO'));
  assert.ok(svg.includes('viewBox="0 0 100 60"'));
});
test('rejects executable and externally dependent artwork', () => {
  for (const body of [
    '<script>alert(1)</script>',
    '<image href="https://example.com/x.png"/>',
    '<use href="https://example.com/a.svg#x"/>',
    '<rect style="fill:url(https://example.com/x)"/>',
  ]) {
    assert.throws(
      () => assertLocalSvg(`<svg viewBox="0 0 10 10">${body}</svg>`),
      /self-contained/,
    );
  }
  assert.doesNotThrow(() =>
    assertLocalSvg(
      '<svg viewBox="0 0 10 10"><path id="p" d="M0 0L1 1"/><use href="#p" style="fill:url( #p )"/></svg>',
    ),
  );
});
test('normalizes invalid opacity in upstream artwork without changing geometry', () => {
  const result = cleanFlagSvg(
    '<svg viewBox="0 0 10 10"><path opacity="NaN" d="M0 0H10V10Z"/></svg>',
  );
  assert.ok(!result.includes('NaN'));
  assert.ok(result.includes('d="M0 0H10V10Z"'));
});
test('outline keeps separate islands and inner rings in one uniformly fitted viewBox', () => {
  const svg = outlineSvg(
    [
      [
        [
          [-76, 40],
          [-75, 40],
          [-75, 41],
          [-76, 40],
        ],
        [
          [-75.9, 40.1],
          [-75.8, 40.1],
          [-75.8, 40.2],
          [-75.9, 40.1],
        ],
      ],
      [
        [
          [-74.9, 40],
          [-74.8, 40],
          [-74.8, 40.1],
          [-74.9, 40],
        ],
      ],
    ],
    'XX',
  );
  assert.equal((svg.match(/<path /g) ?? []).length, 2);
  assert.equal((svg.match(/M/g) ?? []).length, 3);
  assert.ok(svg.includes('fill-rule="evenodd"'));
  assert.ok(!svg.includes('NaN'));
});

const hasData = existsSync(resolve(root, 'data/provenance.json'));
test(
  'complete collected dataset matches reviewed facts and every local asset',
  { skip: !hasData },
  () => {
    assert.equal(
      validateData(resolve(root, 'data'), { complete: true })?.states.length,
      50,
    );
  },
);
for (const [name, mutate, expected] of [
  [
    'DC substituted for a state',
    (data: Dataset) => {
      data.states[0].abbreviation = 'DC';
    },
    /50 US states/,
  ],
  [
    'wrong capital',
    (data: Dataset) => {
      data.states[0].capital = 'Not the capital';
    },
    /reviewed official references/,
  ],
  [
    'changed state name',
    (data: Dataset) => {
      data.states[0].name = 'Not the state';
    },
    /reviewed official references/,
  ],
  [
    'image fill-in mode',
    (data: Dataset) => {
      data.properties!.find((p) => p.id === 'flag')!.modes.push('fill-in');
    },
    /Property metadata/,
  ],
  [
    'reused image',
    (data: Dataset) => {
      data.states[1].shape = data.states[0].shape;
    },
    /reused|naming/,
  ],
] as const)
  test(`complete validation rejects ${name}`, { skip: !hasData }, () =>
    temporary((directory) => {
      cpSync(resolve(root, 'data'), directory, { recursive: true });
      change(directory, mutate);
      assert.throws(
        () => validateData(directory, { complete: true }),
        expected,
      );
    }),
  );
test(
  'complete validation detects modified asset bytes',
  { skip: !hasData },
  () =>
    temporary((directory) => {
      cpSync(resolve(root, 'data'), directory, { recursive: true });
      const data = JSON.parse(
        readFileSync(resolve(directory, 'dataset.json'), 'utf8'),
      ) as Dataset;
      writeFileSync(
        resolve(directory, data.states[0].shape),
        '<svg viewBox="0 0 10 10"><path d="M0 0L1 1"/></svg>',
      );
      assert.throws(
        () => validateData(directory, { complete: true }),
        /changed asset/,
      );
    }),
);
