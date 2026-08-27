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

**La vague doit couvrir dès la première image**, sans quoi on voit la page une
fraction de seconde avant qu'elle ne la recouvre, et l'effet est détruit : il
repose justement sur le fait de ne jamais voir la coupure. C'est ce qui a
demandé le plus de détours, et trois pistes ont été écartées avant la bonne.

| Piste | Pourquoi elle échoue |
|---|---|
| Un état React | Un composant n'agit qu'après l'hydratation, donc après la première peinture. C'était le défaut d'origine. |
| Un `<script>` écrit dans le corps | Fonctionne, mais fait mentir le HTML rendu par React, qui émet deux avertissements en développement. |
| `next/script` en `beforeInteractive` | **N'écrit pas de balise exécutable.** Next dépose un lien de préchargement et une file d'attente que son propre runtime traite plus tard, donc après la peinture. Le nom induit en erreur : c'est avant l'hydratation, pas avant l'affichage. |

**La solution retenue n'utilise aucun JavaScript.** Le sens du retrait voyage
dans **l'ancre de l'adresse**, et le CSS la lit avec `:target`. L'ancre fait
partie de la requête, le navigateur l'applique avant de peindre quoi que ce
soit, et rien n'est ajouté au document après coup : il n'y a donc rien qui
puisse diverger de ce que React a rendu. Console vide.

L'élément de la vague est aussi placé **avant le contenu** : le navigateur
peint sans attendre la fin de l'analyse du document, donc en fin de corps il
risquait de n'exister qu'après une première peinture.

React ne pilote plus que le départ, qui part d'un clic et n'a pas ce problème.

**Deux pièges de spécificité, trouvés en testant :**

- Le sélecteur d'arrivée s'écrit `[id="vague-monte"]:target`, jamais
  `#vague-monte:target`. Il vise le même élément, mais pèse comme un attribut
  et non comme un identifiant. Avec l'identifiant, il l'emportait sur la règle
  du départ : quitter la page rejouait le retrait au lieu de couvrir l'écran.
- Les règles de départ portent `body` en tête, pour passer devant celle du
  retrait quelle que soit l'ordre du fichier.

L'ancre est retirée de l'adresse à la fin de l'animation, jamais avant, sinon
`:target` cesserait de s'appliquer et couperait le retrait en plein vol. Un
filet par délai prend le relais si l'événement de fin n'arrive pas, ce qui
survient quand l'onglet passe en arrière plan pendant le chargement.

**Les deux phases sont exactement symétriques**, 760 ms chacune, avec des
courbes miroir : `cubic-bezier(0.16, 1, 0.3, 1)` est le reflet de
`cubic-bezier(0.7, 0, 0.84, 0)`, chaque point `(x, y)` devenant `(1 - x, 1 - y)`
dans l'ordre inverse. Le retrait est le film de l'arrivée joué à l'envers, pas
une seconde animation qui lui ressemblerait.

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

## Le bouton liquide

Le bouton « Launch app » porte une surface d'eau : elle ondule seule, s'incline
sous le curseur, s'enfonce d'un coup au clic. L'effet vient d'une démonstration
que Clément a envoyée, mais **pas son emballage**.

Le composant fourni enferme le bouton dans un `iframe` en
`sandbox="allow-scripts"`, sans `allow-top-navigation`. Un clic dedans ne peut
donc pas faire naviguer la page : ce serait un bouton « Launch app » qui ne
lance rien. Il perdrait aussi la vague de transition, le focus clavier,
l'ouverture dans un nouvel onglet et son existence pour un moteur de recherche,
et il chargerait Tailwind, GSAP et Iconify depuis trois CDN pour un seul
bouton. Pour le bouton qui fait entrer dans l'application, chacun de ces points
est rédhibitoire.

Le shader a donc été extrait et posé sur un canevas **dans** l'ancre : même
mouvement, aucune dépendance, et le lien reste un lien. Les couleurs sont
celles de la marque, pas le cyan de la démonstration.

**Ce qui compte autant que l'effet :**

- Sans WebGL, le canevas reste transparent et le dégradé du bouton s'affiche
  dessous. Le bouton n'est jamais un rectangle noir. *Vérifié pour de vrai :
  le navigateur du banc d'essai perd son contexte WebGL, et le bouton reste
  parfaitement présentable.*
- **La perte de contexte est traitée.** Un onglet longtemps en arrière plan ou
  un pilote qui redémarre reprend le contexte ; sans `preventDefault` sur
  `webglcontextlost`, il n'est jamais restauré, et le canevas resterait noir
  par dessus le bouton. On revient au dégradé, et l'effet se remonte au retour.
- L'animation s'arrête dès que le bouton quitte l'écran ou que l'onglet passe
  en arrière plan. Une boucle de rendu permanente pour un bouton d'en tête
  viderait la batterie d'un téléphone pour rien.
- `prefers-reduced-motion` donne une surface calme et figée, pas une absence
  de surface.
- **Le shader ne contient que de l'ASCII, commentaires compris.** GLSL ES ne
  garantit rien au delà, et un accent dans un commentaire peut faire échouer
  la compilation sur certains pilotes, donc l'effet entier, sans message.

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
