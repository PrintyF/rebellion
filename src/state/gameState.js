// État de la partie en cours de configuration/lancée. EP2 (carte galactique)
// lira `gameConfig` pour initialiser son propre état — voir US13.2.
export const gameConfig = {
  galaxySize: null,
  difficulty: null,
  faction: null,
};

export function setGalaxySize(value) {
  gameConfig.galaxySize = value;
}

export function setDifficulty(value) {
  gameConfig.difficulty = value;
}

export function setFaction(value) {
  gameConfig.faction = value;
}

export function isGameConfigComplete() {
  return Boolean(gameConfig.galaxySize && gameConfig.difficulty && gameConfig.faction);
}
