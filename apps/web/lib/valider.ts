import type { Cours, Creneau, Module, Regles } from "./donnees";
import type { Langue } from "./langues";
import { dansUnePhrase, libelleJour, libelleSemestre } from "./semestres";
import { textes } from "./textes";

/**
 * Le moteur de regles, transpose en TypeScript pour l'interface.
 *
 * La logique est celle de packages/rules, eprouvee par les tests sur les
 * vraies donnees du MScIS. Elle tourne ici cote client, sans reseau : la
 * selection de l'etudiant ne quitte jamais son appareil.
 *
 * Un diagnostic ne porte pas de phrase, il porte des faits : un code, le
 * module en cause, les nombres. La phrase est fabriquee a l'affichage, dans la
 * langue du lecteur. Deux benefices, au dela de la traduction. Le moteur
 * redevient testable sur des valeurs plutot que sur du texte, et le
 * planificateur repere les cours qui se heurtent par leur identifiant au lieu
 * de chercher leur intitule dans une phrase, ce qui cassait des qu'un titre
 * contenait celui d'un autre.
 */

export type Niveau = "erreur" | "info" | "ok";

export type Diagnostic =
  | { niveau: "erreur"; code: "module_min"; module: string; obtenu: number; requis: number }
  | { niveau: "erreur"; code: "module_max"; module: string; exces: number }
  | { niveau: "ok"; code: "module_fait"; module: string }
  | {
      niveau: "erreur";
      code: "verrou";
      module: string;
      requis: number;
      acquis: number;
      depuis: string[];
    }
  | {
      niveau: "erreur";
      code: "chevauchement";
      jour: string;
      semestre: string;
      cours: [string, string];
      titres: [string, string];
    }
  | { niveau: "info"; code: "horaire_inconnu"; sans: number; total: number }
  | { niveau: "erreur"; code: "externes_max"; module: string; pris: number; max: number }
  | { niveau: "info"; code: "externes_accord"; module: string; pris: number }
  | { niveau: "erreur"; code: "total_depasse"; total: number; exces: number; requis: number }
  | { niveau: "info"; code: "total_manque"; total: number; requis: number }
  | { niveau: "ok"; code: "plan_valide"; total: number };

export type Resultat = {
  total: number;
  parModule: Record<string, number>;
  diagnostics: Diagnostic[];
  valide: boolean;
};

const somme = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

export function valider(
  selection: Set<string>,
  regles: Regles,
  catalogue: Cours[],
  /*
   * Les credits pris hors du plan, quand le plan l'autorise. Ils ne
   * correspondent a aucun cours du catalogue, donc ils s'ajoutent au module
   * d'accueil sans passer par la selection.
   */
  creditsExternes = 0,
): Resultat {
  const parId = new Map(catalogue.map((c) => [c.id, c]));
  const choisis = [...selection].map((id) => parId.get(id)).filter(Boolean) as Cours[];
  const d: Diagnostic[] = [];

  /* ---------- credits par module ---------- */
  const parModule: Record<string, number> = {};
  for (const m of regles.modules) parModule[m.code] = 0;
  for (const c of choisis) parModule[c.module] = (parModule[c.module] ?? 0) + c.ects;

  const externes = regles.externes;
  const horsPlan = externes ? Math.max(0, creditsExternes) : 0;
  if (externes && horsPlan) {
    parModule[externes.module] = (parModule[externes.module] ?? 0) + horsPlan;
  }

  /*
   * Un module parent n'a pas de cours en propre : ses credits sont ceux de ses
   * sous-modules. Sans cette remontee, le Module 4 du MScIS reste a zero alors
   * que le memoire le remplit, et le total du diplome est compte deux fois.
   */
  const enfantsDe = (code: string) => regles.modules.filter((m) => m.parent === code);
  for (const m of regles.modules) {
    const enfants = enfantsDe(m.code);
    if (enfants.length) {
      parModule[m.code] = somme(enfants.map((e) => parModule[e.code] ?? 0));
    }
  }

  const racines = regles.modules.filter((m) => !m.parent);
  const total = somme(racines.map((m) => parModule[m.code] ?? 0));

  /* ---------- chaque module ---------- */
  for (const m of regles.modules) {
    const obtenu = parModule[m.code] ?? 0;

    /*
     * Un module qui a des sous-modules ne parle pas en son nom : ses enfants
     * disent deja ce qu'il leur manque. Sans ce filtre, le MScIS annonce trois
     * fois le meme manque, pour le Module 4 puis pour ses deux sous-modules.
     */
    const aDesEnfants = enfantsDe(m.code).length > 0;

    if (obtenu < m.minEcts && !aDesEnfants) {
      d.push({
        niveau: "erreur",
        code: "module_min",
        module: m.code,
        obtenu,
        requis: m.minEcts,
      });
    }

    const max = m.maxEcts ?? (m.kind === "free_choice" ? Infinity : m.minEcts);
    if (obtenu > max && !aDesEnfants) {
      d.push({ niveau: "erreur", code: "module_max", module: m.code, exces: obtenu - max });
    }

    if (obtenu === m.minEcts && !aDesEnfants) {
      d.push({ niveau: "ok", code: "module_fait", module: m.code });
    }

    if (m.unlockedBy && choisis.some((c) => c.module === m.code)) {
      const acquis = somme(m.unlockedBy.ectsFrom.map((code) => parModule[code] ?? 0));
      if (acquis < m.unlockedBy.atLeast) {
        d.push({
          niveau: "erreur",
          code: "verrou",
          module: m.code,
          requis: m.unlockedBy.atLeast,
          acquis,
          depuis: m.unlockedBy.ectsFrom,
        });
      }
    }
  }

  /* ---------- chevauchements d'horaire ---------- */

  /*
   * On ne compare que ce qui est comparable : meme saison, meme jour, et les
   * deux cours donnes chaque semaine. Un cours en semaine bloc ou a cadence
   * irreguliere produirait un faux chevauchement la plupart du temps, donc il
   * est ecarte et signale a part.
   */
  const avecHoraire = choisis.filter((c) => c.horaireConnu);
  const creneaux: { c: Cours; k: Creneau }[] = avecHoraire.flatMap((c) =>
    c.creneaux.map((k) => ({ c, k })),
  );
  const reguliers = creneaux.filter(
    (x) => x.k.cadence === "hebdomadaire" || x.k.cadence === "quinzaine",
  );

  for (let i = 0; i < reguliers.length; i++) {
    for (let j = i + 1; j < reguliers.length; j++) {
      const a = reguliers[i];
      const b = reguliers[j];
      if (a.c.id === b.c.id) continue;
      if (a.k.semestre !== b.k.semestre || a.k.jour !== b.k.jour) continue;
      if (a.k.debutMin >= b.k.finMin || b.k.debutMin >= a.k.finMin) continue;
      d.push({
        niveau: "erreur",
        code: "chevauchement",
        jour: a.k.jour,
        semestre: a.k.semestre,
        cours: [a.c.id, b.c.id],
        titres: [a.c.titre, b.c.titre],
      });
    }
  }

  /* ---------- les enseignements pris hors du plan ---------- */
  if (externes && horsPlan) {
    if (externes.maxEcts !== null && horsPlan > externes.maxEcts) {
      d.push({
        niveau: "erreur",
        code: "externes_max",
        module: externes.module,
        pris: horsPlan,
        max: externes.maxEcts,
      });
    }
    /*
     * L'accord de la direction est rappele en permanence, meme quand tout est
     * dans les clous : c'est une condition du plan, pas un avertissement lie a
     * un depassement, et le site ne peut ni le donner ni le prevoir.
     */
    d.push({
      niveau: "info",
      code: "externes_accord",
      module: externes.module,
      pris: horsPlan,
    });
  }

  const sansHoraire = choisis.filter((c) => !c.horaireConnu);
  if (sansHoraire.length && choisis.length) {
    d.push({
      niveau: "info",
      code: "horaire_inconnu",
      sans: sansHoraire.length,
      total: choisis.length,
    });
  }

  /* ---------- total du diplome ---------- */
  if (total > regles.totalEcts) {
    d.push({
      niveau: "erreur",
      code: "total_depasse",
      total,
      exces: total - regles.totalEcts,
      requis: regles.totalEcts,
    });
  } else if (total < regles.totalEcts && total > 0) {
    d.push({ niveau: "info", code: "total_manque", total, requis: regles.totalEcts });
  }

  const erreurs = d.filter((x) => x.niveau === "erreur");
  if (!erreurs.length && total === regles.totalEcts) {
    d.push({ niveau: "ok", code: "plan_valide", total });
  }

  const ordre = { erreur: 0, info: 1, ok: 2 } as const;
  d.sort((a, b) => ordre[a.niveau] - ordre[b.niveau]);

  return {
    total,
    parModule,
    diagnostics: d,
    valide: erreurs.length === 0 && total === regles.totalEcts,
  };
}

/* ------------------------------------------------------------- affichage */

/** Les identifiants des cours qui se heurtent, pour les teinter dans la grille. */
export function coursEnConflit(diagnostics: Diagnostic[]): Set<string> {
  const s = new Set<string>();
  for (const d of diagnostics) {
    if (d.code === "chevauchement") for (const id of d.cours) s.add(id);
  }
  return s;
}

/** La phrase a lire, fabriquee dans la langue du lecteur. */
export function messageDiagnostic(
  d: Diagnostic,
  regles: Regles,
  langue: Langue,
): string {
  const T = textes(langue).diagnostics;
  const nom = (code: string) => {
    const m = regles.modules.find((x) => x.code === code);
    return m ? nomModule(m, langue) : code;
  };

  switch (d.code) {
    case "module_min":
      return T.moduleMin(nom(d.module), d.obtenu, d.requis);
    case "module_max":
      return T.moduleMax(nom(d.module), d.exces);
    case "module_fait":
      return T.moduleFait(nom(d.module));
    case "verrou":
      return T.verrou(
        nom(d.module),
        d.requis,
        enumerer(
          d.depuis.map((c) => c.replace(/^S?M/, "")),
          T.et,
        ),
        d.acquis,
      );
    case "chevauchement":
      return T.chevauchement(
        dansUnePhrase(libelleJour(d.jour, langue), langue),
        dansUnePhrase(libelleSemestre(d.semestre, langue), langue),
        d.titres[0],
        d.titres[1],
      );
    case "horaire_inconnu":
      return d.sans === d.total ? T.horaireAucun : T.horaireCertains(d.sans, d.total);
    case "externes_max":
      return T.externesMax(nom(d.module), d.pris, d.max);
    case "externes_accord":
      return T.externesAccord(nom(d.module), d.pris);
    case "total_depasse":
      return T.totalDepasse(d.total, d.exces, d.requis);
    case "total_manque":
      return T.totalManque(d.total, d.requis);
    case "plan_valide":
      return T.planValide(d.total);
  }
}

/** « 1, 2 et 3 », plutot qu'une liste de codes bruts colles a la virgule. */
function enumerer(xs: string[], et: string): string {
  if (xs.length <= 1) return xs[0] ?? "";
  return `${xs.slice(0, -1).join(", ")}${et}${xs[xs.length - 1]}`;
}

/**
 * Le nom d'un module.
 *
 * Les plans ecrivent « Sous-Module 4.1 » au MScCCF et « Sousmodule 1a » au MDE.
 * Une seule forme est affichee, sans quoi la meme notion change d'aspect d'un
 * master a l'autre.
 */
export function nomModule(m: Module, langue: Langue = "fr"): string {
  const nom = m.label.replace(/sous-?module/i, langue === "fr" ? "Sous-module" : "Sub-module");
  return nom;
}
