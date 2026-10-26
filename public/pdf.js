import { ATTRIBUTES, GROUPS, availableSkills, budgets, issues } from './model.js';

/** Creates a real, selectable-text A4 PDF. All PDF dependencies run in the browser. */
export async function createSkillPdf(character, { PDFDocument, StandardFonts, rgb }) {
  if (issues(character).length) throw new Error('Resolve allocation warnings before exporting.');
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const title = await pdf.embedFont(StandardFonts.TimesRoman);
  const ink = rgb(.12, .17, .16), muted = rgb(.36, .4, .38), green = rgb(.10, .25, .22), light = rgb(.94, .95, .93), line = rgb(.82, .84, .81);
  const width = 595.28, height = 841.89, margin = 34, gap = 24, columnWidth = (width - margin * 2 - gap) / 2;
  const skills = availableSkills(character), budget = budgets(character);
  const pages = [];
  let page, column = 0, y = 0, contentTop = 0;
  const wrap = (text, font, size, maxWidth) => {
    const words = String(text).replace(/[\r\n\t]+/g, ' ').split(/\s+/), result = []; let current = '';
    for (const word of words) {
      let rest = word;
      while (font.widthOfTextAtSize(rest, size) > maxWidth) {
        if (current) { result.push(current); current = ''; }
        let count = 1;
        while (count < rest.length && font.widthOfTextAtSize(rest.slice(0, count + 1), size) <= maxWidth) count++;
        result.push(rest.slice(0, count)); rest = rest.slice(count);
      }
      const next = current ? `${current} ${rest}` : rest;
      if (font.widthOfTextAtSize(next, size) > maxWidth && current) { result.push(current); current = rest; } else current = next;
    }
    if (current || !result.length) result.push(current);
    return result;
  };
  const text = (value, x, top, font = regular, size = 9, color = ink) => page.drawText(String(value), { x, y: top, font, size, color });
  const right = (value, x, top, font = regular, size = 9) => { let fitted = size; while (font.widthOfTextAtSize(String(value), fitted) > 43 && fitted > 6) fitted -= .5; text(value, x - font.widthOfTextAtSize(String(value), fitted), top, font, fitted); };
  function newPage() {
    page = pdf.addPage([width, height]); pages.push(page); column = 0;
    text('STEEL & STORY  /  CAMPAIGN SKILL SHEET', margin, height - 39, bold, 8, green);
    let top = height - 72;
    for (const name of wrap(character.name, title, 26, width - margin * 2)) { text(name, margin, top, title, 26); top -= 29; }
    top -= 2;
    for (const row of wrap(`${character.campaign || 'Draw Steel campaign'}  |  Level ${character.level}  |  ${character.xp} total XP`, regular, 9, width - margin * 2)) { text(row, margin, top, regular, 9, muted); top -= 13; }
    const attrY = top - 45;
    page.drawRectangle({ x: margin, y: attrY - 8, width: width - margin * 2, height: 49, color: light });
    ATTRIBUTES.forEach((a, i) => { const x = margin + 12 + i * ((width - margin * 2) / 5); text(a.toUpperCase(), x, attrY + 23, bold, 7, muted); text(`${character.attributes[a] >= 0 ? '+' : ''}${character.attributes[a]}`, x, attrY + 2, bold, 18, green); });
    contentTop = attrY - 30; y = contentTop;
  }
  function advanceColumn() { if (column === 0) { column = 1; y = contentTop; } else newPage(); }
  const xPosition = () => margin + column * (columnWidth + gap);
  function groupHeader(group, continuation = false) {
    const x = xPosition();
    page.drawRectangle({ x, y: y - 5, width: columnWidth, height: 22, color: green });
    text(`${group.toUpperCase()}${continuation ? ' (CONT.)' : ''}`, x + 8, y + 2, bold, 9, rgb(1, 1, 1));
    y -= 22;
    text('SKILL', x + 3, y, bold, 6.5, muted); text('ATTRIBUTE', x + 119, y, bold, 6, muted);
    text('CREATE', x + 167, y, bold, 6, muted); text('ADV.', x + 196, y, bold, 6, muted); text('TOTAL', x + 222, y, bold, 6, muted);
    y -= 9;
  }
  newPage();
  for (const group of GROUPS) {
    const groupSkills = skills.filter(s => s.group === group);
    if (!groupSkills.length) continue;
    if (y - 65 < 82) advanceColumn();
    groupHeader(group);
    for (const skill of groupSkills) {
      const names = wrap(`${skill.name}${skill.trained ? ' *' : ''}`, regular, 8.7, 112);
      const rowHeight = Math.max(20, names.length * 11 + 8);
      if (y - rowHeight < 82) { advanceColumn(); groupHeader(group, true); }
      const x = xPosition(), top = y - 11;
      names.forEach((name, i) => text(name, x + 3, top - i * 11, regular, 8.7));
      text(skill.attribute, x + 119, top, regular, 7.5, muted);
      right(skill.creation, x + 184, top, regular, 8);
      right(skill.advancement, x + 209, top, regular, 8);
      right(`${skill.total}%`, x + columnWidth - 3, top, bold, 9.5);
      page.drawLine({ start: { x, y: y - rowHeight + 3 }, end: { x: x + columnWidth, y: y - rowHeight + 3 }, thickness: .4, color: line });
      y -= rowHeight;
    }
    y -= 12;
  }
  pages.forEach((p, i) => {
    page = p;
    page.drawLine({ start: { x: margin, y: 74 }, end: { x: width - margin, y: 74 }, thickness: .6, color: line });
    text('* Trained (+15%). Total = 20 + attribute x 5 + training + creation + advancement.', margin, 60, regular, 7, muted);
    text(`Creation: ${budget.creationSpent}/150 spent, ${budget.creationRemaining} remaining. Advancement: ${budget.advancementSpent}/${budget.advancementBudget} spent, ${budget.advancementRemaining} remaining.`, margin, 46, regular, 7, muted);
    text(`${character.rules.pointsPerXp} points per XP. ${character.rules.perSkillPerLevel} advancement points per level per skill.`, margin, 32, regular, 7, muted);
    right(`${i + 1} / ${pages.length}`, width - margin, 32, regular, 7);
  });
  pdf.setTitle(`${character.name} - Skill Sheet`); pdf.setAuthor('Steel & Story'); pdf.setSubject('Draw Steel campaign skills');
  return pdf.save();
}
