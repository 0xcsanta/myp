/**
 * L'adresse publique du site.
 *
 * Le domaine n'est pas encore arrete : il est lu dans l'environnement, et la
 * valeur par defaut n'est qu'un espoir raisonnable. Elle sert au plan du site,
 * au robots.txt et aux adresses canoniques, qui doivent etre absolues. Quand
 * Clement aura tranche, une seule variable suffit :
 *
 *     NEXT_PUBLIC_SITE_URL=https://exemple.ch
 */
export const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://myp.omniscient.swiss";
