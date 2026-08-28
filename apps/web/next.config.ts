import type { NextConfig } from "next";

/**
 * Les adresses nues renvoient vers le francais.
 *
 * Le site a deux mises en page racines, une par langue de balise html, ce qui
 * interdit une page a la racine de l'arborescence : la redirection se fait donc
 * ici, avant le routeur. `/` mene a `/fr` et `/app` a `/app/fr`. Personne ne
 * devrait arriver sur ces adresses depuis le site, mais une adresse tapee a la
 * main ou un vieux lien ne doit pas tomber sur une page introuvable.
 */
const nextConfig: NextConfig = {
  /*
   * Les donnees vivent a la racine du depot, hors de l'application, et la
   * route de Mipmip les lit a l'execution et non au build. Vercel n'embarque
   * dans une fonction que les fichiers qu'il a vus etre lus, et une lecture
   * par chemin calcule lui echappe : sans cette ligne, le site se deploie et
   * Mipmip repond « master inconnu » a chaque question, sur un serveur ou
   * data/ n'existe simplement pas.
   *
   * Les pages, elles, sont pregenerees au build et n'en ont pas besoin.
   */
  outputFileTracingIncludes: {
    "/api/mipmip": ["../../data/**"],
  },

  /*
   * Les en-tetes de securite.
   *
   * Vercel ne pose de lui meme que le `Strict-Transport-Security`. Le reste
   * est ici, et chaque ligne repond a une attaque precise plutot qu'a une
   * checklist.
   *
   * La politique de contenu peut etre stricte parce que le site ne charge
   * aucun script tiers : ni mesure d'audience, ni widget, ni publicite. Seules
   * les polices de Google sont autorisees, et elles ne servent que du CSS et
   * des fichiers de police. `frame-ancestors 'none'` remplace l'ancien
   * X-Frame-Options, qu'on garde quand meme pour les navigateurs qui ne lisent
   * que lui.
   *
   * `'unsafe-inline'` est present sur les scripts, et il faut dire pourquoi
   * plutot que de laisser croire a une politique stricte.
   *
   * Next inscrit ses donnees d'hydratation dans des balises `<script>` en
   * ligne, sur chaque page. Sans `'unsafe-inline'`, le navigateur les refuse
   * toutes et la page ne s'anime plus du tout : mesure faite, la console se
   * remplit de « Executing inline script violates ». La seule alternative
   * propre est un nonce different a chaque requete, pose par un middleware,
   * ce qui rendrait dynamique chaque page d'un site aujourd'hui entierement
   * pregenere : plus lent pour le visiteur, et facture a chaque vue.
   *
   * Le compromis est tenable ici parce que la surface d'injection est nulle :
   * le site n'affiche aucun contenu ecrit par un visiteur. La seule saisie est
   * la question posee a Mipmip, rendue comme texte par React, donc echappee.
   * Et le reste de la politique continue de faire un vrai travail : aucune
   * source de script exterieure, aucun plugin, aucune mise en cadre, aucun
   * envoi de formulaire ailleurs que sur le site.
   */
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      "connect-src 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/:chemin*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: "/", destination: "/fr", permanent: false },
      { source: "/app", destination: "/app/fr", permanent: false },
    ];
  },
};

export default nextConfig;
