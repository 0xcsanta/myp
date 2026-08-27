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

  async redirects() {
    return [
      { source: "/", destination: "/fr", permanent: false },
      { source: "/app", destination: "/app/fr", permanent: false },
    ];
  },
};

export default nextConfig;
