import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as PDFLib from 'pdf-lib';
import { newCharacter, addGrant, setAllocation } from '../public/model.js';
import { CATALOG } from '../public/catalog.js';
import { createSkillPdf } from '../public/pdf.js';

test('downloadable PDF is A4, has character metadata, and fits the whole base catalog on one page', async () => {
  const c = newCharacter('Eléonore the Wanderer'); c.level = 2; c.xp = 16;
  for (const s of CATALOG) addGrant(c, s.id, s.template ? s.suggestions[0] || 'Dwarven' : '');
  setAllocation(c, 'creation', 'athletics', 15); setAllocation(c, 'advancement', 'athletics', 10);
  const bytes = await createSkillPdf(c, PDFLib), pdf = await PDFLib.PDFDocument.load(bytes);
  assert.equal(pdf.getPageCount(), 1);
  assert.equal(pdf.getTitle(), 'Eléonore the Wanderer - Skill Sheet');
  assert.ok(Math.abs(pdf.getPages()[0].getWidth() - 595.28) < .01);
  assert.ok(Math.abs(pdf.getPages()[0].getHeight() - 841.89) < .01);
});
test('long specialty lists paginate instead of truncating the sheet', async () => {
  const c = newCharacter('The chronicler');
  for (let i = 0; i < 100; i++) addGrant(c, 'lore', `A lengthy specialty with many words and a distinct subject number ${i}`);
  const pdf = await PDFLib.PDFDocument.load(await createSkillPdf(c, PDFLib));
  assert.ok(pdf.getPageCount() > 2);
});
test('PDF export blocks inconsistent allocations', async () => {
  const c = newCharacter(); c.xp = 5; setAllocation(c, 'advancement', 'athletics', 5); c.xp = 0;
  await assert.rejects(createSkillPdf(c, PDFLib), /allocation/);
});
