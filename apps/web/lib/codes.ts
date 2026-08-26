import type { Langue } from "./langues";

/**
 * Les codes des plans d'etudes, rendus lisibles.
 *
 * Le plan note la langue d'enseignement et le type d'evaluation par des
 * lettres, et l'interface les affichait telles quelles : « A · VCN+ENEP ».
 * Illisible, et trompeur, car le meme anglais s'ecrit `A` dans les plans
 * rediges en francais et `E` dans ceux rediges en anglais. Les deux legendes
 * officielles le disent noir sur blanc :
 *
 *   plans francais : « Langue: Langue d'enseignement (F: Francais; A: Anglais) »
 *   plans anglais  : « Language: Teaching language (F: French; E: English) »
 *
 * Le libelle francais des types d'evaluation est celui de la legende, mot pour
 * mot. Aucun plan ne donne cette legende en anglais, meme ceux qui sont ecrits
 * en anglais : la colonne de droite est donc une traduction de ma main, ce qui
 * est note dans docs/SOURCES.md.
 *
 * Un code absent de la legende n'est pas devine : il est rendu tel quel.
 */

const LANGUE_COURS: Record<string, [string, string]> = {
  F: ["français", "French"],
  A: ["anglais", "English"],
  E: ["anglais", "English"],
};

const EVALUATION: Record<string, [string, string]> = {
  E: ["examen écrit", "written exam"],
  ENEP: ["examen numérique en présentiel", "on site digital exam"],
  O: ["examen oral", "oral exam"],
  VCN: ["validation continue notée", "graded continuous assessment"],
  M: ["mémoire", "master thesis"],
};

const idx = (l: Langue) => (l === "fr" ? 0 : 1);

/** « F/A » devient « français ou anglais ». */
export function langueDuCours(code: string | null, l: Langue): string | null {
  if (!code) return null;
  const ou = l === "fr" ? " ou " : " or ";
  const morceaux = code.split("/").map((c) => LANGUE_COURS[c.trim()]?.[idx(l)] ?? null);
  if (morceaux.some((m) => m === null)) return code;
  return [...new Set(morceaux as string[])].join(ou);
}

/** « VCN+ENEP » devient « validation continue notée et examen numérique... ». */
export function evaluationDuCours(code: string | null, l: Langue): string | null {
  if (!code) return null;
  const et = l === "fr" ? " et " : " and ";
  const morceaux = code.split("+").map((c) => EVALUATION[c.trim()]?.[idx(l)] ?? null);
  if (morceaux.some((m) => m === null)) return code;
  return (morceaux as string[]).join(et);
}
