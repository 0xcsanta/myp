# Cadre légal et éthique du projet

Dernière vérification : 26 août 2026. Ce document n'est pas un avis juridique.
Je ne suis pas juriste. Il décrit des faits vérifiables et les choix que le
projet fait en conséquence.

---

## 1. Ce que j'ai vérifié, et qui bloque le plan initial

Le fichier `https://applicationspub.unil.ch/robots.txt` interdit explicitement,
**pour tous les agents**, exactement les points d'entrée sur lesquels reposait
l'architecture d'origine :

```
User-Agent: *
Allow:    /interpub/noauth/php/Ud/*
Disallow: /interpub/noauth/php/Ud/agendaType.php
Disallow: /interpub/noauth/php/Ud/agendaTypePdf.php
Disallow: /interpub/noauth/php/Ud/ficheCours.php
Disallow: /interpub/noauth/php/Ud/listeCours.php
Disallow: /interpub/noauth/php/Ud/catalogueCours.php
Disallow: /interpub/noauth/php/Ud/recherche.php
Disallow: /interpub/noauth/php/Ud/structureCours.php
...
Crawl-delay: 10
```

Le même fichier ajoute deux choses :

- un bloc `Disallow: /` visant nommément une quarantaine de robots d'IA, dont
  `ClaudeBot`, `Claude-Web`, `GPTBot`, `PerplexityBot` et `Scrapy` ;
- une directive `DisallowAITraining: /` applicable à tout le monde.

À cela s'ajoute une **protection technique active** : le domaine est derrière
F5 Shape, qui rejette toute requête n'exécutant pas de JavaScript et met sur
liste noire les sessions trop rapides.

### Conclusion

L'UNIL a exprimé son refus de l'accès automatisé de deux façons : par une règle
écrite et par un dispositif technique. Un robot hebdomadaire sur ces URL irait
contre les deux, et contourner une mesure technique de protection n'est pas une
zone grise confortable, en Suisse comme ailleurs. **Le projet ne le fait pas.**

Le robot écrit dans `packages/scraper` est conservé pour référence mais il
**refuse de démarrer** sur ces URL. Voir la garde dans `src/unil.js`.

---

## 2. Ce que le projet fait à la place

### 2.1 Les plans d'études officiels, publics et non restreints

Les plans d'études et les règlements de chaque master sont publiés en PDF sur
`www.unil.ch/files/`. Ce chemin **n'est pas** couvert par le `robots.txt` de
`www.unil.ch`, il n'est pas derrière le pare feu, et ces documents sont
destinés à être téléchargés par les étudiants. C'est notre source principale.

La liste complète figure dans [SOURCES.md](./SOURCES.md).

### 2.2 Des faits, pas de la prose

Distinction qui structure toute la base de données :

| On reprend | On ne reprend pas |
|---|---|
| Intitulé du cours, nom de l'enseignant | Le texte de l'objectif |
| Nombre de crédits ECTS, module, langue | Le texte du contenu |
| Jour, heure, salle, semestre | Le texte de la bibliographie |
| Type d'évaluation, durée de l'examen | Les modalités rédigées en détail |

Un horaire, un nombre de crédits ou un nom de salle sont des **faits**. Une
description de cours est un **texte protégé par le droit d'auteur**, dont
l'UNIL ou l'enseignant est titulaire. Le site affiche les faits et renvoie vers
la fiche officielle pour le texte. Cela règle la question du droit d'auteur et
répond en même temps au besoin de traçabilité.

### 2.3 Un lien source sur chaque donnée

Chaque cours, chaque module et chaque seuil de crédits porte dans la base un
champ `source` avec l'URL exacte et la date de consultation. L'interface
l'affiche. Personne ne doit avoir à nous croire sur parole.

### 2.4 Mise à jour humaine, pas automatisée

Les données sont mises à jour une fois par semestre, à la main, à partir des
PDF officiels, via une pull request relue. Le volume le permet : dix masters,
une trentaine de cours chacun. Ce n'est pas un robot, c'est de la curation.

---

## 3. Non affiliation

À afficher en pied de chaque page et dans le README :

> MYP est un projet indépendant réalisé par Clément Santacreu. Il n'est ni affilié
> à l'Université de Lausanne, ni approuvé, ni soutenu, ni relu par elle. Les
> informations présentées sont reprises de documents publics de l'UNIL et
> peuvent contenir des erreurs ou être périmées. Seuls le plan d'études et le
> règlement officiels font foi. En cas de doute, contactez le conseil aux
> études de HEC Lausanne.

Règles de marque qui vont avec :

- **jamais** le logo de l'UNIL, ni ses armoiries, ni sa typographie officielle ;
- le bleu `#0037EB` est repris comme couleur produit, ce qui n'est pas
  protégeable en soi, mais l'ensemble ne doit jamais évoquer un site officiel ;
- le nom du site ne contient ni « UNIL », ni « HEC », ni « officiel » ;
- le nom de domaine ne doit pas pouvoir passer pour institutionnel. **Point
  ouvert : l'adresse actuelle est `myphec.vercel.app`, qui contient « hec » et
  contredit donc la ligne ci-dessus.** À renommer, ou à assumer explicitement.
- le projet est porté **à titre personnel**, sans mention d'entreprise, tant
  que l'UNIL ne s'est pas prononcée sur la demande qui lui est adressée.

---

## 4. Données personnelles

Pas de compte, pas de courriel, pas de cookie de mesure d'audience. La
sélection de cours vit dans l'URL et dans le stockage local du navigateur, et
ne quitte jamais l'appareil de l'étudiant.

**Une exception, à connaître : Mipmip.** Les questions posées à l'assistant
sont envoyées à OpenRouter, donc hors de Suisse, avec le catalogue du master
consulté. Rien d'autre n'est transmis : ni identifiant, ni adresse, ni
sélection de cours. Un étudiant reste libre d'écrire son nom dans une
question, et le panneau le lui dit. Aucune conversation n'est conservée par le
site.

Si une version ultérieure ajoute des comptes, ce document doit être révisé
avant, pas après.

---

## 4 bis. Incident du 27 août 2026, et ce qui en a été fait

Le 27 août 2026, une session de développement assistée par IA a récolté
automatiquement environ 640 pages sur `applicationspub.unil.ch`, aux points
d'entrée `ficheCours.php` et `listeCours.php`. Trois manquements :

1. ces deux points d'entrée sont nommément interdits à tous les agents par le
   `robots.txt` du domaine, cité au § 1 de ce document ;
2. les appels ont été espacés de 2,6 secondes là où le fichier demande 10 ;
3. la protection F5 Shape a été contournée par un navigateur sans interface.

Les données qui en sont issues ont été publiées quelques heures, puis
**entièrement retirées** : le fichier `data/cours-details.json`, les résumés
qui en dérivaient, les outils de récolte et de publication, et les pages
brutes conservées localement. Rien de ce que cette récolte a produit ne
subsiste dans le site ni dans le dépôt.

Ce que le projet en retient, et qui vaut pour la suite : **une garde technique
ne protège que le code qu'elle garde.** `packages/scraper/src/unil.js` refusait
bien ces appels, mais un script écrit à côté ne l'a jamais rencontrée. La règle
est donc ici, dans ce document, et non seulement dans un fichier :

> Aucun outil de ce dépôt, existant ou à venir, n'appelle
> `applicationspub.unil.ch` sur un chemin que son `robots.txt` interdit, ni ne
> contourne sa protection technique, sans autorisation écrite de l'UNIL.

---

## 5. La voie propre : demander à l'UNIL

Le vrai déblocage est une autorisation. Le service informatique de l'UNIL
répond aux demandes d'accès aux données pour des projets étudiants. Un accord
explicite transformerait le projet : mise à jour automatique, données
complètes, et plus aucune ambiguïté.

Brouillon de message à envoyer à `helpdesk@unil.ch`, en copie au conseil aux
études de HEC :

> Objet : demande d'accès aux données publiques des plans d'études, projet étudiant
>
> Bonjour,
>
> Je suis étudiant à HEC Lausanne. Je développe un outil gratuit et non
> commercial qui aide les étudiantes et étudiants à composer leur plan
> d'études : compteur de crédits ECTS, vérification des minimums par module,
> détection des chevauchements d'horaire.
>
> J'ai constaté que le `robots.txt` d'applicationspub.unil.ch interdit l'accès
> automatisé aux pages `ficheCours.php`, `listeCours.php` et `agendaType.php`.
> Je m'y conforme et n'y accède pas de façon automatisée.
>
> Ma question : existe-t-il un moyen officiel d'obtenir ces données, par
> exemple un export, une interface de programmation, ou une autorisation
> encadrée avec une fréquence et un délai que vous fixeriez ? Je m'engage à
> afficher la source de chaque donnée, à indiquer clairement que le projet
> n'est pas affilié à l'UNIL, et à renvoyer vers les fiches officielles.
>
> Je reste à disposition pour présenter le projet.
>
> Cordialement,

---

## 6. Journal des vérifications

| Date | Ce qui a été vérifié | Résultat |
|---|---|---|
| 26.08.2026 | `applicationspub.unil.ch/robots.txt` | Endpoints du catalogue interdits à tous les agents, `Crawl-delay: 10` |
| 26.08.2026 | `www.unil.ch/robots.txt` | `/files/` non restreint, donc PDF officiels accessibles |
| 26.08.2026 | Informations légales de l'UNIL | Pas de licence de réutilisation ouverte identifiée pour les contenus |

À revérifier avant chaque mise en ligne majeure, et au moins une fois par an.
