# Sources

Toute donnée affichée par Cursus vient d'un document listé ici. Chaque entrée
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
| Inter, IBM Plex Mono | Google Fonts, licence SIL Open Font |
| Logo et signature Omniscient | charte de marque Omniscient |

Aucun élément graphique de l'UNIL n'est repris : ni logo, ni armoiries, ni
gabarit. Voir la section 3 de [LEGAL.md](./LEGAL.md).

## 6. Contacts officiels vers lesquels renvoyer

Ces contacts sont affichés dans le site, à côté de l'avertissement de non
affiliation, sous le titre « une question sur votre plan d'études ». Cursus ne
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
celles et ceux qui suivent un ancien cursus. Cursus ne les reprend pas.
