"use client";

import type { ReactElement } from "react";
import type { Cours } from "@/lib/donnees";
import type { Langue } from "@/lib/langues";
import { JOURS_OUVRABLES, libelleJour } from "@/lib/semestres";
import { textes } from "@/lib/textes";

/**
 * La grille horaire d'un semestre.
 *
 * Les blocs sont poses en absolu sur une colonne par jour, a leur heure reelle.
 * Quand deux cours se chevauchent, ils se partagent la largeur de la colonne
 * au lieu de se cacher : un chevauchement doit se voir, pas disparaitre.
 *
 * Tant qu'aucun horaire n'est releve, ce composant ne s'affiche pas. Le
 * planificateur dit alors ce qu'il ne sait pas, plutot que de montrer une
 * grille vide qui laisserait croire a un emploi du temps libre.
 */

/*
 * Les jours sont stockes en francais, comme les ecrit l'agenda officiel : le
 * releve doit rester comparable au PDF dont il sort. Seul l'affichage traduit.
 */
const JOURS = JOURS_OUVRABLES;
const DEBUT = 8 * 60;
const FIN = 20 * 60;
const PX_PAR_MIN = 0.86;

type Bloc = { cours: Cours; jour: string; debut: number; fin: number; salle: string | null; voie: number; voies: number };

/** Repartit les blocs d'un jour en voies, pour que rien ne se recouvre. */
function disposer(blocs: Omit<Bloc, "voie" | "voies">[]): Bloc[] {
  const out: Bloc[] = [];
  for (const jour of JOURS) {
    const duJour = blocs.filter((b) => b.jour === jour).sort((a, b) => a.debut - b.debut);
    let groupe: typeof duJour = [];
    let finGroupe = -1;
    const vider = () => {
      groupe.forEach((b, i) => out.push({ ...b, voie: i, voies: groupe.length }));
      groupe = [];
      finGroupe = -1;
    };
    for (const b of duJour) {
      if (groupe.length && b.debut >= finGroupe) vider();
      groupe.push(b);
      finGroupe = Math.max(finGroupe, b.fin);
    }
    vider();
  }
  return out;
}

export function GrilleHoraire({
  cours,
  semestre,
  enConflit,
  langue,
  groupes = {},
}: {
  cours: Cours[];
  semestre: string;
  enConflit: Set<string>;
  langue: Langue;
  /** Le groupe retenu pour les cours donnes plusieurs fois dans le semestre. */
  groupes?: Record<string, number>;
}) {
  const T = textes(langue).grille;
  const bruts = cours.flatMap((c) => {
    /*
     * Un cours donne en plusieurs groupes n'affiche que celui qu'on suit. Sans
     * ce filtre, « Economie II » posait dix huit blocs sur la grille pour un
     * seul cours, et l'emploi du temps devenait illisible.
     */
    const duSemestre = c.creneaux.filter((k) => k.semestre === semestre);
    const retenu = groupes[c.id];
    const garder =
      duSemestre.length > 1 && retenu !== undefined && c.creneaux[retenu]
        ? [c.creneaux[retenu]].filter((k) => k.semestre === semestre)
        : duSemestre;
    return garder
      .filter((k) => Number.isFinite(k.debutMin))
      .map((k) => ({
        cours: c,
        jour: k.jour,
        debut: k.debutMin,
        fin: k.finMin,
        salle: k.salle,
      }));
  });
  if (!bruts.length) return null;

  const blocs = disposer(bruts);
  const hauteur = (FIN - DEBUT) * PX_PAR_MIN;

  const lignes: ReactElement[] = [];
  for (let m = DEBUT; m <= FIN; m += 60) {
    lignes.push(
      <div
        key={m}
        className="pointer-events-none absolute inset-x-0 border-t border-line/70"
        style={{ top: (m - DEBUT) * PX_PAR_MIN }}
      />,
    );
  }

  return (
    /* Le fond de la grille est choisi par l'etudiant : voir ChoixDeFond, qui
       pose un attribut sur la racine du document que la feuille de style
       traduit en degrade. Blanc par defaut. */
    <div className="fond-du-calendrier overflow-x-auto rounded-2xl border border-line">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-[58px_repeat(5,1fr)] border-b border-line">
          <div />
          {JOURS.map((j) => (
            <div key={j} className="py-2.5 text-center text-[12.5px] font-semibold text-ink">
              {libelleJour(j, langue)}
            </div>
          ))}
        </div>

        <div className="relative grid grid-cols-[58px_repeat(5,1fr)]" style={{ height: hauteur }}>
          <div className="relative border-r border-line">
            {Array.from({ length: (FIN - DEBUT) / 60 + 1 }, (_, i) => {
              const m = DEBUT + i * 60;
              return (
                <span
                  key={m}
                  className="absolute right-2 -translate-y-1/2 font-mono text-[10.5px] text-muted"
                  style={{ top: (m - DEBUT) * PX_PAR_MIN }}
                >
                  {String(m / 60).padStart(2, "0")}:00
                </span>
              );
            })}
          </div>

          {JOURS.map((jour) => (
            <div key={jour} className="relative border-r border-line last:border-r-0">
              {lignes}
              {blocs
                .filter((b) => b.jour === jour)
                .map((b, i) => {
                  const conflit = enConflit.has(b.cours.id);
                  const largeur = 100 / b.voies;
                  return (
                    <div
                      key={`${b.cours.id}-${i}`}
                      className={`absolute overflow-hidden rounded-lg border-l-[3px] px-2 py-1.5 ${
                        conflit
                          ? "border-l-warn bg-warn-soft"
                          : "border-l-unil-400 bg-unil-100"
                      }`}
                      style={{
                        top: (b.debut - DEBUT) * PX_PAR_MIN,
                        height: Math.max((b.fin - b.debut) * PX_PAR_MIN - 3, 24),
                        left: `calc(${b.voie * largeur}% + 3px)`,
                        width: `calc(${largeur}% - 6px)`,
                      }}
                      title={`${b.cours.titre} · ${b.salle ?? T.sallePrecisee}`}
                    >
                      <p
                        className={`text-[11.5px] font-semibold leading-tight ${
                          conflit ? "text-warn" : "text-unil-500"
                        }`}
                      >
                        {b.cours.titre}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-muted">
                        {b.salle ?? T.salleInconnue}
                      </p>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
