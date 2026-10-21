/** Source selection is deliberately explicit. Updates require a new review. */
export const sources = {
  boundaries:
    'https://www2.census.gov/geo/tiger/GENZ2025/kml/cb_2025_us_state_500k.zip',
  codes: 'https://www2.census.gov/geo/docs/reference/state.txt',
  capitals: 'https://www.lrl.mn.gov/docs/2013/other/130552.pdf',
  flagReference:
    'https://www.govinfo.gov/content/pkg/CDOC-109sdoc18/pdf/CDOC-109sdoc18.pdf',
};

// Reviewed additions/corrections to the federal reference's older illustrations.
export const flagChecks = [
  {
    id: 'AL',
    url: 'https://governor.alabama.gov/contact/',
    contains: 'Montgomery',
    note: 'Independent confirmation of Montgomery; corrects the capitals reference typo Montomgery.',
  },
  {
    id: 'MN',
    url: 'https://www.sos.mn.gov/about-minnesota/state-symbols/state-flag/',
    contains: '2024',
    note: 'White eight-point star in dark blue hoist; bright blue fly, adopted May 11, 2024.',
  },
  {
    id: 'UT',
    url: 'https://flag.utah.gov/',
    contains: 'Beehive',
    note: 'Use the new beehive design, not the historical seal flag.',
  },
  {
    id: 'MS',
    url: 'https://www.mdah.ms.gov/msflag',
    contains: 'magnolia',
    note: 'New Magnolia flag; the state explicitly permits public use.',
  },
  {
    id: 'LA',
    url: 'https://www.sos.la.gov/archives/state-flag-and-seal',
    contains: 'three drops',
    note: 'Current pelican design includes three drops of blood.',
  },
  {
    id: 'NY',
    url: 'https://www.nysenate.gov/legislation/laws/STL/70?print=1',
    contains: 'pluribus',
    note: 'Arms include E pluribus unum under Excelsior (2020 update).',
  },
  {
    id: 'ME',
    url: 'https://legislature.maine.gov/statutes/1/title1sec206.html',
    contains: 'blue',
    note: 'Current law specifies blue field with coat of arms; not the proposed pine tree flag.',
  },
  {
    id: 'MA',
    url: 'https://www.mass.gov/orgs/massachusetts-seal-flag-and-motto-advisory-commission',
    contains: 'recommend',
    note: 'Redesign proposals do not replace the current adopted flag.',
  },
  {
    id: 'IL',
    url: 'https://www.museum.state.il.us/exhibits/symbols/flag.html',
    contains: 'Illinois',
    note: 'White field with seal and Illinois below; proposed contest designs are excluded.',
  },
  {
    id: 'OR',
    url: 'https://www.oregonlegislature.gov/bills_laws/ors/ors186.html',
    contains: 'beaver',
    note: 'Use the obverse (escutcheon), not the distinct beaver reverse.',
  },
];

export interface DownloadSource {
  url: string;
  sha256: string;
  retrievedAt: string;
}
export interface FlagSource extends DownloadSource {
  abbreviation: string;
  page: string;
  revision: string;
  license: string;
  licenseUrl: string;
  author: string;
  credit: string;
  attributionRequired: boolean;
}
export interface SourceLock {
  schemaVersion: 1;
  reviewedAt: string;
  factsSha256: string;
  sources: Record<keyof typeof sources, DownloadSource>;
  checks: (DownloadSource & { id: string; note: string })[];
  flags: FlagSource[];
}
