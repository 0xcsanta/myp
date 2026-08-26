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
  court: string;
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
  /* l'horaire n'est dans aucune source PDF : on ne l'invente pas */
  horaireConnu: false;
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

export function coursDe(slug: string): Cours[] {
  const brut = lire<{ courses: CoursBrut[] }>(`programmes/${slug}-${ANNEE}.json`);
  const vus = new Map<string, number>();

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
      horaireConnu: false,
    };
  });
}
