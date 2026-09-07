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

## Roadmap

- [ ] Carte galactique (planètes, connexions)
- [ ] Gestion des personnages (missions, stats)
- [ ] Gestion des flottes / vaisseaux
- [ ] Ressources & production
- [ ] Moteur de tour par tour (Empire vs Alliance)
- [ ] Combat spatial / terrestre
