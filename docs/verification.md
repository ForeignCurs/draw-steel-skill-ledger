# Verification

Verified locally on 26 October 2026.

## Automated checks

`npm test`: 15 passing tests for catalog corrections, skill availability and formula, creation/advancement budgets, saved points, unlimited skill percentages, specialties and duplicate training, removing grants, lowered settings, invalid input, independent character storage, backup validation, A4 PDF generation, and multi-page PDF export.

`npm run build`: static output generated successfully. JavaScript syntax checks passed.

## Browser story

Using the actual interface:

1. Created and named a character; entered Might 2 and Presence 1.
2. Trained Deceive, unlocked Bureaucracy, and added Lore: History as a separate specialty.
3. Allocated 15/10/12 creation points to those skills, respectively.
4. Entered level 2 and cumulative XP 16; verified 32 advancement points and a 10-point allowance per skill.
5. Spent 10 advancement points on Deceive and verified its 65% total.
6. Lowered the per-skill setting to 2; verified existing points were kept and flagged above the new four-point allowance.
7. Reduced Deceive's advancement allocation to four; reloaded and verified the value persisted.
8. Downloaded a PDF and a JSON backup through the app's buttons.
9. Imported the backup and verified it created a separate character in the library.

The editor saves live input without replacing the focused input node. Browser error logs were empty during the verified flow.

## PDF inspection

Rendered the complete 44-skill catalog to PNG with Poppler and visually inspected the resulting one-page A4 sheet. Text, attributes, percentages, grouped headings, separate spending totals, and footer were legible and unclipped.

A stress fixture with 100 long additional Lore specialties generated five pages. PDF text extraction confirmed the final specialty was present.

## Scope

No live Vercel deployment was requested or performed. `vercel.json` supplies the static build command and output directory for a GitHub import. Data is stored per browser origin; JSON backups support moving characters between origins/devices.
