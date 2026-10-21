import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';

/** Keep original flag artwork, including lettering belonging to the design. */
export function cleanFlagSvg(input: string): string {
  if (XMLValidator.validate(input) !== true)
    throw new Error('Invalid flag XML.');
  // Preserve painter order: regrouping repeated XML elements changes flag artwork.
  const parser = new XMLParser({
    preserveOrder: true,
    ignoreAttributes: false,
    parseTagValue: false,
    processEntities: false,
  });
  type Node = { [key: string]: Node[] | Record<string, string> | string };
  const doc = parser.parse(input) as Node[];
  function clean(nodes: Node[]): Node[] {
    return nodes
      .filter(
        (node) =>
          !Object.keys(node).some(
            (key) =>
              ['title', 'desc', 'metadata'].includes(key) ||
              key.startsWith('?') ||
              key.startsWith('!') ||
              /^(?:sodipodi|inkscape|rdf|cc|dc):/.test(key),
          ),
      )
      .map((node) => {
        for (const [key, value] of Object.entries(node)) {
          if (key === ':@') {
            const attrs = value as Record<string, string>;
            // Indiana's upstream SVG contains opacity="NaN". Browsers ignore it;
            // removing it keeps that same default opacity and valid numeric values.
            if (/^(?:NaN|Infinity)$/.test(attrs['@_opacity'] ?? ''))
              delete attrs['@_opacity'];
            for (const attr of Object.keys(attrs))
              if (
                /^@_(?:on|aria-|inkscape:|sodipodi:|xmlns:(?:inkscape|sodipodi|rdf|cc|dc))/.test(
                  attr,
                ) ||
                attr === '@_role'
              )
                delete attrs[attr];
          } else if (Array.isArray(value)) node[key] = clean(value);
        }
        return node;
      });
  }
  const cleaned = clean(doc);
  if (!cleaned.some((node) => 'svg' in node))
    throw new Error('Expected an SVG flag.');
  const root = cleaned.find((node) => 'svg' in node)!;
  const attrs = (root[':@'] ?? {}) as Record<string, string>;
  if (!attrs['@_viewBox']) {
    const width = Number(String(attrs['@_width']).replace(/px$/, ''));
    const height = Number(String(attrs['@_height']).replace(/px$/, ''));
    if (
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width <= 0 ||
      height <= 0
    )
      throw new Error('Cannot infer flag viewBox.');
    attrs['@_viewBox'] = `0 0 ${width} ${height}`;
    root[':@'] = attrs;
  }
  const result = new XMLBuilder({
    preserveOrder: true,
    ignoreAttributes: false,
    processEntities: false,
  }).build(cleaned) as string;
  assertLocalSvg(result);
  return result + '\n';
}

export function assertLocalSvg(svg: string) {
  if (
    XMLValidator.validate(svg) !== true ||
    /\b(?:NaN|Infinity)\b/.test(svg) ||
    !/<svg\b/.test(svg) ||
    /<(?:script|foreignObject|image|iframe|title|desc|metadata)\b|<!DOCTYPE|<!ENTITY|\bon\w+\s*=|(?:href|xlink:href)\s*=\s*["'](?!#)|@import/i.test(
      svg,
    ) ||
    [...svg.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)].some(
      (match) => !match[2].trim().startsWith('#'),
    )
  ) {
    throw new Error(
      'SVG must be self-contained artwork with no metadata, scripts, or external resources.',
    );
  }
  const root = new XMLParser({ ignoreAttributes: false }).parse(svg)
    .svg as Record<string, unknown>;
  const bounds = String(root['@_viewBox'] ?? '')
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (
    bounds.length !== 4 ||
    bounds.some((n) => !Number.isFinite(n)) ||
    bounds[2] <= 0 ||
    bounds[3] <= 0
  )
    throw new Error('SVG needs a positive, finite viewBox.');
  if (!/<(?:path|rect|polygon|circle|ellipse|use)\b/.test(svg))
    throw new Error('SVG has no artwork.');
}
