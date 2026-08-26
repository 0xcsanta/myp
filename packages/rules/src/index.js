/**
 * Moteur de regles.
 *
 * Une seule fonction publique, `validate`, sans dependance et sans acces
 * reseau : elle tourne aussi bien au build que dans le navigateur de
 * l'etudiant. Les regles sont declaratives, un fichier JSON par master, pour
 * qu'ajouter un master ne demande aucune ligne de code.
 *
 * Trois niveaux de diagnostic :
 *   error   ce qui empeche le plan d'etudes d'etre valide
 *   info    ce qu'il faut savoir sans que ce soit bloquant
 *   ok      ce qui est satisfait, pour que l'etudiant voie ses acquis
 */

export const LEVEL = { ERROR: 'error', INFO: 'info', OK: 'ok' };

const sum = (xs) => xs.reduce((a, b) => a + b, 0);

/** Credits d'un cours dans le contexte d'un module donne. */
function creditsOf(course, moduleCode) {
  if (course.creditsByModule && course.creditsByModule[moduleCode] != null) {
    return course.creditsByModule[moduleCode];
  }
  return course.ects ?? 0;
}

/** Deux creneaux du meme jour et du meme semestre se chevauchent ils ? */
function overlaps(a, b) {
  return (
    a.semester === b.semester &&
    a.weekday === b.weekday &&
    a.startMin < b.endMin &&
    b.startMin < a.endMin
  );
}

/**
 * @param {string[]} selectedIds   les cours coches par l'etudiant
 * @param {object}   rules         le fichier de regles du master
 * @param {object[]} catalogue     tous les cours du master
 * @returns {{ total:number, byModule:Record<string,number>, diagnostics:object[], valid:boolean }}
 */
export function validate(selectedIds, rules, catalogue) {
  const byId = new Map(catalogue.map((c) => [c.id, c]));
  const selected = selectedIds.map((id) => byId.get(id)).filter(Boolean);
  const checks = new Set(rules.checks ?? []);
  const d = [];
  const add = (level, code, message, extra = {}) =>
    d.push({ level, code, message, ...extra });

  /* ---------- credits par module ---------- */
  const byModule = {};
  for (const m of rules.modules) byModule[m.code] = 0;
  for (const c of selected) {
    const code = c.module;
    if (byModule[code] === undefined) byModule[code] = 0;
    byModule[code] += creditsOf(c, code);
  }

  /*
   * Un module parent n'a pas de cours a lui : ses credits sont ceux de ses
   * sous-modules. Sans cette remontee, le Module 4 du MScIS reste a zero alors
   * que le memoire et le seminaire le remplissent, et le total du diplome est
   * compte deux fois.
   */
  const childrenOf = (code) => rules.modules.filter((m) => m.parent === code);
  for (const m of rules.modules) {
    const kids = childrenOf(m.code);
    if (kids.length) byModule[m.code] = sum(kids.map((k) => byModule[k.code] ?? 0));
  }

  const total = sum(
    rules.modules.filter((m) => !m.parent).map((m) => byModule[m.code] ?? 0)
  );

  for (const m of rules.modules) {
    const got = byModule[m.code] ?? 0;
    const label = m.label ?? m.code;

    if (checks.has('module_min') && got < m.minEcts) {
      add(LEVEL.ERROR, 'module_min',
        `${label} : ${got} crédits sur ${m.minEcts}. Il t'en manque ${m.minEcts - got}.`,
        { module: m.code, got, need: m.minEcts });
    }

    // le maximum vaut le minimum, sauf pour les modules a option ou l'UNIL
    // laisse depasser, et sauf si le fichier de regles dit autre chose
    const max = m.maxEcts ?? (m.kind === 'free_choice' ? Infinity : m.minEcts);
    if (checks.has('module_max') && got > max) {
      add(LEVEL.ERROR, 'module_max',
        `${label} : tu dépasses de ${got - max} crédits.`,
        { module: m.code, got, max });
    }

    if (got === m.minEcts) {
      add(LEVEL.OK, 'module_done', `${label} complet.`, { module: m.code });
    }

    // cours obligatoires manquants
    if (m.kind === 'all_required' && Array.isArray(m.courses)) {
      const missing = m.courses.filter((id) => !selectedIds.includes(id));
      if (missing.length) {
        add(LEVEL.ERROR, 'required_missing',
          `${label} : ${missing.length} enseignement${missing.length > 1 ? 's' : ''} obligatoire${missing.length > 1 ? 's' : ''} non sélectionné${missing.length > 1 ? 's' : ''}.`,
          { module: m.code, missing });
      }
    }

    // deverrouillage, typiquement le memoire
    if (m.unlockedBy && selected.some((c) => c.module === m.code)) {
      const acquired = sum(m.unlockedBy.ectsFrom.map((code) => byModule[code] ?? 0));
      if (acquired < m.unlockedBy.atLeast) {
        add(LEVEL.ERROR, 'locked',
          `${label} verrouillé : il faut ${m.unlockedBy.atLeast} crédits acquis aux modules ${m.unlockedBy.ectsFrom.join(', ')}, tu en as ${acquired}.`,
          { module: m.code, acquired, need: m.unlockedBy.atLeast });
      }
    }
  }

  /* ---------- total du diplome ---------- */
  if (checks.has('total_ects')) {
    if (total > rules.totalEcts) {
      add(LEVEL.ERROR, 'total_over',
        `Total : ${total} crédits, soit ${total - rules.totalEcts} de plus que les ${rules.totalEcts} du diplôme.`,
        { total });
    } else if (total < rules.totalEcts) {
      add(LEVEL.INFO, 'total_under',
        `Total : ${total} crédits sur ${rules.totalEcts}. Il t'en manque ${rules.totalEcts - total}.`,
        { total });
    }
  }

  /* ---------- chevauchements d'horaire ---------- */
  if (checks.has('time_clash')) {
    const slots = selected.flatMap((c) =>
      (c.slots ?? []).map((s) => ({ ...s, course: c }))
    );
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        if (!overlaps(slots[i], slots[j])) continue;
        add(LEVEL.ERROR, 'time_clash',
          `Chevauchement le ${slots[i].weekday} : ${slots[i].course.title} et ${slots[j].course.title}.`,
          { courses: [slots[i].course.id, slots[j].course.id], weekday: slots[i].weekday });
      }
    }
  }

  /* ---------- cours a candidature ou places limitees ---------- */
  if (checks.has('capacity_limited')) {
    for (const c of selected) {
      if (c.capacity?.limited) {
        add(LEVEL.INFO, 'capacity_limited',
          `${c.title} : ${c.capacity.note ?? 'inscription préalable requise, places limitées.'}`,
          { course: c.id });
      }
    }
  }

  /* ---------- prerequis ---------- */
  if (checks.has('prereq_met')) {
    for (const c of selected) {
      const missing = (c.requires ?? []).filter((id) => !selectedIds.includes(id));
      if (missing.length) {
        add(LEVEL.INFO, 'prereq',
          `${c.title} suppose d'avoir suivi ${missing.map((id) => byId.get(id)?.title ?? id).join(', ')}.`,
          { course: c.id, missing });
      }
    }
  }

  const errors = d.filter((x) => x.level === LEVEL.ERROR);
  if (!errors.length && total === rules.totalEcts) {
    add(LEVEL.OK, 'plan_valid',
      `Plan complet et conforme. ${total} crédits, tous les modules satisfaits.`);
  }

  // les erreurs d'abord, puis les informations, puis les acquis
  const order = { error: 0, info: 1, ok: 2 };
  d.sort((a, b) => order[a.level] - order[b.level]);

  return { total, byModule, diagnostics: d, valid: errors.length === 0 && total === rules.totalEcts };
}
