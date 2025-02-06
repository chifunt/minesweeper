import { initScreens, showScreen } from "./screens.js";
import { initGame } from "./game.js";
import { initSounds } from "./sound.js";
import { initUISounds } from "./uiSounds.js";

// When DOM is ready, initialize screens and game.
document.addEventListener("DOMContentLoaded", () => {
  initScreens();
  initGame();
  initSounds();
  initUISounds();
  // Initially show main menu
  showScreen("screen-mainmenu");
});
