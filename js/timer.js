/**
 * @module timer
 * Provides timer functionality for the game.
 */
import { GameState } from "./gameState.js";

/**
 * Starts the game timer and invokes the update callback every second.
 * @param {Function} updateCallback - A function that receives the elapsed time in milliseconds.
 */
export function startTimer(updateCallback) {
  GameState.startTime = Date.now();
  GameState.timerInterval = setInterval(() => {
    const elapsed = Date.now() - GameState.startTime;
    updateCallback(elapsed);
  }, 1000);
}

/**
 * Stops the game timer.
 */
export function stopTimer() {
  clearInterval(GameState.timerInterval);
}
