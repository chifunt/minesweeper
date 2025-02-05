/**
 * Create a 2D array representing the board.
 * Each cell is an object with properties:
 *   - revealed: has the tile been revealed?
 *   - flagged: is the tile flagged?
 *   - mine: is there a mine?
 *   - number: count of adjacent mines.
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
 * Place mines on the board.
 * The cell at (firstClickRow, firstClickCol) and its neighbors are excluded.
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
        excluded.add(r + "," + c);
      }
    }
  }
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (excluded.has(r + "," + c)) continue;
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }
  return board;
}

/**
 * For each cell not containing a mine, count the number of adjacent mines.
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
          if (
            nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols &&
            board[nr][nc].mine
          ) {
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
 * Perform a flood-fill starting at (startRow, startCol)
 * to reveal blank (number === 0) areas.
 * Returns an array of [row, col] pairs that were revealed.
 */
export function floodFill(board, startRow, startCol) {
  const rows = board.length;
  const cols = board[0].length;
  const toReveal = [];
  const visited = new Set();
  const stack = [[startRow, startCol]];

  while (stack.length) {
    const [r, c] = stack.pop();
    const key = r + "," + c;
    if (visited.has(key)) continue;
    visited.add(key);
    const cell = board[r][c];
    if (!cell.revealed && !cell.flagged) {
      cell.revealed = true;
      toReveal.push([r, c]);
      if (cell.number === 0) {
        // Add all adjacent neighbors
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (
              nr >= 0 &&
              nr < rows &&
              nc >= 0 &&
              nc < cols &&
              !visited.has(nr + "," + nc)
            ) {
              stack.push([nr, nc]);
            }
          }
        }
      }
    }
  }
  return toReveal;
}
