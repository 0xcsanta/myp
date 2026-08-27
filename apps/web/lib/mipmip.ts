import fs from "node:fs";
import path from "node:path";

import { coursDe, master, reglesDe } from "./donnees";
import type { Langue } from "./langues";

/**
 * Mipmip, la mascotte qui repond aux questions sur les cours.
 *
 * Le probleme de fond n'est pas de faire parler un modele, c'est de
 * l'empecher de parler d'autre chose. Un site public, ouvert a des etudiants
 * et a des enseignants, ne peut pas heberger un assistant qui donne son avis
 * sur la politique ou qui invente un prerequis. Et une consigne, aussi ferme
 * soit-elle, reste une phrase que le modele peut choisir d'ignorer : sur un
 * petit modele, il suffit souvent de le lui demander.
 *
 * Le verrou est donc pose en trois couches, dont la derniere ne fait aucune
 * confiance au modele.
 *
 *   1. Le contexte. Le modele ne recoit que les cours du master consulte. Il
 *      n'a rien d'autre sous la main a quoi se raccrocher.
 *   2. La consigne. Elle impose de repondre a partir de ce seul contexte, de
 *      nommer les cours utilises, et de renvoyer a la fiche officielle.
 *   3. La verification, cote serveur. La reponse doit citer au moins un cours
 *      qui existe vraiment dans le contexte. Sinon elle est jetee et
 *      remplacee par un refus ecrit d'avance. Une reponse hors sujet, ou
 *      obtenue en detournant la consigne, ne cite aucun cours reel : elle ne
 *      passe pas. Cette couche tient meme si les deux premieres cedent.
 */

const RACINE = path.join(process.cwd(), "..", "..", "data");

export type Details = {
  titre: string;
  source: string;
  resume?: Record<string, { quoi: string; programme: string }>;
  faits?: Record<string, Record<string, unknown>>;
  langues?: string;
  credits?: number;
  moodle?: string;
};

let cacheDetails: Record<string, Details> | null = null;

/*
 * Le fichier est relu a chaque appel en developpement, et garde en memoire
 * une seule fois en production. Il est ecrit par tools_fiches_publier.py, donc
 * il change pendant qu'on travaille : le retenir ferait mentir la page a
 * chaque regeneration, et on chercherait le defaut ailleurs.
 */
export function detailsDesCours(): Record<string, Details> {
  if (cacheDetails && process.env.NODE_ENV === "production") return cacheDetails;
  const f = path.join(RACINE, "cours-details.json");
  cacheDetails = fs.existsSync(f)
    ? (JSON.parse(fs.readFileSync(f, "utf8")) as Record<string, Details>)
    : {};
  return cacheDetails;
}

const JOURS_COURTS: Record<string, string> = {
  Lundi: "lun",
  Mardi: "mar",
  Mercredi: "mer",
  Jeudi: "jeu",
  Vendredi: "ven",
  Samedi: "sam",
};

/**
 * Le catalogue d'un master, mis a plat pour tenir dans une consigne.
 *
 * Une ligne par cours, les faits d'abord, le resume ensuite quand il existe.
 * Le format est volontairement telegraphique : chaque mot economise ici est
 * paye a chaque question posee par chaque etudiant.
 */
export function contexteDuMaster(slug: string, langue: Langue): string | null {
  const m = master(slug);
  if (!m) return null;

  const regles = reglesDe(slug);
  const cours = coursDe(slug, langue);
  const details = detailsDesCours();

  const lignes = cours.map((c) => {
    const bouts = [c.titre, `${c.ects} ECTS`, `module ${c.module}`];
    if (c.saisons.length) bouts.push(c.saisons.join(" et "));
    if (c.langue) bouts.push(`langue ${c.langue}`);
    if (c.enseignants) bouts.push(c.enseignants);
    if (c.evaluation) {
      bouts.push(c.dureeExamen ? `${c.evaluation} ${c.dureeExamen}min` : c.evaluation);
    }
    if (c.creneaux.length) {
      bouts.push(
        c.creneaux
          .map((x) => `${JOURS_COURTS[x.jour] ?? x.jour} ${x.debut}-${x.fin}`)
          .join(" "),
      );
    }

    const d = details[c.titre];
    const r = d?.resume?.[langue];
    let ligne = `- ${bouts.join(" | ")}`;
    if (r) ligne += `\n  ${r.quoi}\n  Au programme : ${r.programme}`;
    const prereq = d?.faits?.[langue]?.prerequis;
    if (typeof prereq === "string") ligne += `\n  Prerequis : ${prereq.slice(0, 200)}`;
    return ligne;
  });

  return [
    `MASTER : ${m.long} (${slug}), ${regles.totalEcts} ECTS, annee ${regles.year}.`,
    `COURS DE CE MASTER, et rien d'autre :`,
    ...lignes,
  ].join("\n");
}

/** Les titres exacts du master, pour verifier ce que le modele pretend citer. */
export function titresDuMaster(slug: string, langue: Langue): Set<string> {
  return new Set(coursDe(slug, langue).map((c) => c.titre));
}

export {
  CONSIGNE,
  filtrerReponse,
  RAPPEL,
  REFUS,
} from "./mipmip-verrou";
