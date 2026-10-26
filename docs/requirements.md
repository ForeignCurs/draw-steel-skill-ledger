# Agreed campaign rules

Draw Steel combat remains unchanged. Montage and roleplaying skills use D100 roll-under checks. The website prepares and updates printed sheets; it does not roll dice.

## Skill formula

20 + linked attribute × 5 + 15 if trained + creation allocation + advancement allocation.

Standard skills are always available. Only skill grants unlock professional skills. Each grant trains one skill, respecting the group chosen outside the app. The user enters attributes and grants manually; culture/career automation is deferred. Training is a boolean, not a stacking bonus.

Craft, Culture, and Lore have named specialties. Every specialty has its own grant and point allocations. Suggested names come from the reviewed workbook; custom names are allowed. Unresolved distinctions between suggested Lore names are left editable rather than merged without a decision.

## Point pools

- Creation: 150 total points, at most 15 per skill.
- Advancement: cumulative XP since creation × 2 points per XP.
- Advancement limit: current level × 5 per skill, separate from creation points. This is cumulative, with no spending ledger by historical level.
- The points-per-XP conversion and advancement allowance are editable per character.
- Unspent points remain available, without a cap on the saved total.
- No overall skill percentage cap.
- Attributes recalculate linked skills; lowering XP, level, or settings preserves allocations and reports any excess.

## Workflow and storage

Multiple characters saved in the current browser. Five sections: character attributes, manual grants, creation allocation, advancement, sheet/PDF. No accounts or server-side character storage. JSON backup/import supports moving or restoring a character; an import creates a separate copy.

## Print/PDF

PDF export is a first-version priority. Group skills by category, alphabetically within each group. Include names, linked attributes, final percentages, and separate creation/advancement totals. Omit descriptions and individual level history. A4, extending to more pages when necessary. All standard skills plus acquired professional skills appear.

## Reviewed catalog

Source: only the workbook's Reduced Skill List. 44 definitions: 14 standard, 30 professional.

- Brawn: Might, Exploration, lifting/pushing/pulling/forcing. Remains standard.
- Athletics: climbing/jumping/running. Remove Lift from its aliases.
- Disrupt Magic: Intuition, Intrigue, professional; replace inherited lockpicking description with magic disruption.
- Escape Artist includes lockpicking.
- Hide includes moving quietly; Sneak is an alias.
- Brag remains an alias of Intimidate and Persuade, not a new skill.
- Add the agreed descriptions to Bureaucracy, Commerce, Instruction, Survival, and Research; broaden Rumors to include gathering information.
- Cooking, Survival, Navigate, Eavesdrop, and Gymnastics deliberately remain professional.
- Trim Survival's attribute whitespace and correct Strategy's spelling in Lore suggestions.

The source workbook is not overwritten. The reviewed catalog is checked in as public/catalog.js.
