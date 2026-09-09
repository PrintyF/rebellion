# SW Rebellion Remake — guide de travail

Remake web (HTML/JS vanilla + Vite) de *Star Wars: Rebellion* (1998). Le projet est piloté par des issues GitHub structurées en epics/user stories ; ce fichier explique comment travailler dessus efficacement.

## État du projet

Scaffold Vite minimal (`index.html`, `src/main.js`, `src/style.css`), pas encore de logique de jeu. Tout est à construire depuis l'EP1 (extraction/modélisation des données).

## Source de vérité pour le travail à faire

- **GitHub Issues** (repo `PrintyF/rebellion`) est la source de vérité : 53 issues, toutes de type `type:story`, groupées par epic via un label `epic:EPx` (EP1 à EP15) et un milestone par epic. Aucune n'est fermée à ce jour.
- **[docs/ROADMAP.md](docs/ROADMAP.md)** est un snapshot local hors-ligne de ces issues, dans l'ordre de traitement recommandé. Pratique pour naviguer sans appel réseau, mais **ne pas s'y fier pour le statut réel** (ouvert/fermé/assigné) — toujours vérifier sur GitHub avant de commencer une story si un doute existe.
- Pour rafraîchir le snapshot ou lire le détail d'une issue (critères d'acceptation, cas de test QA) :
  ```bash
  curl -s "https://api.github.com/repos/PrintyF/rebellion/issues/<numero>"
  curl -s "https://api.github.com/repos/PrintyF/rebellion/issues?state=all&per_page=100"
  ```
  (`gh` CLI n'est pas installé dans cet environnement — utiliser l'API REST via curl.)

## Ordre de traitement des epics

EP1 (données) est un prérequis pour presque tout. Ordre recommandé (fondations avant systèmes avancés, IA/sauvegarde/UX transverse/multi en dernier car ils dépendent du reste) :

1. **EP1** — Extraction & modélisation des données
2. **EP13** — Menu principal & lancement de partie
3. **EP2** — Carte galactique
4. **EP3** — Moteur de tour avec timer auto-résolutif
5. **EP4** — Gestion des personnages
6. **EP14** — Missions
7. **EP15** — Installations planétaires
8. **EP5** — Gestion des flottes et vaisseaux
9. **EP6** — Économie & production
10. **EP7** — Combat spatial
11. **EP8** — Combat terrestre / invasion
12. **EP9** — IA adverse
13. **EP10** — Sauvegarde / chargement de partie
14. **EP11** — Interface utilisateur & UX
15. **EP12** — Multijoueur

Le détail issue par issue est dans [docs/ROADMAP.md](docs/ROADMAP.md). Rester à l'intérieur d'un epic tant qu'il n'est pas terminé plutôt que de sauter entre epics, sauf dépendance bloquante explicite.

## Agents & rôles

Le projet est traité comme une petite équipe, via des subagents dédiés (`.claude/agents/`) :

| Agent | Rôle | Quand l'invoquer |
|---|---|---|
| `product-owner` | Valide l'intention produit d'une story, tranche les ambiguïtés de périmètre, priorise | Avant de démarrer une story ambiguë ; après implémentation pour valider l'intention (pas juste la lettre) |
| `tech-lead` | Architecture, découpage technique, choix de dépendances/patterns | Avant/pendant l'implémentation d'une story non triviale |
| `qa` | Vérifie les critères d'acceptation et cas de test QA de l'issue, cherche les régressions | Après implémentation, avant la review de merge |
| `ui-ux` | Cohérence visuelle, accessibilité, interactions | Après implémentation de toute story front-end (EP2, EP11, EP13, tout écran de jeu) |
| `code-reviewer` | Gate obligatoire avant merge sur `main` | Toujours, en dernier, avant tout merge |

Ces agents sont consultatifs et peuvent tourner en parallèle quand ils n'ont pas de dépendance entre eux (ex: `qa` et `ui-ux` sur une même story front-end). Aucun ne pousse sur `main` ni n'ouvre de PR de sa propre initiative — c'est toujours l'agent orchestrateur (la session principale) qui agit, après confirmation utilisateur si l'action est sensible (push, merge, ouverture de PR).

## Workflow par story

1. Lire l'issue complète sur GitHub (`curl .../issues/<n>`) : la story, les critères d'acceptation, le(s) cas de test QA. Ce sont eux qui définissent "fini", pas une interprétation du titre seul.
2. Si le périmètre est ambigu, consulter `product-owner`. Pour une story non triviale, consulter `tech-lead` pour le découpage technique.
3. Créer une branche dédiée : `git checkout -b us<epic>.<n>-slug` (ex: `us1.1-extraction-script`).
4. Implémenter uniquement le périmètre de la story — pas d'anticipation sur les stories suivantes du même epic.
5. Une fois l'implémentation faite : consulter `qa` (toujours) et `ui-ux` (si la story touche à l'interface). Corriger les FAIL avant de continuer.
6. **Gate obligatoire : consulter `code-reviewer` sur le diff complet (`git diff main...<branche>`).** Un verdict `REQUEST CHANGES` bloque le merge — corriger et re-soumettre à `code-reviewer` jusqu'à `APPROVE`. Ne jamais merger sur `main` sans un `APPROVE` explicite d'un agent `code-reviewer` distinct de celui qui a écrit le code.
7. Commit avec un message clair référençant l'issue (`Closes #<n>` si applicable). Pousser/ouvrir une PR/merger seulement après confirmation explicite de l'utilisateur — voir aussi la branch protection GitHub (section Environnements).
8. Cocher la case correspondante dans `docs/ROADMAP.md` une fois la story réellement mergée (pas avant).

## Environnements

Voir [docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md) — pas d'hébergement staging/prod pour l'instant (projet 100% front-end sans backend), `main` sert de proxy "production" (toujours fonctionnel, protégé par review obligatoire). Branch protection GitHub à activer manuellement (pas de `gh`/token dans cet environnement d'exécution) — voir les instructions données par l'agent lors de la mise en place initiale.

## Stack & conventions

- HTML/JS vanilla + Vite, pas de framework pour l'instant (voir README pour évolution éventuelle).
- Pas de linter/formatter/test runner configuré actuellement. Si une story nécessite l'un de ces outils (ex: EP1 parsing CSV, tests QA formalisés), le mettre en place à ce moment-là plutôt qu'en préalable global — poser la question à l'utilisateur si le choix d'outillage n'est pas évident.
- Données de jeu : `src/data/` — alimenté par le pipeline d'extraction de l'EP1, basé sur les exports CSV de [StarWarsRebellionEditor.NET](https://github.com/MetasharpNet/StarWarsRebellionEditor.NET) (`characters.csv`, `units.csv`, `buildings.csv`, `systems.csv`, `sectors.csv`).
- `docs/` — documentation de conception (roadmap local + toute note de règles du jeu original qui serait ajoutée).

## Repères de conception issus des stories déjà écrites

- Le jeu tourne en temps réel avec des tours à durée réglable et auto-résolutifs (EP3), pas en tour par tour classique à validation manuelle.
- Les personnages ont des capacités typées (recrutement, espionnage, diplomatie, sabotage, incitation à l'insurrection, recherche) qui pilotent les missions (EP14).
- Les erreurs de données (parsing CSV, sauvegarde corrompue) doivent être loggées et gérées sans crash, jamais silencieusement ignorées sans trace.
