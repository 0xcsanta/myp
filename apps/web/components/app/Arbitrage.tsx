"use client";

import { useEffect, useRef } from "react";
import type { Cours, Regles } from "@/lib/donnees";
import type { Langue } from "@/lib/langues";
import { textes } from "@/lib/textes";
import { dansUnePhrase, libelleJour, libelleSemestre } from "@/lib/semestres";
import { libelleCreneaux } from "@/lib/creneaux";
import { evaluationDuCours, langueDuCours } from "@/lib/codes";
import { nomModule, valider, type Diagnostic } from "@/lib/valider";

/**
 * L'arbitrage d'un chevauchement.
 *
 * Signaler que deux cours tombent au meme moment ne suffit pas : l'etudiant
 * doit trancher, et pour trancher il lui faut savoir ce que chaque renoncement
 * coute. La carte met les deux cours cote a cote et, sous chacun, ce qui se
 * passerait s'il l'enlevait : les modules qui tomberaient sous leur minimum, et
 * le total du diplome apres coup.
 *
 * Le calcul n'est pas une estimation : on rejoue le moteur de regles sur la
 * selection privee du cours, puis on compare module par module. C'est la meme
 * verite que celle affichee dans le rail, pas une approximation faite a part.
 */

type Consequence = { module: string; obtenu: number; requis: number };

export function Arbitrage({
  chevauchement,
  catalogue,
  regles,
  selection,
  langue,
  onEnlever,
  onFermer,
}: {
  chevauchement: Extract<Diagnostic, { code: "chevauchement" }>;
  catalogue: Cours[];
  regles: Regles;
  selection: Set<string>;
  langue: Langue;
  onEnlever: (id: string) => void;
  onFermer: () => void;
}) {
  const T = textes(langue).plan;
  const boite = useRef<HTMLDivElement | null>(null);
  const premier = useRef<HTMLButtonElement | null>(null);

  /* Echap ferme, et le fond ne defile pas sous la carte. */
  useEffect(() => {
    const auClavier = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFermer();
      if (e.key !== "Tab" || !boite.current) return;
      // le clavier tourne dans la carte : sinon on tabule dans la page cachee
      const cibles = boite.current.querySelectorAll<HTMLElement>("button, a[href]");
      if (!cibles.length) return;
      const debut = cibles[0];
      const fin = cibles[cibles.length - 1];
      if (e.shiftKey && document.activeElement === debut) {
        e.preventDefault();
        fin.focus();
      } else if (!e.shiftKey && document.activeElement === fin) {
        e.preventDefault();
        debut.focus();
      }
    };
    document.addEventListener("keydown", auClavier);
    const avant = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    premier.current?.focus();
    return () => {
      document.removeEventListener("keydown", auClavier);
      document.body.style.overflow = avant;
    };
  }, [onFermer]);

  const parId = new Map(catalogue.map((c) => [c.id, c]));
  const avant = valider(selection, regles, catalogue);

  /** Ce qui manquerait en plus, module par module, si on retirait ce cours. */
  const consequences = (id: string): { total: number; pires: Consequence[] } => {
    const sans = new Set(selection);
    sans.delete(id);
    const apres = valider(sans, regles, catalogue);

    const manque = (d: Diagnostic[]) =>
      new Map(
        d
          .filter((x): x is Extract<Diagnostic, { code: "module_min" }> => x.code === "module_min")
          .map((x) => [x.module, x]),
      );
    const a = manque(avant.diagnostics);
    const b = manque(apres.diagnostics);

    const pires: Consequence[] = [];
    for (const [code, d] of b) {
      const dejaManquant = a.get(code);
      const ecartAvant = dejaManquant ? dejaManquant.requis - dejaManquant.obtenu : 0;
      if (d.requis - d.obtenu > ecartAvant) {
        pires.push({ module: code, obtenu: d.obtenu, requis: d.requis });
      }
    }
    return { total: apres.total, pires };
  };

  const quand = T.arbitrageIntro(
    dansUnePhrase(libelleJour(chevauchement.jour, langue), langue),
    dansUnePhrase(libelleSemestre(chevauchement.semestre, langue), langue),
  );

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && onFermer()}
    >
      <div
        ref={boite}
        role="dialog"
        aria-modal="true"
        aria-labelledby="arbitrage-titre"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-[720px] overflow-y-auto rounded-2xl
          border border-line bg-white p-6 shadow-[0_24px_70px_-30px_rgba(10,31,48,0.7)]"
      >
        <h2
          id="arbitrage-titre"
          className="font-display text-[22px] tracking-[-0.02em] text-ink"
        >
          {T.arbitrageTitre}
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">{quand}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {chevauchement.cours.map((id, i) => {
            const c = parId.get(id);
            if (!c) return null;
            const { total, pires } = consequences(id);
            /* pas `module` : le nom est reserve par l'empaqueteur */
            const bloc = regles.modules.find((x) => x.code === c.module);

            return (
              <div
                key={id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-line bg-surface-2 p-4"
              >
                <div>
                  <p className="text-[14.5px] font-semibold leading-snug text-ink">
                    {c.titre}
                  </p>
                  <p className="mt-1 tnum font-mono text-[11.5px] text-muted">
                    {c.ects} ECTS · {bloc ? nomModule(bloc, langue) : c.module}
                  </p>
                  <p className="mt-2 text-[12px] leading-relaxed text-muted">
                    {[
                      c.enseignants,
                      langueDuCours(c.langue, langue),
                      evaluationDuCours(c.evaluation, langue),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="mt-1 font-mono text-[11.5px] text-unil-400">
                    {libelleCreneaux(c, langue) ?? T.horaireNonReleve}
                  </p>

                  <div className="mt-4 rounded-lg bg-white p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink-2">
                      {T.siTuLEnleves}
                    </p>
                    {pires.length === 0 ? (
                      <p className="mt-1.5 text-[12px] leading-relaxed text-ok">
                        {T.aucuneConsequence}
                      </p>
                    ) : (
                      <ul className="mt-1.5 grid gap-1">
                        {pires.map((p) => {
                          const m = regles.modules.find((x) => x.code === p.module);
                          return (
                            <li
                              key={p.module}
                              className="text-[12px] leading-relaxed text-warn"
                            >
                              {textes(langue).diagnostics.moduleMin(
                                m ? nomModule(m, langue) : p.module,
                                p.obtenu,
                                p.requis,
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <p className="mt-1.5 tnum text-[12px] leading-relaxed text-muted">
                      {T.totalApres(total, regles.totalEcts)}
                    </p>
                  </div>
                </div>

                <button
                  ref={i === 0 ? premier : undefined}
                  type="button"
                  onClick={() => onEnlever(id)}
                  className="w-full rounded-lg border border-warn/40 bg-warn-soft py-2 text-[13px]
                    font-medium text-warn transition-colors duration-150 ease-[var(--ease-out-std)]
                    hover:bg-warn hover:text-white focus-visible:outline-2
                    focus-visible:outline-offset-2 focus-visible:outline-warn"
                >
                  {T.enleverCeCours}
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onFermer}
          className="mt-4 w-full rounded-lg border border-line-2 py-2 text-[13px] text-ink-2
            transition-colors duration-150 ease-[var(--ease-out-std)] hover:border-unil-400
            hover:text-unil-400 focus-visible:outline-2 focus-visible:outline-offset-2
            focus-visible:outline-unil-400"
        >
          {T.garderLesDeux}
        </button>
      </div>
    </div>
  );
}
