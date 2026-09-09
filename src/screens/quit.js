// Un navigateur ne peut pas se fermer lui-même de façon fiable (window.close()
// échoue silencieusement hors onglet ouvert par script) : on affiche un écran
// de confirmation plutôt qu'un no-op invisible pour l'utilisateur.
export function renderQuit(container, { goTo }) {
  container.innerHTML = `
    <div class="screen quit-screen">
      <h1>À bientôt, Commandant</h1>
      <p>Vous pouvez fermer cet onglet.</p>
      <button type="button" data-action="back">Retour au menu principal</button>
    </div>
  `;

  container.querySelector('[data-action="back"]').addEventListener("click", () => goTo("main-menu"));
}
