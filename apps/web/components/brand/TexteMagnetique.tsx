"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Un titre qui en revele un autre sous un disque suivant le curseur.
 *
 * L'echange se fait mot par mot, et c'est tout l'interet : « Master Your Plan »
 * devient « Plan Your Master », donc le premier et le dernier mot permutent
 * pendant que celui du milieu ne bouge pas. Passer le disque sur « Your » ne
 * doit rien changer du tout.
 *
 * Pour que ce soit vrai a l'oeil, chaque mot revele occupe exactement la boite
 * du mot qu'il remplace. Plutot que de mesurer les mots en JavaScript, le
 * calque revele reprend le mot d'origine en le rendant invisible, ce qui lui
 * reserve sa place au pixel, et pose le mot de remplacement centre par dessus.
 * L'alignement est donc exact par construction, quelle que soit la fonte, le
 * corps ou l'interlettrage, et il le reste si le titre passe a la ligne.
 *
 * La typographie est heritee, jamais imposee : le titre du hero a une taille
 * fluide reglee au pixel et une chasse negative, que ce composant ne doit pas
 * ecraser. C'est aussi ce partage exact qui rend la substitution credible.
 *
 * Trois precautions qui n'etaient pas dans la version d'origine.
 *
 * Le calque revele est cache aux lecteurs d'ecran, et n'entre dans la page
 * qu'au premier survol : monte d'emblee, il donnait un titre en double, bien
 * present pour un moteur qui execute le JavaScript.
 *
 * L'effet ne s'arme que sur un appareil qui a vraiment un curseur, et jamais
 * quand le lecteur demande moins d'animations. Sur telephone rien n'est monte
 * et rien ne tourne : le titre reste un titre.
 *
 * La boucle de rendu ne tourne que pendant le survol, alors qu'elle tournait
 * en permanence, du chargement de la page a sa fermeture, pour un disque de
 * taille nulle la plupart du temps.
 */

export type MotMagnetique = {
  texte: string;
  /** Le mot qui le remplace sous le disque. Absent, le mot ne change pas. */
  revele?: string;
};

export function TexteMagnetique({
  mots,
  /** Diametre du disque, en cadratins : il suit donc le corps du titre. */
  diametre = 1.8,
  className = "",
}: {
  mots: MotMagnetique[];
  diametre?: number;
  className?: string;
}) {
  const conteneur = useRef<HTMLSpanElement | null>(null);
  const disque = useRef<HTMLSpanElement | null>(null);
  const interieur = useRef<HTMLSpanElement | null>(null);
  const boucle = useRef<number | null>(null);
  const vise = useRef({ x: 0, y: 0 });
  const courant = useRef({ x: 0, y: 0 });

  const [arme, setArme] = useState(false);
  /*
   * Le calque revele reproduit une ligne unique. Si le titre en occupe deux, il
   * n'y a plus de correspondance possible entre un mot et celui qu'il remplace,
   * donc l'effet se desarme plutot que de s'afficher de travers.
   */
  const [uneSeuleLigne, setUneSeuleLigne] = useState(true);
  const [survole, setSurvole] = useState(false);
  const [devoile, setDevoile] = useState(false);
  const [taille, setTaille] = useState({ w: 0, h: 0 });

  const phrase = mots.map((m) => m.texte).join(" ");

  /* l'effet n'existe que la ou il y a un curseur, et si on veut bien du mouvement */
  useEffect(() => {
    const curseur = window.matchMedia("(hover: hover) and (pointer: fine)");
    const calme = window.matchMedia("(prefers-reduced-motion: reduce)");
    const juger = () => setArme(curseur.matches && !calme.matches);
    juger();
    curseur.addEventListener("change", juger);
    calme.addEventListener("change", juger);
    return () => {
      curseur.removeEventListener("change", juger);
      calme.removeEventListener("change", juger);
    };
  }, []);

  /* le calque revele est cale sur le conteneur, il lui faut donc sa mesure */
  useEffect(() => {
    const el = conteneur.current;
    if (!el) return;
    const mesurer = () => {
      setTaille({ w: el.offsetWidth, h: el.offsetHeight });
      /*
       * Le nombre de lignes se compte sur le texte lui meme, par le nombre de
       * rectangles qu'il occupe. Comparer une hauteur a l'interligne ne marche
       * pas : sur un element en ligne, `offsetHeight` mesure la boite des
       * glyphes, ascendantes et descendantes comprises, et non la hauteur de
       * ligne. Le titre passait ainsi pour etre sur deux lignes alors qu'il
       * tenait sur une seule, et l'effet ne s'armait jamais.
       */
      const texte = Array.from(el.childNodes).find((n) => n.nodeType === 3);
      if (!texte) return;
      const portee = document.createRange();
      portee.selectNodeContents(texte);
      setUneSeuleLigne(portee.getClientRects().length <= 1);
    };
    mesurer();
    const ro = new ResizeObserver(mesurer);
    ro.observe(el);
    return () => ro.disconnect();
  }, [arme]);

  /*
   * Le disque poursuit le curseur au lieu de le suivre : chaque image le
   * rapproche d'une fraction de la distance restante, ce qui donne une inertie
   * douce plutot qu'un collage rigide. Le calque revele se deplace en sens
   * inverse et de la meme quantite, si bien qu'il reste immobile a l'ecran :
   * c'est ce qui donne l'illusion d'une fenetre ouverte sur un autre calque, et
   * non d'une pastille qui promene des mots.
   */
  useEffect(() => {
    if (!survole) return;
    const glisser = (de: number, vers: number) => de + (vers - de) * 0.15;
    const image = () => {
      courant.current.x = glisser(courant.current.x, vise.current.x);
      courant.current.y = glisser(courant.current.y, vise.current.y);
      if (disque.current) {
        disque.current.style.transform = `translate(${courant.current.x}px, ${courant.current.y}px) translate(-50%, -50%)`;
      }
      if (interieur.current) {
        interieur.current.style.transform = `translate(${-courant.current.x}px, ${-courant.current.y}px)`;
      }
      boucle.current = requestAnimationFrame(image);
    };
    boucle.current = requestAnimationFrame(image);
    return () => {
      if (boucle.current) cancelAnimationFrame(boucle.current);
    };
  }, [survole]);

  const suivre = useCallback((e: React.PointerEvent<HTMLSpanElement>) => {
    const el = conteneur.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    vise.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  }, []);

  const entrer = useCallback((e: React.PointerEvent<HTMLSpanElement>) => {
    const el = conteneur.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // le disque nait sous le curseur, sinon il traverse le titre en diagonale
    const p = { x: e.clientX - r.left, y: e.clientY - r.top };
    vise.current = p;
    courant.current = { ...p };
    setDevoile(true);
    setSurvole(true);
  }, []);

  if (!arme || !uneSeuleLigne) {
    return (
      <span ref={conteneur} className={className}>
        {phrase}
      </span>
    );
  }

  const cote = `${diametre}em`;

  return (
    <span
      ref={conteneur}
      onPointerMove={suivre}
      onPointerEnter={entrer}
      onPointerLeave={() => setSurvole(false)}
      className={`relative inline-block select-none ${className}`}
    >
      {phrase}

      <span
        ref={disque}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 block overflow-hidden rounded-full bg-unil-400"
        style={{
          width: survole ? cote : 0,
          height: survole ? cote : 0,
          transition:
            "width 0.5s cubic-bezier(0.33, 1, 0.68, 1), height 0.5s cubic-bezier(0.33, 1, 0.68, 1)",
          willChange: "transform, width, height",
        }}
      >
        {devoile && (
          <span
            ref={interieur}
            className="absolute flex items-center justify-center text-white"
            style={{
              width: taille.w,
              height: taille.h,
              top: "50%",
              left: "50%",
              willChange: "transform",
            }}
          >
            {/*
              `whitespace-nowrap` est ce qui empeche le calque de se replier.
              Il doit reproduire la ligne du titre exactement : replie, les mots
              se retrouvaient a une autre hauteur que ceux qu'ils remplacent, et
              l'echange devenait illisible.
            */}
            <span className="whitespace-nowrap">
              {mots.map((m, i) => (
                <span key={`${m.texte}-${i}`}>
                  {i > 0 && " "}
                  {m.revele ? (
                    /*
                     * Le mot d'origine reste la, invisible : il reserve sa
                     * place au pixel pres, et le remplacement se centre
                     * dessus. Aucune mesure, aucun decalage possible.
                     */
                    <span className="relative inline-block">
                      <span className="invisible">{m.texte}</span>
                      <span className="absolute inset-0 flex items-center justify-center">
                        {m.revele}
                      </span>
                    </span>
                  ) : (
                    m.texte
                  )}
                </span>
              ))}
            </span>
          </span>
        )}
      </span>
    </span>
  );
}
