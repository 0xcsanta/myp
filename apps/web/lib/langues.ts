/**
 * Les langues de l'application.
 *
 * Le francais est la langue de reference : le dictionnaire anglais est type
 * d'apres lui, donc une chaine oubliee arrete la compilation au lieu de
 * laisser passer du francais sous une adresse anglaise.
 */
export const LANGUES = ["fr", "en"] as const;
export type Langue = (typeof LANGUES)[number];

export const LANGUE_PAR_DEFAUT: Langue = "fr";

export const estLangue = (v: string): v is Langue =>
  (LANGUES as readonly string[]).includes(v);

/** L'autre langue, pour le bouton de bascule. */
export const autreLangue = (l: Langue): Langue => (l === "fr" ? "en" : "fr");
