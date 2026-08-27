import type { Cours } from "./donnees";
import type { Langue } from "./langues";
import { libelleJour, libelleSemestre } from "./semestres";
import { textes } from "./textes";

/**
 * Les creneaux d'un cours, ecrits en clair.
 *
 * « Lundi 08:30 a 12:00 · Internef 263 ». La grille montre deja ces horaires,
 * mais elle ne montre que les cours coches : la ligne du catalogue est le seul
 * endroit ou l'on voit l'horaire d'un cours avant de le prendre.
 *
 * Un cours sans releve ne renvoie rien plutot qu'une plage vide : le site dit
 * ce qu'il ne sait pas, il ne l'invente pas.
 */
export function libelleCreneaux(c: Cours, langue: Langue): string | null {
  if (!c.horaireConnu || !c.creneaux.length) return null;
  const T = textes(langue).plan;
  return c.creneaux
    .map((k) => {
      const quand = T.creneau(libelleJour(k.jour, langue), k.debut, k.fin);
      return k.salle ? `${quand} · ${k.salle}` : quand;
    })
    .join(" · ");
}

/** Les semestres ou le cours est effectivement donne, d'apres le releve. */
export function semestresDuCours(c: Cours, langue: Langue): string[] {
  return [...new Set(c.creneaux.map((k) => k.semestre))].map((s) =>
    libelleSemestre(s, langue),
  );
}
