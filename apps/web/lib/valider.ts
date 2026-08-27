import type { Cours, Creneau, Module, Regles } from "./donnees";
import type { Langue } from "./langues";
import { dansUnePhrase, libelleJour, libelleSemestre, rangEffectif } from "./semestres";
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
  | { niveau: "info"; code: "creneaux_multiples"; nombre: number }
  | { niveau: "erreur"; code: "externes_max"; module: string; pris: number; max: number }
  | { niveau: "erreur"; code: "orientations"; module: string; nombre: number }
  | { niveau: "info"; code: "externes_accord"; module: string; pris: number }
  | { niveau: "erreur"; code: "total_depasse"; total: number; exces: number; requis: number }
  | { niveau: "info"; code: "total_manque"; total: number; requis: number }
  | { niveau: "ok"; code: "plan_valide"; total: number };

export type Resultat = {
  total: number;
  parModule: Record<string, number>;
  diagnostics: Diagnostic[];
  valide: boolean;
  /**
   * Les modules qui ne concernent pas ce plan : les orientations qu'on n'a pas
   * choisies, quand le plan demande d'en choisir une. Ils n'exigent rien et ne
   * s'affichent pas.
   */
  enSommeil: Set<string>;
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
  /*
   * L'orientation suivie, quand le plan demande d'en choisir une. Les cours des
   * autres orientations ne sont pas des erreurs : le MScF les accepte au titre
   * de son Module 4, « Any compulsory courses in other tracks ». Il faut donc
   * savoir laquelle est la sienne, et le deviner serait arbitraire.
   */
  orientation: string | null = null,
  /*
   * Le semestre choisi pour les cours donnes a plusieurs, par identifiant. Sans
   * lui, un cours propose au premier et au troisieme semestre serait compare a
   * tout ce qui tombe dans les deux, et signalerait des heurts avec des cours
   * qu'on ne suivra jamais en meme temps que lui.
   */
  placements: Record<string, number> = {},
  /*
   * Le groupe retenu pour les cours donnes plusieurs fois dans le meme
   * semestre, par identifiant de cours et index de creneau. « Economie II » au
   * MDE en compte dix huit : ce sont des groupes paralleles, l'etudiant en suit
   * un. Tant qu'il n'a pas choisi, aucun heurt n'est signale pour ce cours,
   * puisqu'il lui reste le loisir d'en prendre un autre.
   */
  groupes: Record<string, number> = {},
): Resultat {
  const parId = new Map(catalogue.map((c) => [c.id, c]));
  const choisis = [...selection].map((id) => parId.get(id)).filter(Boolean) as Cours[];
  const d: Diagnostic[] = [];

  /* ---------- credits par module ---------- */
  const enfantsDe = (code: string) => regles.modules.filter((m) => m.parent === code);
  const descendants = (code: string): string[] =>
    enfantsDe(code).flatMap((f) => [f.code, ...descendants(f.code)]);

  /*
   * Ou compter chaque cours.
   *
   * Normalement, dans son module. Mais un cours pris dans une orientation
   * qu'on ne suit pas compte au module qui les accueille, quand le plan le
   * prevoit : il devient un enseignement a option comme un autre. Sans cette
   * bascule, il gonflerait une orientation qui n'est pas la sienne et le plan
   * paraitrait faux.
   */
  const choix = regles.modules.find((m) => m.choisirUn);
  const accueil = regles.autresOrientations?.moduleDAccueil ?? null;
  const branchesNonSuivies = new Set<string>();
  if (choix && accueil && orientation) {
    for (const b of enfantsDe(choix.code)) {
      if (b.code === orientation) continue;
      branchesNonSuivies.add(b.code);
      for (const d of descendants(b.code)) branchesNonSuivies.add(d);
    }
  }
  const moduleDe = (c: Cours) =>
    branchesNonSuivies.has(c.module) && accueil ? accueil : c.module;

  const parModule: Record<string, number> = {};
  for (const m of regles.modules) parModule[m.code] = 0;
  for (const c of choisis) {
    const code = moduleDe(c);
    parModule[code] = (parModule[code] ?? 0) + c.ects;
  }

  const externes = regles.externes;
  const horsPlan = externes ? Math.max(0, creditsExternes) : 0;
  if (externes && horsPlan) {
    parModule[externes.module] = (parModule[externes.module] ?? 0) + horsPlan;
  }

  /*
   * Un module parent n'a pas de cours en propre : ses credits sont ceux de ses
   * sous-modules. Sans cette remontee, le Module 4 du MScIS reste a zero alors
   * que le memoire le remplit, et le total du diplome est compte deux fois.
   *
   * La remontee est recursive, et ce n'est pas un detail. En parcourant les
   * modules dans l'ordre du plan, un parent etait calcule avant ses propres
   * enfants : le Module 3 du MScF, seul a compter trois niveaux, restait a zero
   * alors que son sous-sous-module 3.2.1 etait rempli.
   */
  const feuilles = { ...parModule };
  const totalDe = (code: string): number => {
    const enfants = enfantsDe(code);
    return enfants.length
      ? somme(enfants.map((e) => totalDe(e.code)))
      : (feuilles[code] ?? 0);
  };
  for (const m of regles.modules) parModule[m.code] = totalDe(m.code);

  /*
   * Les orientations qu'on ne suit pas.
   *
   * « MODULE 3: Choose the submodule of your orientation » : celui qui prend
   * l'orientation 3.3 n'a pas a se voir reclamer les neuf credits du
   * sous-sous-module 3.2.1, qui appartient a une autre orientation. Tant
   * qu'aucune n'est choisie, toutes dorment et c'est le module parent qui
   * porte l'exigence, avec son seuil a lui.
   */
  const enSommeil = new Set<string>();
  for (const m of regles.modules) {
    if (!m.choisirUn) continue;
    const branches = enfantsDe(m.code);
    /*
     * L'orientation annoncee fait foi. A defaut, on regarde ou des cours sont
     * coches, ce qui suffit tant que l'etudiant ne pioche que dans une seule.
     */
    const suivie = (b: Module) => {
      if (orientation) return b.code === orientation;
      const codes = [b.code, ...descendants(b.code)];
      return choisis.some((c) => codes.includes(c.module));
    };
    const suivies = branches.filter(suivie);
    for (const b of branches) {
      if (suivies.length && suivies.includes(b)) continue;
      enSommeil.add(b.code);
      for (const d of descendants(b.code)) enSommeil.add(d);
    }
  }

  const racines = regles.modules.filter((m) => !m.parent);
  const total = somme(racines.map((m) => parModule[m.code] ?? 0));

  /* ---------- chaque module ---------- */
  for (const m of regles.modules) {
    if (enSommeil.has(m.code)) continue;
    const obtenu = parModule[m.code] ?? 0;

    /*
     * Un module qui a des sous-modules ne parle pas en son nom : ses enfants
     * disent deja ce qu'il leur manque. Sans ce filtre, le MScIS annonce trois
     * fois le meme manque, pour le Module 4 puis pour ses deux sous-modules.
     */
    const aDesEnfants = enfantsDe(m.code).length > 0;

    /*
     * Un module dont le plan ne chiffre aucun seuil ne peut rien exiger. Les
     * sous-modules d'orientation du MScF sont dans ce cas : leur en-tete ne
     * porte pas de credits, c'est le module parent qui les donne pour tous.
     * Sans ce filtre, ils s'annonceraient « complets » a zero credit.
     */
    const aUnSeuil = m.minEcts > 0;

    if (aUnSeuil && obtenu < m.minEcts && !aDesEnfants) {
      d.push({
        niveau: "erreur",
        code: "module_min",
        module: m.code,
        obtenu,
        requis: m.minEcts,
      });
    }

    const max = m.maxEcts ?? (m.kind === "free_choice" ? Infinity : m.minEcts);
    if (aUnSeuil && obtenu > max && !aDesEnfants) {
      d.push({ niveau: "erreur", code: "module_max", module: m.code, exces: obtenu - max });
    }

    if (aUnSeuil && obtenu === m.minEcts && !aDesEnfants) {
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

  /* ---------- une seule orientation a la fois ---------- */
  for (const m of regles.modules) {
    if (!m.choisirUn) continue;
    /*
     * Quand le plan accueille les cours des autres orientations, en prendre
     * plusieurs n'est pas une faute : ils comptent ailleurs. L'avertissement ne
     * vaut que pour les plans qui n'ouvrent pas cette porte.
     */
    if (accueil) continue;
    const enfants = enfantsDe(m.code);
    const garnis = enfants.filter((e) => {
      const sousEnfants = enfantsDe(e.code);
      const codes = sousEnfants.length ? sousEnfants.map((x) => x.code) : [e.code];
      return choisis.some((c) => codes.includes(c.module));
    });
    if (garnis.length > 1) {
      d.push({
        niveau: "erreur",
        code: "orientations",
        module: m.code,
        nombre: garnis.length,
      });
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

  /*
   * Un cours donne en plusieurs groupes n'entre dans la comparaison que si l'on
   * a dit lequel on suit. Sans cela, « Economie II » et ses dix huit creneaux
   * se heurterait a presque tout l'horaire, alors qu'aucun de ces heurts n'est
   * inevitable : il suffit de changer de groupe.
   */
  const parSemestre = (c: Cours) => {
    const n: Record<string, number> = {};
    for (const k of c.creneaux) n[k.semestre] = (n[k.semestre] ?? 0) + 1;
    return n;
  };
  const groupeFixe = (c: Cours, k: Creneau) => {
    const compte = parSemestre(c)[k.semestre] ?? 0;
    if (compte <= 1) return true;
    const i = groupes[c.id];
    return i !== undefined && c.creneaux[i] === k;
  };

  const creneaux: { c: Cours; k: Creneau }[] = avecHoraire.flatMap((c) =>
    c.creneaux.filter((k) => groupeFixe(c, k)).map((k) => ({ c, k })),
  );
  const reguliers = creneaux.filter(
    (x) => x.k.cadence === "hebdomadaire" || x.k.cadence === "quinzaine",
  );

  /*
   * Deux cours ne se heurtent que si l'on peut les suivre en meme temps.
   *
   * Un master de cent vingt credits compte quatre semestres, dont deux
   * automnes. Un cours du premier semestre et un cours du troisieme tombent
   * tous deux a l'automne, et l'agenda officiel les place au meme creneau,
   * mais l'etudiant les suit a un an d'intervalle : ce n'est pas un conflit.
   * Ils doivent donc partager au moins une colonne du plan.
   *
   * Un plan qui ne dit rien ne permet pas de trancher : dans ce cas on compare
   * quand meme, quitte a signaler un chevauchement de trop plutot que d'en
   * taire un vrai.
   */
  const memeMoment = (x: Cours, y: Cours) => {
    if (!x.colonnes.length || !y.colonnes.length) return true;
    const rx = rangEffectif(x.colonnes, placements[x.id]);
    const ry = rangEffectif(y.colonnes, placements[y.id]);
    return rx !== null && ry !== null ? rx === ry : true;
  };

  for (let i = 0; i < reguliers.length; i++) {
    for (let j = i + 1; j < reguliers.length; j++) {
      const a = reguliers[i];
      const b = reguliers[j];
      if (a.c.id === b.c.id) continue;
      if (a.k.semestre !== b.k.semestre || a.k.jour !== b.k.jour) continue;
      if (!memeMoment(a.c, b.c)) continue;
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

  /*
   * Les cours a plusieurs creneaux dont on n'a pas dit lequel on suit. Ils sont
   * ecartes de la comparaison, donc il faut le dire : sans cela, l'absence de
   * chevauchement passerait pour une verification faite, alors qu'elle est
   * seulement suspendue.
   */
  const enAttente = avecHoraire.filter((c) => {
    const n = parSemestre(c);
    return Object.values(n).some((v) => v > 1) && groupes[c.id] === undefined;
  });
  if (enAttente.length) {
    d.push({ niveau: "info", code: "creneaux_multiples", nombre: enAttente.length });
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
    enSommeil,
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
    case "orientations":
      return T.orientations(nom(d.module), d.nombre);
    case "creneaux_multiples":
      return T.creneauxMultiples(d.nombre);
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
  /*
   * Les plans ecrivent la meme notion de cinq facons : « Module 1 »,
   * « Sous-Module 3.1 » au MScCCF, « Sousmodule 1a » au MDE, « Submodule 3.1 »
   * et « Sub-Submodule 3.2.1 » au MScF. Une seule forme est affichee, dans la
   * langue du lecteur, sans quoi la meme notion change d'aspect d'un master a
   * l'autre et d'une ligne a la suivante.
   */
  const numero = m.label.replace(/^[^\d]*/, "").trim();
  const sousSous = /sub-?sub|sous-?sous/i.test(m.label);
  const sous = !sousSous && /sub|sous/i.test(m.label);
  const mot = sousSous
    ? langue === "fr"
      ? "Sous-sous-module"
      : "Sub-submodule"
    : sous
      ? langue === "fr"
        ? "Sous-module"
        : "Submodule"
      : "Module";
  return numero ? `${mot} ${numero}` : mot;
}
