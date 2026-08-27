import { bilanParSemestre } from "./bilan";
import type { Cours, Regles } from "./donnees";

/**
 * La comparaison de deux plans.
 *
 * Un etudiant hesite rarement entre valide et invalide : il hesite entre deux
 * plans qui tiennent tous les deux. Ce que le site savait dire, c'est si un
 * plan passe. Ce qu'il ne savait pas dire, c'est en quoi celui ci differe de
 * celui la, ce qui est pourtant la question qu'on se pose a ce moment.
 *
 * Le module est pur : deux selections, un catalogue, des regles, et il rend la
 * difference. Rien d'affiche, rien de stocke.
 */

export type LigneComparee = {
  code: string;
  a: number;
  b: number;
};

export type Comparaison = {
  totalA: number;
  totalB: number;
  /** Les modules ou les deux plans ne totalisent pas la meme chose. */
  modules: LigneComparee[];
  /** Les semestres ou la charge differe, en credits. */
  semestres: LigneComparee[];
  /** Les cours du plan B absents du plan A. */
  entrants: Cours[];
  /** Les cours du plan A absents du plan B. */
  sortants: Cours[];
  /** Vrai si les deux plans retiennent exactement les memes cours. */
  identiques: boolean;
};

/**
 * Les credits par module, calcules comme le fait valider().
 *
 * Volontairement plus simple : la comparaison ne remonte pas les credits d'un
 * sous-module vers son parent. Elle ne montre que des feuilles, ou la
 * difference se lit sans ambiguite. Remonter donnerait deux fois le meme ecart,
 * une fois sur l'enfant et une fois sur le parent, et laisserait croire a deux
 * problemes la ou il n'y en a qu'un.
 */
function parModule(choisis: Cours[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of choisis) out[c.module] = (out[c.module] ?? 0) + c.ects;
  return out;
}

export function comparer({
  catalogue,
  regles,
  a,
  b,
  placementsA,
  placementsB,
  groupesA,
  groupesB,
}: {
  catalogue: Cours[];
  regles: Regles;
  a: Set<string>;
  b: Set<string>;
  placementsA: Record<string, number>;
  placementsB: Record<string, number>;
  groupesA: Record<string, number>;
  groupesB: Record<string, number>;
}): Comparaison {
  const coursA = catalogue.filter((c) => a.has(c.id));
  const coursB = catalogue.filter((c) => b.has(c.id));

  const mA = parModule(coursA);
  const mB = parModule(coursB);
  const codes = [...new Set([...regles.modules.map((m) => m.code), ...Object.keys(mA), ...Object.keys(mB)])];
  const modules = codes
    .map((code) => ({ code, a: mA[code] ?? 0, b: mB[code] ?? 0 }))
    .filter((l) => l.a !== l.b);

  const sA = bilanParSemestre(coursA, placementsA, groupesA);
  const sB = bilanParSemestre(coursB, placementsB, groupesB);
  const rangs = [...new Set([...sA.map((x) => x.rang), ...sB.map((x) => x.rang)])].sort();
  const semestres = rangs
    .map((r) => ({
      code: String(r),
      a: sA.find((x) => x.rang === r)?.ects ?? 0,
      b: sB.find((x) => x.rang === r)?.ects ?? 0,
    }))
    .filter((l) => l.a !== l.b);

  const entrants = coursB.filter((c) => !a.has(c.id));
  const sortants = coursA.filter((c) => !b.has(c.id));

  return {
    totalA: coursA.reduce((n, c) => n + c.ects, 0),
    totalB: coursB.reduce((n, c) => n + c.ects, 0),
    modules,
    semestres,
    entrants,
    sortants,
    identiques: entrants.length === 0 && sortants.length === 0,
  };
}
