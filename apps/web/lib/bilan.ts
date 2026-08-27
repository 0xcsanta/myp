import type { Cours } from "./donnees";
import { rangEffectif } from "./semestres";

/**
 * Le bilan d'un plan, semestre par semestre.
 *
 * Le site comptait les credits par module, ce que demande le reglement, et
 * jamais par semestre, ce que vit l'etudiant. Un plan peut etre parfaitement
 * valide au regard des modules et poser trente quatre credits au troisieme
 * semestre contre huit au quatrieme : le reglement s'en moque, pas celui qui
 * les suit.
 *
 * Trois mesures, et rien de plus, parce que ce sont les trois qu'on regrette
 * de ne pas avoir vues avant de s'inscrire : les credits, les heures de cours
 * par semaine, et les examens.
 */

export type BilanSemestre = {
  rang: number;
  cours: number;
  ects: number;
  /**
   * Les minutes de cours d'une semaine ordinaire. Un creneau de quinzaine
   * compte pour moitie, ce qui est sa charge moyenne. Les creneaux irreguliers
   * n'y sont pas : ils n'ont pas de rythme hebdomadaire, donc les y verser
   * fabriquerait un nombre faux plutot qu'un nombre approximatif.
   */
  minutesParSemaine: number;
  /** Les cours dont un creneau est irregulier, donc absents du compte ci dessus. */
  coursIrreguliers: number;
  /** Les cours dont l'horaire n'est pas releve : la charge est donc sous estimee. */
  coursSansHoraire: number;
  /** Les examens, par code d'evaluation du plan, avec la duree cumulee. */
  examens: { code: string; nombre: number; minutes: number }[];
};

/**
 * Les creneaux qu'un cours occupe reellement a un semestre donne.
 *
 * Deux reglages de l'ecran entrent ici, et c'est voulu : le semestre choisi
 * quand le plan en propose deux, et le creneau choisi quand le cours en a
 * plusieurs. Le bilan doit decrire le plan que l'etudiant compose, pas la
 * somme de tous les possibles.
 */
function creneauxRetenus(c: Cours, saison: string, groupes: Record<string, number>) {
  const duSemestre = c.creneaux.filter((k) => k.semestre === saison);
  if (duSemestre.length <= 1) return duSemestre;
  const i = groupes[c.id];
  if (i === undefined || !c.creneaux[i]) return duSemestre;
  return c.creneaux[i].semestre === saison ? [c.creneaux[i]] : [];
}

/**
 * Le semestre du releve qui correspond a un rang du plan.
 *
 * Le releve ne couvre que deux semestres, automne 2026 et printemps 2026. Les
 * rangs impairs tombent a l'automne, les pairs au printemps : le troisieme
 * semestre se lit donc sur le releve d'automne, faute de mieux, et le site le
 * dit deja ailleurs.
 */
const saisonDuRang = (rang: number) =>
  rang % 2 === 1 ? "automne-2026" : "printemps-2026";

export function bilanParSemestre(
  choisis: Cours[],
  placements: Record<string, number>,
  groupes: Record<string, number>,
): BilanSemestre[] {
  const par = new Map<number, BilanSemestre>();

  for (const c of choisis) {
    const rang = rangEffectif(c.colonnes, placements[c.id]);
    if (rang === null) continue;

    let b = par.get(rang);
    if (!b) {
      b = {
        rang,
        cours: 0,
        ects: 0,
        minutesParSemaine: 0,
        coursIrreguliers: 0,
        coursSansHoraire: 0,
        examens: [],
      };
      par.set(rang, b);
    }

    b.cours += 1;
    b.ects += c.ects;

    const creneaux = creneauxRetenus(c, saisonDuRang(rang), groupes);
    if (!creneaux.length) {
      b.coursSansHoraire += 1;
    } else {
      let irregulier = false;
      for (const k of creneaux) {
        const duree = k.finMin - k.debutMin;
        if (!Number.isFinite(duree) || duree <= 0) continue;
        if (k.cadence === "irregulier" || k.cadence === "bloc") {
          irregulier = true;
        } else if (k.cadence === "quinzaine") {
          b.minutesParSemaine += duree / 2;
        } else {
          b.minutesParSemaine += duree;
        }
      }
      if (irregulier) b.coursIrreguliers += 1;
    }

    if (c.evaluation) {
      const e = b.examens.find((x) => x.code === c.evaluation);
      if (e) {
        e.nombre += 1;
        e.minutes += c.dureeExamen ?? 0;
      } else {
        b.examens.push({
          code: c.evaluation,
          nombre: 1,
          minutes: c.dureeExamen ?? 0,
        });
      }
    }
  }

  for (const b of par.values()) {
    b.examens.sort((x, y) => y.nombre - x.nombre || x.code.localeCompare(y.code));
  }
  return [...par.values()].sort((a, b) => a.rang - b.rang);
}

/** « 12h15 » a partir de minutes. Rien du tout si le compte est nul. */
export function enHeures(minutes: number, langue: "fr" | "en"): string | null {
  if (minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (!h) return `${m} min`;
  if (!m) return langue === "fr" ? `${h}h` : `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}`;
}
