import type { Cours, Creneau, Module, Regles } from "./donnees";
import { libelleSemestre } from "./semestres";

/**
 * Le moteur de regles, transpose en TypeScript pour l'interface.
 *
 * La logique est celle de packages/rules, eprouvee par les tests sur les
 * vraies donnees du MScIS. Elle tourne ici cote client, sans reseau : la
 * selection de l'etudiant ne quitte jamais son appareil.
 */

export type Niveau = "erreur" | "info" | "ok";

export type Diagnostic = {
  niveau: Niveau;
  code: string;
  message: string;
  module?: string;
};

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
): Resultat {
  const parId = new Map(catalogue.map((c) => [c.id, c]));
  const choisis = [...selection].map((id) => parId.get(id)).filter(Boolean) as Cours[];
  const d: Diagnostic[] = [];
  const ajouter = (niveau: Niveau, code: string, message: string, module?: string) =>
    d.push({ niveau, code, message, module });

  /* ---------- credits par module ---------- */
  const parModule: Record<string, number> = {};
  for (const m of regles.modules) parModule[m.code] = 0;
  for (const c of choisis) parModule[c.module] = (parModule[c.module] ?? 0) + c.ects;

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
    const nom = nomModule(m);

    /*
     * Un module qui a des sous-modules ne parle pas en son nom : ses enfants
     * disent deja ce qu'il leur manque. Sans ce filtre, le MScIS annonce trois
     * fois le meme manque, pour le Module 4 puis pour ses deux sous-modules.
     */
    const aDesEnfants = enfantsDe(m.code).length > 0;

    if (obtenu < m.minEcts && !aDesEnfants) {
      ajouter(
        "erreur",
        "module_min",
        `${nom} : ${obtenu} crédits sur ${m.minEcts}. Il t'en manque ${m.minEcts - obtenu}.`,
        m.code,
      );
    }

    const max = m.maxEcts ?? (m.kind === "free_choice" ? Infinity : m.minEcts);
    if (obtenu > max && !aDesEnfants) {
      ajouter(
        "erreur",
        "module_max",
        `${nom} : tu dépasses de ${obtenu - max} crédits.`,
        m.code,
      );
    }

    if (obtenu === m.minEcts && !aDesEnfants) {
      ajouter("ok", "module_fait", `${nom} complet.`, m.code);
    }

    if (m.unlockedBy && choisis.some((c) => c.module === m.code)) {
      const acquis = somme(m.unlockedBy.ectsFrom.map((code) => parModule[code] ?? 0));
      if (acquis < m.unlockedBy.atLeast) {
        ajouter(
          "erreur",
          "verrou",
          `${nom} verrouillé : il faut ${m.unlockedBy.atLeast} crédits acquis aux modules ${enumerer(
            m.unlockedBy.ectsFrom.map((c) => c.replace(/^S?M/, "")),
          )}, tu en as ${acquis}.`,
          m.code,
        );
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
      ajouter(
        "erreur",
        "chevauchement",
        `Chevauchement le ${a.k.jour.toLowerCase()} en ${libelleSemestre(
          a.k.semestre,
        ).toLowerCase()} : ${a.c.titre} et ${b.c.titre}.`,
      );
    }
  }

  const sansHoraire = choisis.filter((c) => !c.horaireConnu);
  if (sansHoraire.length && choisis.length) {
    ajouter(
      "info",
      "horaire_inconnu",
      sansHoraire.length === choisis.length
        ? "Aucun horaire n'est encore relevé pour ce master, donc les chevauchements ne sont pas vérifiés."
        : sansHoraire.length === 1
          ? `1 cours sur ${choisis.length} n'a pas d'horaire relevé : ses chevauchements ne sont pas vérifiés.`
          : `${sansHoraire.length} cours sur ${choisis.length} n'ont pas d'horaire relevé : leurs chevauchements ne sont pas vérifiés.`,
    );
  }

  /* ---------- total du diplome ---------- */
  if (total > regles.totalEcts) {
    ajouter(
      "erreur",
      "total_depasse",
      `Total : ${total} crédits, soit ${total - regles.totalEcts} de plus que les ${regles.totalEcts} du diplôme.`,
    );
  } else if (total < regles.totalEcts && total > 0) {
    ajouter(
      "info",
      "total_manque",
      `Total : ${total} crédits sur ${regles.totalEcts}. Il t'en manque ${regles.totalEcts - total}.`,
    );
  }

  const erreurs = d.filter((x) => x.niveau === "erreur");
  if (!erreurs.length && total === regles.totalEcts) {
    ajouter(
      "ok",
      "plan_valide",
      `Plan complet et conforme. ${total} crédits, tous les modules satisfaits.`,
    );
  }

  const ordre = { erreur: 0, info: 1, ok: 2 } as const;
  d.sort((a, b) => ordre[a.niveau] - ordre[b.niveau]);

  return { total, parModule, diagnostics: d, valide: erreurs.length === 0 && total === regles.totalEcts };
}

/** « 1, 2 et 3 », plutot qu'une liste de codes bruts colles a la virgule. */
function enumerer(xs: string[]): string {
  if (xs.length <= 1) return xs[0] ?? "";
  return `${xs.slice(0, -1).join(", ")} et ${xs[xs.length - 1]}`;
}

export function nomModule(m: Module): string {
  return m.label.replace("Sous-Module", "Sous-module");
}
