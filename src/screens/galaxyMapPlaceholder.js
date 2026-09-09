// Écran temporaire tant qu'EP2 (carte galactique) n'est pas implémentée.
// À remplacer par le véritable écran de carte, qui lira gameConfig lui-même.
import { gameConfig } from "../state/gameState.js";

const GALAXY_SIZE_LABELS = { small: "Petite", medium: "Moyenne", large: "Grande" };
const DIFFICULTY_LABELS = { easy: "Facile", medium: "Moyen", hard: "Difficile" };
const FACTION_LABELS = { alliance: "Alliance Rebelle", empire: "Empire Galactique" };

export function renderGalaxyMapPlaceholder(container, { goTo }) {
  container.innerHTML = `
    <div class="screen galaxy-map-placeholder">
      <h1>Partie lancée</h1>
      <p>La carte galactique (EP2) n'est pas encore implémentée.</p>
      <ul>
        <li>Taille de galaxie : ${GALAXY_SIZE_LABELS[gameConfig.galaxySize]}</li>
        <li>Difficulté : ${DIFFICULTY_LABELS[gameConfig.difficulty]}</li>
        <li>Faction : ${FACTION_LABELS[gameConfig.faction]}</li>
      </ul>
      <button type="button" data-action="back">Retour au menu principal</button>
    </div>
  `;

  container.querySelector('[data-action="back"]').addEventListener("click", () => goTo("main-menu"));
}
