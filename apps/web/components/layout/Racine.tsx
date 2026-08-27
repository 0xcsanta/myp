import { Crimson_Text, DM_Sans, DynaPuff, IBM_Plex_Mono } from "next/font/google";
import type { Langue } from "@/lib/langues";
import { textes } from "@/lib/textes";
import { Vague } from "@/components/brand/Vague";

/**
 * Le squelette du document, partage par les deux mises en page racines.
 *
 * Le site en a deux, une par groupe de routes : l'accueil vit sous `/fr` et
 * `/en`, le planificateur sous `/app/fr` et `/app/en`. C'est le seul moyen de
 * poser le bon `lang` sur la balise html tout en gardant les adresses
 * demandees, car une mise en page ne recoit que les parametres des segments
 * dynamiques qui la contiennent. Servir une page anglaise annoncee comme
 * francaise tromperait les lecteurs d'ecran et les moteurs de recherche.
 *
 * Le prix de ce decoupage est un rechargement complet quand on passe de
 * l'accueil au planificateur. Une fois, sur un clic « lancer », c'est un prix
 * raisonnable : a l'interieur de chaque groupe, y compris pour changer de
 * langue, la navigation reste instantanee.
 */

const crimson = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-crimson",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dynaPuff = DynaPuff({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-dynapuff",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export function Racine({
  langue,
  children,
}: {
  langue: Langue;
  children: React.ReactNode;
}) {
  return (
    <html
      lang={textes(langue).htmlLang}
      className={`${crimson.variable} ${dmSans.variable} ${dynaPuff.variable} ${plexMono.variable}`}
    >
      <body className="antialiased">
        {/*
          Ce script doit s'executer avant que la page soit peinte, donc avant
          React, avant l'hydratation, et avant meme que l'element de la vague
          soit analyse. C'est la seule facon que l'ecran soit deja couvert a la
          premiere image : pose par React, l'etat de la vague n'arrivait
          qu'apres l'hydratation, et l'on voyait la page une fraction de
          seconde avant que la vague ne la recouvre. L'effet etait detruit,
          puisqu'il repose sur le fait de ne jamais voir la coupure.

          Il ne fait qu'une chose : lire par ou la page precedente a fait
          entrer la vague, et le poser sur la balise html, ou la feuille de
          style l'attend. Le nettoyage se fait a la fin de l'animation, avec un
          filet si celle ci ne se declenche pas, sans quoi l'attribut resterait
          et figerait la vague hors champ.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var r=document.documentElement;try{var s=sessionStorage.getItem("myp:vague");if(s!=="monte"&&s!=="descend")return;sessionStorage.removeItem("myp:vague");if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;r.setAttribute("data-vague",s);}catch(e){return}var fini=function(){r.removeAttribute("data-vague")};document.addEventListener("animationend",function(e){if(e.target&&e.target.classList&&e.target.classList.contains("vague"))fini()},true);setTimeout(fini,3000)})();`,
          }}
        />
        {/*
          La vague vient avant le contenu, pas apres. Le navigateur peint sans
          attendre la fin de l'analyse du document : placee en fin de corps,
          elle risquait de n'exister qu'apres une premiere peinture de la page,
          exactement le defaut que le script ci dessus corrige. Son empilement
          ne depend pas de cet ordre, elle est en position fixe avec un
          z-index qui la met au dessus de tout.
        */}
        <Vague />
        {children}
      </body>
    </html>
  );
}
