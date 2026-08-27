import type { MetadataRoute } from "next";
import { tousLesMasters } from "@/lib/donnees";
import { LANGUES } from "@/lib/langues";
import { SITE } from "@/lib/site";

/**
 * Le plan du site.
 *
 * Chaque page existe dans les deux langues, et chacune declare l'autre en
 * `alternates` : c'est ce qui evite qu'un moteur traite la version anglaise
 * comme un doublon de la francaise.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const alternates = (chemin: (l: string) => string) => ({
    languages: Object.fromEntries(LANGUES.map((l) => [l, `${SITE}${chemin(l)}`])),
  });

  const accueil = LANGUES.map((l) => ({
    url: `${SITE}/${l}`,
    priority: 1,
    changeFrequency: "monthly" as const,
    alternates: alternates((x) => `/${x}`),
  }));

  const choix = LANGUES.map((l) => ({
    url: `${SITE}/app/${l}`,
    priority: 0.9,
    changeFrequency: "monthly" as const,
    alternates: alternates((x) => `/app/${x}`),
  }));

  const masters = LANGUES.flatMap((l) =>
    tousLesMasters().map((m) => ({
      url: `${SITE}/app/${l}/${m.slug}`,
      priority: 0.8,
      changeFrequency: "monthly" as const,
      alternates: alternates((x) => `/app/${x}/${m.slug}`),
    })),
  );

  return [...accueil, ...choix, ...masters];
}
