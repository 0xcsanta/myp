# Horaires : ce qui reste à vérifier

Généré automatiquement par `tools_horaires.py`. Chaque entrée est un bloc du
PDF officiel dont l'intitulé a été haché par la mise en page au point d'être
méconnaissable. Ces créneaux **ne sont pas** dans le site : le cours concerné
affiche « horaire non publié » plutôt qu'une heure douteuse.

Pour en corriger un : ouvrir `data/horaires/brut/<master>.txt`, remplacer
l'intitulé de la ligne indiquée par le vrai titre du cours, puis relancer
`python tools_horaires.py <master>`.

## mde

75 créneaux retenus, 32 écartés.

| Ligne | Texte lu dans le PDF | Diagnostic |
|---|---|---|
| 5 | `Sociétés de capitaux et financement d'entreprise` | introuvable (meilleure similarite 0.57), proches : x-le-gouvernement-d-entreprise-aut26, |
| 7 | `r s h ip , P r o p ri été` | introuvable (meilleure similarite 0.50), proches : leadership-development, propriete-int |
| 8 | `Taxation o f e enterprises and t ransfer e pricing p` | introuvable (meilleure similarite 0.85), proches : taxation-of-multinational-enterprises |
| 9 | `ne E and Machine Learning` | introuvable (meilleure similarite 0.49), proches : power-and-leadership, analyse-economi |
| 14 | `Séminaire de droit des affaires` | introuvable (meilleure similarite 0.72), proches : methodes-en-droit-des-affaires, f-sem |
| 18 | `Procédure juridiction` | introuvable (meilleure similarite 0.69), proches : procedure-et-juridiction-administrati |
| 21 | `c i v ile e t c o m m e` | introuvable (meilleure similarite 0.61), proches : mediation-civile-et-commerciale, droi |
| 27 | `in and Machine Learning - Internef /` | introuvable (meilleure similarite 0.50), proches : droit-des-marches-financiers, bdroit- |
| 28 | `T/ax Disputes & Investment Treaty Arbitration Wuschk` | introuvable (meilleure similarite 0.68), proches : international-tax-disputes-investment |
| 31 | `Economie I` | ambigu : beconomie-i, beconomie-ii |
| 32 | `B C - e s - S t r a tégie le` | introuvable (meilleure similarite 0.59), proches : controle-strategique, strategie-d-ent |
| 33 | `Foundations in Econometrics and Machine Learning` | introuvable (meilleure similarite 0.51), proches : microeconomics-and-game-theory, media |
| 35 | `12C6` | introuvable (meilleure similarite 0.13), proches : beconomie-i, droit-public, beconomie- |
| 36 | `a Eirceonomie I` | introuvable (meilleure similarite 0.77), proches : beconomie-i, beconomie-ii, analyse-ec |
| 37 | `AC U- LDAroit de la Hcoenbsdoommmadaatiiroen et c l ` | introuvable (meilleure similarite 0.59), proches : droit-de-la-consommation, droit-de-la |
| 43 | `Droit de` | ambigu : droit-de-l-immobilier, droit-de-la-concurrence-suisse-et-europeen, droit-de-la- |
| 45 | `Fiscal Policy - H/EAP` | introuvable (meilleure similarite 0.76), proches : x-fiscal-policy, droit-fiscal-du-patr |
| 46 | `Regulatory E c o n o m i cs A u t o m n e` | introuvable (meilleure similarite 0.82), proches : regulatory-economics, microeconomics- |
| 48 | `Normes comptables (IFRS)` | introuvable (meilleure similarite 0.73), proches : normes-comptables-internationales-ifr |
| 52 | `Economie I` | ambigu : beconomie-i, beconomie-ii |
| 53 | `/ à la fi nance - a` | introuvable (meilleure similarite 0.60), proches : introduction-a-la-finance, advanced-f |
| 54 | `/` | ambigu : advanced-financial-analysis, advanced-group-accounting, advanced-issues-in-inte |
| 57 | `Economie I` | ambigu : beconomie-i, beconomie-ii |
| 58 | `Economie C - I` | introuvable (meilleure similarite 0.87), proches : beconomie-i, beconomie-ii, economie-p |
| 59 | `Stratégie A y o ub i d 'e n tr eprise` | introuvable (meilleure similarite 0.79), proches : strategie-d-entreprise, strategy-of-i |
| 61 | `Economie I` | ambigu : beconomie-i, beconomie-ii |
| 68 | `Droit des maCr c-h financiers - Interinnetfe 232 - R` | introuvable (meilleure similarite 0.66), proches : droit-des-marches-financiers, droit-d |
| 69 | `c-h Dérsoit /rnational` | introuvable (meilleure similarite 0.60), proches : droit-international-economique, droit |
| 70 | `Droit é c o n o m iq - C u b o tr on` | introuvable (meilleure similarite 0.60), proches : droit-de-la-consommation, droit-penal |
| 73 | `C Interna t i o n F i n a r c ia d r o Arbitration P` | introuvable (meilleure similarite 0.46), proches : international-commercial-arbitration, |
| 74 | `Droit des m a r c h é s p u b l i c s - In t e r n e` | introuvable (meilleure similarite 0.78), proches : droit-des-marches-publics-p26-p28, dr |
| 76 | `Valuation` | introuvable (meilleure similarite 0.46), proches : droit-fiscal-du-patrimoine, advanced- |

Rapprochés par similarité, à confirmer :

- ligne 13 : `Advanced issues in International and European ` retenu comme **advanced-issues-in-international-european-tax-** (SIMILARITE 0.96)
- ligne 19 : `e-s Arbitrage en droit sport` retenu comme **arbitrage-en-droit-du-sport** (SIMILARITE 0.89)
- ligne 22 : `Séminaire de restructuration financière` retenu comme **seminaire-de-restucturation-financiere** (SIMILARITE 0.99)
- ligne 62 : `Droit et éthique de la profession d'avocat·e` retenu comme **xxdroit-et-ethique-de-la-profession-d-avocat** (SIMILARITE 0.95)

## mscas

31 créneaux retenus, 9 écartés.

| Ligne | Texte lu dans le PDF | Diagnostic |
|---|---|---|
| 5 | `Data Science Methods for Management - BA orientation` | introuvable (meilleure similarite 0.47), proches : data-science-for-non-life-insurance,  |
| 6 | `Data Science Methods for Management - BA orientation` | introuvable (meilleure similarite 0.47), proches : data-science-for-non-life-insurance,  |
| 13 | `Introduction to Data Science` | ambigu : introduction-to-data-science-i, introduction-to-data-science-ii |
| 20 | `Quantitative Asset and Risk Management II` | introuvable (meilleure similarite 0.56), proches : asset-and-liability-management-for-ac |
| 21 | `Quantitative Asset and Risk Management II` | introuvable (meilleure similarite 0.56), proches : asset-and-liability-management-for-ac |
| 36 | `Applied AI & Deep Learning for Managers: From Fundam` | introuvable (meilleure similarite 0.39), proches : asset-and-liability-management-for-ac |
| 37 | `Applied AI & Deep Learning for Managers: From Fundam` | introuvable (meilleure similarite 0.39), proches : asset-and-liability-management-for-ac |
| 39 | `Strategic Pricing` | introuvable (meilleure similarite 0.38), proches : probability-and-stochastic-processes, |
| 40 | `Strategic Pricing` | introuvable (meilleure similarite 0.38), proches : probability-and-stochastic-processes, |

Rapprochés par similarité, à confirmer :

- ligne 14 : `PrévoyanceC - professionnelle` retenu comme **prevoyance-professionnelle** (SIMILARITE 0.98)
- ligne 16 : `PrévoyanceC - professionnelle` retenu comme **prevoyance-professionnelle** (SIMILARITE 0.98)

## msce

24 créneaux retenus, 5 écartés.

| Ligne | Texte lu dans le PDF | Diagnostic |
|---|---|---|
| 6 | `Foundations in Econometrics and Machine Learning` | introuvable (meilleure similarite 0.56), proches : topics-in-structural-econometrics-and |
| 13 | `Foundations in Econometrics and Machine Learning` | introuvable (meilleure similarite 0.56), proches : topics-in-structural-econometrics-and |
| 14 | `Foundations in Econometrics and Machine Learning` | introuvable (meilleure similarite 0.56), proches : topics-in-structural-econometrics-and |
| 24 | `to Cb e- Ocorngfainrmizeadti o-nal Theory and Decisi` | introuvable (meilleure similarite 0.57), proches : organizational-theory-and-decision-ma |
| 27 | `Business Cycles` | introuvable (meilleure similarite 0.34), proches : neuro-economie, international-trade,  |

## mscm-behaviour

44 créneaux retenus, 10 écartés.

| Ligne | Texte lu dans le PDF | Diagnostic |
|---|---|---|
| 7 | `Simple for managing people in face of adversity: Pra` | introuvable (meilleure similarite 0.39), proches : statistical-methods-for-management-al |
| 9 | `Simple for managing people in face of adversity: Pra` | introuvable (meilleure similarite 0.39), proches : statistical-methods-for-management-al |
| 26 | `Decision Intelligence for Managers` | introuvable (meilleure similarite 0.46), proches : heuristic-decision-making-strategies, |
| 28 | `Decision Intelligence for Managers` | introuvable (meilleure similarite 0.46), proches : heuristic-decision-making-strategies, |
| 47 | `Methods` | ambigu : data-science-methods-for-management-ba-orienta, experimental-methods, optimizat |
| 48 | `The iRcissk, Reputation /` | introuvable (meilleure similarite 0.46), proches : strategic-marketing-mkt-orientation,  |
| 49 | `Economics` | ambigu : behavior-economics-and-evolution-lectures-seri, behavioral-economics, environme |
| 50 | `ta l C ri sis 16 février` | introuvable (meilleure similarite 0.41), proches : spatial-modelling-of-species-and-biod |
| 56 | `Simple Rules for Leadership and Strategy: a Practica` | introuvable (meilleure similarite 0.39), proches : sustainability-strategy-project, gran |
| 57 | `S - Behavior, Economics, and Evolution Lecture Serie` | introuvable (meilleure similarite 0.72), proches : behavior-economics-and-evolution-lect |

Rapprochés par similarité, à confirmer :

- ligne 15 : `Strategic Management - SOL/BEE orientations` retenu comme **strategic-management-bee-sol-orientations** (SIMILARITE 0.90)
- ligne 27 : `Organizational Theory and Decision Making - SO` retenu comme **organizational-theory-and-decision-making-bee-** (SIMILARITE 0.94)
- ligne 30 : `Organizational Theory and Decision Making - SO` retenu comme **organizational-theory-and-decision-making-bee-** (SIMILARITE 0.94)
- ligne 36 : `Human Decision- Making and the SDGs` retenu comme **human-decisions-making-and-the-sdgs** (SIMILARITE 0.99)
- ligne 38 : `Human Decision- Making and the SDGs` retenu comme **human-decisions-making-and-the-sdgs** (SIMILARITE 0.99)
- ligne 40 : `Human Decision-Making and the SDGs` retenu comme **human-decisions-making-and-the-sdgs** (SIMILARITE 0.99)
- ligne 42 : `Human Decision-Making and the SDGs` retenu comme **human-decisions-making-and-the-sdgs** (SIMILARITE 0.99)
- ligne 51 : `Power and L e a dership t /` retenu comme **power-and-leadership** (SIMILARITE 0.93)

## mscm-business-analytics

31 créneaux retenus, 10 écartés.

| Ligne | Texte lu dans le PDF | Diagnostic |
|---|---|---|
| 12 | `/anced D a t a A n a lysis - i` | introuvable (meilleure similarite 0.84), proches : advanced-data-analysis, sustainable-l |
| 17 | `Demand and Supply Management` | introuvable (meilleure similarite 0.76), proches : demand-management, datascience-and-ad |
| 23 | `Strategic Purchasing and Supply M a n a g e m e n t` | introuvable (meilleure similarite 0.54), proches : strategic-pricing, demand-management, |
| 34 | `Methods` | ambigu : data-science-methods-for-management-ba-orienta, optimization-methods-for-manage |
| 35 | `CTh -e MaSnuasgteamineanbtle of RLiosgk,istics Rep-u` | introuvable (meilleure similarite 0.37), proches : advanced-issues-in-international-and- |
| 37 | `Power and Leadership` | introuvable (meilleure similarite 0.48), proches : projects-in-demand-forecasting, softw |
| 39 | `Neuro Economie` | introuvable (meilleure similarite 0.36), proches : genes-populations-and-evolution-bee-o |
| 41 | `Simple Rules for Leadership and Strategy: a Practica` | introuvable (meilleure similarite 0.39), proches : software-and-tools-for-business-analy |
| 46 | `/ Advanced - u-tsourcing in a Digital C - Era - Inte` | introuvable (meilleure similarite 0.68), proches : advanced-project-management-outsourci |
| 47 | `Multicriteria rn e f` | introuvable (meilleure similarite 0.63), proches : multicriteria-decision-analysis, stra |

Rapprochés par similarité, à confirmer :

- ligne 42 : `Analytics in Action: Operations Management thr` retenu comme **analytics-in-action-operations-management-thro** (SIMILARITE 0.92)
- ligne 44 : `Analytics in Action: Business Intelligence wit` retenu comme **analytics-in-action-business-intelligence-with** (SIMILARITE 0.92)

## mscm-marketing

30 créneaux retenus, 7 écartés.

| Ligne | Texte lu dans le PDF | Diagnostic |
|---|---|---|
| 7 | `Simple for managing people in face of adversity: Pra` | introuvable (meilleure similarite 0.39), proches : statistical-methods-for-management-al |
| 15 | `Luxury Marketing` | introuvable (meilleure similarite 0.69), proches : global-marketing, datascience-for-mar |
| 31 | `d-o TmCh of and- - 2120` | introuvable (meilleure similarite 0.34), proches : strategy-of-innovation, digital-strat |
| 32 | `e Crisis 16 février` | introuvable (meilleure similarite 0.42), proches : thesis-research-or-internship, heuris |
| 33 | `Power and L e a dership t /` | introuvable (meilleure similarite 0.44), proches : customer-relationship-management, gra |
| 34 | `Neuro Economie` | introuvable (meilleure similarite 0.44), proches : heuristic-decision-making-strategies, |
| 39 | `Simple Rules for Leadership and Strategy: a Practica` | introuvable (meilleure similarite 0.39), proches : sustainability-strategy-project, gran |

Rapprochés par similarité, à confirmer :

- ligne 10 : `Integrated Marketing Communication (MScM)` retenu comme **integrated-marketing-communications** (SIMILARITE 0.95)
- ligne 19 : `Organizational Theory and Decision Making - SO` retenu comme **organizational-theory-and-decision-making-sol-** (SIMILARITE 0.95)
- ligne 21 : `Organizational Theory and Decision Making - SO` retenu comme **organizational-theory-and-decision-making-sol-** (SIMILARITE 0.95)

## mscm-strategy

35 créneaux retenus, 10 écartés.

| Ligne | Texte lu dans le PDF | Diagnostic |
|---|---|---|
| 7 | `Simple for managing people in face of adversity: Pra` | introuvable (meilleure similarite 0.45), proches : simple-rules-for-leadership-and-strat |
| 15 | `Strategy & Development Modes` | introuvable (meilleure similarite 0.61), proches : strategy-development-project-for-sol- |
| 20 | `Decision Intelligence for Managers` | introuvable (meilleure similarite 0.46), proches : heuristic-decision-making-strategies, |
| 22 | `Normes comptables (IFRS)` | introuvable (meilleure similarite 0.73), proches : normes-comptables-internationales-ifr |
| 24 | `Social Norms, Culture, Organizations and Climate Cha` | introuvable (meilleure similarite 0.73), proches : social-norms-and-social-tipping-mecha |
| 36 | `Methods` | ambigu : data-science-methods-for-management-ba-orienta, optimization-methods-for-manage |
| 37 | `The iRcissk, Reputation /` | introuvable (meilleure similarite 0.51), proches : the-management-of-risk-reputation-and |
| 38 | `Crisis 16 février` | introuvable (meilleure similarite 0.39), proches : thesis-research-or-internship, heuris |
| 39 | `Managing C o t /` | introuvable (meilleure similarite 0.53), proches : managing-contractual-relationship, ma |
| 43 | `Neuro Economie` | introuvable (meilleure similarite 0.50), proches : managerial-decision-making, heuristic |

Rapprochés par similarité, à confirmer :

- ligne 27 : `Human Decision- Making and the SDGs` retenu comme **human-decisions-making-and-the-sdgs** (SIMILARITE 0.99)
- ligne 31 : `Human Decision- Making and the SDGs` retenu comme **human-decisions-making-and-the-sdgs** (SIMILARITE 0.99)
- ligne 41 : `Innovation Strategy Project (for SOL orientati` retenu comme **innovation-strategy-project-for-sol-orientatio** (SIMILARITE 0.99)

