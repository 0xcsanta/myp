import { Crimson_Text, DM_Sans, DynaPuff, IBM_Plex_Mono } from "next/font/google";
import type { Langue } from "@/lib/langues";
import { textes } from "@/lib/textes";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
