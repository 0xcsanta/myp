# Horaires : ce qu'il manque et comment l'obtenir

## Le constat

J'ai vérifié le contenu réel des annuaires de cours. **Ils ne portent pas
l'horaire hebdomadaire.** La légende de l'annuaire le confirme : les champs
structurés sont le type de cours, le nombre d'heures par semaine, le nombre
d'heures par année, le statut, la langue, le semestre et les crédits. Ni jour,
ni heure, ni salle.

Ce que les sources PDF nous donnent, et c'est déjà beaucoup :

| Donnée | Source | État |
|---|---|---|
| Modules et seuils de crédits | plan d'études | extrait, 10 masters |
| Cours, crédits, langue | plan d'études | extrait, 10 masters |
| Type d'évaluation, durée d'examen | plan d'études | extrait, 10 masters |
| Semestre, automne ou printemps | plan d'études et annuaire | extrait |
| Enseignant | plan d'études et annuaire | extrait |
| Prérequis, objectif, contenu | annuaire | disponible, non republié par choix |
| **Jour, heure, salle** | **aucune source PDF** | **manquant** |

L'horaire n'existe que sur `agendaType.php` et `ficheCours.php`, tous deux
interdits à l'accès automatisé par le `robots.txt` de l'UNIL. Voir
[LEGAL.md](./LEGAL.md).

## Les trois façons de débloquer

### A. Télécharger les horaires à la main, comme tu l'as fait pour les annuaires

Un être humain qui clique sur un lien ne fait pas de l'accès automatisé. C'est
exactement la même démarche que pour les annuaires déjà dans `allmaster/`.

Sur chaque page ci-dessous, il y a un bouton **Version PDF** à côté de
l'agenda. Tu télécharges, tu déposes le fichier dans `allmaster/`, et je
l'analyse. Un fichier par master et par semestre.

Semestres disponibles aujourd'hui sur le site : **172 = Printemps 2026** et
**173 = Automne 2026**.

| Master | Printemps 2026 | Automne 2026 |
|---|---|---|
| Systèmes d'information | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=35523&v_semposselected=172&v_langue=fr&v_isinterne=) | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=35523&v_semposselected=173&v_langue=fr&v_isinterne=) |
| Comptabilité contrôle finance, M1 et 2 | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=35005&v_semposselected=172&v_langue=fr&v_isinterne=) | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=35005&v_semposselected=173&v_langue=fr&v_isinterne=) |
| Comptabilité contrôle finance, M3 et 4 | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=35007&v_semposselected=172&v_langue=fr&v_isinterne=) | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=35007&v_semposselected=173&v_langue=fr&v_isinterne=) |
| Droit et Économie, M1 | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=34698&v_semposselected=172&v_langue=fr&v_isinterne=) | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=34698&v_semposselected=173&v_langue=fr&v_isinterne=) |
| Droit et Économie, M2 | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=35628&v_semposselected=172&v_langue=fr&v_isinterne=) | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=35628&v_semposselected=173&v_langue=fr&v_isinterne=) |
| Droit et Économie, M3 | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=34699&v_semposselected=172&v_langue=fr&v_isinterne=) | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=34699&v_semposselected=173&v_langue=fr&v_isinterne=) |
| Économie, M1 | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=38002&v_semposselected=172&v_langue=fr&v_isinterne=) | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=38002&v_semposselected=173&v_langue=fr&v_isinterne=) |
| Économie, M2 et 3 | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=38001&v_semposselected=172&v_langue=fr&v_isinterne=) | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=38001&v_semposselected=173&v_langue=fr&v_isinterne=) |
| Finance, M1 | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=38003&v_semposselected=172&v_langue=fr&v_isinterne=) | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=38003&v_semposselected=173&v_langue=fr&v_isinterne=) |
| Finance, M2 à 5 | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=38004&v_semposselected=172&v_langue=fr&v_isinterne=) | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=38004&v_semposselected=173&v_langue=fr&v_isinterne=) |
| Sciences actuarielles, M1 et 2 | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=37944&v_semposselected=172&v_langue=fr&v_isinterne=) | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=37944&v_semposselected=173&v_langue=fr&v_isinterne=) |
| Sciences actuarielles, M3 à 7 | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=37947&v_semposselected=172&v_langue=fr&v_isinterne=) | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=37947&v_semposselected=173&v_langue=fr&v_isinterne=) |
| Management Marketing, M1 et 2 | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=35016&v_semposselected=172&v_langue=fr&v_isinterne=) | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=35016&v_semposselected=173&v_langue=fr&v_isinterne=) |
| Management Marketing, M3 à 6 | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=35017&v_semposselected=172&v_langue=fr&v_isinterne=) | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=35017&v_semposselected=173&v_langue=fr&v_isinterne=) |
| Management Stratégie, M1 et 2 | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=35018&v_semposselected=172&v_langue=fr&v_isinterne=) | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=35018&v_semposselected=173&v_langue=fr&v_isinterne=) |
| Management Stratégie, M3 à 6 | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=35019&v_semposselected=172&v_langue=fr&v_isinterne=) | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=35019&v_semposselected=173&v_langue=fr&v_isinterne=) |
| Management Business Analytics, M1 et 2 | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=35020&v_semposselected=172&v_langue=fr&v_isinterne=) | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=35020&v_semposselected=173&v_langue=fr&v_isinterne=) |
| Management Business Analytics, M3 à 6 | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=35021&v_semposselected=172&v_langue=fr&v_isinterne=) | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=35021&v_semposselected=173&v_langue=fr&v_isinterne=) |
| Management Comportement, M1 et 2 | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=36274&v_semposselected=172&v_langue=fr&v_isinterne=) | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=36274&v_semposselected=173&v_langue=fr&v_isinterne=) |
| Management Comportement, M3 à 6 | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=36275&v_semposselected=172&v_langue=fr&v_isinterne=) | [ouvrir](https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?v_ueid=173&v_etapeid1=36275&v_semposselected=173&v_langue=fr&v_isinterne=) |

Nomme les fichiers librement, je les identifie tout seul à partir de leur
contenu, comme pour les annuaires.

### B. Demander l'accès à l'UNIL

Le brouillon de message est prêt dans [LEGAL.md](./LEGAL.md), section 5. Un
accord rendrait la mise à jour automatique, et réglerait le problème pour
toutes les années à venir. C'est la meilleure option sur la durée.

### C. Sortir sans les horaires

Le site reste utile : compteur de crédits, minimums par module, semestre
d'automne ou de printemps, type d'évaluation, prérequis. À la place de la
grille horaire, chaque cours affiche « horaire non publié dans nos sources »
avec un lien direct vers l'horaire officiel du programme. C'est un cran en
dessous, mais c'est honnête et ça sort vite.

## Une question de calendrier à trancher

Le site de l'UNIL propose aujourd'hui **Printemps 2026** et **Automne 2026**,
c'est à dire l'année **2026-2027**. Les plans d'études publiés sur la page HEC
s'arrêtent eux à **2025-2026**.

Autrement dit : les règles de crédits que j'ai extraites sont celles de
2025-2026, mais les horaires disponibles sont ceux de 2026-2027. Il faut
choisir ce que le site annonce, et l'afficher clairement. Ma recommandation :
garder 2025-2026 comme année de référence pour les règles, puisque c'est le
document officiel le plus récent, et étiqueter les horaires avec leur propre
année. Deux dates distinctes, affichées telles quelles, plutôt qu'une
approximation.
