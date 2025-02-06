import { playSound } from "./sound.js";

/**
 * Initializes UI sound effects on button hover and click.
 */
export function initUISounds() {
  const uiButtons = document.querySelectorAll(
    "#screen-mainmenu button, #screen-help button, #screen-game button"
  );
  uiButtons.forEach((button) => {
    button.addEventListener("mouseover", () => playSound("uiHover"));
    button.addEventListener("click", () => playSound("uiClick"));
  });
}
