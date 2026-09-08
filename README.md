# SW Rebellion Remake

Remake web (HTML/JS) du jeu *Star Wars: Rebellion* (1998), jouable dans le navigateur.

## Contexte

Inspiré de la documentation et des données récoltées via le projet
[StarWarsRebellionEditor.NET](https://github.com/MetasharpNet/StarWarsRebellionEditor.NET),
qui référence pas mal de stats (personnages, vaisseaux, planètes).

## Stack

- HTML / JavaScript (vanilla, sans framework pour l'instant)
- Vite pour le dev server / build

## Structure

```
sw-rebellion-remake/
├── index.html
├── src/
│   ├── main.js
│   ├── style.css
│   └── data/        # données jeu (personnages, vaisseaux, planètes)
├── docs/            # notes de conception, règles du jeu original
└── README.md
```

## Démarrage

```bash
npm install
npm run dev
```

## Pipeline de données (EP1)

Les données de jeu (`src/data/*.json`) sont générées à partir des CSV exportés par [StarWarsRebellionEditor.NET](https://github.com/MetasharpNet/StarWarsRebellionEditor.NET) (export 1-clic : `characters.csv`, `units.csv`, `buildings.csv`, `systems.csv`, `sectors.csv`).

```bash
# 1. Placer les CSV exportés dans data-source/ (ignoré par git)
# 2. Lancer le pipeline complet :
npm run data:pipeline

# ou étape par étape :
npm run data:extract   # CSV -> data-raw/*.json (brut, erreurs de parsing loggées et ignorées)
npm run data:build     # data-raw/*.json -> src/data/*.json (validé via les schémas Zod de types/)
```

`characters.csv` et `buildings.csv` ne sont pas encore disponibles (nécessitent l'éditeur WinForms .NET, Windows uniquement) — leurs fichiers de sortie sont vides tant qu'ils ne sont pas fournis. Certains champs du schéma cible (connexions entre secteurs, loyalty initiale, garrison, capacités des personnages, déblocage par recherche) n'existent pas dans l'export de l'éditeur et sont défaultés avec un warning explicite — à trancher côté game design plus tard.

## Roadmap

- [ ] Carte galactique (planètes, connexions)
- [ ] Gestion des personnages (missions, stats)
- [ ] Gestion des flottes / vaisseaux
- [ ] Ressources & production
- [ ] Moteur de tour par tour (Empire vs Alliance)
- [ ] Combat spatial / terrestre
