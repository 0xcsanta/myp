"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Le titre qui se relit a l'envers.
 *
 * « Master Your Plan » et « Plan Your Master » sont faits des memes lettres :
 * la seconde phrase est une permutation de la premiere. Au clic, aucune lettre
 * n'est remplacee, chacune s'envole et retombe a sa nouvelle place.
 *
 * Le vol se calcule au moment du clic plutot que d'etre ecrit a l'avance,
 * parce que la position d'une lettre depend de la largeur de la fenetre, de la
 * taille fluide du titre et du point ou la phrase passe a la ligne. On mesure
 * donc les lettres avant le changement, on laisse le navigateur poser le
 * nouveau texte, on les remesure, et l'ecart entre les deux mesures est
 * exactement le trajet a parcourir. C'est la technique dite FLIP : le texte
 * affiche est toujours le vrai texte, jamais une mise en scene posee par
 * dessus, et la mise en page reste juste a chaque instant.
 */

type Lettre = { id: number; ch: string };

/*
 * Les trois mots. L'identifiant d'une lettre ne change jamais d'un etat a
 * l'autre : c'est lui qui permet de suivre le meme « a » pendant tout le vol,
 * et donc de le faire atterrir la ou il doit.
 */
const MOTS: Record<string, Lettre[]> = {
  master: [
    { id: 0, ch: "M" },
    { id: 1, ch: "a" },
    { id: 2, ch: "s" },
    { id: 3, ch: "t" },
    { id: 4, ch: "e" },
    { id: 5, ch: "r" },
  ],
  your: [
    { id: 6, ch: "Y" },
    { id: 7, ch: "o" },
    { id: 8, ch: "u" },
    { id: 9, ch: "r" },
  ],
  plan: [
    { id: 10, ch: "P" },
    { id: 11, ch: "l" },
    { id: 12, ch: "a" },
    { id: 13, ch: "n" },
  ],
};

const PHRASES = [
  ["master", "your", "plan"],
  ["plan", "your", "master"],
];

const EN_CLAIR = ["Master Your Plan", "Plan Your Master"];

/*
 * Le desordre est calcule, jamais tire au hasard : deux clics de suite donnent
 * le meme vol, et le rendu du serveur ne peut pas diverger de celui du
 * navigateur. Un sinus seme par l'identifiant de la lettre suffit a produire
 * quatorze ecarts qui n'ont aucun rapport les uns avec les autres.
 */
const bruit = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const DUREE = 1150;
const RETOMBEE = "cubic-bezier(0.22, 0.9, 0.24, 1)";

/*
 * Le titre se retourne aussi tout seul, six secondes apres le dernier vol,
 * qu'il ait ete declenche par un clic ou par le minuteur precedent. Le delai
 * se compte depuis la derniere bascule et non depuis le chargement : sans
 * cela, un clic pourrait etre suivi d'un retournement automatique un dixieme
 * de seconde plus tard.
 *
 * Six secondes et non trois : le vol dure 1,15 s, donc a trois secondes le
 * titre bougeait 38 pour cent du temps. Un titre qu'on doit pouvoir lire ne
 * peut pas etre en mouvement plus d'un cinquieme du temps, et une animation
 * composite qui ne s'arrete jamais coute de la batterie sur un telephone.
 */
const RESPIRATION = 6000;

export function TitreMelange({ invite }: { invite: string }) {
  const [etat, setEtat] = useState(0);
  const lettres = useRef(new Map<number, HTMLSpanElement>());
  const bouton = useRef<HTMLButtonElement>(null);
  const avant = useRef<Map<number, DOMRect> | null>(null);

  const basculer = useCallback(() => {
    const mesures = new Map<number, DOMRect>();
    lettres.current.forEach((n, id) => mesures.set(id, n.getBoundingClientRect()));
    /*
     * On mesure avant d'annuler, et non l'inverse : `getBoundingClientRect`
     * tient compte des transformations, donc la mesure prise ici est l'endroit
     * ou la lettre se trouve vraiment a l'ecran, meme si elle est encore en
     * plein vol. Un second clic reprend ainsi le mouvement la ou il en est au
     * lieu de faire sauter les lettres.
     */
    lettres.current.forEach((n) => n.getAnimations().forEach((a) => a.cancel()));
    avant.current = mesures;
    setEtat((e) => (e === 0 ? 1 : 0));
  }, []);

  /*
   * Deux refus, et ils ne sont pas des details.
   *
   * Un titre qui bouge sans qu'on le lui ait demande est exactement ce que le
   * reglage « moins d'animations » du systeme existe pour eteindre. On ne
   * l'attenue donc pas ici, on ne lance rien du tout.
   *
   * Et rien ne tourne dans un onglet cache : le navigateur y ralentit les
   * minuteurs sans les arreter, et faire travailler la machine de quelqu'un
   * pour une page qu'il ne regarde pas ne se justifie jamais.
   */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let minuteur = 0;
    const armer = () => {
      minuteur = window.setTimeout(() => {
        // Onglet cache : on ne bascule pas, mais on se rearme. Sans ce
        // rearmement le minuteur mourait la, et le titre restait fige au
        // retour puisque rien ne relance cet effet tant que l'etat ne change
        // pas. Le defaut ne se serait vu qu'apres un aller-retour d'onglet.
        if (document.visibilityState !== "visible") return armer();
        basculer();
      }, RESPIRATION);
    };
    armer();
    return () => window.clearTimeout(minuteur);
  }, [etat, basculer]);

  useLayoutEffect(() => {
    const depart = avant.current;
    avant.current = null;
    if (!depart) return; // premier rendu : rien a animer

    const sobre = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const taille = parseFloat(getComputedStyle(bouton.current!).fontSize);

    lettres.current.forEach((n, id) => {
      const a = depart.get(id);
      if (!a) return;
      const b = n.getBoundingClientRect();
      const dx = a.left - b.left;
      const dy = a.top - b.top;
      if (dx === 0 && dy === 0 && !sobre) return;

      if (sobre) {
        n.animate(
          [
            { transform: `translate(${dx}px, ${dy}px)` },
            { transform: "translate(0px, 0px)" },
          ],
          { duration: 320, easing: "ease-out" },
        );
        return;
      }

      /*
       * L'ecart du milieu est proportionnel a la taille du titre : le meme
       * mouvement doit se lire aussi bien sur un titre de 44 pixels que sur un
       * de 262. Il penche vers la verticale, ou rien ne peut deborder de la
       * page, la ou l'horizontale est bornee par la gouttiere.
       */
      const h1 = bruit(id + 1);
      const h2 = bruit(id + 41);
      const h3 = bruit(id + 91);
      const sx = (h2 - 0.5) * taille * 0.9;
      const sy = (h1 - 0.5) * taille * 1.2;
      const tour = (h3 - 0.5) * 70;
      const ech = 0.72 + h3 * 0.45;

      n.animate(
        [
          {
            transform: `translate(${dx}px, ${dy}px) rotate(0deg) scale(1)`,
            offset: 0,
            easing: "cubic-bezier(0.35, 0, 0.6, 1)",
          },
          {
            transform: `translate(${dx + sx}px, ${dy + sy}px) rotate(${tour}deg) scale(${ech})`,
            offset: 0.4,
            easing: RETOMBEE,
          },
          { transform: "translate(0px, 0px) rotate(0deg) scale(1)", offset: 1 },
        ],
        { duration: DUREE, fill: "none" },
      );
    });
  }, [etat]);

  return (
    <button
      type="button"
      ref={bouton}
      onClick={basculer}
      title={invite}
      aria-label={EN_CLAIR[etat]}
      className="block w-full cursor-pointer select-none appearance-none bg-transparent
        text-inherit outline-none focus-visible:outline-2 focus-visible:outline-offset-8
        focus-visible:outline-[var(--color-unil-400)]"
    >
      {PHRASES[etat].map((mot, i) => (
        <Fragment key={mot}>
          {i > 0 ? " " : null}
          <span className="inline-block whitespace-nowrap">
            {MOTS[mot].map((l) => (
              <span
                key={l.id}
                ref={(n) => {
                  if (n) lettres.current.set(l.id, n);
                  else lettres.current.delete(l.id);
                }}
                className="inline-block"
              >
                {l.ch}
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </button>
  );
}
