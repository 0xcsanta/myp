# Les horaires

Un fichier par master et par année : `<slug>-<annee>.json`.

Ce dossier est vide au départ. **Les horaires ne figurent dans aucune source
que le projet peut lire automatiquement**, ni dans les plans d'études, ni dans
les annuaires de cours, et le catalogue en ligne interdit l'accès automatisé.
Voir [../../docs/LEGAL.md](../../docs/LEGAL.md) et
[../../docs/HORAIRES-A-TELECHARGER.md](../../docs/HORAIRES-A-TELECHARGER.md).

Tant qu'un fichier manque, l'interface écrit « horaire non publié dans nos
sources » et renvoie vers le catalogue officiel. Elle n'invente jamais un
créneau, et ne reprend jamais celui d'une autre année.

## Format

```json
{
  "programme": "mscis",
  "annee": "2025-2026",
  "source": {
    "document": "horaire type du programme, semestre d'automne",
    "url": "https://applicationspub.unil.ch/interpub/noauth/php/Ud/agendaType.php?...",
    "releveLe": "2026-08-27",
    "releveParUnHumain": true
  },
  "creneaux": [
    {
      "cours": "data-science-machine-learning",
      "saison": "automne",
      "jour": "Lundi",
      "debut": "14:15",
      "fin": "18:00",
      "salle": "Internef/237",
      "cadence": "hebdomadaire",
      "note": ""
    }
  ]
}
```

### Les champs

| Champ | Règle |
|---|---|
| `cours` | l'identifiant du cours, celui que produit `coursDe()` à partir du titre. Un identifiant inconnu est signalé au build plutôt qu'ignoré en silence. |
| `saison` | `automne` ou `printemps`. C'est ce qui permet de ne comparer que des créneaux qui se chevauchent vraiment. |
| `jour` | `Lundi` à `Vendredi`, en toutes lettres. |
| `debut`, `fin` | format `HH:MM` sur 24 heures. |
| `salle` | telle qu'écrite par l'UNIL, par exemple `Internef/237`. |
| `cadence` | `hebdomadaire`, `quinzaine`, `bloc` ou `irregulier`. Un cours en `bloc` ou `irregulier` n'entre pas dans la détection de chevauchements, parce qu'un chevauchement y serait faux la plupart du temps. |
| `note` | ce qu'il faut savoir en plus, par exemple « semaine bloc en novembre ». Affichée telle quelle. |

### Ce qu'on n'écrit pas

- **Pas de créneau deviné.** Si l'horaire officiel ne dit rien, on n'écrit rien.
- **Pas de report d'une année sur l'autre.** Un cours peut changer de jour.
- **Pas de plage approximative.** `14:15` et non `14:00`, l'UNIL est précise.

### Vérification

Chaque fichier porte sa date de relevé. L'interface affiche cette date à côté
de la grille, pour que l'étudiant sache de quand date l'information et puisse
la recouper lui même.
