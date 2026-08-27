import fs from "node:fs";
import path from "node:path";

import type { CalendrierAcademique } from "./ics";
import type { Langue } from "./langues";
import { nomCourt } from "./nomMaster";

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
  /**
   * Le plan demande d'en choisir un seul parmi les sous-modules, et non de
   * les additionner : « MODULE 3: Choose the submodule of your orientation ».
   */
  choisirUn?: boolean;
  unlockedBy?: { ectsFrom: string[]; atLeast: number };
  unlockedNote?: string;
};

/**
 * L'autorisation de prendre des enseignements hors de son propre plan.
 *
 * Deux masters sur dix la portent dans leur plan 2025-2026, et deux seulement.
 * Ce n'est donc pas une regle generale de HEC : le site ne l'affiche que la ou
 * le document l'ecrit, et repond « demande a l'administration » ailleurs.
 */
export type CoursExternes = {
  /** Le module qui accueille ces credits. */
  module: string;
  /** Le plafond en credits, quand le plan en donne un. */
  maxEcts: number | null;
  /** La phrase du plan, mot pour mot. */
  citation: string;
};

/**
 * Le module qui accueille les enseignements des orientations qu'on ne suit
 * pas. Le MScF l'ecrit sur une ligne de son Module 4 : « Any compulsory
 * courses in other tracks ».
 */
export type AutresOrientations = {
  moduleDAccueil: string;
  citation: string;
  /*
   * « interne » : les orientations sont des sous-modules du meme plan, et un
   * cours qu'on ne prend pas au titre de son orientation bascule simplement au
   * module d'accueil. C'est le MScF.
   *
   * « externe » : les orientations sont des plans distincts, et les cours sont
   * importes dans le catalogue par coursDe. C'est le MScM.
   */
  portee: "interne" | "externe";
};

export type Regles = {
  programme: string;
  year: string;
  totalEcts: number;
  modules: Module[];
  checks: string[];
  source: { document: string; page: string; checkedOn: string };
  externes?: CoursExternes;
  autresOrientations?: AutresOrientations;
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
  /*
   * Les orientations d'ou vient ce cours, quand ce n'est pas celle qu'on
   * consulte. Les quatre orientations du MSc Management ouvrent leur Module 4
   * au Module 5 des trois autres : ces cours la sont bien au programme, mais
   * ils viennent d'un autre plan, et l'etudiant doit le savoir avant de s'y
   * inscrire.
   *
   * Une liste, et pas un nom : le meme cours figure souvent au Module 5 de deux
   * orientations. N'en nommer qu'une, la premiere rencontree, serait un hasard
   * d'ordre alphabetique presente comme un fait.
   */
  venantDe?: string[];
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
  /*
   * Le master dont l'agenda a fourni ce creneau, quand ce n'est pas celui
   * qu'on consulte. Un cours enseigne dans plusieurs masters n'a qu'un
   * horaire, et l'agenda de l'un comble le trou de l'autre. L'etiquette est
   * resolue cote serveur, dans coursDe, qui seule connait la liste des
   * masters et la langue : le composant client n'a ni l'une ni l'autre.
   */
  reprisDe?: string | null;
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

type FicheAutresOrientations = {
  regles: {
    programmes: string[];
    citation: string;
    moduleDAccueil: string;
    /** Le module d'ou viennent les cours, chez l'autre programme. Forme externe seulement. */
    moduleSource?: string;
    portee: "interne" | "externe";
  }[];
};

type FicheExternes = {
  programmes: { programme: string; module: string; maxEcts: number | null; citation: string }[];
};

export function reglesDe(slug: string): Regles {
  const regles = lire<Regles>(`rules/${slug}-${ANNEE}.json`);
  /*
   * L'autorisation vit dans son propre fichier plutot que dans les regles :
   * elle a ete relevee a la main, plan par plan, et son fichier porte les
   * citations et la methode. La melanger aux regles extraites automatiquement
   * ferait perdre cette distinction.
   */
  const fiche = lire<FicheExternes>("cours-externes.json");
  const e = fiche.programmes.find((x) => x.programme === slug);
  const avecExternes = e
    ? { ...regles, externes: { module: e.module, maxEcts: e.maxEcts, citation: e.citation } }
    : regles;

  /*
   * Les orientations qu'on ne suit pas. Deux formes dans les plans, et seule
   * la forme interne est traitee ici : celle du MScF, dont les orientations
   * sont des sous-modules du meme plan. Celle du MScM, dont les orientations
   * sont des masters distincts, demandera de charger d'autres catalogues.
   */
  const autres = lire<FicheAutresOrientations>("cours-autres-orientations.json");
  const r = autres.regles.find(
    (x) => x.portee === "interne" && x.programmes.includes(slug),
  );
  const externe = autres.regles.find(
    (x) => x.portee === "externe" && x.programmes.includes(slug),
  );
  const ouverture = r ?? externe;
  return ouverture
    ? {
        ...avecExternes,
        autresOrientations: {
          moduleDAccueil: ouverture.moduleDAccueil,
          citation: ouverture.citation,
          portee: ouverture.portee,
        },
      }
    : avecExternes;
}

/** La regle externe d'un master, s'il en a une : les cours viennent d'un autre plan. */
function regleExterne(slug: string) {
  const autres = lire<FicheAutresOrientations>("cours-autres-orientations.json");
  return autres.regles.find(
    (x) => x.portee === "externe" && x.programmes.includes(slug),
  );
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

/**
 * Les dates reelles de l'annee academique, pour l'export vers un agenda.
 *
 * Elles ne sont pas dans les plans d'etudes : elles viennent du calendrier
 * publie par la Direction de l'UNIL. Sans elles, un fichier .ics n'aurait
 * aucune date a donner, et il faudrait les deviner.
 */
export function calendrierAcademique(): CalendrierAcademique {
  return lire<CalendrierAcademique>("calendrier-academique.json");
}

export function coursDe(slug: string, langue: Langue = "fr"): Cours[] {
  const brut = lire<{ courses: CoursBrut[] }>(`programmes/${slug}-${ANNEE}.json`);
  const vus = new Map<string, number>();
  const horaires = horairesDe(slug);

  const base = brut.courses.map((c, i) => {
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
  });

  const siens = base.map((c) => {
    if (!horaires) return c;
    const noms = new Map(tousLesMasters().map((m) => [m.slug, nomCourt(m, langue)]));
    const siens = horaires.creneaux
      .filter((x) => x.cours === c.id)
      .map((x) => ({
        ...x,
        debutMin: enMinutes(x.debut),
        finMin: enMinutes(x.fin),
        reprisDe: x.reprisDe ? (noms.get(x.reprisDe) ?? x.reprisDe) : null,
      }));
    return siens.length ? { ...c, creneaux: siens, horaireConnu: true } : c;
  });

  return [...siens, ...coursDesAutresOrientations(slug, siens, langue)];
}

/*
 * Les enseignements que le plan va chercher dans les autres orientations.
 *
 * « Module 4 can be any course listed above and any course listed under Module
 * 5 of other orientations (and are not listed below). » Les quatre orientations
 * du MSc Management portent cette phrase dans les memes termes. Contrairement
 * au MScF, dont les orientations sont des sous-modules du meme plan, celles du
 * MScM sont des masters distincts dans notre decoupage : les cours viennent
 * donc d'autres fichiers, avec leurs propres horaires.
 *
 * Trois exclusions, toutes tirees de la phrase elle meme :
 *   - « and are not listed below », donc ce que le plan d'accueil propose deja ;
 *   - les intitules qui se reservent a une orientation, le plan les marquant
 *     lui meme « (for SOL orientation only) » ;
 *   - les projets d'entreprise, que la phrase exclut. Aucun n'est aujourd'hui
 *     dans un Module 5, ils sont tous au Module 3 : l'exclusion ne retire donc
 *     rien, elle est appliquee au cas ou un plan futur en placerait un.
 */
function coursDesAutresOrientations(slug: string, siens: Cours[], langue: Langue): Cours[] {
  const r = regleExterne(slug);
  if (!r) return [];

  const dejaLa = new Set(siens.map((c) => c.titre.toLowerCase()));
  /*
   * « Management, Business analytics » devient « Business analytics ». Les
   * quatre orientations partagent le mot Management, qui ne distingue rien :
   * garder l'etiquette entiere donnait « ORIENTATION MANAGEMENT, BUSINESS
   * ANALYTICS » sur une pastille de dix pixels de haut.
   */
  const noms = new Map(
    tousLesMasters().map((m) => {
      const n = nomCourt(m, langue);
      const i = n.indexOf(", ");
      return [m.slug, i > 0 ? n.slice(i + 2) : n];
    }),
  );
  const venus: Cours[] = [];
  const parTitre = new Map<string, Cours>();

  for (const autre of r.programmes.filter((p) => p !== slug)) {
    const regles = lire<Regles>(`rules/${autre}-${ANNEE}.json`);
    /* « Module 5 » comprend ses sous-modules : deux orientations sur quatre
     * n'ont aucun cours directement sous M5, tout est range dessous. */
    const source = new Set<string>([r.moduleSource ?? "M5"]);
    let bouge = true;
    while (bouge) {
      bouge = false;
      for (const m of regles.modules) {
        if (m.parent && source.has(m.parent) && !source.has(m.code)) {
          source.add(m.code);
          bouge = true;
        }
      }
    }

    const horaires = horairesDe(autre);
    const brut = lire<{ courses: CoursBrut[] }>(`programmes/${autre}-${ANNEE}.json`);
    const vusChezLui = new Map<string, number>();

    brut.courses.forEach((c, i) => {
      let idSource = identifiant(c.title, i);
      const n = vusChezLui.get(idSource) ?? 0;
      if (n) idSource = `${idSource}-${n + 1}`;
      vusChezLui.set(idSource, n + 1);

      if (!source.has(c.module)) return;
      const cle = c.title.toLowerCase();
      if (dejaLa.has(cle)) return;
      // deja vu chez une autre orientation : on ne le double pas, on ajoute
      // seulement la provenance
      const deja = parTitre.get(cle);
      if (deja) {
        const nom = noms.get(autre) ?? autre;
        if (!deja.venantDe?.includes(nom)) deja.venantDe?.push(nom);
        return;
      }
      if (/orientation only|\(for [A-Z]{2,4}( orientation)? only\)/i.test(c.title)) return;
      if (/company project|projet d'entreprise/i.test(c.title)) return;

      const creneaux = (horaires?.creneaux ?? [])
        .filter((x) => x.cours === idSource)
        .map((x) => ({ ...x, debutMin: enMinutes(x.debut), finMin: enMinutes(x.fin) }));

      const cours: Cours = {
        id: `${autre}--${idSource}`,
        titre: c.title,
        enseignants: c.teachers || null,
        module: r.moduleDAccueil,
        ects: c.ects,
        colonnes: c.semesters,
        saisons: [...new Set(c.semesters.map((x) => SAISON[x]).filter(Boolean))],
        langue: c.language,
        evaluation: c.evalType,
        dureeExamen: c.examMinutes,
        creneaux,
        horaireConnu: creneaux.length > 0,
        venantDe: [noms.get(autre) ?? autre],
      };
      parTitre.set(cle, cours);
      venus.push(cours);
    });
  }

  /* l'ordre du plan d'accueil d'abord, puis ceux ci : le code de partage est
   * positionnel, donc tout ce qui s'ajoute doit s'ajouter a la fin */
  return venus.sort((a, b) => a.titre.localeCompare(b.titre, "fr"));
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
