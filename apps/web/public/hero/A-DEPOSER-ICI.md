# Les deux images du hero

Depose ici les deux PNG exportes de Figma, en respectant exactement ces noms :

| Nom attendu      | Fichier Figma d'origine                            | Role                          |
|------------------|----------------------------------------------------|-------------------------------|
| `hero-backdrop.png` | `c679635ffcd72bb904ceb3d4d370143ce50d9282.png`  | le fond bleu du cadre         |
| `hero-screen.png`   | `862ef6d8c1032e893ea45b5385ce07114edec35c.png`  | l'ecran, les lettres MYP en 3D |

Tant qu'elles sont absentes, le cadre affiche un degrade et le mot
« image du hero absente ». Rien ne casse, et le manque se voit.

Le composant les detecte tout seul au rendu : aucune ligne de code a changer,
il suffit de relancer `npm run dev`.
