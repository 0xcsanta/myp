/**
 * Le moteur de regles, eprouve sur les vraies donnees du MScIS extraites du
 * plan d'etudes officiel 2025-2026. Pas de donnees inventees : si le parseur
 * PDF derive, ces tests tombent.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validate, LEVEL } from '../src/index.js';
import { toCatalogue } from '../src/adapt.js';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../../../..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const rules = read('data/rules/mscis-2025-2026.json');
const catalogue = toCatalogue(read('data/programmes/mscis-2025-2026.json'));

const byModule = (code) => catalogue.filter((c) => c.module === code);
const ids = (cs) => cs.map((c) => c.id);
const codes = (r) => r.diagnostics.map((d) => d.code);

test('le plan d\'etudes MScIS totalise bien 90 credits', () => {
  assert.equal(rules.totalEcts, 90);
  assert.equal(rules.modules.filter((m) => !m.parent).length, 4);
});

test('une selection vide signale chaque module en manque', () => {
  const r = validate([], rules, catalogue);
  assert.equal(r.total, 0);
  assert.equal(r.valid, false);
  const mins = r.diagnostics.filter((d) => d.code === 'module_min');
  assert.ok(mins.length >= 4, 'au moins un manque par module racine');
  assert.ok(mins.every((d) => d.level === LEVEL.ERROR));
});

test('les modules obligatoires seuls font 30 credits et laissent le reste en manque', () => {
  const sel = ids([...byModule('M1'), ...byModule('M2')]);
  const r = validate(sel, rules, catalogue);
  assert.equal(r.total, 30);
  assert.equal(r.byModule.M1, 18);
  assert.equal(r.byModule.M2, 12);
  assert.ok(codes(r).includes('module_min'));
  assert.equal(r.valid, false);
});

test('les credits d\'un sous-module remontent dans son parent', () => {
  const memoire = byModule('SM4.2').map((c) => c.id);
  const seminaire = byModule('SM4.1').slice(0, 1).map((c) => c.id);
  const r = validate([...memoire, ...seminaire], rules, catalogue);
  assert.equal(r.byModule['SM4.2'], 24);
  assert.equal(r.byModule['SM4.1'], 3);
  // le Module 4 n'a aucun cours en propre : il vaut la somme de ses enfants
  assert.equal(r.byModule.M4, 27);
});

test('le memoire est verrouille sous 60 credits aux modules 1, 2 et 3', () => {
  const r = validate(ids(byModule('SM4.2')), rules, catalogue);
  const locked = r.diagnostics.find((d) => d.code === 'locked');
  assert.ok(locked, 'le verrou du memoire doit se declencher');
  assert.equal(locked.level, LEVEL.ERROR);
  assert.equal(locked.need, 60);
});

test('un plan complet et conforme est declare valide', () => {
  const m3 = byModule('M3')
    .filter((c) => c.ects === 6)
    .slice(0, 5); // 5 x 6 = 30 credits
  const sm41 = byModule('SM4.1').filter((c) => c.ects === 3).slice(0, 2); // 6
  const sel = ids([
    ...byModule('M1'), ...byModule('M2'), ...m3, ...sm41, ...byModule('SM4.2'),
  ]);
  const r = validate(sel, rules, catalogue);
  assert.equal(r.total, 90, `total obtenu ${r.total}`);
  assert.equal(r.valid, true, JSON.stringify(r.diagnostics.filter(d => d.level === 'error'), null, 1));
  assert.ok(codes(r).includes('plan_valid'));
});

test('depasser les 90 credits est signale, avec l\'ecart exact', () => {
  const m3 = byModule('M3').filter((c) => c.ects === 6).slice(0, 6); // 36 au lieu de 30
  const sm41 = byModule('SM4.1').filter((c) => c.ects === 3).slice(0, 2);
  const sel = ids([
    ...byModule('M1'), ...byModule('M2'), ...m3, ...sm41, ...byModule('SM4.2'),
  ]);
  const r = validate(sel, rules, catalogue);
  assert.equal(r.total, 96);
  const over = r.diagnostics.find((d) => d.code === 'total_over');
  assert.ok(over, 'le depassement doit etre signale');
  assert.match(over.message, /6 de plus/);
});

test('un chevauchement d\'horaire est detecte', () => {
  const a = { ...catalogue[0], id: 'a', title: 'Cours A',
    slots: [{ semester: 'autumn', weekday: 'Lundi', startMin: 855, endMin: 1080 }] };
  const b = { ...catalogue[1], id: 'b', title: 'Cours B',
    slots: [{ semester: 'autumn', weekday: 'Lundi', startMin: 900, endMin: 1020 }] };
  const r = validate(['a', 'b'], rules, [a, b]);
  const clash = r.diagnostics.find((d) => d.code === 'time_clash');
  assert.ok(clash, 'deux cours au meme creneau doivent se signaler');
  assert.equal(clash.weekday, 'Lundi');
});

test('un horaire non publie n\'invente jamais de creneau', () => {
  const sansHoraire = catalogue.filter((c) => !c.scheduleKnown);
  assert.ok(sansHoraire.length > 0, 'le plan d\'etudes ne porte pas les horaires');
  assert.ok(sansHoraire.every((c) => c.slots.length === 0));
});
