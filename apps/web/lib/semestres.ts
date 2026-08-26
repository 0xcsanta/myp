import type { Cours } from "./donnees";

/**
 * Helpers de semestre, dans leur propre module et sans acces disque.
 *
 * Ils sont appeles depuis des composants client. Les laisser dans donnees.ts,
 * qui lit le systeme de fichiers, tirait `node:fs` dans le paquet du
 * navigateur et faisait echouer la compilation. Les types peuvent traverser la
 * frontiere, les valeurs non.
 */

/** « automne-2026 » devient « Automne 2026 ». */
export function libelleSemestre(cle: string): string {
  const [saison, an] = cle.split("-");
  if (!saison || !an) return cle;
  return `${saison.charAt(0).toUpperCase()}${saison.slice(1)} ${an}`;
}

/** Les semestres presents dans un releve, du plus ancien au plus recent. */
export function semestresDe(cours: Cours[]): string[] {
  const s = new Set<string>();
  for (const c of cours) for (const k of c.creneaux) s.add(k.semestre);
  return [...s].sort((a, b) => {
    const [sa, aa] = a.split("-");
    const [sb, ab] = b.split("-");
    return aa === ab ? (sa === "printemps" ? -1 : 1) : Number(aa) - Number(ab);
  });
}
