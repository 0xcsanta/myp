import type { Langue } from "@/lib/langues";
import { SITE } from "@/lib/site";
import { textes } from "@/lib/textes";

/**
 * Ce que le site declare etre, en JSON-LD.
 *
 * Sans cela, un moteur doit deviner a partir du texte : il voit des noms de
 * cours et peut conclure que MYP est une ecole, ce qu'il n'est pas. Deux
 * entites suffisent ici et se repondent par leur `@id` : l'outil lui meme, et
 * qui le publie.
 *
 * `isAccessibleForFree` et un prix a zero ne sont pas decoratifs : ce sont les
 * champs que Google et les moteurs de reponse lisent pour savoir s'il faut
 * proposer le site a quelqu'un qui cherche un outil gratuit.
 *
 * La non affiliation est declaree ici aussi, et pas seulement en pied de page,
 * pour qu'une machine qui ne lit que les donnees structurees ne puisse pas
 * prendre MYP pour un service de l'UNIL.
 */
export function DonneesStructurees({ langue }: { langue: Langue }) {
  const T = textes(langue);

  const graphe = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${SITE}/#application`,
        name: "MYP, Master Your Plan",
        url: `${SITE}/${langue}`,
        description: T.accueil.description,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Tout navigateur web",
        inLanguage: ["fr-CH", "en-GB"],
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "CHF" },
        author: { "@id": `${SITE}/#auteur` },
        disambiguatingDescription:
          langue === "fr"
            ? "Projet indépendant, ni affilié à l'Université de Lausanne ni approuvé par elle. Seuls les plans d'études officiels font foi."
            : "Independent project, neither affiliated with nor endorsed by the University of Lausanne. Only the official study plans are authoritative.",
      },
      {
        /*
         * Une personne, pas une entreprise. Le projet est porte a titre
         * personnel tant que l'UNIL ne s'est pas prononcee.
         */
        "@type": "Person",
        "@id": `${SITE}/#auteur`,
        name: "Clément Santacreu",
        url: "https://github.com/0xcsanta/myp",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      /*
       * Les chevrons sont echappes : c'est la recommandation de Next, et elle
       * evite qu'une donnee contenant « </script> » ne ferme la balise.
       */
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graphe).replace(/</g, "\\u003c"),
      }}
    />
  );
}
