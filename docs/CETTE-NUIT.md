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

## Ce qui t'attend

1. **Regarder ton propre master.** Coche ton plan réel sur `/app/fr/mscis` et
   compare avec ce que tu sais. C'est le meilleur contrôle qui existe.
2. **Les trois intitulés perdus**, si tu veux les récupérer. Cinq minutes, ils
   sont listés avec leur jour et leur heure. Les 43 autres n'ont pas à être
   corrigés : ce sont des cours de 2026-2027.
3. **Le reste du chantier** n'a pas bougé : export PDF et PNG du calendrier,
   anglais, styles de calendrier, mise en ligne.

## Pour corriger un créneau

Ajouter une entrée dans `data/horaires/corrections.json`, en repérant le bloc
par son master, son semestre, son jour et son heure de début, puis :

```bash
python tools_horaires.py mde
```

Le script recoupe l'intitulé avec le catalogue et refuse tout ce qu'il ne sait
pas identifier.
