import { initScreens, showScreen } from "./screens.js";
import { initGame } from "./game.js";

// When DOM is ready, initialize screens and game.
document.addEventListener("DOMContentLoaded", () => {
  initScreens();
  initGame();
  // Initially show main menu
  showScreen("screen-mainmenu");
});
