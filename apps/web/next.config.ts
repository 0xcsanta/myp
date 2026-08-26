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
  async redirects() {
    return [
      { source: "/", destination: "/fr", permanent: false },
      { source: "/app", destination: "/app/fr", permanent: false },
    ];
  },
};

export default nextConfig;
