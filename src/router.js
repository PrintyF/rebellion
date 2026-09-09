// Petite state-machine à écrans : pas de vraie gestion d'URL/historique, juste
// un point d'accroche unique (goTo) que les epics suivants (EP2, ...) pourront
// enregistrer sans toucher aux écrans existants.

const screens = new Map();
let container = null;
let currentScreen = null;

export function registerScreen(name, render) {
  screens.set(name, render);
}

export function goTo(screenName, params) {
  const render = screens.get(screenName);
  if (!render) {
    console.error(`Écran inconnu : "${screenName}"`);
    return;
  }
  currentScreen = screenName;
  container.innerHTML = "";
  render(container, { goTo, params });
  focusScreenTitle(container);
}

// Après un changement d'écran, le focus clavier retombe sinon sur <body> et
// aucun changement n'est annoncé aux lecteurs d'écran. On déplace le focus
// sur le titre du nouvel écran (rendu focusable temporairement) pour que
// l'utilisateur au clavier/lecteur d'écran sache où il se trouve.
function focusScreenTitle(root) {
  const title = root.querySelector("h1");
  if (!title) return;
  if (!title.hasAttribute("tabindex")) {
    title.setAttribute("tabindex", "-1");
  }
  title.focus();
}

export function initRouter(rootElement, initialScreen) {
  container = rootElement;
  goTo(initialScreen);
}

export function getCurrentScreen() {
  return currentScreen;
}
