/**
 * @module inputHandler
 * Handles user input on the Minesweeper grid.
 */
import { GameState } from "./gameState.js";
import { updateTileDOM, updateMineCounter } from "./gridRenderer.js";
import { playSound } from "./sound.js";
import { floodFill, placeMines, calculateNumbers } from "./minefield.js";

/**
 * Returns an array of valid neighbor coordinates for a given cell.
 * @param {number} row
 * @param {number} col
 * @returns {Array<[number, number]>}
 */
export function getNeighbors(row, col) {
  const neighbors = [];
  const { rows, cols } = GameState;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        neighbors.push([r, c]);
      }
    }
  }
  return neighbors;
}

/**
 * Handles the mousedown event on a tile.
 * @param {MouseEvent} e
 */
export function handleMouseDown(e) {
  if (GameState.gameOver) return;
  GameState.activeTile = e.currentTarget;
  const row = parseInt(GameState.activeTile.dataset.row, 10);
  const col = parseInt(GameState.activeTile.dataset.col, 10);

  if (GameState.board[row][col].flagged) return;

  if (GameState.board[row][col].revealed && GameState.board[row][col].number > 0) {
    getNeighbors(row, col).forEach(([r, c]) => {
      if (!GameState.board[r][c].revealed && !GameState.board[r][c].flagged) {
        const neighborTile = document.querySelector(`.tile[data-row="${r}"][data-col="${c}"]`);
        neighborTile?.classList.add("tile-highlight");
      }
    });
  } else if (!GameState.board[row][col].revealed && GameState.board[row][col].number !== 0) {
    GameState.activeTile.classList.add("tile-highlight");
  }
}

/**
 * Handles the mouseup event on a tile.
 * @param {MouseEvent} e
 */
export function handleMouseUp(e) {
  if (GameState.gameOver) return;
  if (e.currentTarget !== GameState.activeTile) {
    e.currentTarget.classList.remove("tile-highlight");
    return;
  }
  GameState.activeTile.classList.remove("tile-highlight");

  const row = parseInt(GameState.activeTile.dataset.row, 10);
  const col = parseInt(GameState.activeTile.dataset.col, 10);

  if (e.button === 0 && GameState.board[row][col].flagged) return;

  if (e.button === 0) {
    if (!GameState.firstClickDone) {
      // Place mines (avoiding the clicked cell and its neighbors), then calculate numbers.
      GameState.board = placeMines(GameState.board, GameState.minesCount, row, col);
      GameState.board = calculateNumbers(GameState.board);
      GameState.firstClickDone = true;
    }
    if (GameState.board[row][col].revealed) {
      chordReveal(row, col);
    } else {
      revealTile(row, col);
    }
  } else if (e.button === 2) {
    toggleFlag(row, col);
  }

  updateMineCounter();
  // Defer win-condition check to allow UI update.
  setTimeout(checkWinCondition, 0);
}

/**
 * Reveals the tile at (row, col). For blank cells, a flood-fill is performed.
 * @param {number} row
 * @param {number} col
 */
export function revealTile(row, col) {
  if (GameState.board[row][col].flagged || GameState.board[row][col].revealed) return;

  if (GameState.board[row][col].mine) {
    GameState.board[row][col].revealed = true;
    updateTileDOM(row, col, true);
    playSound("explosion");
    revealAllMines();
    import("./timer.js").then(({ stopTimer }) => stopTimer());
    GameState.gameOver = true;
  } else if (GameState.board[row][col].number > 0) {
    GameState.board[row][col].revealed = true;
    updateTileDOM(row, col);
    playSound("tileReveal");
  } else {
    const revealedCells = floodFill(GameState.board, row, col);
    revealedCells.forEach(([r, c]) => updateTileDOM(r, c));
    playSound("tileReveal");
  }
}

/**
 * If a revealed numbered tile has the same number of flagged neighbors,
 * reveal all adjacent non-flagged tiles.
 * @param {number} row
 * @param {number} col
 */
export function chordReveal(row, col) {
  const cell = GameState.board[row][col];
  if (cell.number === 0) return;
  const flaggedCount = getNeighbors(row, col).reduce(
    (acc, [r, c]) => acc + (GameState.board[r][c].flagged ? 1 : 0),
    0
  );
  if (flaggedCount === cell.number) {
    getNeighbors(row, col).forEach(([r, c]) => {
      if (!GameState.board[r][c].revealed && !GameState.board[r][c].flagged) {
        revealTile(r, c);
      }
    });
  }
}

/**
 * Toggles the flagged state on the tile at (row, col).
 * @param {number} row
 * @param {number} col
 */
export function toggleFlag(row, col) {
  if (GameState.gameOver || GameState.board[row][col].revealed) return;
  GameState.board[row][col].flagged = !GameState.board[row][col].flagged;
  updateTileDOM(row, col);
  playSound("flagPlace");
}

/**
 * Reveals all mines on the board when the game is lost.
 * Correctly flagged mines remain flagged (and unrevealed),
 * while any unflagged mine is revealed. Incorrect flags are marked as misflags.
 */
export function revealAllMines() {
  const { board, rows, cols } = GameState;

  // Reveal only those mines that are NOT flagged.
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine && !board[r][c].revealed && !board[r][c].flagged) {
        board[r][c].revealed = true;
        updateTileDOM(r, c);
      }
    }
  }

  // Mark misflagged tiles (those that are flagged but do not contain a mine).
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].flagged && !board[r][c].mine) {
        const tile = document.querySelector(`.tile[data-row="${r}"][data-col="${c}"]`);
        if (tile) {
          tile.classList.add("tile-misflag");
        }
      }
    }
  }
}

/**
 * Checks if the win condition is met (all non-mine cells revealed).
 */
export function checkWinCondition() {
  const { board, rows, cols } = GameState;
  let won = true;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].mine && !board[r][c].revealed) {
        won = false;
        break;
      }
    }
    if (!won) break;
  }
  if (won) {
    document.getElementById("reset-button").classList.add("gameover");
    playSound("gameWon");
    import("./timer.js").then(({ stopTimer }) => stopTimer());
    GameState.gameOver = true;
  }
}
