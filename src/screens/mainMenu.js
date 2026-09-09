export function renderMainMenu(container, { goTo }) {
  container.innerHTML = `
    <div class="screen main-menu">
      <h1>SW Rebellion Remake</h1>
      <nav class="main-menu__actions">
        <button type="button" data-action="new-game">Nouvelle partie</button>
        <button type="button" data-action="load-game">Sauvegardes</button>
        <button type="button" data-action="multiplayer">Multijoueur</button>
        <button type="button" data-action="quit">Quitter</button>
      </nav>
    </div>
  `;

  container.querySelector('[data-action="new-game"]').addEventListener("click", () => goTo("new-game"));
  container.querySelector('[data-action="load-game"]').addEventListener("click", () => goTo("load-game"));
  container.querySelector('[data-action="multiplayer"]').addEventListener("click", () => goTo("multiplayer"));
  container.querySelector('[data-action="quit"]').addEventListener("click", () => goTo("quit"));
}
