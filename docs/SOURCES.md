# Sources

Toute donnée affichée par MYP vient d'un document listé ici. Chaque entrée
de la base porte un champ `source` avec l'URL exacte et la date de
consultation, et l'interface l'affiche.

Consultation de référence : **26 août 2026**.

---

## 1. Sources primaires : les plans d'études officiels

Publiés par HEC Lausanne, publics, hors pare feu, chemin `/files/` non
restreint par le `robots.txt` de `www.unil.ch`.

Page d'index :
<https://www.unil.ch/hec/fr/home/ressources/intranet/espace-etudiant/enseignement-master/plan-d-etudes-et-reglements.html>

Racine des fichiers :
`https://www.unil.ch/files/live/sites/hec/files/hec/doc/master/`

| Master | Fichier 2025-2026 | Ce qu'on en tire |
|---|---|---|
| Comptabilité, contrôle et finance | `MscCCF/Plan d'études officiel MScCCF 2025-2026.pdf` | modules, seuils ECTS, cours, évaluation |
| Droit et Économie | `MDE/Plan d'études officiel MDE 2025-2026.pdf` | idem |
| Économie | `MScE/Plan d'études officiel MScE Mentions+BEE 2025-2026.pdf` | idem |
| Finance | `MScF/Plan d'études officiel MScF 2025-2026.pdf` | idem |
| Management, Business Analytics | `MScM/Orientation Business Analytics 2025-2026.pdf` | idem |
| Management, Behaviour Economics and Evolution | `MScM/Orientation Behaviour, Economics and Evolution 2025-2026.pdf` | idem |
| Management, Marketing | `MScM/Orientation Marketing 2025-2026.pdf` | idem |
| Management, Strategy Organization and Leadership | `MScM/Orientation Strategy, Organization and Leadership 2025-2026.pdf` | idem |
| Sciences actuarielles | `MScAS/Plan d'études officiel MScAS 2025-2026.pdf` | idem |
| Systèmes d'information et innovation numérique | `MScIS/Plan d'études officiel MScIS 2025-2026.pdf` | idem |

Copies locales : `allmaster/`. Elles ne sont pas redistribuées par le site ;
celui-ci renvoie vers l'URL officielle.

## 2. Règlements d'études

Seuls documents faisant foi. Le site y renvoie systématiquement et ne les
paraphrase pas.

| Master | Fichier |
|---|---|
| Droit et Économie | `MDE/Règlement MDE valable dès rentrée 2025.pdf` |
| Économie | `MScE/Réglement MScE valable dès rentrée 2025.pdf` |
| Finance | `MScF/Règlement MScF valable dès rentrée 2025.pdf` |
| Management | `MScM/Règlement MScM valable dès rentrée 2025.pdf` |
| Systèmes d'information | `MScIS/Règlement MScIS valable dès rentrée 2024.pdf` |

## 3. Fiches de cours détaillées

**Non reprises.** Le site affiche un lien profond vers la fiche officielle,
dans la langue choisie par le lecteur :

```
https://applicationspub.unil.ch/interpub/noauth/php/Ud/ficheCours.php
  ?v_enstyid=<identifiant>&v_ueid=173&v_etapeid1=<programme>&v_langue=fr|en
```

Un lien qu'un être humain clique n'est pas un accès automatisé. Le robot, lui,
n'y touche pas : voir [LEGAL.md](./LEGAL.md).

## 4. Horaires

Origine : les plans d'études, plus vérification humaine sur l'horaire type
officiel du programme, consulté à la main :

<https://applicationspub.unil.ch/interpub/noauth/php/Ud/index.php?v_ueid=173&v_langue=fr>

Chaque créneau affiché porte sa date de vérification. Un créneau non vérifié
depuis plus d'un semestre est marqué comme tel dans l'interface.

## 5. Identité visuelle

| Élément | Origine |
|---|---|
| Bleu `#0037EB` et échelle de neutres | jetons `--brand-primary-*` et `--brand-neutral-*` de `https://www.unil.ch/modules/refonte-templates/css/styles.css` |
| DynaPuff (logotype), Crimson Text (titres), DM Sans (interface), IBM Plex Mono (chiffres) | Google Fonts, licence SIL Open Font |
| Logo et signature du site | dessinés pour MYP |

Aucun élément graphique de l'UNIL n'est repris : ni logo, ni armoiries, ni
gabarit. Voir la section 3 de [LEGAL.md](./LEGAL.md).

## 6. Contacts officiels vers lesquels renvoyer

Ces contacts sont affichés dans le site, à côté de l'avertissement de non
affiliation, sous le titre « une question sur votre plan d'études ». MYP ne
répond à aucune question académique et renvoie systématiquement ici.

Page de référence :
<https://www.unil.ch/hec/fr/home/ressources/intranet/espace-etudiant/enseignement-master/contact.html>

Administration des cursus de Master, Service de l'enseignement et des affaires
étudiantes de HEC Lausanne :

| Sujet | Courriel | Téléphone |
|---|---|---|
| Information générale sur les cursus de Master | HECmaster@unil.ch | +41 21 692 36 68 / 34 12 |
| Conseil aux études Master | HECmaster@unil.ch | +41 21 692 33 09 |
| Mémoires et stages | HECmaster@unil.ch | +41 21 692 33 04 |
| Admission aux masters | HECmasterAdmission@unil.ch | +41 21 692 33 09 |
| Attestations d'études, relevé de notes | HECattestation@unil.ch | +41 21 692 33 00 |
| Cérémonie de fin d'études | hecgraduation@unil.ch | |
| Réception générale de HEC | HEC@unil.ch | +41 21 692 33 00 |

Réception Master : du lundi au vendredi de 14h à 16h, réception HEC, NEF 261.

Adresse postale :

```
Cursus de Master
Université de Lausanne
Faculté des HEC
Quartier de Chamberonne
Internef 258 / 258.1
CH-1015 Lausanne
```

Autres liens utiles à afficher :

| Besoin | Lien |
|---|---|
| Plans d'études, règlements, directives | <https://www.unil.ch/hec/fr/home/ressources/intranet/espace-etudiant/enseignement-master/plan-d-etudes-et-reglements.html> |
| Enseignements, horaires, syllabus, Moodle | <https://www.unil.ch/hec/fr/home/ressources/intranet/espace-etudiant/enseignement-master.html> |
| Mémoires et stages MScIS | <https://www.unil.ch/hec/fr/home/ressources/intranet/espace-etudiant/enseignement-master/memoire-et-stages/systemes-d-information-et-innovation-numerique.html> |
| Catalogue des enseignements | <https://applicationspub.unil.ch/interpub/noauth/php/Ud/index.php?v_ueid=173&v_langue=fr> |
| Moodle | <https://moodle.unil.ch> |

---

## 7. Année de référence

**Toutes les données du site proviennent des plans d'études officiels
2025-2026**, sauf mention contraire portée sur la donnée elle-même. L'année de
référence est affichée en permanence dans l'interface, à côté du sélecteur de
master, et rappelée dans l'avertissement de non affiliation.

Les plans d'études des années antérieures restent listés sur la page HEC pour
celles et ceux qui suivent un ancien cursus. MYP ne les reprend pas.

---

## 8. Les codes des plans, et qui les traduit

Les plans notent la langue d'enseignement et le type d'évaluation par des
lettres. Le site les affiche en toutes lettres, et il faut savoir d'où vient
chaque libellé.

**La langue d'enseignement.** Les deux légendes officielles ne se recouvrent
pas, ce qui est un piège réel :

| Plan | Légende, citée telle quelle |
|---|---|
| Rédigé en français | « Langue: Langue d'enseignement (F: Français; A: Anglais) » |
| Rédigé en anglais | « Language: Teaching language (F: French; E: English) » |

Donc **`A` et `E` désignent tous les deux l'anglais**, selon la langue du
document dont le cours provient. Le site les ramène à une seule notion.

**Le type d'évaluation.** La légende n'existe qu'en français, y compris dans
les plans rédigés en anglais, qui ne définissent que ECTS et Language. Le
libellé français est celui de la légende, mot pour mot :

> Type d'évaluation: E: Examen écrit; ENEP: Examen numérique en présentiel;
> O: Examen oral; VCN: Validation continue notée; M: Mémoire

**Le libellé anglais de ces types est une traduction de ma main**, pas un texte
officiel, faute de source. Elle est dans `apps/web/lib/codes.ts`.

**`VM` n'est défini nulle part.** Il apparaît sur trois cours du MScIS
(Digital Innovation week, et les deux séminaires d'introduction à la
recherche). Il n'est pas deviné : il s'affiche tel quel. À demander à
l'administration si l'occasion se présente.

**Les intitulés ne sont jamais traduits.** Ni les titres de cours, ni les
intitulés de diplôme, ni les notes de module. HEC ne publie pas les dix
intitulés officiels en anglais, et en inventer un serait fabriquer une donnée
officielle. Seules les étiquettes courtes du sélecteur de master
(`courtEn` dans `data/masters.json`) sont écrites pour le site, et le fichier
le dit.

---

## 9. Les enseignements pris hors de son propre plan

**Relu le 27 août 2026, les dix plans un par un.** Contrairement à ce qu'on
pourrait croire, ce n'est pas une règle générale de HEC : **deux masters sur
dix** seulement portent cette possibilité dans leur plan 2025-2026.

| Master | Module | Plafond | Ce que dit le plan |
|---|---|---|---|
| MScCCF | Sous-module 3.2 | aucun chiffré | « Autres cours de Master (sous réserve de l'approbation de la Direction du programme) » |
| MScE | Module 2 | **6 ECTS** | « Students can take 6 credits ECTS in courses of other Masters not covered by this study plan or any pre-approved IHEID courses below. This is subject to approval by the Director of this curriculum. » |

La note du MScE couvre aussi les enseignements pré-approuvés de l'IHEID,
l'Institut de hautes études internationales et du développement, dont le plan
donne la liste.

**Méthode.** Recherche des formulations « autres cours », « autres
enseignements », « other courses », « courses of other Masters », « autre
maîtrise », « approbation » et « approval » dans les dix plans et dans les
règlements. Le module d'accueil a été établi en repérant le cours voisin
immédiat de la ligne dans le tableau, puis en lisant le module de ce voisin
dans le catalogue déjà extrait, l'ordre du texte d'un PDF ne suivant pas celui
des colonnes.

**Les huit autres** (MDE, MScAS, MScF, MScIS et les quatre orientations du
MScM) ne disent rien à ce sujet. Cela ne prouve pas que ce soit interdit,
seulement que le document ne l'autorise pas noir sur blanc. Le site n'affiche
donc rien chez eux : un étudiant concerné doit écrire à l'administration des
cursus de Master.

**Dans les deux cas, l'accord de la direction du programme est obligatoire.**
MYP compte les crédits et rappelle la condition ; il ne peut ni donner cet
accord ni le prévoir.

Le relevé, avec ses citations et sa méthode, est dans
[data/cours-externes.json](../data/cours-externes.json).

---

## 10. Les sous-modules, et pourquoi la moitié manquait

**Relu le 27 août 2026.** Notre extraction ne voyait les sous-modules que de
quatre masters. Elle en manquait **six**, pour une raison bête : son motif de
reconnaissance ne cherchait que le français, `SOUS-MODULE`, alors que les plans
rédigés en anglais écrivent `SUBMODULE` et `SUB-SUBMODULE`.

Trois autres défauts sont apparus en corrigeant le premier.

**Les crédits n'étaient pas optionnels.** Le motif exigeait un nombre d'ECTS sur
la ligne d'en tête. Or « SUBMODULE 3.1: Asset and Risk Management » n'en porte
aucun, le module parent les donnant pour les trois orientations. L'en tête était
donc rejeté en entier.

**Les décimales étaient tronquées.** Le MScE a des seuils à 22,5 et 7,5 crédits,
que `\d+` ramenait à 22 et 7.

**La profondeur était limitée à un niveau.** Le parent se calculait en prenant le
premier chiffre du code, donc « 3.2.1 » devenait un enfant de « Module 3 » au
lieu du « Sous-module 3.2 ». Il se lit maintenant dans le code lui même.

**Un garde-fou a dû être ajouté**, parce qu'un motif plus permissif attrape des
phrases du corps du texte. « Module 4 can be any course listed above... » créait
un second Module 4 fantôme dans les quatre orientations du MScM. Un en tête doit
désormais porter un deux points juste après son numéro, ou un nombre de crédits.

**Ce que ça donne**, sous-modules réellement présents dans les plans :

| Master | Sous-modules |
|---|---|
| MDE | Sousmodule 1a, 1b |
| MScCCF | 3.1, 3.2 |
| MScE | 1.1, 1.2 |
| **MScF** | 3.1, 3.2, 3.3, **et 3.2.1, 3.2.2 sous le 3.2** |
| MScIS | 4.1, 4.2 |
| MScM comportement | 5.1, 5.2, 5.3, 6.1, 6.2 |
| MScM business analytics | 6.1, 6.2 |
| MScM marketing | 6.1, 6.2 |
| MScM stratégie | 5.1, 5.2, 6.1, 6.2 |
| MScAS | aucun |

**Vérification.** Aucun cours n'a été perdu ni inventé par la régénération :
les dix catalogues comptent exactement le même nombre de titres qu'avant, et
les mêmes. Seule leur répartition entre modules a changé, ce qui était le but.
Les totaux de diplôme sont inchangés, 90 ou 120 crédits selon le master.

### Choisir son orientation

Le MScF écrit « MODULE 3: Choose the submodule of your orientation ». On en
prend **un**, pas les trois. Le site le signale quand des cours sont cochés dans
plusieurs orientations à la fois.

Un module dont le plan ne chiffre aucun seuil, comme ces orientations, affiche
ce qu'il totalise sans barre de comparaison : annoncer « 21 / 0 » serait faux,
le seuil vivant sur le module parent.

**Les orientations qu'on ne suit pas n'exigent rien.** Celui qui prend
l'orientation 3.3 ne doit pas se voir réclamer les neuf crédits du
sous-sous-module 3.2.1, qui appartient à une autre orientation. Elles
disparaissent donc du rail et des vérifications, et c'est le module parent qui
porte l'exigence, avec son seuil à lui : « Module 3 : 21 / 21 ».

En revanche **le catalogue les montre toutes**, puisque c'est là qu'on choisit
la sienne. Les masquer rendrait le choix impossible.

---

## 11. Prendre les cours d'une autre orientation

**Relu le 27 août 2026.** Deux masters l'écrivent, dans des termes différents,
ce qui a d'ailleurs causé une erreur de relevé de ma part.

| Master | Où | Ce que dit le plan |
|---|---|---|
| **MScF** | Dernière ligne du Module 4 | « Any compulsory courses in other tracks » |
| **MScM**, les quatre orientations | Note du Module 4 | « Module 4 can be any course listed above and any course listed under Module 5 of other orientations (and are not listed below). Company projects for other orientations are not open unless otherwise stated in SOL and BEE curriculums. » |

**Une correction de relevé.** Un premier passage avait conclu que le MScF ne
disait rien. C'était faux : sa ligne emploie le mot « tracks », que ma recherche
ne couvrait pas, alors que les MScM emploient « orientations ». Clément l'a vue
dans le PDF. Un synonyme de plus aurait suffi, et il est désormais dans la liste.

### Ce que ça implique pour le MScF

Les orientations du MScF sont les sous-modules du Module 3. Les cours de
l'orientation suivie comptent au Module 3 ; **ceux des autres comptent au
Module 4**, où ils sont des enseignements à option comme les autres.

Le site demande donc quelle orientation on suit, au lieu de la deviner. La
deviner serait arbitraire dès qu'on prend des cours dans deux orientations, ce
que le plan autorise précisément.

Le choix est enregistré et voyage dans le lien de partage, après les crédits
pris hors plan : `bits~externes~orientation`. Un lien écrit avant l'arrivée de
ce champ reste lisible.

### Le MScM reste à faire

Ses quatre orientations sont des masters distincts dans notre découpage, chacun
avec son plan. Importer les cours de leur Module 5 demande de charger d'autres
catalogues, ce qui n'est pas encore fait. La règle et ses exclusions sont déjà
relevées dans
[data/cours-autres-orientations.json](../data/cours-autres-orientations.json).

### Un bug trouvé au passage

La remontée des crédits d'un module vers son parent ne franchissait **qu'un
seul niveau**, parce qu'elle parcourait les modules dans l'ordre du plan : un
parent était calculé avant ses propres enfants. Le MScF, seul master à compter
trois niveaux, affichait « Module 3 : 0 / 21 » alors que son sous-sous-module
3.2.1 était rempli. La remontée est désormais récursive.

---

## 12. Les quatre colonnes de semestre

**Signalé par Clément le 27 août 2026.** Un master de 120 crédits compte quatre
semestres : automne, printemps, automne, printemps. Le plan porte donc quatre
colonnes, et chaque cours a un point dans la sienne.

Le site n'affichait que la saison. « Automne » ne disait pas s'il s'agissait du
premier ou du troisième semestre, soit un an d'écart. Le badge donne désormais
le rang : « Blockchain and Crypto Economy » est au **2e sem, printemps** et
« Advanced Data Analysis » au **3e sem, automne**, exactement comme le plan.

Quand un cours occupe plusieurs colonnes, elles sont toutes données : « 1er ou
3e sem, automne » au MDE, très fréquent chez lui. La saison n'est dite que si
toutes les colonnes tombent dans la même, sinon seuls les rangs le sont.

**Et le plan propose, l'étudiant tranche.** Un cours donné au premier et au
troisième semestre n'est suivi qu'une fois. Une fois coché, sa pastille devient
un choix : « 1er semestre » ou « 3e semestre ». La grille ne le montre alors
que là, au lieu de l'afficher dans les deux, et les chevauchements se calculent
sur le semestre retenu. À défaut de choix, le premier rang fait foi.

Ces choix sont enregistrés et voyagent dans le lien de partage, écrits par rang
du catalogue : `0-3` place le premier cours au troisième semestre.

### La conséquence sur les chevauchements

C'est le point important. Deux cours ne se heurtent que si l'on peut les suivre
en même temps. Un cours du premier semestre et un du troisième tombent tous
deux à l'automne, et l'agenda officiel les place au même créneau, mais
l'étudiant les suit **à un an d'intervalle**.

Le site les comparait quand même. Sur les dix relevés d'horaire, cela produisait
**48 faux conflits sur 264**, presque un sur cinq. Par exemple, au MScAS,
« Insurance Economics » du 1er semestre contre « Time Series » du 3e, tous deux
le lundi à 12h30.

Deux cours doivent maintenant partager au moins une colonne du plan pour être
comparés. Quand le plan ne dit rien, ils sont comparés quand même : mieux vaut
signaler un chevauchement de trop que d'en taire un vrai.
