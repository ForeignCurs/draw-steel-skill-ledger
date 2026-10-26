import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../public/catalog.js';
import { newCharacter, availableSkills, addGrant, removeGrant, skillKey, budgets, setAllocation, issues, validateCharacter, loadCharacters, saveCharacters, STORAGE_KEY } from '../public/model.js';

test('reviewed catalog contains complete definitions and agreed corrections', () => {
  assert.equal(CATALOG.length, 44);
  assert.equal(new Set(CATALOG.map(s => s.id)).size, 44);
  assert.equal(CATALOG.filter(s => s.type === 'Standard').length, 14);
  assert.ok(CATALOG.every(s => s.description?.trim()));
  assert.deepEqual(CATALOG.filter(s => s.template).map(s => s.name).sort(), ['Craft', 'Culture', 'Lore']);
  const brawn = CATALOG.find(s => s.name === 'Brawn');
  assert.equal(brawn.attribute, 'Might'); assert.equal(brawn.group, 'Exploration');
  assert.ok(!CATALOG.find(s => s.name === 'Athletics').aliases.includes('Lift'));
  assert.ok(!CATALOG.find(s => s.name === 'Disrupt Magic').description.includes('locks'));
});
test('all standard skills are visible; professional skills require grants', () => {
  const c = newCharacter();
  assert.equal(availableSkills(c).length, 14);
  assert.throws(() => setAllocation(c, 'creation', 'bureaucracy', 1), /grant/);
  addGrant(c, 'bureaucracy');
  assert.equal(availableSkills(c).find(s => s.key === 'bureaucracy').total, 35);
});
test('formula handles positive/negative attributes, training, and separate allocations', () => {
  const c = newCharacter(); c.attributes.Presence = 1; addGrant(c, 'deceive');
  assert.equal(availableSkills(c).find(s => s.key === 'deceive').total, 40);
  c.attributes.Presence = -1;
  assert.equal(availableSkills(c).find(s => s.key === 'deceive').total, 30);
  setAllocation(c, 'creation', 'deceive', 15); c.xp = 16; c.level = 2;
  setAllocation(c, 'advancement', 'deceive', 10);
  assert.equal(availableSkills(c).find(s => s.key === 'deceive').total, 55);
});
test('creation enforces 150 total and 15 per skill, allowing saved points', () => {
  const c = newCharacter();
  assert.equal(budgets(c).creationRemaining, 150);
  assert.throws(() => setAllocation(c, 'creation', 'athletics', 16), /15/);
  const skills = availableSkills(c);
  for (const s of skills.slice(0, 10)) setAllocation(c, 'creation', s.key, 15);
  assert.equal(budgets(c).creationRemaining, 0);
  assert.throws(() => setAllocation(c, 'creation', skills[10].key, 1), /remain/);
  setAllocation(c, 'creation', skills[0].key, 0);
  assert.equal(budgets(c).creationRemaining, 15);
});
test('advancement uses cumulative XP, current level allowance, and its own budget', () => {
  const c = newCharacter(); c.xp = 16; c.level = 2;
  assert.equal(budgets(c).advancementBudget, 32);
  assert.equal(budgets(c).advancementLimit, 10);
  setAllocation(c, 'creation', 'athletics', 15);
  setAllocation(c, 'advancement', 'athletics', 10);
  assert.throws(() => setAllocation(c, 'advancement', 'athletics', 11), /10/);
  assert.equal(budgets(c).creationRemaining, 135);
  assert.equal(budgets(c).advancementRemaining, 22);
  c.level = 3; c.xp = 32;
  assert.equal(budgets(c).advancementRemaining, 54);
  setAllocation(c, 'advancement', 'athletics', 15);
});
test('skill percentages have no overall cap', () => {
  const c = newCharacter(); c.attributes.Might = 10; c.level = 20; c.xp = 100;
  addGrant(c, 'athletics'); setAllocation(c, 'creation', 'athletics', 15); setAllocation(c, 'advancement', 'athletics', 100);
  assert.equal(availableSkills(c).find(s => s.key === 'athletics').total, 200);
});
test('specialties are separate, normalize duplicate names, and need individual grants', () => {
  const c = newCharacter();
  const history = addGrant(c, 'lore', 'History');
  const theology = addGrant(c, 'lore', 'Theology');
  setAllocation(c, 'creation', history, 15);
  assert.equal(availableSkills(c).find(s => s.key === theology).creation, 0);
  assert.throws(() => addGrant(c, 'lore', '  HISTORY '), /already/);
  assert.throws(() => addGrant(c, 'craft'), /specialty/);
  assert.throws(() => addGrant(c, 'lore', '  '), /specialty/);
  assert.equal(skillKey('lore', '  Sea   Lore '), 'lore:sea lore');
});
test('training cannot stack and removing professional grants returns their points', () => {
  const c = newCharacter(); const key = addGrant(c, 'lore', 'History');
  c.xp = 3; setAllocation(c, 'creation', key, 12); setAllocation(c, 'advancement', key, 5);
  assert.throws(() => addGrant(c, 'lore', 'History'), /already/);
  removeGrant(c, key);
  assert.equal(budgets(c).creationRemaining, 150); assert.equal(budgets(c).advancementRemaining, 6);
  assert.ok(!availableSkills(c).some(s => s.key === key));
  addGrant(c, 'deceive'); setAllocation(c, 'creation', 'deceive', 3); removeGrant(c, 'deceive');
  assert.equal(availableSkills(c).find(s => s.key === 'deceive').creation, 3);
});
test('lowered settings preserve allocations and expose excess without trapping corrections', () => {
  const c = newCharacter(); c.level = 2; c.xp = 5;
  setAllocation(c, 'advancement', 'athletics', 10);
  c.rules.pointsPerXp = 1; c.rules.perSkillPerLevel = 2;
  assert.equal(c.advancement.athletics, 10); assert.equal(issues(c).length, 2);
  assert.throws(() => setAllocation(c, 'advancement', 'athletics', 11));
  setAllocation(c, 'advancement', 'athletics', 4);
  assert.deepEqual(issues(c), []);
});
test('allocations reject fractional, negative, non-finite, or unavailable values', () => {
  const c = newCharacter();
  for (const value of [-1, .5, NaN, Infinity, '5']) assert.throws(() => setAllocation(c, 'creation', 'athletics', value));
  assert.throws(() => setAllocation(c, 'unknown', 'athletics', 1));
  assert.throws(() => addGrant(c, 'not-in-catalog'));
});
test('multiple characters and settings survive storage and backup validation independently', () => {
  const a = newCharacter('Eléonore'), b = newCharacter('Second'); a.rules.pointsPerXp = 3;
  const k = addGrant(a, 'culture', 'Dwarven'); setAllocation(a, 'creation', k, 7);
  const values = new Map(), storage = { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v) };
  saveCharacters(storage, { characters: [a, b], activeId: a.id });
  const restored = loadCharacters(storage);
  assert.equal(restored.characters.length, 2); assert.equal(restored.activeId, a.id);
  assert.equal(restored.characters[0].creation[k], 7); assert.equal(restored.characters[1].rules.pointsPerXp, 2);
  assert.deepEqual(validateCharacter(JSON.parse(JSON.stringify(a))), a);
  assert.ok(values.get(STORAGE_KEY));
});
test('invalid imports and corrupt storage fail explicitly rather than being overwritten', () => {
  const c = newCharacter();
  for (const bad of [{ ...c, xp: -1 }, { ...c, level: 0 }, { ...c, creation: { bureaucracy: 5 } }, { ...c, grants: [{ catalogId: 'fake', specialty: '' }] }, { ...c, rules: {} }]) assert.throws(() => validateCharacter(bad));
  assert.throws(() => loadCharacters({ getItem: () => '{broken' }));
  assert.throws(() => loadCharacters({ getItem: () => JSON.stringify({ version: 999, characters: [] }) }));
  assert.throws(() => loadCharacters({ getItem: () => JSON.stringify({ version: 1, characters: [c, c] }) }));
});
