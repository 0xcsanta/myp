import fs from "node:fs";
import path from "node:path";

/**
 * Lecture des donnees, cote serveur uniquement.
 *
 * Les fichiers vivent a la racine du depot, pas dans l'application : ils sont
 * produits par l'analyse des plans d'etudes PDF et relus a la main. On les lit
 * au build, donc le navigateur ne recoit que le master consulte.
 */

const RACINE = path.join(process.cwd(), "..", "..", "data");
const ANNEE = "2025-2026";

const lire = <T>(rel: string): T =>
  JSON.parse(fs.readFileSync(path.join(RACINE, rel), "utf8")) as T;

export type Master = {
  slug: string;
  /** Etiquette d'interface, ecrite pour le site, pas un intitule officiel. */
  court: string;
  courtEn: string;
  /**
   * L'intitule officiel du diplome, repris tel quel. HEC ne le publie pas en
   * anglais pour les dix masters, donc il reste en francais dans les deux
   * langues du site : traduire un intitule officiel, ce serait l'inventer.
   */
  long: string;
  sigle: string;
  etapeids: string[];
  ects: number;
};

export type Module = {
  code: string;
  parent: string | null;
  label: string;
  minEcts: number;
  maxEcts?: number;
  kind: "all_required" | "free_choice" | "thesis";
  note: string;
  avgMin?: number;
  unlockedBy?: { ectsFrom: string[]; atLeast: number };
  unlockedNote?: string;
};

export type Regles = {
  programme: string;
  year: string;
  totalEcts: number;
  modules: Module[];
  checks: string[];
  source: { document: string; page: string; checkedOn: string };
};

export type CoursBrut = {
  title: string;
  teachers: string;
  module: string;
  ects: number;
  semesters: number[];
  language: string | null;
  evalType: string | null;
  examMinutes: number | null;
};

export type Cours = {
  id: string;
  titre: string;
  enseignants: string | null;
  module: string;
  ects: number;
  colonnes: number[];
  saisons: ("automne" | "printemps")[];
  langue: string | null;
  evaluation: string | null;
  dureeExamen: number | null;
  /*
   * L'horaire ne figure dans aucune source lisible automatiquement. Tant qu'un
   * releve humain n'a pas ete depose dans data/horaires, la liste reste vide
   * et `horaireConnu` reste faux. On n'invente jamais un creneau.
   */
  creneaux: Creneau[];
  horaireConnu: boolean;
};

export type Creneau = {
  cours: string;
  /*
   * Le semestre reel, « automne-2026 » et non « automne ». Les releves
   * couvrent le printemps 2026, second semestre de l'annee 2025-2026, et
   * l'automne 2026, premier semestre de 2026-2027. Les melanger ferait
   * apparaitre des chevauchements entre deux semestres qui n'ont jamais lieu
   * en meme temps.
   */
  semestre: string;
  jour: string;
  debut: string;
  fin: string;
  debutMin: number;
  finMin: number;
  salle: string | null;
  cadence: "hebdomadaire" | "quinzaine" | "bloc" | "irregulier";
  note: string | null;
};

export type Horaires = {
  programme: string;
  source: { document: string; url: string; releveLe: string; note?: string };
  creneaux: Omit<Creneau, "debutMin" | "finMin">[];
};

export function tousLesMasters(): Master[] {
  return lire<{ masters: Master[] }>("masters.json").masters;
}

export function master(slug: string): Master | undefined {
  return tousLesMasters().find((m) => m.slug === slug);
}

/** Colonne du plan d'etudes vers saison. Les colonnes 1 et 3 sont des automnes. */
const SAISON: Record<number, "automne" | "printemps"> = {
  1: "automne",
  2: "printemps",
  3: "automne",
  4: "printemps",
};

const identifiant = (titre: string, i: number) =>
  titre
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 46) || `cours-${i}`;

export function reglesDe(slug: string): Regles {
  return lire<Regles>(`rules/${slug}-${ANNEE}.json`);
}

const enMinutes = (t: string): number => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t ?? "");
  return m ? +m[1] * 60 + +m[2] : NaN;
};

/**
 * Le releve d'horaire du master, s'il existe.
 *
 * Renvoie `null` quand le fichier n'a pas encore ete depose, ce qui est le cas
 * normal aujourd'hui : l'interface doit alors dire qu'elle ne sait pas.
 */
export function horairesDe(slug: string): Horaires | null {
  const f = path.join(RACINE, "horaires", `${slug}.json`);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, "utf8")) as Horaires;
}

export function coursDe(slug: string): Cours[] {
  const brut = lire<{ courses: CoursBrut[] }>(`programmes/${slug}-${ANNEE}.json`);
  const vus = new Map<string, number>();
  const horaires = horairesDe(slug);

  return brut.courses.map((c, i) => {
    let id = identifiant(c.title, i);
    const n = vus.get(id) ?? 0;
    if (n) id = `${id}-${n + 1}`;
    vus.set(id, n + 1);

    return {
      id,
      titre: c.title,
      enseignants: c.teachers || null,
      module: c.module,
      ects: c.ects,
      colonnes: c.semesters,
      saisons: [...new Set(c.semesters.map((s) => SAISON[s]).filter(Boolean))],
      langue: c.language,
      evaluation: c.evalType,
      dureeExamen: c.examMinutes,
      creneaux: [],
      horaireConnu: false,
    };
  }).map((c) => {
    if (!horaires) return c;
    const siens = horaires.creneaux
      .filter((x) => x.cours === c.id)
      .map((x) => ({ ...x, debutMin: enMinutes(x.debut), finMin: enMinutes(x.fin) }));
    return siens.length ? { ...c, creneaux: siens, horaireConnu: true } : c;
  });
}

/**
 * Verifie que chaque creneau vise un cours qui existe.
 *
 * Un identifiant errone passerait autrement inapercu : le creneau serait
 * simplement ignore, et l'etudiant verrait « horaire non publie » pour un cours
 * dont l'horaire est pourtant connu. Mieux vaut casser le build.
 */
export function verifierHoraires(slug: string): string[] {
  const h = horairesDe(slug);
  if (!h) return [];
  const ids = new Set(coursDe(slug).map((c) => c.id));
  return h.creneaux.filter((x) => !ids.has(x.cours)).map((x) => x.cours);
}
