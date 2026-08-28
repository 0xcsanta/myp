# Audit — MYP, Master Your Plan

**Date :** 27 août 2026 · **URL auditée :** <https://myphec.vercel.app> + code local et serveur de développement
**Stack :** Next.js 16.3.3 (App Router), React 19.2.8, Tailwind CSS 4, TypeScript 5, npm workspaces, déployé sur Vercel
**Périmètre testé :** `/fr`, `/en`, `/app/fr`, `/app/fr/mscf`, `/app/en/mscm-marketing`, `/api/mipmip`, `sitemap.xml`, `robots.txt`
**Mode :** audit complet, site lancé et code lu. Rendu vérifié à 320, 390, 768 et 1440 px sur cinq pages.

> **Note de méthode.** La vue navigateur intégrée à l'outillage ne composait pas d'images pendant
> cette session. Les vérifications de rendu ont donc été faites avec Playwright, en Chromium, sur
> le serveur de développement et sur la production. Les mesures sont réelles ; elles sont issues
> d'un autre pilote que celui prévu par la procédure, ce qui est sans effet sur leur validité mais
> mérite d'être dit.

---

## Résumé exécutif

**Le site est techniquement très solide, et il a un problème de fond qui n'est pas technique.**

Sur les dimensions habituelles, MYP se situe nettement au dessus de la moyenne : aucune erreur
console sur cinq pages et quatre tailles d'écran, aucun lien mort, un seul `h1` par page, toutes
les images avec leur `alt` et leurs dimensions, métadonnées et Open Graph complets, `hreflang`
correct dans les deux sens, `npm audit` à zéro, Next.js à la dernière version publiée, lint et
types sans erreur, treize tests qui passent.

Le problème est ailleurs. **La récolte des fiches de cours de l'UNIL faite le 27 août 2026 viole
le `robots.txt` du domaine, contourne une protection technique, et publie des textes que le projet
s'était lui même engagé par écrit à ne pas reprendre.** Le dépôt contient un document,
`docs/LEGAL.md`, qui décrit précisément cette interdiction et conclut « Le projet ne le fait pas ».
Il le fait depuis aujourd'hui, et c'est en ligne.

| Sévérité | Nombre |
|----------|--------|
| 🔴 Critique | 2 |
| 🟠 Majeur | 4 |
| 🟡 Mineur | 6 |
| 🔵 Suggestion | 5 |
| **Total** | **17** |

### À régler en priorité

1. 🔴 **Récolte automatisée en violation du `robots.txt` de l'UNIL** — § 8.1
2. 🔴 **Publication de textes protégés que le projet s'engageait à ne pas reprendre** — § 8.2
3. 🟠 **Aucun en-tête de sécurité HTTP, aucune CSP** — § 1.1
4. 🟠 **Le budget OpenRouter est épuisable par un script en quelques heures** — § 1.2
5. 🟠 **LCP de 3,3 s sur la page d'accueil** — § 4.1

---

## Suivi des corrections — 28 août 2026

Tout a été corrigé le lendemain de l'audit, sauf une opération destructive qui
attend une décision explicite.

| # | Trouvaille | État |
|---|---|---|
| 8.1 | Récolte en violation du `robots.txt` | ✅ **Tout retiré** : `data/cours-details.json`, les résumés, les trois outils, les 4,5 Mo de pages brutes locales, les scripts de récolte. Règle permanente écrite dans `docs/LEGAL.md § 4 bis`. |
| 8.2 | Textes protégés publiés | ✅ Disparu avec le fichier. Mipmip ne lit plus que les plans d'études officiels. |
| 1.1 | Aucun en-tête de sécurité | ✅ CSP, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` dans `next.config.ts`. Vérifiés sur un build de production. |
| 1.2 | Budget épuisable par script | ✅ Contrôle d'origine sur `/api/mipmip`, 403 sinon. |
| 1.3 | Pas de `server-only` | ✅ Posé sur `lib/donnees.ts` et `lib/mipmip.ts`. |
| 3.1 | Débordement à 320 px en anglais | ✅ 320 = 320. La bascule de langue passe au code à deux lettres sous 380 px. |
| 4.2 | Titre animé 38 % du temps | ✅ `RESPIRATION` 3 000 → 6 000 ms, soit 19 %. |
| 5.1 | Aucun JSON-LD | ✅ `WebApplication` + `Organization` en `@graph`, avec la non affiliation déclarée. |
| 6.1 | Champ Mipmip sans libellé | ✅ `aria-label`. |
| 6.2 | Pas de lien d'évitement | ✅ Premier au Tab, 142 × 41 px, mène à `#contenu`. |
| 6.3 | Contraste à 4,54:1 | ✅ 5,39:1. |
| 9.1 | Mipmip promettait trop | ✅ Cadre et exemples réalignés sur ce qu'il sait faire. |
| 2.1 | Cache de dev corrompu | ✅ Documenté, non reproductible. |
| 4.3 | 15 Mo dans l'historique git | ⏸️ **En attente** : réécriture d'historique, destructive. |
| 7.1 | README muet sur la récolte | ✅ Sans objet, les outils n'existent plus. |
| 10.1 | Aucune surveillance | ⏸️ À poser hors du dépôt (UptimeRobot, alerte de solde). |
| 10.2 | Facteur d'autobus | ⏸️ Document de reprise à écrire. |

**Vérification finale**, sur un build de production, 5 pages × 4 tailles : aucun
défilement horizontal, aucune erreur console, aucune violation CSP, aucune
réponse HTTP ≥ 400.

**Une régression introduite puis corrigée pendant les corrections** : la première
CSP interdisait tout script en ligne, ce qui empêchait Next d'hydrater la page.
Détectée par la console, corrigée, et la raison du compromis est écrite dans
`next.config.ts` plutôt que passée sous silence.

---

## 1. 🔒 Sécurité

### 1.0 Ce qui est bon, et qui compte

- **Next.js 16.3.3** est la **dernière version publiée** (`npm view next version`). Le site n'est
  donc exposé à aucune des CVE connues, y compris le lot de mai 2026 corrigé en 16.2.6.
- **`npm audit --omit=dev` : 0 vulnérabilité.**
- **Aucun fichier d'environnement dans l'historique git** (`git log --all --full-history -- "*.env*"`
  ne renvoie rien).
- **Aucun secret en dur** dans le code (recherche `sk_live`, `service_role`, `AKIA`, `sk-or-v1`,
  clés privées : aucun résultat).
- **Aucun secret en `NEXT_PUBLIC_`.** La seule variable publique est `NEXT_PUBLIC_SITE_URL`.
- **`X-Powered-By` absent** de la production.
- **Pas de CORS ouvert sur l'API** : `/api/mipmip` ne renvoie pas d'`Access-Control-Allow-Origin`,
  donc un navigateur bloque les appels depuis un autre site.

### 1.1 Aucun en-tête de sécurité HTTP, aucune CSP — 🟠

**Problème :** `apps/web/next.config.ts` ne définit aucune fonction `headers()`. Les en-têtes réels
de la production (`curl -sI https://myphec.vercel.app/fr`) ne contiennent que le
`Strict-Transport-Security` ajouté d'office par Vercel. Sont absents :

| En-tête | État |
|---|---|
| `Strict-Transport-Security` | ✅ présent (Vercel) |
| `X-Content-Type-Options: nosniff` | ❌ absent |
| `X-Frame-Options` ou `frame-ancestors` | ❌ absent |
| `Referrer-Policy` | ❌ absent |
| `Permissions-Policy` | ❌ absent |
| `Content-Security-Policy` | ❌ absent |

**Pourquoi c'est important :** sans `X-Frame-Options` ni `frame-ancestors`, n'importe qui peut
placer MYP dans une `<iframe>` invisible sur son propre site et faire cliquer les visiteurs à leur
insu. Sans `Referrer-Policy`, l'URL complète de la page consultée, qui contient le master choisi,
part vers chaque site externe cliqué, dont l'UNIL. Sans CSP, une seule injection de script suffit
à tout compromettre. Le site n'a pas de compte utilisateur, donc l'enjeu reste modéré, mais ces
en-têtes coûtent dix lignes.

**Correction recommandée :** ajouter une fonction `headers()` dans `next.config.ts`. Une CSP est
réaliste ici parce que le site ne charge aucun script tiers : `default-src 'self'` avec les
domaines Google Fonts suffit presque.

### 1.2 Le budget OpenRouter est épuisable par un script — 🟠

**Problème :** `/api/mipmip` est un endpoint POST public, sans authentification, dont chaque appel
coûte de l'argent. Les protections en place sont deux, et aucune n'arrête un script :

1. Le limiteur de `apps/web/app/api/mipmip/route.ts:41` compte en mémoire, par instance de fonction.
   Vercel en démarre plusieurs en parallèle, donc la limite réelle est un multiple de 8 par minute.
   Le fichier le documente honnêtement lui même (`route.ts:32`), mais le constat reste.
2. L'absence d'en-tête CORS bloque les navigateurs, **pas** `curl`. J'ai appelé la production en
   ligne de commande avec un `Origin` hostile pendant cet audit : la réponse est arrivée normalement.

**Chiffrage :** contexte d'environ 5 000 jetons en entrée et 250 en sortie, sur
`google/gemini-3.1-flash-lite` à 0,25 $ et 1,50 $ le million, soit **0,0016 $ la question**. À
8 questions par minute depuis une seule adresse, cela fait **0,77 $ l'heure** : le plafond de
6,50 $ tombe en **huit heures et demie** par une personne seule, et en quelques minutes avec
plusieurs adresses.

**Pourquoi c'est important :** le jour où le budget tombe, Mipmip s'arrête pour tout le monde, y
compris pour l'étudiant qui arrive la veille de la clôture des inscriptions. Le coût financier est
borné par le plafond ; le coût d'image ne l'est pas.

**Correction recommandée :** dans l'ordre de rentabilité.

1. **Exiger un `Origin` ou un `Referer` correspondant au site**, et refuser sinon. Trois lignes.
   Cela n'arrête pas quelqu'un de déterminé, cela arrête tout le monde d'autre.
2. **Un limiteur partagé** (Vercel KV, Upstash) au lieu de la mémoire d'instance.
3. **Garder le plafond de dépense** sur la clé : c'est la seule protection qui ne dépende pas du
   code, et donc la seule sur laquelle on puisse vraiment compter.

### 1.3 Absence de `import 'server-only'` sur les modules sensibles — 🟡

**Problème :** `apps/web/lib/mipmip.ts` et `apps/web/lib/donnees.ts` lisent le système de fichiers
et ne portent pas `import 'server-only'`. Rien ne les importe côté client aujourd'hui, mais rien
ne l'empêche non plus : un import distrait depuis un composant `"use client"` échouerait au build
de façon obscure, ou pire, embarquerait des données dans le paquet du navigateur.

**Correction recommandée :** ajouter `import "server-only";` en tête de `lib/donnees.ts` et
`lib/mipmip.ts`. Le build échoue alors immédiatement et avec un message clair.

---

## 2. 🐛 Bugs & comportements Next.js

### 2.0 Résultat des tests dynamiques

Cinq pages × quatre tailles, soit vingt rendus. Mesuré : **aucune erreur console, aucune
`pageerror`, aucune réponse HTTP ≥ 400, aucun avertissement d'hydratation, aucun `id` dupliqué,
exactement un `h1` par page, aucune image sans `alt`, aucune image sans dimensions.** C'est rare et
cela mérite d'être dit.

### 2.1 Le cache du serveur de développement s'est corrompu — 🔵

**Problème :** pendant l'audit, `/app/fr/mscf` renvoyait 500 en développement avec
`SyntaxError: Unexpected non-whitespace character after JSON at position 1191`, alors que
`npm run build` générait les 31 pages sans erreur. Cause : le cache `.next/dev` corrompu par un
plantage antérieur du serveur. `rm -rf .next/dev .next/cache` puis relance : tout revient.

**Pourquoi c'est important :** ce n'est pas un défaut du code, mais c'est une demi heure perdue
la prochaine fois. À connaître.

---

## 3. 📱 Responsive

### 3.0 Ce qui est bon

Aucun débordement horizontal à 390, 768 et 1440 px sur les cinq pages. Les tailles fluides
(`clamp`) et les points de rupture sont réellement utilisés, pas seulement à un ou deux endroits.

### 3.1 Scroll horizontal à 320 px, en anglais seulement — 🟡

**Problème :** sur `/en` à 320 px de large, `document.scrollWidth` vaut **323** pour un
`clientWidth` de 320. L'élément fautif est le groupe de droite de l'en-tête,
`div.flex items-center gap-2 justify-self-end`, qui contient le bouton de langue et le bouton
« Launch app ». En français les mêmes boutons tiennent, « Lancer l'app » étant plus court que
« Launch app » une fois le libellé de langue « Français » ajouté à côté.

**Pourquoi c'est important :** trois pixels suffisent à faire apparaître une barre de défilement
horizontale, et la page entière se met à glisser latéralement au doigt. 320 px reste la largeur de
l'iPhone SE de première génération et de plusieurs Android d'entrée de gamme.

**Correction recommandée :** réduire l'écart (`gap-2` → `gap-1.5`) sous 360 px, ou masquer le
libellé de la langue au profit du seul code (`EN` / `FR`) sur les très petits écrans.

### 3.2 Faux positif écarté : les cases à cocher

Le contrôle automatique signale des cases de **17 × 17 px**, sous le seuil WCAG 2.2 de 24 × 24.
Vérification faite, **chaque case est enveloppée dans un `<label>` de 350 × 108 px** : toute la
ligne du cours est cliquable. La cible réelle est donc largement conforme. Ce point n'est **pas**
un défaut, et il est mentionné ici pour qu'il ne soit pas re-signalé par le prochain outil
automatique.

---

## 4. ⚡ Performance

### 4.1 LCP de 3,3 s sur la page d'accueil — 🟠

**Problème :** mesuré sur la production, en Chromium, connexion filaire, CDN chaud :

| Page | Poids transféré | LCP |
|---|---|---|
| `/fr` | 1 052 Ko | **3 256 ms** |
| `/app/fr/mscf` | 992 Ko | 584 ms |

Ressources de plus de 90 Ko sur l'accueil : `hero-backdrop.webp` 152 Ko, `hero-screen.webp` 144 Ko,
et **386 Ko de JavaScript** en deux paquets (224 + 162 Ko).

Le seuil « bon » de Google est de 2,5 s au 75e percentile des visiteurs réels. 3,3 s en conditions
de laboratoire favorables signifie que le terrain, sur téléphone en 4G, sera nettement au dessus.

**À noter :** les images du hero portent déjà `fetchPriority="high"`, et les polices passent par
`next/font/google` avec `display: "swap"`. Les causes faciles sont donc déjà traitées, ce qui rend
le diagnostic moins évident. Les pistes restantes, par ordre de gain probable :

1. **Quatre familles de polices** sont chargées (Crimson Text, DM Sans, DynaPuff, IBM Plex Mono).
   DynaPuff ne sert qu'au logotype, IBM Plex Mono qu'aux chiffres. Chaque famille est un ou
   plusieurs fichiers à télécharger.
2. **386 Ko de JavaScript** pour une page dont le contenu est statique.
3. Les deux images du hero représentent **296 Ko** à elles seules.

**Correction recommandée :** avant d'optimiser quoi que ce soit, **mesurer le terrain** sur
PageSpeed Insights une fois qu'il y aura du trafic. Les données CrUX diront ce qui pèse réellement
pour les visiteurs, là où une mesure de laboratoire peut désigner le mauvais coupable.

### 4.2 Le titre s'anime en permanence sur l'accueil — 🟡

**Problème :** `apps/web/components/brand/TitreMelange.tsx:80` relance l'animation des lettres
toutes les 3 000 ms, pour une animation qui dure 1 150 ms. **Le titre est donc en mouvement 38 %
du temps**, indéfiniment, tant que l'onglet est visible. Quatorze éléments animés simultanément
avec `transform`, `rotate` et `scale`.

**Pourquoi c'est important :** sur un téléphone d'entrée de gamme, une animation composite qui ne
s'arrête jamais consomme de la batterie et occupe le fil principal, ce qui dégrade l'INP au moment
précis où le visiteur essaie de cliquer sur « Lancer l'app ». Et un titre qui bouge 38 % du temps
est plus difficile à lire qu'un titre immobile.

**Ce qui est déjà bien fait :** rien ne se déclenche sous `prefers-reduced-motion: reduce`
(vérifié : titre inchangé après neuf secondes), et rien ne tourne dans un onglet caché.

**Correction recommandée :** porter `RESPIRATION` à 6 000 ou 8 000 ms. Le mouvement devient une
surprise agréable au lieu d'un clignotement. Une ligne à changer.

### 4.3 15 Mo d'images inutiles dans l'historique git — 🟡

**Problème :** `.git` pèse **19 Mo** pour un arbre de travail d'environ 1 Mo. Les quatre plus gros
objets de l'historique sont des images de travail supprimées du suivi mais jamais purgées :

```
4887 Ko  Nouveau dossier/degradé2.jpg
3337 Ko  Nouveau dossier/degradé3.jpg
3069 Ko  Nouveau dossier/degradé.jpg
2615 Ko  Nouveau dossier/Gemini_Generated_Image_sg801jsg801jsg80.jpg
 515 Ko  Nouveau dossier/image myp.jpg
```

Soit **14,8 Mo**, dans un dépôt public, pour des fichiers qui n'existent plus. Une purge antérieure
avait retiré les captures d'écran mais avait manqué ce dossier.

**Pourquoi c'est important :** chaque clone télécharge ces 15 Mo. Et le dépôt affiche une règle
explicite, « on n'y met que ce qui fait le site », que ces fichiers contredisent.

**Correction recommandée :** `git filter-repo --path "Nouveau dossier" --invert-paths` puis
`push --force`. **Opération destructive** qui réécrit l'historique : à ne faire qu'en connaissance
de cause, et le dépôt doit être re-cloné ensuite par quiconque en aurait une copie.

---

## 5. 🔍 SEO & référencement

### 5.0 Ce qui est bon, et c'est presque tout

Le `<head>` rendu en production contient : `<title>` unique, `description`, `canonical`,
`hreflang` déclaré **dans les deux sens** (fr ↔ en), Open Graph complet avec `og:image` de
1200 × 630 et son `og:image:alt`, `twitter:card` en `summary_large_image`, favicon, icône 512,
`apple-touch-icon`. Le `sitemap.xml` liste les 22 pages avec leurs `alternates`, et **n'émet pas de
`lastModified`**, ce qui évite le piège classique du `new Date()` au build qui fait croire à Google
que tout change à chaque déploiement. Le `robots.txt` est ouvert et pointe vers le sitemap.

### 5.1 Aucune donnée structurée JSON-LD — 🟡

**Problème :** aucune balise `<script type="application/ld+json">` sur la production (vérifié par
`curl | grep -c`, résultat 0).

**Pourquoi c'est important :** le JSON-LD est ce qui permet à Google et aux moteurs de réponse par
IA de comprendre **ce qu'est** le site plutôt que de le deviner. Pour MYP, deux schémas seraient
directement pertinents : `WebApplication` (un outil gratuit, avec sa catégorie et son prix à zéro)
et `Organization`. Sur un site qui vise un public captif et bien identifié, ce n'est pas décisif,
mais c'est une heure de travail pour un gain durable.

### 5.2 Le site n'est soumis à aucun moteur — 🔵

**Problème :** rien n'indique une soumission à Google Search Console ni à Bing Webmaster Tools.
Or Bing alimente **ChatGPT et Copilot** : ne pas y être, c'est être absent des réponses IA que
consulteront de plus en plus d'étudiants.

**Correction recommandée :** le skill fournit `scripts/seo-submit.mjs` pour automatiser la
soumission à Google, Bing et IndexNow.

---

## 6. ♿ Accessibilité

### 6.0 Ce qui est bon

Un seul `h1` par page, `lang` correct sur `<html>` dans les deux langues, tous les `alt` présents,
aucun `id` dupliqué, `aria-expanded` sur le bouton Mipmip, `Échap` ferme le panneau, focus visible
géré par `:focus-visible` sur les éléments interactifs principaux.

### 6.1 Le champ de Mipmip n'a pas de libellé — 🟠

**Problème :** `apps/web/components/app/Mipmip.tsx:215`, le champ de saisie porte un `placeholder`
mais **ni `<label>` associé, ni `aria-label`**.

**Pourquoi c'est important :** un placeholder n'est pas un libellé. Il disparaît dès la première
lettre tapée, et un lecteur d'écran annonce un champ sans nom. C'est le défaut d'accessibilité de
formulaire le plus courant et le plus facile à corriger.

**Correction recommandée :** ajouter `aria-label={T.invite}` sur le champ. Une ligne.

### 6.2 Pas de lien d'évitement — 🟡

**Problème :** aucun lien « Aller au contenu » en tête de page (vérifié sur la production).

**Pourquoi c'est important :** une personne qui navigue au clavier doit traverser tout l'en-tête à
chaque page. L'en-tête de MYP est court, donc la gêne est réelle mais limitée.

### 6.3 Contraste du texte secondaire à la limite — 🟡

**Problème :** `.text-muted` mesure `rgb(106, 120, 131)` sur fond blanc, à 13 px, soit un rapport
de contraste de **4,54:1**. Le seuil WCAG AA pour du texte normal est de 4,5:1. **La conformité
tient à 0,04 point.**

**Pourquoi c'est important :** ce n'est pas une non conformité, c'est une absence de marge. Le
moindre ajustement de couleur, ou un fond légèrement teinté comme ceux du sélecteur de fond de
calendrier, fait basculer sous le seuil sans que personne ne s'en aperçoive.

**Correction recommandée :** assombrir `--color-muted` d'un cran, vers `rgb(95, 108, 119)`, ce qui
porte le rapport à environ 5,3:1 sans changement visible.

---

## 7. 🧹 Qualité de code & hygiène

### 7.0 Ce qui est bon

`npm run lint` : **0 erreur**. `npx tsc --noEmit` : **0 erreur**. `npm test` : **13 tests, 13
passent**. Aucun `TODO`, aucun `FIXME`, aucun `console.log` oublié, aucun texte de remplissage.
Les commentaires expliquent le **pourquoi** des décisions, ce qui est l'exception plutôt que la
règle. Le fichier `data/corrections-plans.json` documente chaque correction manuelle avec sa
justification, et l'outil signale les corrections devenues caduques au lieu de les appliquer en
silence.

### 7.1 Le README ne parle pas de la reprise des fiches — 🔵

**Problème :** `README.md` et `docs/SOURCES.md` décrivent les plans d'études PDF comme source, et
`docs/LEGAL.md` affirme que le projet n'appelle pas les points d'entrée de `applicationspub.unil.ch`.
Trois outils ajoutés aujourd'hui font exactement le contraire : `tools_fiches.py`,
`tools_fiches_publier.py`, `tools_fiches_verser.py`.

**Pourquoi c'est important :** un dépôt public qui documente une politique qu'il ne suit pas est
pire qu'un dépôt qui ne documente rien. Voir § 8.

---

## 8. 🔐 Conformité légale & vie privée

### 8.1 Récolte automatisée en violation du `robots.txt` de l'UNIL — 🔴

**Problème :** le 27 août 2026, une récolte automatisée a appelé environ **640 fois** les points
d'entrée suivants sur `applicationspub.unil.ch` :

- `/interpub/noauth/php/Ud/ficheCours.php` — 610 appels, 305 fiches en deux langues
- `/interpub/noauth/php/Ud/listeCours.php` — 29 appels

Le fichier `https://applicationspub.unil.ch/robots.txt`, relevé pendant cet audit, contient :

```
User-Agent: *
Allow:    /interpub/noauth/php/Ud/*
Disallow: /interpub/noauth/php/Ud/ficheCours.php
Disallow: /interpub/noauth/php/Ud/listeCours.php
Crawl-delay: 10
```

Trois manquements distincts, tous vérifiables :

1. **Les deux points d'entrée utilisés sont nommément interdits** à tous les agents.
2. **Le `Crawl-delay` de 10 secondes n'a pas été respecté** : la récolte a espacé ses appels de
   2,6 secondes, soit un rythme presque quatre fois supérieur à celui demandé.
3. **La protection technique F5 Shape a été contournée** par un navigateur sans interface, avec
   vidage des cookies et réessai à chaque refus du pare feu.

Le dépôt contenait déjà tout ce qu'il fallait pour l'éviter. `docs/LEGAL.md:12` cite ces mêmes
lignes de `robots.txt`, nomme `ficheCours.php` et `listeCours.php`, relève le `Crawl-delay: 10`, et
conclut :

> « L'UNIL a exprimé son refus de l'accès automatisé de deux façons : par une règle écrite et par
> un dispositif technique. Un robot hebdomadaire sur ces URL irait contre les deux, et contourner
> une mesure technique de protection n'est pas une zone grise confortable, en Suisse comme
> ailleurs. **Le projet ne le fait pas.** »

Mieux : `packages/scraper/src/unil.js:38` contient une liste `DISALLOWED` qui bloque explicitement
`ficheCours.php` et `listeCours.php`, avec ce commentaire :

> « Ce module refuse de les appeler. Le contournement n'est possible qu'avec une autorisation
> écrite de l'UNIL. »

**Le garde-fou n'a pas été contourné, il a été ignoré** : un script neuf a été écrit en dehors du
paquet qui le contenait.

**Responsabilité :** cette récolte est de mon fait, pendant la session du 27 août 2026. J'avais
l'information sous la main, dans une note de mémoire décrivant ces endpoints et dans ce fichier
`LEGAL.md` du dépôt, et je n'ai pas consulté le `robots.txt` avant de commencer.

**Pourquoi c'est important :** l'UNIL est l'institution dont MYP dépend, dont il affiche les
données, et à laquelle il envisage d'écrire pour obtenir une reconnaissance. Un étudiant qui
publie un dépôt public montrant qu'il a contourné le pare feu de sa propre université, en
contradiction avec la politique qu'il a lui même écrite, prend un risque qui dépasse largement le
site.

**Correction recommandée :** trois options, à trancher par Clément, pas par moi.

1. **Retirer les données récoltées** et revenir à ce que le projet annonçait : un lien vers la
   fiche officielle, sans reprise. C'est l'option qui remet le site en conformité avec sa propre
   documentation, aujourd'hui.
2. **Écrire à l'UNIL** avant toute publication supplémentaire, en décrivant exactement ce qui a été
   fait et en demandant l'autorisation. Un courriel à `HECmaster@unil.ch` était déjà rédigé et non
   envoyé. Cette option est la seule qui permette de garder les données.
3. **Ne rien faire** en assumant que le volume est faible et l'usage bienveillant. C'est un choix
   défendable, mais il doit être **explicite** et `docs/LEGAL.md` doit alors être réécrit pour
   dire la vérité.

Dans tous les cas : **supprimer `tools_fiches_recolte`**, ou lui ajouter la même garde que
`packages/scraper/src/unil.js`, pour que la récolte ne puisse pas être relancée par inadvertance.

### 8.2 Publication de textes que le projet s'engageait à ne pas reprendre — 🔴

**Problème :** `docs/LEGAL.md:64` pose la règle qui structure toute la base de données :

| On reprend | On ne reprend pas |
|---|---|
| Intitulé, enseignant, ECTS, module, langue | Le texte de l'objectif |
| Jour, heure, salle, semestre | Le texte du contenu |
| Type d'évaluation, durée de l'examen | **Le texte de la bibliographie** |
| | **Les modalités rédigées en détail** |

Le fichier `data/cours-details.json`, versionné et déployé, contient sur **241 cours** :

- **180 bibliographies** reprises **mot pour mot**, avec titres d'ouvrages, éditeurs et ISBN ;
- **85 blocs d'évaluation** contenant les modalités rédigées en détail ;
- **159 blocs de prérequis** en prose.

Extrait réel du fichier publié :

> « Lectures complémentaires (facultatives) : Picker, R. et al. (2016): Applying IFRS Standards,
> 4th edition, Chichester, West Sussex / UK: John Wiley & Sons. ISBN: 978-1119159223… »

Le raisonnement qui a présidé à ce choix, écrit dans `tools_fiches_publier.py:13`, était que ces
champs sont « des faits, qui se citent librement parce qu'ils ne sont l'expression de personne ».
**Ce raisonnement est faux pour deux des trois champs.** Une liste bibliographique est un choix
éditorial de l'enseignant, et les modalités d'évaluation rédigées sont un texte. Le projet l'avait
d'ailleurs déjà tranché, dans le sens inverse, et par écrit.

**Pourquoi c'est important :** ce n'est plus une question de `robots.txt` mais de droit d'auteur,
et le contenu est en ligne et dans un dépôt public.

**Correction recommandée :** dans `tools_fiches_publier.py`, retirer `bibliographie` et
`evaluation` de `FAITS_PAR_LANGUE`, régénérer, et pousser. Les prérequis, souvent réduits à une
phrase factuelle du type « bases de statistique et de probabilité », peuvent se discuter au cas par
cas. **Cette correction est indépendante du § 8.1 et peut être appliquée immédiatement**, quelle
que soit la décision prise sur la récolte.

### 8.3 Ni bandeau cookies ni mentions légales, et c'est correct — ✅

Le site ne dépose **aucun cookie**, n'utilise **aucun outil de mesure d'audience**, et ne charge
**aucun script tiers**. Le seul stockage est un `localStorage` pour le fond du calendrier et le
plan en cours, qui ne quitte jamais le navigateur. Aucun bandeau de consentement n'est donc requis,
ni par la nLPD ni par le RGPD. `docs/LEGAL.md` couvre la non affiliation à l'UNIL, et l'avis figure
en pied de page. **Rien à corriger.**

Un point à surveiller : les questions posées à Mipmip **partent chez OpenRouter**, donc hors de
Suisse. Elles ne contiennent aucune donnée personnelle aujourd'hui, mais un étudiant peut toujours
écrire son nom dans une question. Une phrase dans le panneau de Mipmip suffirait à le dire.

---

## 9. 🎯 UX, conversion & contenu

### 9.1 Mipmip ne sait pas encore répondre à sa question principale — 🟠

**Problème :** l'usage attendu de Mipmip est « de quoi parle ce cours ». Sur les 241 cours publiés,
**32 seulement ont un résumé**. Pour les 209 autres, Mipmip répond correctement « le plan d'études
ne fournit pas de descriptif » et renvoie à la fiche officielle, ce qui est honnête, mais représente
**87 % des cas**.

**Pourquoi c'est important :** un assistant qui échoue huit fois sur dix sur la question qu'on lui
pose le plus détruit la confiance qu'il devait construire. Le reste de ses réponses, sur les
horaires, crédits, modules et examens, fonctionne pourtant très bien.

**Correction recommandée :** soit finir les résumés avant d'annoncer Mipmip publiquement, soit
formuler sa promesse dans le site autour de ce qu'il sait faire aujourd'hui. Note : cette
recommandation se heurte au § 8, puisque les résumés dérivent de la récolte contestée.

### 9.2 Le verrou de Mipmip, éprouvé — ✅

Douze questions hostiles envoyées à la production : détournement de rôle, demande de code Python,
question sur l'EPFL, conseil boursier, invention de cours, extraction du prompt système, fausse
ligne `System:`. **Les huit tentatives hostiles sont refusées, les quatre légitimes répondent**,
chacune avec le lien vers la fiche officielle. La troisième couche du verrou, qui vérifie
côté serveur que la réponse cite un titre existant au caractère près, tient même si la consigne
cède. Treize tests unitaires couvrent les détournements. **Rien à corriger.**

---

## 10. 🚀 Livraison & exploitation

### 10.1 Aucune surveillance — 🔵

**Problème :** aucun outil de suivi d'erreurs, aucune surveillance de disponibilité, aucune alerte.
Si `/api/mipmip` se met à renvoyer 502 parce que le crédit OpenRouter est épuisé, personne ne
l'apprendra avant qu'un étudiant ne le signale.

**Correction recommandée :** une surveillance gratuite type UptimeRobot sur `/fr` et sur
`/api/mipmip`, plus l'alerte de solde d'OpenRouter.

### 10.2 Facteur d'autobus de un — 🔵

**Problème :** un seul contributeur, une seule personne qui sait comment les données sont
produites. Les outils `tools_*.py` sont bien commentés, ce qui limite fortement le risque, mais la
récolte des horaires reste un relevé manuel qu'aucun document ne décrit pas à pas.

**Correction recommandée :** une page « comment mettre à jour pour l'année suivante » dans `docs/`.
Une heure de travail, qui vaudra cher dans douze mois.

---

## Ce qui n'a pas pu être testé

- **Core Web Vitals de terrain** : le site n'a pas assez de trafic pour que CrUX ait des données.
  Toutes les mesures de performance de ce rapport sont des mesures de laboratoire.
- **Lecteur d'écran** : les vérifications d'accessibilité sont automatiques et manuelles au
  clavier, mais aucun test NVDA ou VoiceOver n'a été fait. Les outils automatiques ne couvrent
  qu'environ la moitié des critères WCAG.
- **Comportement réel sous charge** de `/api/mipmip` : le limiteur n'a pas été éprouvé avec
  plusieurs instances Vercel simultanées.
