/**
 * Passe des donnees brutes du plan d'etudes a la forme attendue par le
 * moteur de regles. Une seule fonction, pour que le format de sortie du
 * parseur PDF puisse changer sans toucher au validateur.
 */

const slugify = (s) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);

/** Numero de colonne du plan vers semestre reel. 1 et 3 sont des automnes. */
const SEASON = { 1: 'autumn', 2: 'spring', 3: 'autumn', 4: 'spring' };

export function toCatalogue(programme) {
  const seen = new Map();
  return programme.courses.map((c, i) => {
    let id = slugify(c.title) || `cours-${i}`;
    if (seen.has(id)) id = `${id}-${seen.get(id) + 1}`;
    seen.set(id, (seen.get(id) ?? 0) + 1);

    return {
      id,
      title: c.title,
      teachers: c.teachers || null,
      module: c.module,
      ects: c.ects,
      language: c.language,
      evalType: c.evalType,
      examMinutes: c.examMinutes,
      // colonnes du plan d'etudes, pas des dates : un cours peut etre
      // proposable a plusieurs semestres
      semesterSlots: c.semesters,
      seasons: [...new Set(c.semesters.map((n) => SEASON[n]).filter(Boolean))],
      // l'horaire precis n'est pas dans le plan d'etudes : tant qu'il n'a pas
      // ete verifie a la main, on ne l'invente pas
      slots: c.slots ?? [],
      scheduleKnown: Array.isArray(c.slots) && c.slots.length > 0,
    };
  });
}
