import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * Le robots.txt du site.
 *
 * Tout est ouvert : MYP ne publie que ce qui est deja public sur le site de
 * l'UNIL, remis en forme, et n'a rien a cacher aux moteurs. C'est aussi une
 * facon de rendre la pareille, le projet ayant renonce a explorer les pages de
 * l'UNIL parce que leur robots.txt le lui interdit.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
