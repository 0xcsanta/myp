import type { Cours } from "./donnees";
import type { Langue } from "./langues";

/**
 * Helpers de semestre et de jour, dans leur propre module et sans acces disque.
 *
 * Ils sont appeles depuis des composants client. Les laisser dans donnees.ts,
 * qui lit le systeme de fichiers, tirait `node:fs` dans le paquet du
 * navigateur et faisait echouer la compilation. Les types peuvent traverser la
 * frontiere, les valeurs non.
 *
 * Les jours et les saisons sont stockes en francais, tels que les ecrivent les
 * documents officiels. Ils sont traduits a l'affichage, jamais dans les
 * donnees : le releve doit rester comparable au PDF dont il sort.
 */

const SAISONS: Record<string, [string, string]> = {
  automne: ["Automne", "Autumn"],
  printemps: ["Printemps", "Spring"],
};

const JOURS: Record<string, [string, string]> = {
  Lundi: ["Lundi", "Monday"],
  Mardi: ["Mardi", "Tuesday"],
  Mercredi: ["Mercredi", "Wednesday"],
  Jeudi: ["Jeudi", "Thursday"],
  Vendredi: ["Vendredi", "Friday"],
  Samedi: ["Samedi", "Saturday"],
};

const idx = (l: Langue) => (l === "fr" ? 0 : 1);

/** « automne-2026 » devient « Automne 2026 », ou « Autumn 2026 ». */
export function libelleSemestre(cle: string, langue: Langue = "fr"): string {
  const [saison, an] = cle.split("-");
  if (!saison || !an) return cle;
  const nom = SAISONS[saison]?.[idx(langue)];
  return nom ? `${nom} ${an}` : `${saison.charAt(0).toUpperCase()}${saison.slice(1)} ${an}`;
}

/** « Lundi » reste « Lundi », ou devient « Monday ». */
export function libelleJour(jour: string, langue: Langue = "fr"): string {
  return JOURS[jour]?.[idx(langue)] ?? jour;
}

/** Les cinq jours ouvrables, dans l'ordre de la grille. */
export const JOURS_OUVRABLES = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

/** « automne » devient « automne », ou « autumn » : en minuscules, dans une liste. */
export function libelleSaison(saison: string, langue: Langue = "fr"): string {
  return (SAISONS[saison]?.[idx(langue)] ?? saison).toLowerCase();
}

/**
 * La casse d'un nom propre glisse dans une phrase.
 *
 * Le francais ecrit « le jeudi en automne 2026 » en minuscules, l'anglais
 * ecrit « on Thursday in Autumn 2026 » avec des majuscules. Mettre en
 * minuscules dans l'appelant marchait en francais et fabriquait de l'anglais
 * fautif : la regle appartient a la langue, pas au composant.
 */
export function dansUnePhrase(mot: string, langue: Langue): string {
  return langue === "fr" ? mot.toLowerCase() : mot;
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

/**
 * L'annee academique a laquelle appartient un semestre.
 *
 * Une annee academique va de l'automne d'une annee civile au printemps de la
 * suivante : « automne-2026 » et « printemps-2027 » forment 2026-2027. Ce
 * decalage n'est pas cosmetique. Le releve d'aout 2026 contient un automne
 * 2026, qui est bien le semestre a venir, et un printemps 2026, qui appartient
 * a l'annee precedente et s'est deja termine. Sans cette distinction, un
 * etudiant qui prepare 2026-2027 prendrait le printemps affiche pour le sien.
 *
 * Verifie sur les donnees elles memes : les mentions « debute le 28 septembre »
 * et « debute le 16 fevrier » portees par les PDF tombent sur le jour de la
 * semaine annonce en 2026, et sur aucun autre jour en 2027.
 */
export function anneeAcademique(cle: string): string {
  const [saison, an] = cle.split("-");
  const n = Number(an);
  if (!saison || !Number.isFinite(n)) return cle;
  return saison === "automne" ? `${n}-${n + 1}` : `${n - 1}-${n}`;
}

/*
 * Les colonnes de semestre du plan.
 *
 * Un master de cent vingt credits en compte quatre : automne, printemps,
 * automne, printemps. Deux cours d'automne peuvent donc etre au premier et au
 * troisieme semestre, soit a un an d'ecart. N'afficher que la saison, comme le
 * site le faisait, revenait a perdre cette information : « Blockchain and
 * Crypto Economy » est au deuxieme semestre et « Advanced Data Analysis » au
 * troisieme, et rien ne le disait.
 */
const RANGS: Record<number, [string, string]> = {
  1: ["1er", "1st"],
  2: ["2e", "2nd"],
  3: ["3e", "3rd"],
  4: ["4e", "4th"],
};

const SAISON_DE: Record<number, string> = {
  1: "automne",
  2: "printemps",
  3: "automne",
  4: "printemps",
};

/** « 1er ou 3e sem, automne ». Rien du tout si le plan ne dit rien. */
export function libelleColonnes(colonnes: number[], langue: Langue): string | null {
  const rangs = [...new Set(colonnes)].filter((n) => RANGS[n]).sort((a, b) => a - b);
  if (!rangs.length) return null;

  const ou = langue === "fr" ? " ou " : " or ";
  const nums = rangs.map((n) => RANGS[n][idx(langue)]);
  const liste =
    nums.length === 1
      ? nums[0]
      : `${nums.slice(0, -1).join(", ")}${ou}${nums[nums.length - 1]}`;
  const sem = langue === "fr" ? "sem" : "sem";

  // la saison n'est dite que si toutes les colonnes tombent dans la meme
  const saisons = [...new Set(rangs.map((n) => SAISON_DE[n]))];
  if (saisons.length !== 1) return `${liste} ${sem}`;
  return `${liste} ${sem}, ${libelleSaison(saisons[0], langue)}`;
}

/** Le premier et le troisieme semestre tombent a l'automne, les autres au printemps. */
export const saisonDuRang = (rang: number) => (rang % 2 === 1 ? "automne" : "printemps");

/** « 1er semestre », pour les boutons de choix. */
export function libelleRang(rang: number, langue: Langue): string {
  const r = RANGS[rang]?.[idx(langue)] ?? String(rang);
  return langue === "fr" ? `${r} semestre` : `${r} semester`;
}

/** Les rangs de semestre que couvrent ces cours, dans l'ordre du plan. */
export function rangsDe(cours: Cours[]): number[] {
  const s = new Set<number>();
  for (const c of cours) for (const n of c.colonnes) if (n >= 1 && n <= 4) s.add(n);
  return [...s].sort((a, b) => a - b);
}
