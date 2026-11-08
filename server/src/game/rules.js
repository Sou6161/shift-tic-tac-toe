// Placement: the first 6 moves put a piece down. Shifting: each move then slides one of your pieces to an empty cell.

export const PLACEMENT_MOVES = 6;

export const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const emptyBoard = () => Array(9).fill(null);

export const other = (player) => (player === "X" ? "O" : "X");

export function findWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

const isCell = (n) => Number.isInteger(n) && n >= 0 && n <= 8;

// move is [to] while placing and [from, to] while shifting. Returns { board } or { error }.
export function applyMove(board, player, moveCount, move) {
  if (!Array.isArray(move)) return { error: "Invalid move." };
  const placing = moveCount < PLACEMENT_MOVES;

  if (placing) {
    const [to] = move;
    if (move.length !== 1 || !isCell(to)) return { error: "Invalid move." };
    if (board[to]) return { error: "That square is taken." };
    const next = [...board];
    next[to] = player;
    return { board: next };
  }

  const [from, to] = move;
  if (move.length !== 2 || !isCell(from) || !isCell(to)) return { error: "Pick up a piece, then choose an empty square." };
  if (board[from] !== player) return { error: "You can only move your own pieces." };
  if (board[to]) return { error: "That square is taken." };
  const next = [...board];
  next[to] = player;
  next[from] = null;
  return { board: next };
}
