import { playSound } from "./sound.js";

/**
 * Attach hover and click sound effects to all UI elements.
 */
export function initUISounds() {
  const uiButtons = document.querySelectorAll(
    "#screen-mainmenu button, #screen-help button, #screen-game button"
  );

  uiButtons.forEach(button => {
    button.addEventListener("mouseover", () => {
      playSound("uiHover");
    });

    button.addEventListener("click", () => {
      playSound("uiClick");
    });
  });
}
