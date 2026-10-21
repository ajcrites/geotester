# Geography data sources

## Reviewed snapshot

Sources and artwork were reviewed on 2026-10-21. The local collection contains the 50 US states, excluding DC and territories. Collected records and images remain in ignored `data/`; this document and [the source lock](../scripts/source-lock.json) retain provenance without committing the dataset.

The lock records original download URLs, SHA-256 hashes, retrieval timestamps, Commons revision timestamps, creators, credits, and reuse terms. `data/provenance.json` adds output hashes and transformations for all 100 assets. The tracked [gallery HTML](../scripts/templates/gallery.html) is copied unchanged to `data/gallery.html` during installation or with `npm run data:gallery`; it reads adjacent local JSON files and distributes the credits alongside an offline inspection gallery. Normal collection reproduces this reviewed snapshot, rather than silently taking newer artwork. An upstream hash change stops collection and requires source review. Future flag changes require a deliberate refresh and a new review date.

## Selection and factual checks

* **Outlines:** [U.S. Census Bureau 2025 cartographic boundary files](https://www.census.gov/geographies/mapping-files/2025/geo/carto-boundary-file.html), state layer at 1:500,000. The nationwide KML ZIP is small enough for repeatable collection and retains islands and coastal detail. This is preferable to hand-drawn silhouettes or third-party icon collections with unclear geography or terms. Files are generalized for small-scale display, not geographic analysis or precise boundaries.
* **State membership, names, FIPS and postal codes:** [Census ANSI reference](https://www.census.gov/library/reference/code-lists/ansi/ansi-codes-for-states.html) and its pipe-delimited [state code file](https://www2.census.gov/geo/docs/reference/state.txt). Names/codes are independently joined against the boundary attributes, with an explicit 50-state allowlist. Stable record IDs use `us-` plus lowercase USPS code; asset filenames use lowercase state names with hyphens and a `-shape.svg` or `-flag.svg` suffix. FIPS codes remain in the records as metadata.
* **Capitals:** [Minnesota Legislative Reference Library's archived 1975–76 Legislative Manual](https://www.lrl.mn.gov/docs/2013/other/130552.pdf), printed page 515 / PDF page 517. The script extracts the three-column capital table by word coordinates, joins all 50 names against Census, and pins the digest of the resulting facts. This is an older official reference, not a 2013 or 2026 publication; the URL is the archive's path. Its capital values were checked during this collection. Two explicit corrections are retained in code: `Montomgery` → `Montgomery`, confirmed against [Alabama's governor contact page](https://governor.alabama.gov/contact/), and OCR `5t. Paul` → `St. Paul`, confirmed against [Saint Paul's city government](https://www.stpaul.gov/). Do not reproduce the old ZIP codes or population figures.
* **Flags:** [Wikimedia Commons SVG state-flag collection](https://commons.wikimedia.org/wiki/Category:SVG_flags_of_states_of_the_United_States). Commons supplies scalable artwork and per-file revision, author and licensing records, unlike hotlinked flag thumbnails without provenance. The Commons API is queried in one batch. Georgia is explicitly disambiguated from the country. Oregon uses its obverse; the different beaver reverse is outside this dataset.
* **Flag verification baseline:** [U.S. Senate / GPO, Our Flag, Senate Document 109-18](https://www.govinfo.gov/content/pkg/CDOC-109sdoc18/pdf/CDOC-109sdoc18.pdf), printed pages 26–38 / PDF pages 32–44. Reviewed all 50 state illustrations against the collected designs, with the later changes and active redesign questions checked against the state sources below. This older publication is a verification reference, not the source of redistributed artwork. Its illustrations are not extracted into the app. Official-source page keyword checks catch obvious source failures during refresh; they do not replace visual or factual review.

## Official checks for later designs and special cases

* **AL:** [Independent confirmation of Montgomery; corrects the capitals reference typo Montomgery.](https://governor.alabama.gov/contact/) Retrieved 2026-10-21.
* **MN:** [White eight-point star in dark blue hoist; bright blue fly, adopted May 11, 2024.](https://www.sos.mn.gov/about-minnesota/state-symbols/state-flag/) Retrieved 2026-10-21.
* **UT:** [Use the new beehive design, not the historical seal flag.](https://flag.utah.gov/) Retrieved 2026-10-21.
* **MS:** [New Magnolia flag; the state explicitly permits public use.](https://www.mdah.ms.gov/msflag) Retrieved 2026-10-21.
* **LA:** [Current pelican design includes three drops of blood.](https://www.sos.la.gov/archives/state-flag-and-seal) Retrieved 2026-10-21.
* **NY:** [Arms include E pluribus unum under Excelsior (2020 update).](https://www.nysenate.gov/legislation/laws/STL/70?print=1) Retrieved 2026-10-21.
* **ME:** [Current law specifies blue field with coat of arms; not the proposed pine tree flag.](https://legislature.maine.gov/statutes/1/title1sec206.html) Retrieved 2026-10-21.
* **MA:** [Redesign proposals do not replace the current adopted flag.](https://www.mass.gov/orgs/massachusetts-seal-flag-and-motto-advisory-commission) Retrieved 2026-10-21.
* **IL:** [White field with seal and Illinois below; proposed contest designs are excluded.](https://www.museum.state.il.us/exhibits/symbols/flag.html) Retrieved 2026-10-21.
* **OR:** [Use the obverse (escutcheon), not the distinct beaver reverse.](https://www.oregonlegislature.gov/bills_laws/ors/ors186.html) Retrieved 2026-10-21.

## Reuse and attribution

* **Census outlines:** federal Census geographic data; public-domain source, with acknowledgement explicitly requested by the included `cb_2025_us_state_500k.kml.iso.xml` metadata. Its Use Constraints permit use in products and publications with acknowledgement of the U.S. Census Bureau. Credit: **Outlines derived from U.S. Census Bureau, 2025 Cartographic Boundary Files, 1:500,000.** That credit and a source link are included in the gallery. Preserve it in later quiz/credits UI. Observe the source's small-scale visualization limitation; these images are not survey or analysis products.
* **49 flag SVGs:** Commons identifies these specific files as **Public domain**, with no required copyright attribution. Creator and source credit are nevertheless retained below, in the source lock and in the gallery. This is per-file verification, not an assumption that every state-government image is public domain.
* **Mississippi:** **Copyrighted free use**, not public domain. The [Mississippi Department of Archives and History](https://www.mdah.ms.gov/msflag) states that the state owns the design and allows public use. Commons records no attribution requirement; the authors and source are still credited. Preserve the permission distinction in future source updates.
* **State facts:** collect individual geographic facts and identifiers, not the reference publications' prose or page artwork. Raw PDFs and source responses stay in ignored `.cache/collection/` and are not served or copied into the production build.
* **Official insignia:** Commons marks flags as insignia. Copyright permission does not imply government endorsement or remove separate restrictions on official symbols. This app uses them as geography illustrations; it does not alter flag designs.

## Transformations and quiz implications

* All outlines use a state-centered azimuthal equal-area projection, then one uniform scale and translation into a `640 × 440` SVG viewBox with padding. Every polygon and inner ring in the Census state geometry is retained; holes use even-odd filling. No location context, neighboring boundaries, text or added answer labels are drawn.
* Alaska's positive longitudes are unwrapped across the antimeridian so the Aleutian chain does not span the entire world. All its islands are retained. Hawaii's main islands use the upper area; the remote Northwestern Hawaiian Islands use a separately fitted lower inset so the main island chain stays recognizable. Relative position/scale between those two groups is intentionally not geographic; positions within each group and aspect ratios are preserved. Very small islands can remain subpixel at quiz size; SVG zoom retains their geometry.
* Flag XML keeps its painter order, shapes, original proportions, embedded design lettering and symbols. Collection removes titles, descriptions, metadata and editor attributes; it rejects external resources and executable content. Indiana's upstream SVG includes invalid `opacity="NaN"` attributes; collection removes those, preserving the default opacity browsers already use. A missing viewBox is derived from the original dimensions. No recoloring, stretching or redrawing is performed.
* **Authentic lettering is retained.** Several official flags include the state name or initials, including Arkansas, California, Illinois, Iowa, Kansas, Montana, Oklahoma, Oregon and Wisconsin. Removing those words would make inaccurate flags. The requirement to avoid answer labels is implemented for added visible labels and embedded metadata; intrinsic lettering remains an educational clue. The user requested readable state-name filenames, so paths identify their states as well. Later quizzes must use neutral image alternatives before submission and avoid displaying filenames as clues. The named gallery is for review, not quiz play.

## Collection and review workflow

Requires Node.js 22.18+, npm dependencies and `curl` on PATH. The first collection requires network access to the Census, Minnesota legislative archive, GovInfo and Wikimedia; the reference PDFs total about 37 MB. Downloads are serialized/cached and Wikimedia requests are paced. Curl follows redirects and handles retry/backoff with bounded transfer times. A failed run preserves completed downloads and leaves the existing dataset untouched.

```sh
npm ci
npm run data:collect
npm run data:validate
npm run data:gallery
npm run dev
```

Open `/data/gallery.html` on Vite's printed local URL to inspect all outlines and flags. The homepage should report 50 state records; quizzes remain unavailable until implemented.

For an existing sample/dataset, use `npm run data:collect -- --replace`. Collection builds and validates a temporary directory before installing it and preserves the previous directory as an ignored `.data-backup-<timestamp>/`. A plain rerun refuses to overwrite `data/`. Generated data, backups, staging directories and caches remain ignored.

For a new upstream review, use `npm run data:collect -- --replace --refresh-sources --no-cache`. `--no-cache` forces network reads; without it a refresh can reuse already downloaded source responses. Refresh updates the source lock only after the new dataset validates. Review all official sources and the gallery, update this document and the task notes, and verify the resulting lock diff before accepting a new snapshot. A normal rerun never changes the reviewed lock or rechecks mutable official HTML.

The CLI and Vite hook enforce the JSON schemas, factual digest, membership, property capabilities, asset paths and hashes, and local self-contained SVGs before serving/building real data. Builds do not download anything. `npm run test:data` tests malformed data, geometry and SVG cleanup plus full-data regressions when collected data is installed; those full-data tests explicitly skip on an empty checkout.

## Per-file flag provenance

Every file below was retrieved on the stated date. Links lead to the Commons file description with its licensing rationale and full file history; exact original URLs, revision timestamps and content hashes are retained in the source lock. All files use the flag transformation above. No copyright attribution is required by the currently selected files, but these creator credits are distributed in the gallery.

| State code | Source | Creator / credited author | Status | Retrieved |
| --- | --- | --- | --- | --- |
| AL | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Alabama.svg) | Steve Hall | Public domain | 2026-10-21 |
| AK | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Alaska.svg) | Benny Benson | Public domain | 2026-10-21 |
| AZ | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Arizona.svg) | Original: Unknown author Vector: Madden | Public domain | 2026-10-21 |
| AR | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Arkansas.svg) |  | Public domain | 2026-10-21 |
| CA | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_California.svg) | Original: Donald Graeme Kelley Vectorization: Devin Cook | Public domain | 2026-10-21 |
| CO | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Colorado.svg) | Original: Andrew Carlyle Carson Vector: Fleminra | Public domain | 2026-10-21 |
| CT | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Connecticut.svg) | Jean-Pierre Demailly, xrmap authors, Commons users (SVG) | Public domain | 2026-10-21 |
| DE | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Delaware.svg) | xrmap flag collection | Public domain | 2026-10-21 |
| FL | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Florida.svg) | Template:Brendon Tiana | Public domain | 2026-10-21 |
| GA | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_the_State_of_Georgia.svg) |  | Public domain | 2026-10-21 |
| HI | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Hawaii.svg) | Dbenbenn | Public domain | 2026-10-21 |
| ID | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Idaho.svg) | Paul B. Evans, based on a work by the Adjutant General of Idaho and Emma Edwards Green | Public domain | 2026-10-21 |
| IL | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Illinois.svg) | Denelson83 | Public domain | 2026-10-21 |
| IN | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Indiana.svg) | The Indiana state flag was designed by Paul Hadley in 1917. This SVG file was made by Zscout370 with some modifications by HoosierMan1816 . | Public domain | 2026-10-21 |
| IA | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Iowa.svg) |  | Public domain | 2026-10-21 |
| KS | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Kansas.svg) | Xrmap | Public domain | 2026-10-21 |
| KY | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Kentucky.svg) | Commonwealth of Kentucky | Public domain | 2026-10-21 |
| LA | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Louisiana.svg) | Curtis Vann, Jr. | Public domain | 2026-10-21 |
| ME | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Maine.svg) |  | Public domain | 2026-10-21 |
| MD | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Maryland.svg) | Michael Wheeler | Public domain | 2026-10-21 |
| MA | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Massachusetts.svg) | State of Massachusetts | Public domain | 2026-10-21 |
| MI | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Michigan.svg) |  | Public domain | 2026-10-21 |
| MN | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Minnesota.svg) | Original: Minnesota State Emblems Redesign Commission Vector: Jamie Eilat , Undertiago | Public domain | 2026-10-21 |
| MS | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Mississippi.svg) | Rocky Vaughn, Sue Anna Joe, Dominique Pugh, Clay Moss, Kara Giles, Micah Whitson and the Mississippi Department of Archives and History | Copyrighted free use | 2026-10-21 |
| MO | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Missouri.svg) | Marie Watkins Oliver | Public domain | 2026-10-21 |
| MT | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Montana.svg) | N.a | Public domain | 2026-10-21 |
| NE | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Nebraska.svg) | Liamgabby79 | Public domain | 2026-10-21 |
| NV | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Nevada.svg) | Caleb Moore | Public domain | 2026-10-21 |
| NH | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_New_Hampshire.svg) | Xrmap flag collection | Public domain | 2026-10-21 |
| NJ | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_New_Jersey.svg) | author of xrmap, with modifications by Denelson83 and ChrisRuvolo | Public domain | 2026-10-21 |
| NM | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_New_Mexico.svg) |  | Public domain | 2026-10-21 |
| NY | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_New_York.svg) | State of New York | Public domain | 2026-10-21 |
| NC | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_North_Carolina.svg) |  | Public domain | 2026-10-21 |
| ND | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_North_Dakota.svg) | Unknown author Unknown author | Public domain | 2026-10-21 |
| OH | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Ohio.svg) | John Eisenmann | Public domain | 2026-10-21 |
| OK | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Oklahoma.svg) | xrmap | Public domain | 2026-10-21 |
| OR | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Oregon.svg) | User:Denelson83 | Public domain | 2026-10-21 |
| PA | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Pennsylvania.svg) | Simtropolitan , Jean-Pierre Demailly (old version) permission= Insignia This image shows a flag , a coat of arms , a seal or some other official insignia . The use of such symbols is restricted in many countries. These restrictions are independent of the copyright status. | Public domain | 2026-10-21 |
| RI | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Rhode_Island.svg) | Xrmap flag collection 2.7 | Public domain | 2026-10-21 |
| SC | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_South_Carolina.svg) | Design by South Carolina General Assembly , SVG by Steve Hall | Public domain | 2026-10-21 |
| SD | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_South_Dakota.svg) | xrmap | Public domain | 2026-10-21 |
| TN | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Tennessee.svg) | -xfi- | Public domain | 2026-10-21 |
| TX | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Texas.svg) | Paul B. Joiner | Public domain | 2026-10-21 |
| UT | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Utah.svg) | The State of Utah | Public domain | 2026-10-21 |
| VT | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Vermont.svg) | User:Simtropolitan Original by User:Denelson83 | Public domain | 2026-10-21 |
| VA | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Virginia.svg) | LadyofHats with additional editing by 痛 and Patrickneil / Charles Keck | Public domain | 2026-10-21 |
| WA | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Washington.svg) | WA Secretary of State | Public domain | 2026-10-21 |
| WV | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_West_Virginia.svg) | Militaryace , Denelson83 | Public domain | 2026-10-21 |
| WI | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Wisconsin.svg) |  | Public domain | 2026-10-21 |
| WY | [SVG source](https://commons.wikimedia.org/wiki/File:Flag_of_Wyoming.svg) | User:Dbenbenn | Public domain | 2026-10-21 |
