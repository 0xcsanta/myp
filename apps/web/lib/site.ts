/**
 * L'adresse publique du site.
 *
 * Elle sert au plan du site, au robots.txt et aux adresses canoniques, qui
 * doivent etre absolues. Trois sources, dans cet ordre :
 *
 *   1. NEXT_PUBLIC_SITE_URL, si un domaine propre est achete un jour ;
 *   2. le domaine de production que Vercel injecte de lui meme, ce qui rend le
 *      deploiement correct sans rien configurer ;
 *   3. localhost, pour le developpement.
 *
 * La valeur par defaut etait un domaine qui n'a pas
 * ete achete. Le site deploye annoncait donc dans son plan et ses adresses
 * canoniques une adresse qui ne repond pas, ce qui est pire que pas d'adresse
 * du tout : les moteurs suivent le canonique.
 */
const deVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (deVercel ? `https://${deVercel}` : "") ||
  "http://localhost:3000"
).replace(/\/$/, "");
