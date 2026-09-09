import { gameConfig, setGalaxySize, setDifficulty, setFaction, isGameConfigComplete } from "../state/gameState.js";

const GALAXY_SIZES = [
  { value: "small", label: "Petite" },
  { value: "medium", label: "Moyenne" },
  { value: "large", label: "Grande" },
];

const DIFFICULTIES = [
  { value: "easy", label: "Facile" },
  { value: "medium", label: "Moyen" },
  { value: "hard", label: "Difficile" },
];

const FACTIONS = [
  { value: "alliance", label: "Alliance Rebelle", description: "Une résistance dispersée qui doit gagner le soutien des systèmes pour renverser l'Empire." },
  { value: "empire", label: "Empire Galactique", description: "Une puissance militaire écrasante qui doit traquer et détruire la Rébellion avant qu'elle ne grandisse." },
];

function renderChoiceGroup(name, options, selectedValue) {
  return options
    .map(
      (opt) => `
        <label class="choice">
          <input type="radio" name="${name}" value="${opt.value}" ${opt.value === selectedValue ? "checked" : ""} />
          ${opt.label}
          ${opt.description ? `<span class="choice__description">${opt.description}</span>` : ""}
        </label>
      `
    )
    .join("");
}

export function renderNewGame(container, { goTo }) {
  // Repart d'une config vierge à chaque entrée sur l'écran, pour ne pas
  // laisser une sélection précédente présélectionnée silencieusement.
  setGalaxySize(null);
  setDifficulty(null);
  setFaction(null);

  container.innerHTML = `
    <div class="screen new-game">
      <h1>Nouvelle partie</h1>

      <fieldset>
        <legend>Taille de la galaxie</legend>
        ${renderChoiceGroup("galaxySize", GALAXY_SIZES, gameConfig.galaxySize)}
      </fieldset>

      <fieldset>
        <legend>Difficulté</legend>
        ${renderChoiceGroup("difficulty", DIFFICULTIES, gameConfig.difficulty)}
      </fieldset>

      <fieldset>
        <legend>Faction</legend>
        ${renderChoiceGroup("faction", FACTIONS, gameConfig.faction)}
      </fieldset>

      <div class="new-game__actions">
        <button type="button" data-action="launch" disabled>Lancer la partie</button>
        <button type="button" data-action="back">Retour au menu principal</button>
      </div>
    </div>
  `;

  const launchButton = container.querySelector('[data-action="launch"]');

  function updateLaunchButton() {
    launchButton.disabled = !isGameConfigComplete();
  }

  container.querySelectorAll('input[name="galaxySize"]').forEach((input) =>
    input.addEventListener("change", (e) => {
      setGalaxySize(e.target.value);
      updateLaunchButton();
    })
  );
  container.querySelectorAll('input[name="difficulty"]').forEach((input) =>
    input.addEventListener("change", (e) => {
      setDifficulty(e.target.value);
      updateLaunchButton();
    })
  );
  container.querySelectorAll('input[name="faction"]').forEach((input) =>
    input.addEventListener("change", (e) => {
      setFaction(e.target.value);
      updateLaunchButton();
    })
  );

  launchButton.addEventListener("click", () => {
    if (!isGameConfigComplete()) return;
    goTo("galaxy-map");
  });

  container.querySelector('[data-action="back"]').addEventListener("click", () => goTo("main-menu"));
}
