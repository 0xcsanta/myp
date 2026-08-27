# Les relevés qui ne couvrent qu'une saison

**Constaté le 27 août 2026.** Trois masters n'ont d'horaire relevé que pour
l'automne : leurs PDF de printemps n'ont pas été fournis.

| Master | Automne | Printemps |
|---|---|---|
| **MScF** | 21 créneaux | **aucun** |
| **MScAS** | 31 créneaux | **aucun** |
| **MScE** | 24 créneaux | **aucun** |
| MDE | 53 | 47 |
| MScCCF | 23 | 9 |
| MScIS | 6 | 10 |
| MScM comportement | 35 | 11 |
| MScM business analytics | 25 | 10 |
| MScM marketing | 21 | 11 |
| MScM stratégie | 25 | 14 |

Conséquence à l'écran : au MScF, les 12 cours du 2e semestre et les 2 du 4e
n'ont aucun créneau. Le sélecteur les propose quand même et explique que le
relevé ne couvre pas cette saison, plutôt que de faire disparaître le bouton
sans un mot.

**Pour compléter**, il suffit de déposer les PDF d'horaire de printemps de ces
trois masters dans `horaires/` et de relancer `tools_pdf_horaires.py` puis
`tools_horaires.py`.

---

# Ce que l'année des relevés implique

**Trouvé le 27 août 2026, en croisant les dates portées par les PDF avec le
jour de la semaine du créneau.**

Une année académique va de l'automne d'une année civile au printemps de la
suivante. Le relevé du 26 août 2026 contient donc deux semestres qui
n'appartiennent pas à la même année :

| Semestre du relevé | Année académique | Statut |
|---|---|---|
| Automne 2026 | 2026-2027 | le semestre à venir, celui qui compte |
| Printemps 2026 | **2025-2026** | déjà terminé, en mai 2026 |

Le printemps que vivront les étudiants de 2026-2027 est **Printemps 2027**, que
HEC n'a pas encore publié.

**La preuve tient dans les données.** Les PDF portent des mentions « Débute le
28 septembre », « Débute le 16 février ». Ces dates tombent sur le jour de la
semaine annoncé si on les lit en 2026, et sur aucun autre jour si on les lit en
2027 :

```
automne-2026     lu en 2026 : 39 concordent, 1 non
automne-2026     lu en 2027 :  0 concordent, 40 non
printemps-2026   lu en 2026 :  7 concordent, 0 non
printemps-2026   lu en 2027 :  0 concordent, 7 non
```

**Ce que fait le site.** Il affiche les deux, parce qu'un horaire de printemps
passé reste la meilleure indication disponible pour le printemps à venir, les
créneaux bougeant peu d'une année à l'autre. Mais il l'écrit en toutes lettres,
en ambre, sous le titre du semestre. Il ne fait pas passer un semestre terminé
pour celui de l'étudiant.

**Ce que ça bloque.** L'export `.ics` demande des dates réelles : un
calendrier place des événements, pas des cases. Il faudrait la date d'ouverture
officielle du semestre, que je n'ai pas. Les indices sont forts pour l'automne
2026, les PDF mentionnant le 14 et le 15 septembre, mais **je ne veux pas
générer quatorze semaines d'événements à partir d'une date déduite** : une
erreur d'une semaine décalerait tout le calendrier de l'étudiant. Il faut le
calendrier académique officiel de l'UNIL. Avec lui, c'est une demi heure de
travail.

---

# Horaires : ce qui reste à vérifier

Généré par `tools_horaires.py`. Ces créneaux **ne sont pas** dans le site : le
cours concerné affiche « horaire non publié » plutôt qu'une heure douteuse.

**43 absents du plan, 3 hachés.** Quinze intitulés ont déjà été rétablis à la main, voir `data/horaires/corrections.json`.

**Absent du plan d'études** : le cours figure à l'agenda 2026-2027 mais pas au
plan officiel 2025-2026, le dernier publié. Rien à corriger, c'est un décalage
réel entre les deux documents. Ces cours entreront quand HEC publiera son plan
2026-2027.

**Texte haché** : la mise en page du PDF a éclaté le titre lettre par lettre.
L'heure et la salle restent exactes, seul l'intitulé est perdu. Pour en
rétablir un, ajouter une entrée dans `data/horaires/corrections.json` en le
repérant par son créneau, puis relancer `python tools_horaires.py <master>`.

## mde

100 créneaux retenus, 5 absents du plan, 2 hachés.

### Absents du plan 2025-2026

| Jour et heure | Texte lu |
|---|---|
| Mardi 08:30-12:00 | `Procédure juridiction` |
| Mardi 14:15-18:00 | `T/ax Disputes & Investment Treaty Arbitration Wuschka (rem` |
| Mercredi 09:00-12:00 | `12C6` |
| Jeudi 08:30-12:00 | `Droit de` |
| Mercredi 08:30-12:00 | `Valuation` |

### Texte haché

| Jour et heure | Texte lu |
|---|---|
| Lundi 10:15-12:00 | `ne E and Machine Learning` |
| Mardi 14:15-16:00 | `in and Machine Learning - Internef /` |

### Rapprochés automatiquement, à confirmer

- `Advanced issues in International and Europ` retenu comme **advanced-issues-in-international-european-tax-** (SIMILARITE 0.96)
- `Séminaire de droit des affaires` retenu comme **methodes-en-droit-des-affaires** (MOTS COMMUNS 0.67)
- `e-s Arbitrage en droit sport` retenu comme **arbitrage-en-droit-du-sport** (SIMILARITE 0.89)
- `Séminaire de restructuration financière` retenu comme **seminaire-de-restucturation-financiere** (SIMILARITE 0.99)
- `Normes comptables (IFRS)` retenu comme **normes-comptables-internationales-ifrs** (MOTS COMMUNS 0.75)
- `Droit et éthique de la profession d'avocat` retenu comme **xxdroit-et-ethique-de-la-profession-d-avocat** (SIMILARITE 0.95)

## mscas

31 créneaux retenus, 9 absents du plan, 0 hachés.

### Absents du plan 2025-2026

| Jour et heure | Texte lu |
|---|---|
| Lundi 08:00-10:00 | `Data Science Methods for Management - BA orientation` |
| Lundi 10:15-12:00 | `Data Science Methods for Management - BA orientation` |
| Mardi 08:30-12:00 | `Introduction to Data Science` |
| Mardi 12:30-16:00 | `Quantitative Asset and Risk Management II` |
| Mardi 12:30-16:00 | `Quantitative Asset and Risk Management II` |
| Vendredi 08:30-12:00 | `Applied AI & Deep Learning for Managers: From Fundamentals` |
| Vendredi 08:30-12:00 | `Applied AI & Deep Learning for Managers: From Fundamentals` |
| Vendredi 10:15-12:00 | `Strategic Pricing` |
| Vendredi 10:15-12:00 | `Strategic Pricing` |

### Rapprochés automatiquement, à confirmer

- `PrévoyanceC - professionnelle` retenu comme **prevoyance-professionnelle** (SIMILARITE 0.98)
- `PrévoyanceC - professionnelle` retenu comme **prevoyance-professionnelle** (SIMILARITE 0.98)

## msce

24 créneaux retenus, 5 absents du plan, 0 hachés.

### Absents du plan 2025-2026

| Jour et heure | Texte lu |
|---|---|
| Lundi 10:15-12:00 | `Foundations in Econometrics and Machine Learning` |
| Mardi 14:15-16:00 | `Foundations in Econometrics and Machine Learning` |
| Mercredi 08:30-10:00 | `Foundations in Econometrics and Machine Learning` |
| Jeudi 12:30-14:00 | `to Cb e- Ocorngfainrmizeadti o-nal Theory and Decision AMm` |
| Jeudi 14:15-18:00 | `Business Cycles` |

## mscm-behaviour

46 créneaux retenus, 8 absents du plan, 0 hachés.

### Absents du plan 2025-2026

| Jour et heure | Texte lu |
|---|---|
| Lundi 08:30-12:00 | `Simple for managing people in face of adversity: Practical` |
| Lundi 08:30-12:00 | `Simple for managing people in face of adversity: Practical` |
| Jeudi 10:15-12:00 | `Decision Intelligence for Managers` |
| Jeudi 10:15-12:00 | `Decision Intelligence for Managers` |
| Lundi 10:15-14:00 | `Methods` |
| Lundi 12:30-14:00 | `The iRcissk, Reputation /` |
| Jeudi 08:30-12:00 | `Simple Rules for Leadership and Strategy: a Practical Appr` |
| Jeudi 14:15-16:00 | `S - Behavior, Economics, and Evolution Lecture Series` |

### Rapprochés automatiquement, à confirmer

- `Strategic Management - SOL/BEE orientation` retenu comme **strategic-management-bee-sol-orientations** (SIMILARITE 0.90)
- `Organizational Theory and Decision Making ` retenu comme **organizational-theory-and-decision-making-bee-** (SIMILARITE 0.94)
- `Organizational Theory and Decision Making ` retenu comme **organizational-theory-and-decision-making-bee-** (SIMILARITE 0.94)
- `Human Decision- Making and the SDGs` retenu comme **human-decisions-making-and-the-sdgs** (SIMILARITE 0.99)
- `Human Decision- Making and the SDGs` retenu comme **human-decisions-making-and-the-sdgs** (SIMILARITE 0.99)
- `Human Decision-Making and the SDGs` retenu comme **human-decisions-making-and-the-sdgs** (SIMILARITE 0.99)
- `Human Decision-Making and the SDGs` retenu comme **human-decisions-making-and-the-sdgs** (SIMILARITE 0.99)

## mscm-business-analytics

35 créneaux retenus, 5 absents du plan, 1 hachés.

### Absents du plan 2025-2026

| Jour et heure | Texte lu |
|---|---|
| Lundi 10:15-14:00 | `Methods` |
| Lundi 12:30-14:00 | `CTh -e MaSnuasgteamineanbtle of RLiosgk,istics Rep-utation` |
| Lundi 14:15-18:00 | `Power and Leadership` |
| Mardi 14:15-18:00 | `Neuro Economie` |
| Jeudi 08:30-12:00 | `Simple Rules for Leadership and Strategy: a Practical Appr` |

### Texte haché

| Jour et heure | Texte lu |
|---|---|
| Jeudi 14:15-18:00 | `Strategic Purchasing and Supply M a n a g e m e n t` |

### Rapprochés automatiquement, à confirmer

- `Demand and Supply Management` retenu comme **demand-management** (MOTS COMMUNS 0.67)
- `Analytics in Action: Operations Management` retenu comme **analytics-in-action-operations-management-thro** (SIMILARITE 0.92)
- `Analytics in Action: Business Intelligence` retenu comme **analytics-in-action-business-intelligence-with** (SIMILARITE 0.92)

## mscm-marketing

32 créneaux retenus, 5 absents du plan, 0 hachés.

### Absents du plan 2025-2026

| Jour et heure | Texte lu |
|---|---|
| Lundi 08:30-12:00 | `Simple for managing people in face of adversity: Practical` |
| Mercredi 08:30-12:00 | `Luxury Marketing` |
| Lundi 12:30-14:00 | `d-o TmCh of and- - 2120` |
| Mardi 14:15-18:00 | `Neuro Economie` |
| Jeudi 08:30-12:00 | `Simple Rules for Leadership and Strategy: a Practical Appr` |

### Rapprochés automatiquement, à confirmer

- `Integrated Marketing Communication (MScM)` retenu comme **integrated-marketing-communications** (SIMILARITE 0.95)
- `Organizational Theory and Decision Making ` retenu comme **organizational-theory-and-decision-making-sol-** (SIMILARITE 0.95)
- `Organizational Theory and Decision Making ` retenu comme **organizational-theory-and-decision-making-sol-** (SIMILARITE 0.95)

## mscm-strategy

39 créneaux retenus, 6 absents du plan, 0 hachés.

### Absents du plan 2025-2026

| Jour et heure | Texte lu |
|---|---|
| Lundi 08:30-12:00 | `Simple for managing people in face of adversity: Practical` |
| Mercredi 08:30-12:00 | `Strategy & Development Modes` |
| Jeudi 10:15-12:00 | `Decision Intelligence for Managers` |
| Lundi 10:15-14:00 | `Methods` |
| Lundi 12:30-14:00 | `The iRcissk, Reputation /` |
| Mardi 14:15-18:00 | `Neuro Economie` |

### Rapprochés automatiquement, à confirmer

- `Normes comptables (IFRS)` retenu comme **normes-comptables-internationales-ifrs** (MOTS COMMUNS 0.75)
- `Social Norms, Culture, Organizations and C` retenu comme **social-norms-and-social-tipping-mechanisms-of-** (MOTS COMMUNS 0.62)
- `Human Decision- Making and the SDGs` retenu comme **human-decisions-making-and-the-sdgs** (SIMILARITE 0.99)
- `Human Decision- Making and the SDGs` retenu comme **human-decisions-making-and-the-sdgs** (SIMILARITE 0.99)
- `Innovation Strategy Project (for SOL orien` retenu comme **innovation-strategy-project-for-sol-orientatio** (SIMILARITE 0.99)

