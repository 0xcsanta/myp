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
| Logo et signature Omniscient | charte de marque Omniscient |

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
