# À décider, à faire

## Règles de conception non négociables

- **Dire « on ne sait pas ».** Beaucoup de cours n'ont ni horaire publié, ni
  modalités d'évaluation détaillées, ni salle. Dans ce cas l'interface écrit
  explicitement « information non publiée par l'UNIL » avec le lien vers la
  fiche officielle. Jamais de case vide, jamais de tiret muet, et surtout
  jamais une valeur devinée ou reprise d'une autre année. Une donnée absente
  est une information en soi : elle dit à l'étudiant qu'il doit aller vérifier.
- **Chaque donnée porte sa source et sa date.** Voir [SOURCES.md](./SOURCES.md).
- **Année de référence affichée en permanence :** 2025-2026.

## Demandé, pas encore construit

- [x] **Le site en français et en anglais.** Fait le 27 août. `/fr` et `/en`
      pour l'accueil, `/app/fr` et `/app/en` pour le planificateur, avec une
      bascule dans l'en tête qui garde la page où on est. Le dictionnaire
      (`lib/textes.ts`) est typé d'après le français : une chaîne oubliée en
      anglais arrête la compilation, plutôt que de servir du français sous une
      adresse anglaise.
      Ce qui vient des documents officiels n'est **pas** traduit : intitulés de
      cours, intitulés de diplôme, notes de module. Une ligne le dit au lecteur
      dans les deux langues, car l'inverse est fréquent : la page française
      porte beaucoup de titres anglais.
      Reste à vérifier avec Clément : faut il pointer les liens UNIL vers leurs
      pages anglaises. Elles existent mais leurs adresses ne se déduisent pas
      de la version française, et je n'ai pas voulu deviner une adresse qui
      renverrait une page introuvable.

- [x] **Export du calendrier en PDF et en PNG.** Fait le 27 août. La grille est
      redessinée sur un canevas, ce qui donne une image nette, puis le PDF est
      assemblé à la main autour de ce JPEG. Aucune bibliothèque : un moteur de
      rendu HTML vers image pèserait plusieurs centaines de kilooctets pour un
      résultat moins propre. Un bouton par semestre et par format.
      L'export sort dans la langue de la page, nom de fichier compris.

- [ ] **Export `.ics`. Mis de côté, décision de Clément le 27 août :** les
      calendriers sont hebdomadaires, et pour le reste les étudiants iront sur
      le site de HEC. Ce qui suit reste vrai si on y revient un jour.

      **Bloqué, et pas par de la technique.** Un calendrier
      place des événements à des dates réelles, là où une grille se contente
      de cases. Il faut donc la date d'ouverture officielle du semestre, que
      je n'ai pas. Les indices sont forts pour l'automne 2026, les PDF
      mentionnant le 14 et le 15 septembre, mais **je refuse de générer
      quatorze semaines d'événements à partir d'une date déduite** : une
      erreur d'une semaine décalerait tout le calendrier de l'étudiant.
      Il me faut le calendrier académique officiel de l'UNIL. Avec lui, c'est
      une demi heure. Détail dans
      [HORAIRES-A-VERIFIER.md](./HORAIRES-A-VERIFIER.md).

- [ ] **Plusieurs styles de calendrier, avec fond personnalisable.**
      *À rediscuter avec Clément avant de construire.* Questions ouvertes :
      combien de styles, un fond image ou seulement des thèmes de couleur, est
      ce que le style choisi se retrouve dans l'export PNG, est ce qu'il se
      partage avec l'URL. Attention à ne pas rendre le calendrier illisible :
      la lisibilité prime sur la décoration.

## Demandé le 27 août, construit le jour même

- [x] **La saison et l'horaire à côté du nom du cours.** La saison passe en
      pastille contre le titre, là où elle se lit, plutôt qu'en bout de ligne
      noyée dans les métadonnées. L'horaire vient dessous, en bleu :
      « Vendredi 12:30 à 16:00 · Anthropole/2064 ». Il figure déjà dans la
      grille, mais la grille ne montre que les cours cochés, donc c'est le seul
      endroit où on voit l'horaire d'un cours **avant** de le prendre. Un cours
      sans relevé écrit « horaire non relevé » plutôt que rien.
- [x] **Le rail de crédits défile tout seul.** Collé en haut, sa fin restait
      hors de portée dès qu'un master avait beaucoup de modules : il fallait
      descendre toute la page. Il a maintenant sa propre hauteur et sa propre
      barre, et la roulette n'emporte plus la page quand on arrive en bas.
- [x] **L'arbitrage des chevauchements.** Chaque chevauchement porte un bouton
      « Choisir lequel garder » qui ouvre la comparaison des deux cours, avec
      pour chacun ce que son retrait coûterait : les modules qui tomberaient
      sous leur minimum, et le total après coup. Le calcul n'est pas une
      estimation, on rejoue le moteur de règles sur la sélection privée du
      cours : c'est la même vérité que le rail. Le site ne tranche pas à la
      place de l'étudiant, il lui montre le prix de chaque renoncement.

## La transition entre l'accueil et l'application

Faite le 27 août, en CSS seul, sans bibliothèque ni JavaScript.

Les deux mises en page racines, qui existent pour poser le bon `lang` sur la
balise html, font que passer de l'accueil au planificateur est un vrai
changement de document. C'est exactement ce que les transitions de vue entre
documents savent traiter : le navigateur capture l'ancienne page, charge la
nouvelle, anime le passage. Là où ce n'est pas encore implémenté, Firefox
aujourd'hui, la navigation reste simplement instantanée.

**Le logotype est nommé**, donc il n'est pas capturé avec le reste de la page.
Il persiste et se déplace de sa position d'accueil vers celle, plus petite, de
l'application. C'est lui qui rend le passage lisible : l'œil a un point fixe à
suivre pendant que le reste change. Un seul élément par page peut porter ce
nom, donc celui du pied de page ne l'a pas, et c'est vérifié.

**Deux pièges désamorcés**, tous deux invisibles jusqu'à ce qu'on les
rencontre :

- Le bouton et le logotype sont des ancres ordinaires, plus des `Link` de
  Next. Next ne peut de toute façon pas naviguer sans recharger entre deux
  mises en page racines, donc le `Link` ne faisait que précharger pour rien.
  Surtout, il déclenchait la navigation **par script**, et une transition entre
  deux documents ne s'active que sur une navigation native.
- `mix-blend-mode: normal` sur les deux captures. La feuille du navigateur pose
  `plus-lighter`, ce qui convient à son fondu croisé par défaut mais surexpose
  les deux pages dès qu'on écrit ses propres animations : les textes
  deviennent des fantômes délavés.

`prefers-reduced-motion: reduce` coupe la transition à sa source plutôt que de
la ralentir : les pseudo-éléments de transition vivent dans leur propre arbre
et la règle `*` du bloc voisin ne les atteint pas.

**Non vérifié à l'œil.** Le navigateur du banc d'essai ne peint pas de frames,
et Chrome saute les transitions quand le document n'est pas visible. Tout le
reste est vérifié : les règles survivent à la minification, les images clés
sont acceptées, un seul élément porte le nom, et `pageswap` confirme une
navigation de document. **L'animation elle même est à juger à l'œil, sur un
vrai écran.**

## La vague, demandée le 27 août

Le dégradé de la marque envahit l'écran puis **se retire par où il est venu**,
comme une vague sur une plage. **Le sens dit où l'on va** : en entrant dans
l'application elle monte du bas puis redescend, en revenant à l'accueil elle
descend du haut puis remonte. Le dôme reste tourné vers le bord d'origine, donc
le milieu arrive en premier et se retire en dernier. Le bord d'attaque est arrondi et s'aplatit
en déferlant, ce qui fait la différence entre une vague et un rectangle qui
monte.

Le sens voyage d'une page à l'autre par le stockage de session, la seule chose
qui survive à un changement de document sans passer par le serveur. La page qui
s'ouvre sait ainsi dans quel sens poursuivre le mouvement commencé par la
précédente.

**Pourquoi pas la transition de vue pour ça.** Une transition de vue croise
deux captures ; elle ne peut pas retenir la navigation le temps qu'une masse de
couleur traverse l'écran. Les deux mécanismes cohabitent sans se gêner : quand
le composant intercepte le clic il navigue par script, ce qui n'active pas les
transitions de vue ; quand il ne l'intercepte pas, faute de JavaScript, le clic
reste natif et la transition de vue prend le relais. Le logotype qui morphe
devient donc un repli, pas l'effet principal.

**Trois gardes, qui comptent autant que l'effet :**

- Si la navigation échoue, l'écran resterait bleu et la page inutilisable. La
  vague se retire d'elle même au bout de deux secondes.
- Un lien qui pointe sur la page courante ne déclenche rien : le logotype mène
  à l'accueil depuis toutes les pages, l'accueil compris.
- `prefers-reduced-motion` navigue directement, et le CSS masque la vague.

Clic milieu, Ctrl, Cmd et cible `_blank` restent des clics normaux.

**Non vérifié à l'œil**, pour la même raison que la transition : le navigateur
du banc d'essai ne peint pas. La mécanique, elle, est vérifiée maillon par
maillon : le clic pose la phase et le sens, l'animation nommée s'applique avec
la bonne durée, la navigation est retardée, le sens arrive dans la page
suivante, le stockage est vidé, et le filet remet la vague au repos. Vérifié
dans les deux sens.

## Avant la mise en ligne

- [x] **Plan du site et robots.txt.** Faits le 27 août. 24 adresses, chacune
      déclarant sa jumelle dans l'autre langue, ce qui évite qu'un moteur
      traite la version anglaise comme un doublon. Tout est ouvert aux
      robots : MYP ne publie que du public remis en forme.
- [ ] **Le domaine.** Pas tranché. Tout le code lit `NEXT_PUBLIC_SITE_URL`, et
      la valeur par défaut est `https://myp.omniscient.swiss`, qui n'est
      qu'une supposition. Une variable à changer le jour où tu décides.
- [x] **Accessibilité du planificateur.** Vérifié le 27 août : toutes les cases
      ont un libellé, aucun bouton muet, images et SVG annotés, hiérarchie de
      titres correcte. Ajouté une région annoncée sur les vérifications, qui
      changeaient en silence pour un lecteur d'écran alors qu'elles sont la
      raison d'être du site.
- [x] **Téléphone.** Le planificateur débordait de 350 pixels sur un écran de
      390. Corrigé, et le compteur de crédits se colle en bas de l'écran tant
      que le rail est hors champ.

## Décisions en attente

- [x] **Le nom.** Tranché : **MYP, Master Your Plan**, choisi par Clément.
- [x] **Année de référence.** Tranché : le site vise **2026-2027**, l'année que
      les étudiants vont réellement vivre. Les règles de crédits viennent du
      plan d'études **2025-2026**, le dernier publié par HEC, et c'est écrit
      tel quel dans le pied de page. Les horaires ne sont pas encore intégrés,
      donc on ne les annonce pas. Quand HEC publiera le plan 2026-2027, mise à
      jour si le temps le permet. Les horaires **sont** intégrés depuis le
      27 août, et le pied de page a été corrigé en conséquence.
- [x] **Périmètre.** Tranché le 26 août 2026 : **HEC uniquement**. Les autres
      facultés ne sont pas un objectif, ni annoncé ni préparé. Si la demande
      vient, on décidera à ce moment là. Ne rien construire « au cas où » :
      le schéma reste simple tant qu'il ne sert qu'à HEC.
- [x] **Périmètre de la version 1.** Tranché par Clément : **les dix masters**.
- [x] **Supabase.** Authentifié le 26 août 2026. Les outils du serveur du projet
      arrivent au prochain démarrage de session.
- [ ] **Envoyer la demande d'accès à l'UNIL** (brouillon prêt dans
      [LEGAL.md](./LEGAL.md), section 5). C'est ce qui débloquerait la mise à
      jour automatique.

## Crédits Higgsfield

Solde : 10. Réservation décidée avec Clément :

- 2 crédits pour l'image Open Graph, à générer **après** l'arrivée de la
  section d'accueil Figma, pour que la vignette suive la même direction.
- 2 crédits gardés pour le visuel de lancement.
- 6 crédits libres.

Pas de génération pour le favicon, le logo, ni les états vides : typographie et
SVG font mieux et ne coûtent rien.
