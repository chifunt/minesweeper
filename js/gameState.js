/**
 * @module gameState
 * A singleton object holding the current game state.
 */
export const GameState = {
  board: null,
  rows: 0,
  cols: 0,
  minesCount: 0,
  firstClickDone: false,
  currentDifficulty: null,
  timerInterval: null,
  startTime: null,
  gameOver: false,
  activeTile: null,
};
