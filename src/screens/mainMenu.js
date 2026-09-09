import { gameConfig, setGalaxySize, setDifficulty, setFaction } from "../state/gameState.js";

// Repris de la disposition du menu principal du jeu original (cockpit à
// zones cliquables) mais avec des graphismes maison, pas les assets Steam.
const DIFFICULTIES = [
  { value: "easy", label: "Facile" },
  { value: "medium", label: "Moyen" },
  { value: "hard", label: "Difficile" },
];

const GALAXY_SIZES = [
  { value: "small", label: "Petite" },
  { value: "medium", label: "Moyenne" },
  { value: "large", label: "Grande" },
];

const DIFFICULTY_LABELS = Object.fromEntries(DIFFICULTIES.map((d) => [d.value, d.label]));
const GALAXY_SIZE_LABELS = Object.fromEntries(GALAXY_SIZES.map((g) => [g.value, g.label]));

function renderPanelGroup(role, options, selectedValue) {
  return options
    .map(
      (opt) => `
        <button
          type="button"
          class="panel-btn${opt.value === selectedValue ? " panel-btn--active" : ""}"
          data-role="${role}"
          data-value="${opt.value}"
          aria-pressed="${opt.value === selectedValue}"
        >${opt.label}</button>
      `
    )
    .join("");
}

export function renderMainMenu(container, { goTo }) {
  container.innerHTML = `
    <div class="screen cockpit-menu">
      <h1>SW Rebellion Remake</h1>

      <section class="panel-row" aria-label="Difficulté">
        <span class="panel-row__label">Difficulté</span>
        <div class="panel-group" data-group="difficulty">
          ${renderPanelGroup("difficulty", DIFFICULTIES, gameConfig.difficulty)}
        </div>
      </section>

      <section class="panel-row" aria-label="Taille de la galaxie">
        <span class="panel-row__label">Taille de la galaxie</span>
        <div class="panel-group" data-group="galaxySize">
          ${renderPanelGroup("galaxySize", GALAXY_SIZES, gameConfig.galaxySize)}
        </div>
      </section>

      <p class="cockpit-menu__summary" data-role="summary"></p>

      <section class="faction-row" aria-label="Choisir une faction et lancer la partie">
        <button type="button" class="faction-btn faction-btn--alliance" data-action="launch" data-faction="alliance">
          <span class="faction-btn__title">Alliance Rebelle</span>
          <span class="faction-btn__hint">Cliquer pour lancer la partie</span>
        </button>
        <button type="button" class="faction-btn faction-btn--empire" data-action="launch" data-faction="empire">
          <span class="faction-btn__title">Empire Galactique</span>
          <span class="faction-btn__hint">Cliquer pour lancer la partie</span>
        </button>
      </section>

      <nav class="cockpit-menu__footer">
        <button type="button" data-action="load-game">Sauvegardes</button>
        <button type="button" data-action="multiplayer">Multijoueur</button>
        <button type="button" data-action="quit">Quitter</button>
      </nav>
    </div>
  `;

  const summary = container.querySelector('[data-role="summary"]');

  function updateSummary() {
    summary.textContent = `Partie ${GALAXY_SIZE_LABELS[gameConfig.galaxySize]} — ${DIFFICULTY_LABELS[gameConfig.difficulty]}`;
  }

  function selectPanel(role, value, setter) {
    setter(value);
    container.querySelectorAll(`[data-group="${role}"] .panel-btn`).forEach((btn) => {
      const isSelected = btn.dataset.value === value;
      btn.classList.toggle("panel-btn--active", isSelected);
      btn.setAttribute("aria-pressed", String(isSelected));
    });
    updateSummary();
  }

  container.querySelectorAll('[data-role="difficulty"]').forEach((btn) =>
    btn.addEventListener("click", () => selectPanel("difficulty", btn.dataset.value, setDifficulty))
  );
  container.querySelectorAll('[data-role="galaxySize"]').forEach((btn) =>
    btn.addEventListener("click", () => selectPanel("galaxySize", btn.dataset.value, setGalaxySize))
  );

  updateSummary();

  container.querySelectorAll('[data-action="launch"]').forEach((btn) =>
    btn.addEventListener("click", () => {
      setFaction(btn.dataset.faction);
      goTo("galaxy-map");
    })
  );

  container.querySelector('[data-action="load-game"]').addEventListener("click", () => goTo("load-game"));
  container.querySelector('[data-action="multiplayer"]').addEventListener("click", () => goTo("multiplayer"));
  container.querySelector('[data-action="quit"]').addEventListener("click", () => goTo("quit"));
}
