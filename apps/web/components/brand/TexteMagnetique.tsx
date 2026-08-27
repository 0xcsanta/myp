"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Un texte qui en revele un autre sous un disque suivant le curseur.
 *
 * La typographie est heritee, jamais imposee : le titre du hero a une taille
 * fluide reglee au pixel et une chasse negative, que ce composant ne doit pas
 * ecraser. Les deux textes partagent donc la meme fonte, le meme corps et le
 * meme interlettrage, ce qui est aussi ce qui rend la substitution credible.
 *
 * Quatre choses qui n'etaient pas dans la version d'origine.
 *
 * Le texte revele est cache aux lecteurs d'ecran et aux moteurs. Sans cela, la
 * page annoncerait deux titres, dont un que personne ne lit jamais.
 *
 * L'effet ne s'arme que sur un appareil qui a vraiment un curseur, et jamais
 * quand le lecteur demande moins d'animations. Sur telephone, le titre reste un
 * titre : rien n'est monte, rien ne tourne.
 *
 * La boucle de rendu ne tourne que pendant le survol. Dans la version d'origine
 * elle tournait en permanence, du chargement de la page a sa fermeture, pour un
 * disque de taille nulle la plupart du temps.
 *
 * Le curseur reste visible. Le masquer sur un titre pleine largeur fait perdre
 * le pointeur a qui traverse la zone sans vouloir jouer avec.
 */
export function TexteMagnetique({
  texte,
  texteSurvol,
  className = "",
}: {
  texte: string;
  texteSurvol: string;
  className?: string;
}) {
  const conteneur = useRef<HTMLSpanElement | null>(null);
  const disque = useRef<HTMLSpanElement | null>(null);
  const interieur = useRef<HTMLSpanElement | null>(null);
  const boucle = useRef<number | null>(null);
  const vise = useRef({ x: 0, y: 0 });
  const courant = useRef({ x: 0, y: 0 });

  const [arme, setArme] = useState(false);
  const [survole, setSurvole] = useState(false);
  /*
   * Le texte revele n'entre dans la page qu'au premier survol, et y reste
   * ensuite. Monte d'emblee, il donnait un titre en double : cache aux lecteurs
   * d'ecran, certes, mais bien present pour un moteur qui execute le
   * JavaScript. Un titre doit rester un seul titre.
   */
  const [devoile, setDevoile] = useState(false);
  const [taille, setTaille] = useState({ w: 0, h: 0 });

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

  /* le texte revele est cale sur le conteneur, il lui faut donc sa mesure */
  useEffect(() => {
    const el = conteneur.current;
    if (!el || !arme) return;
    const mesurer = () =>
      setTaille({ w: el.offsetWidth, h: el.offsetHeight });
    mesurer();
    const ro = new ResizeObserver(mesurer);
    ro.observe(el);
    return () => ro.disconnect();
  }, [arme]);

  /*
   * Le disque poursuit le curseur au lieu de le suivre : chaque image le
   * rapproche d'une fraction de la distance restante, ce qui donne une inertie
   * douce plutot qu'un collage rigide. Le texte revele se deplace en sens
   * inverse et de la meme quantite, si bien qu'il reste immobile a l'ecran :
   * c'est ce qui donne l'illusion d'une fenetre ouverte sur un autre calque, et
   * non d'une pastille qui promene un mot.
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

  if (!arme) return <span className={className}>{texte}</span>;

  return (
    <span
      ref={conteneur}
      onPointerMove={suivre}
      onPointerEnter={entrer}
      onPointerLeave={() => setSurvole(false)}
      className={`relative inline-block select-none ${className}`}
    >
      {texte}

      <span
        ref={disque}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 block overflow-hidden rounded-full bg-unil-400"
        style={{
          width: survole ? 150 : 0,
          height: survole ? 150 : 0,
          transition:
            "width 0.5s cubic-bezier(0.33, 1, 0.68, 1), height 0.5s cubic-bezier(0.33, 1, 0.68, 1)",
          willChange: "transform, width, height",
        }}
      >
        {devoile && (
          <span
            ref={interieur}
            className="absolute flex items-center justify-center"
            style={{
              width: taille.w,
              height: taille.h,
              top: "50%",
              left: "50%",
              willChange: "transform",
            }}
          >
            <span className="whitespace-nowrap text-white">{texteSurvol}</span>
          </span>
        )}
      </span>
    </span>
  );
}
