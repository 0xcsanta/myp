# MYP, Master Your Plan

Un outil gratuit qui aide les étudiantes et étudiants de l'UNIL à composer leur
plan d'études : compteur de crédits ECTS en direct, vérification des minimums
par module, alerte quand on dépasse le total du diplôme, détection des
chevauchements d'horaire, et export du calendrier.

Périmètre : **les dix masters de HEC Lausanne**, et rien d'autre. Une extension
à d'autres facultés se décidera à la demande, si elle vient, et pas avant.

> **MYP est un projet indépendant réalisé par [Omniscient](https://omniscient.swiss).
> Il n'est ni affilié à l'Université de Lausanne, ni approuvé, ni soutenu, ni
> relu par elle.**
>
> **La quasi-totalité des informations est reprise des plans d'études officiels
> 2025-2026 de HEC Lausanne.** Elles peuvent contenir des erreurs ou être
> périmées. Seuls le plan d'études et le règlement officiels font foi.
>
> Pour toute question académique, contactez l'administration des cursus de
> Master de HEC : **HECmaster@unil.ch**, +41 21 692 36 68. Tous les contacts
> figurent dans [docs/SOURCES.md](docs/SOURCES.md).

---

## Sources et conformité

Deux documents à lire avant toute contribution :

- **[docs/SOURCES.md](docs/SOURCES.md)** : d'où vient chaque donnée, avec l'URL
  et la date de consultation, plus tous les contacts officiels.
- **[docs/LEGAL.md](docs/LEGAL.md)** : ce que le `robots.txt` de l'UNIL
  interdit, pourquoi le projet ne récupère pas automatiquement le catalogue des
  cours, et ce qu'on fait à la place.

Le point essentiel, en une phrase : **le catalogue en ligne de l'UNIL interdit
l'accès automatisé à tous ses points d'entrée utiles**, donc les données
viennent des PDF publics des plans d'études, et le site affiche des faits en
renvoyant vers les fiches officielles pour le texte.

Le robot dans `packages/scraper` refuse de démarrer sur les URL interdites.
Cette garde est volontaire, elle ne se contourne pas sans autorisation écrite
de l'UNIL.

## Structure

```
apps/web/            le site, Next.js
packages/scraper/    lecture des sources autorisées, garde robots.txt incluse
packages/rules/      le moteur de règles, sans dépendance, testable seul
data/rules/          un fichier JSON par master, seuils de crédits saisis à la main
data/raw/            sorties de lecture, versionnées
allmaster/           les plans d'études et règlements officiels, copies locales
docs/                sources, cadre légal, décisions
```

## Démarrer

```bash
npm install
npm run test:rules
```

## Licence

Le code est ouvert. Les documents de l'UNIL présents dans `allmaster/` restent
la propriété de l'Université de Lausanne et ne sont pas redistribués par le
site, qui renvoie vers les URL officielles.
