# Steel & Story

A browser-local skill ledger for a Draw Steel campaign using homebrew D100 skills. Create characters, select skill grants and specialties, allocate separate creation/advancement points, and download a printable A4 PDF.

## Run locally

Requires Node.js 22 or later.

```sh
npm ci
npm run dev
```

Open the local URL printed by the server. `npm run dev` builds once, then serves `dist/`; rerun the build after changing source files.

```sh
npm test
npm run build
```

## Deploy on Vercel

Import this GitHub repository into Vercel and deploy. The checked-in `vercel.json` specifies:

- Framework preset: Other (`null`).
- Build command: `npm run build`.
- Output directory: `dist`.
- No environment variables, backend, database, or account system required.

Vercel can build the repository on each push through its Git integration. See [Vercel project configuration](https://vercel.com/docs/project-configuration) and [Git deployments](https://vercel.com/docs/git).

## Campaign rules

The complete interview decisions are in [docs/requirements.md](docs/requirements.md).

`20 + attribute × 5 + 15 if trained + creation points + advancement points`

Creation: 150 total, up to 15 per skill. Advancement: cumulative XP × 2, up to level × 5 per skill. The advancement rules can be changed per character. Standard skills are always available; professional skills require grants. Named Craft, Culture, and Lore specialties are independent skills. Saved points and total skill percentages have no overall cap.

## Storage and exports

Characters stay in the current browser's local storage. JSON backups can be imported on another browser or device. Clearing site data removes locally saved characters; a PDF is a play reference, while a JSON backup restores editable data. Changing the site's origin (for example, from a preview domain to a production domain) uses a different browser store; transfer a JSON backup when needed.

The Export PDF button downloads a real PDF generated locally with pdf-lib. The Print sheet button supports the browser's print/Save as PDF flow. Names outside the downloadable PDF's standard font repertoire use the print flow to preserve their text with browser fonts.

## Project layout

- `public/`: static HTML, CSS, app, rules, reviewed catalog, PDF export.
- `scripts/`: static build and local server.
- `test/`: campaign rule, persistence, and PDF checks.
- `scripts/import-catalog.py`: optional one-time provenance helper for the original workbook; **not needed to run, build, or deploy**. Pass the source workbook path as its argument; the helper needs Python and openpyxl.

The original Excel workbook is not included in the repository. Only the reviewed skill list is included.

## Dependencies

The PDF dependency is pdf-lib (MIT); its license is copied into the deployed vendor folder. Interface fonts request DM Sans and Newsreader from Google Fonts, with system/Georgia fallbacks when offline. No character data is transmitted for saving or PDF generation.
