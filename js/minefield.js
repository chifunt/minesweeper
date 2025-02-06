/**
 * @module minefield
 * Provides helper functions for creating and manipulating the Minesweeper board.
 */

/**
 * Creates an empty Minesweeper board.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @returns {Array<Array<{revealed: boolean, flagged: boolean, mine: boolean, number: number}>>} The board.
 */
export function createEmptyBoard(rows, cols) {
  const board = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        revealed: false,
        flagged: false,
        mine: false,
        number: 0,
      });
    }
    board.push(row);
  }
  return board;
}

/**
 * Places mines on the board, avoiding the first clicked cell and its neighbors.
 * @param {Array<Array<Object>>} board - The board.
 * @param {number} mines - Number of mines to place.
 * @param {number} firstClickRow - Row of the first click.
 * @param {number} firstClickCol - Column of the first click.
 * @returns {Array<Array<Object>>} The board with mines placed.
 */
export function placeMines(board, mines, firstClickRow, firstClickCol) {
  const rows = board.length;
  const cols = board[0].length;
  const excluded = new Set();

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = firstClickRow + dr;
      const c = firstClickCol + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        excluded.add(`${r},${c}`);
      }
    }
  }

  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (excluded.has(`${r},${c}`)) continue;
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }
  return board;
}

/**
 * Calculates the number of adjacent mines for each cell.
 * @param {Array<Array<Object>>} board - The board.
 * @returns {Array<Array<Object>>} The board with numbers calculated.
 */
export function calculateNumbers(board) {
  const rows = board.length;
  const cols = board[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine) {
            count++;
          }
        }
      }
      board[r][c].number = count;
    }
  }
  return board;
}

/**
 * Performs a flood-fill to reveal blank areas starting from the given cell.
 * @param {Array<Array<Object>>} board - The board.
 * @param {number} startRow - The starting row.
 * @param {number} startCol - The starting column.
 * @returns {Array<[number, number]>} An array of [row, col] pairs that were revealed.
 */
export function floodFill(board, startRow, startCol) {
  const rows = board.length;
  const cols = board[0].length;
  const toReveal = [];
  const visited = new Set();
  const stack = [[startRow, startCol]];

  while (stack.length) {
    const [r, c] = stack.pop();
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    visited.add(key);
    const cell = board[r][c];
    if (!cell.revealed && !cell.flagged) {
      cell.revealed = true;
      toReveal.push([r, c]);
      if (cell.number === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(`${nr},${nc}`)) {
              stack.push([nr, nc]);
            }
          }
        }
      }
    }
  }
  return toReveal;
}
