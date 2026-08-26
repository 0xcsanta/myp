/**
 * Les langues de l'application.
 *
 * L'anglais est prevu dans la structure des adresses des maintenant, mais il
 * n'est pas encore genere : l'interface est ecrite en francais, et servir du
 * francais sous une adresse `/app/en` serait mensonger pour le lecteur comme
 * pour les moteurs de recherche. Ajouter l'anglais consistera a traduire les
 * chaines puis a l'ajouter ici.
 */
export const LANGUES = ["fr"] as const;
export type Langue = (typeof LANGUES)[number];

export const LANGUE_PAR_DEFAUT: Langue = "fr";

export const estLangue = (v: string): v is Langue =>
  (LANGUES as readonly string[]).includes(v);
