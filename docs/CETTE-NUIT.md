# Ce qui a été fait pendant la nuit du 26 au 27 août

## En une phrase

Les dix masters ont désormais leurs horaires, **291 créneaux** extraits des PDF
officiels avec leurs salles et leurs cadences. Le site affiche les grilles, les
salles et les chevauchements. **83 créneaux restent à récupérer**, listés dans
[HORAIRES-A-VERIFIER.md](./HORAIRES-A-VERIFIER.md).

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

| Master | Créneaux retenus | Écartés |
|---|---|---|
| Systèmes d'information | 16 | 0 |
| Comptabilité, contrôle et finance | 32 | 2 |
| Finance | 21 | 0 |
| Économie | 24 | 5 |
| Sciences actuarielles | 31 | 9 |
| Management, Marketing | 30 | 7 |
| Management, Stratégie | 35 | 10 |
| Management, Business analytics | 31 | 10 |
| Management, Comportement | 44 | 10 |
| Droit et Économie | 75 | 32 |

Le Droit et Économie est le plus abîmé : c'est aussi le plus dense, avec ses
groupes A, B et anglais, ses séances d'exercices et ses listes de dates.

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
2. **Décider pour les 83 écartés.** Trois options : les saisir à la main depuis
   les captures, ce qui prend une heure ; les laisser, le site dira simplement
   qu'il ne sait pas ; ou me demander de les lire sur les captures d'écran, ce
   que je peux faire mais avec le risque de transcription dont on a parlé.
3. **Le reste du chantier** n'a pas bougé : export PDF et PNG du calendrier,
   anglais, styles de calendrier, mise en ligne.

## Pour corriger un créneau

Ouvrir `data/horaires/brut/<master>.txt`, remplacer l'intitulé de la ligne
indiquée par le vrai titre du cours, puis :

```bash
python tools_horaires.py mde
```

Le script recoupe l'intitulé avec le catalogue et refuse tout ce qu'il ne sait
pas identifier.
