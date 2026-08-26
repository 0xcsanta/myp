/**
 * Orchestrateur du robot.
 *
 *   node packages/scraper/src/run.js --discover
 *   node packages/scraper/src/run.js --programme=35523
 *   node packages/scraper/src/run.js --faculty=173 --masters-only
 *
 * Tout est incremental : un fichier deja present dans data/raw n'est pas
 * retelecharge, sauf avec --force. Une execution interrompue reprend ou elle
 * s'est arretee, ce qui compte quand le pare feu impose deux secondes et demie
 * entre chaque appel.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openUnil, url, HEC } from './unil.js';
import {
  parseFaculties, parseProgrammes, parseCourseList, parseCourse, parseAgenda,
} from './parse.js';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../../../..');
const RAW = path.join(ROOT, 'data', 'raw');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);

const log = (m) => console.log(m);
const ok = (m) => console.log(`  ${m}`);

function save(rel, data) {
  const file = path.join(RAW, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 1), 'utf8');
  return file;
}
function load(rel) {
  const file = path.join(RAW, rel);
  if (!args.force && !args.reparse && fs.existsSync(file)) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* refaire */ }
  }
  return null;
}

/**
 * Recupere une page, en gardant le HTML brut sur le disque.
 *
 * Le HTML cache change tout : itérer sur les analyseurs ne coute plus une
 * seule requete, alors qu'un cycle complet prend plusieurs minutes a cause de
 * l'espacement impose par le pare feu. `--reparse` rejoue tout hors ligne.
 */
async function html(unil, rel, target) {
  const file = path.join(RAW, rel);
  if (fs.existsSync(file) && !args.force) return fs.readFileSync(file, 'utf8');
  if (args.reparse) throw new Error(`HTML absent du cache : ${rel}`);
  const body = await unil.get(target);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body, 'utf8');
  return body;
}

const isMaster = (name) =>
  /Ma[iî]trise universitaire|Master of Science|MSc/i.test(name);

/** Regroupe les etapeids d'un meme master : l'UNIL les decoupe par module. */
function groupProgrammes(list) {
  const key = (n) =>
    n
      .replace(/,?\s*(Modules?|Module)\s*[\d,&\s.et]+$/i, '')
      .replace(/\s*-\s*Module\s*\d+$/i, '')
      .replace(/[\s,-]+$/, '') // « Droit et Économie - » perd son tiret orphelin
      .replace(/\s+/g, ' ')
      .trim();

  const map = new Map();
  for (const p of list) {
    const k = key(p.name);
    if (!map.has(k)) map.set(k, { name: k, etapeids: [], sempos: new Set() });
    const g = map.get(k);
    g.etapeids.push(p.etapeid);
    p.sempos.forEach((s) => g.sempos.add(s));
  }
  return [...map.values()].map((g) => ({ ...g, sempos: [...g.sempos].sort() }));
}

async function main() {
  const ueid = String(args.faculty ?? HEC);
  const unil = args.reparse
    ? { get: () => { throw new Error('mode hors ligne'); }, close: async () => {} }
    : await openUnil({ headless: !args.headed, log });
  const t0 = Date.now();

  try {
    /* ---------- facultes ---------- */
    let faculties = load('faculties.json');
    if (!faculties) {
      log('Facultes');
      faculties = parseFaculties(await html(unil, 'html/faculties.html', url.faculties('fr')));
      save('faculties.json', faculties);
    }
    ok(`${faculties.length} facultes et ecoles`);

    /* ---------- programmes ---------- */
    let programmes = load(`${ueid}/programmes.json`);
    if (!programmes) {
      log(`Programmes de la faculte ${ueid}`);
      programmes = parseProgrammes(
        await html(unil, `${ueid}/html/programmes.html`, url.programmes(ueid, 'fr'))
      );
      save(`${ueid}/programmes.json`, programmes);
    }
    const masters = groupProgrammes(programmes.filter((p) => isMaster(p.name)));
    ok(`${programmes.length} programmes, dont ${masters.length} masters`);
    save(`${ueid}/masters.json`, masters);

    if (args.discover) {
      log('');
      masters.forEach((m, i) =>
        log(`${String(i + 1).padStart(2)}. ${m.name}\n    etapeids ${m.etapeids.join(', ')}  semestres ${m.sempos.join(', ')}`)
      );
      return;
    }

    /* ---------- selection ---------- */
    const targets = args.programme
      ? masters.filter((m) => m.etapeids.includes(String(args.programme)))
      : args['masters-only'] || !args.programme
        ? masters
        : masters;
    const limit = args.limit ? Number(args.limit) : targets.length;

    for (const master of targets.slice(0, limit)) {
      log(`\n${master.name}`);
      const slug = master.etapeids[0];

      /* horaires : une requete par etapeid et par semestre */
      for (const etapeid of master.etapeids) {
        for (const sem of master.sempos) {
          const rel = `${ueid}/${slug}/agenda-${etapeid}-${sem}.json`;
          if (load(rel)) { ok(`horaire ${etapeid}/${sem} deja present`); continue; }
          const raw = await html(
            unil,
            `${ueid}/${slug}/html/agenda-${etapeid}-${sem}.html`,
            url.agenda(ueid, etapeid, sem, 'fr')
          );
          const rows = parseAgenda(raw, 'fr');
          save(rel, { ueid, etapeid, sempos: sem, rows });
          ok(`horaire ${etapeid}/${sem} : ${rows.length} creneaux`);
        }
      }

      /* liste des cours */
      let list = load(`${ueid}/${slug}/courses.json`);
      if (!list) {
        list = [];
        for (const etapeid of master.etapeids) {
          const found = parseCourseList(
            await html(
              unil,
              `${ueid}/${slug}/html/liste-${etapeid}.html`,
              url.courseList(ueid, etapeid, 'fr')
            )
          );
          found.forEach((c) => {
            if (!list.some((x) => x.enstyid === c.enstyid)) list.push({ ...c, etapeid });
          });
        }
        save(`${ueid}/${slug}/courses.json`, list);
      }
      ok(`${list.length} cours listes`);

      if (args['no-courses']) continue;

      /* fiches, en francais puis en anglais */
      let done = 0;
      for (const c of list) {
        const rel = `${ueid}/${slug}/fiches/${c.enstyid}.json`;
        if (load(rel)) { done++; continue; }
        const base = `${ueid}/${slug}/html/fiche-${c.enstyid}`;
        const fr = parseCourse(
          await html(unil, `${base}-fr.html`, url.course(c.enstyid, ueid, c.etapeid, 'fr')),
          'fr'
        );
        const en = parseCourse(
          await html(unil, `${base}-en.html`, url.course(c.enstyid, ueid, c.etapeid, 'en')),
          'en'
        );
        save(rel, { enstyid: c.enstyid, etapeid: c.etapeid, fr, en });
        done++;
        ok(`${String(done).padStart(3)}/${list.length}  ${fr.title.slice(0, 58)}`);
      }
    }
  } finally {
    await unil.close();
    log(`\nTermine en ${Math.round((Date.now() - t0) / 1000)} s`);
  }
}

main().catch((e) => {
  console.error('\nEchec :', e.message);
  process.exit(1);
});
