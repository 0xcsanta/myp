# Ce qui a été fait pendant la nuit du 26 au 27 août

## En une phrase

Les dix masters ont désormais leurs horaires : **376 créneaux** extraits des PDF
officiels avec leurs salles et leurs cadences. Le site affiche les grilles, les
salles et les chevauchements.

Il reste 46 blocs de côté, mais **43 d'entre eux sont des cours qui n'existent
pas au plan d'études 2025-2026** : ils appartiennent à l'année 2026-2027, que
HEC n'a pas encore publiée. Ce n'est donc pas un défaut, c'est un décalage réel
entre les deux documents. **Il ne reste que trois intitulés vraiment perdus.**
Le détail est dans [HORAIRES-A-VERIFIER.md](./HORAIRES-A-VERIFIER.md).

## Le point important sur la méthode

Tes PDF ne sont pas des listes mais des **grilles** : jours en colonnes, heures
en lignes, et chaque cours dessiné comme un rectangle de couleur. Extraire le
texte naïvement donne de la bouillie.

J'ai donc lu la **géométrie** : la position horizontale du rectangle donne le
jour, sa position verticale donne l'heure, et les mots qu'il contient donnent
l'intitulé et la salle. C'est exact par construction, là où une lecture à l'œil
ne l'est jamais.

Deux difficultés réelles, et comment elles sont traitées.

**Le décalage de sept minutes et demie.** Les étiquettes d'heure ne sont pas
centrées sur leur trait. Mesurée sur leur milieu, l'échelle transformait
systématiquement un cours de 8h30 en cours de 8h45. Plutôt que de coder cette
correction en dur, le script cherche le décalage qui aligne le mieux **toutes**
les bornes de la page sur des quarts d'heure. Vérifié contre tes captures
d'écran : 08:30, 13:15, 14:15 tombent juste.

**Les intitulés hachés.** Quand plusieurs cours se chevauchent le même jour,
l'agenda les dessine dans des colonnes très étroites et le texte part lettre
par lettre : « Financial A-ccounting », « c i v ile e t c o m m e ». Un
nettoyage recolle les lettres isolées, et un appariement par similarité
rattrape le reste, avec un seuil élevé et **chaque rapprochement journalisé**.
Ce qui reste méconnaissable est **écarté**, jamais deviné.

## L'état par master

| Master | Créneaux | Mis de côté |
|---|---|---|
| Droit et Économie | 100 | 7 |
| Management, Comportement | 46 | 8 |
| Management, Stratégie | 39 | 6 |
| Management, Business analytics | 35 | 6 |
| Comptabilité, contrôle et finance | 32 | 0 |
| Management, Marketing | 32 | 5 |
| Sciences actuarielles | 31 | 9 |
| Économie | 24 | 5 |
| Finance | 21 | 0 |
| Systèmes d'information | 16 | 0 |

Trois choses ont fait gagner l'essentiel du terrain, après un premier jet à 291
créneaux seulement.

**Les marqueurs de note.** Le plan du Droit et Économie porte des lettres de
renvoi collées devant certains intitulés, « bEconomie I », « f Fiscalité de
l'entreprise ». Le titre stocké ne correspondait donc plus à celui de l'agenda,
et l'horaire ne se rattachait jamais au cours.

**Le recouvrement de mots.** La similarité caractère par caractère échoue sur un
titre haché ; comparer les mots longs la rattrape. « Taxation o f e enterprises
and t ransfer e pricing policy » partage cinq mots avec le vrai titre.

**Quinze intitulés rétablis à la main**, dans `data/horaires/corrections.json`.
Ils sont repérés par leur créneau et non par un numéro de ligne, donc ils
survivent à une régénération. L'heure et la salle ne sont jamais touchées : le
PDF reste la référence, seul le titre est rétabli, puis recoupé avec le
catalogue comme tous les autres.

## Ce que ça donne à l'écran

Sur `/app/fr/<master>`, coche des cours : la grille apparaît, par semestre réel
(« Automne 2026 », « Printemps 2026 »), avec les salles. Deux cours qui se
chevauchent se partagent la largeur et passent en ambre. Sous les grilles, la
date du relevé et un lien vers l'agenda officiel.

Un cours sans horaire relevé n'affiche rien de faux : le rail écrit combien de
cours de ta sélection ne sont pas vérifiés.

## Le site parle anglais

`/fr` et `/en` pour l'accueil, `/app/fr` et `/app/en` pour le planificateur,
avec une bascule dans l'en tête qui garde la page où tu es. Le dictionnaire est
typé d'après le français : si j'oublie une phrase en anglais, la compilation
s'arrête. Je préfère ça à une page anglaise qui sert du français en douce.

**Ce qui vient de HEC n'est pas traduit.** Les intitulés de cours, les
intitulés de diplôme et les notes de module restent dans la langue où HEC les
publie. Traduire un intitulé officiel, ce serait inventer une donnée. Une ligne
le dit au lecteur, dans les deux sens : la page française porte elle aussi
beaucoup de titres anglais.

## Les codes des plans, enfin lisibles

Une ligne de cours affichait « A · VCN+ENEP · examen 120 min ». Elle affiche
maintenant « anglais · validation continue notée et examen numérique en
présentiel · examen 120 min ».

En allant chercher la légende officielle, j'ai trouvé un vrai piège. Les plans
rédigés en français écrivent « A: Anglais », ceux rédigés en anglais écrivent
« E: English ». **Le même anglais s'écrivait donc `A` ou `E` selon le
document**, et le site montrait deux codes pour une seule réalité. C'est
ramené à une seule notion.

Un code n'est pas deviné : `VM`, qui apparaît sur trois cours du MScIS, n'est
défini dans aucune légende, donc il s'affiche tel quel. À demander à
l'administration si l'occasion se présente.

Le libellé français est celui de la légende mot pour mot. **L'anglais est une
traduction de ma main**, faute de source : aucun plan ne donne cette légende en
anglais, pas même ceux qui sont écrits en anglais.

## Deux corrections trouvées en vérifiant

**Le planificateur débordait sur téléphone**, de 350 pixels sur un écran de
390. La grille horaire garde une largeur minimale de 720 pixels pour rester
lisible, et elle repoussait toute la page au lieu de défiler dans son cadre.
Corrigé, et le compteur de crédits vient maintenant se coller en bas de l'écran
tant que le rail est hors champ : sur téléphone il passait sous le catalogue,
donc après une quarantaine de cours.

**Le pied de page annonçait encore que les horaires n'étaient pas intégrés.**
C'était vrai avant cette nuit.

## Une découverte qui change ce que le site raconte

Les deux relevés d'horaire **n'appartiennent pas à la même année académique**.

| Semestre du relevé | Année | Statut |
|---|---|---|
| Automne 2026 | 2026-2027 | le semestre à venir, celui qui compte |
| Printemps 2026 | **2025-2026** | déjà terminé, en mai dernier |

Le printemps que tu vivras est **Printemps 2027**, que HEC n'a pas publié.

Je ne l'ai pas supposé, je l'ai prouvé sur les données. Les PDF portent des
mentions « Débute le 28 septembre », « Débute le 16 février ». Ces dates
tombent sur le jour de la semaine annoncé si on les lit en 2026, et sur aucun
autre jour si on les lit en 2027 : trente neuf sur quarante pour l'automne,
sept sur sept pour le printemps.

Le site affiche toujours les deux, parce qu'un horaire de printemps passé reste
la meilleure indication disponible, les créneaux bougeant peu. Mais il l'écrit
en ambre sous le titre du semestre, au lieu de laisser croire que c'est le
tien.

## Prêt pour la mise en ligne, quand tu le diras

Plan du site et robots.txt : 24 adresses, chacune déclarant sa jumelle dans
l'autre langue. Le domaine n'est pas tranché, donc tout lit une variable
d'environnement ; la valeur par défaut est `myp.omniscient.swiss`, une
supposition à confirmer.

Accessibilité : l'audit du planificateur n'a trouvé qu'un vrai défaut, mais il
portait sur l'essentiel. Les vérifications changent à chaque case cochée sans
qu'un lecteur d'écran en dise rien, donc l'avertissement qui est la raison
d'être du site passait inaperçu. Corrigé.

## Ce qui t'attend

1. **Regarder ton propre master.** Coche ton plan réel sur `/app/fr/mscis` et
   compare avec ce que tu sais. C'est le meilleur contrôle qui existe.
2. **Les trois intitulés perdus**, si tu veux les récupérer. Cinq minutes, ils
   sont listés avec leur jour et leur heure. Les 43 autres n'ont pas à être
   corrigés : ce sont des cours de 2026-2027.
3. **L'export PDF et PNG est fait**, un bouton par semestre et par format, sous
   les grilles. Essaie le, le fichier porte le nom du master et du semestre.
4. **L'anglais est fait.** Regarde `/en` et `/app/en/mscis`, dis moi si le ton
   te va. Une question ouverte pour toi : les liens vers l'UNIL pointent vers
   les pages françaises, même en anglais. Leurs versions anglaises existent
   mais leurs adresses ne se déduisent pas, et je n'ai pas voulu deviner une
   adresse qui tomberait sur une page introuvable.
5. **Le reste du chantier** : export `.ics`, styles de calendrier (tu m'as
   demandé de te le rappeler, donc je te le rappelle : **on devait en
   rediscuter ensemble avant que je construise quoi que ce soit**), mise en
   ligne.

## L'export, en deux mots

La grille est redessinée sur un canevas plutôt que photographiée depuis la page,
ce qui donne une image nette à n'importe quelle taille et une maîtrise complète
de la mise en page. Le PDF est ensuite assemblé à la main autour de ce JPEG :
un catalogue, une page, le flux de l'image, une soixantaine de lignes. Une
bibliothèque de rendu aurait pesé plusieurs centaines de kilooctets pour un
résultat moins propre.

Vérifié : en-tête `%PDF-1.4`, les cinq décalages de la table de références
pointent exactement sur leur objet, le flux image commence bien par la signature
JPEG, le fichier se termine par `%%EOF`. Les décalages sont comptés en octets et
non en caractères, sans quoi le moindre accent du titre aurait décalé toute la
table et rendu le fichier illisible.

## Pour corriger un créneau

Ajouter une entrée dans `data/horaires/corrections.json`, en repérant le bloc
par son master, son semestre, son jour et son heure de début, puis :

```bash
python tools_horaires.py mde
```

Le script recoupe l'intitulé avec le catalogue et refuse tout ce qu'il ne sait
pas identifier.
