const evaluateBoard = (board, depth) => {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ];

  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      if (board[a] === "O") return 10 - depth;
      if (board[a] === "X") return depth - 10;
    }
  }

  return 0;
};

const getAvailableMoves = (board, player, isPlacementPhase, playerPieces) => {
  const moves = [];

  if (isPlacementPhase) {
    // During placement phase, only empty cells are valid moves
    board.forEach((cell, index) => {
      if (!cell) moves.push({ from: null, to: index });
    });
  } else {
    // During shifting phase, can move any of player's pieces to empty cells
    board.forEach((cell, fromIndex) => {
      if (cell === player) {
        board.forEach((targetCell, toIndex) => {
          if (!targetCell) {
            moves.push({ from: fromIndex, to: toIndex });
          }
        });
      }
    });
  }

  return moves;
};

const minimax = (
  board,
  depth,
  alpha,
  beta,
  isMax,
  player,
  isPlacementPhase,
  playerPieces
) => {
  const score = evaluateBoard(board, depth);

  if (score !== 0) return score;
  if (depth === 0) return 0;

  const moves = getAvailableMoves(
    board,
    player,
    isPlacementPhase,
    playerPieces
  );
  if (moves.length === 0) return 0;

  if (isMax) {
    let bestScore = -Infinity;
    for (let move of moves) {
      const newBoard = [...board];
      if (move.from !== null) newBoard[move.from] = null;
      newBoard[move.to] = player;

      const score = minimax(
        newBoard,
        depth - 1,
        alpha,
        beta,
        false,
        player === "X" ? "O" : "X",
        isPlacementPhase,
        playerPieces
      );
      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, bestScore);
      if (beta <= alpha) break;
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let move of moves) {
      const newBoard = [...board];
      if (move.from !== null) newBoard[move.from] = null;
      newBoard[move.to] = player;

      const score = minimax(
        newBoard,
        depth - 1,
        alpha,
        beta,
        true,
        player === "X" ? "O" : "X",
        isPlacementPhase,
        playerPieces
      );
      bestScore = Math.min(bestScore, score);
      beta = Math.min(beta, bestScore);
      if (beta <= alpha) break;
    }
    return bestScore;
  }
};

const getBestMove = (board, player, isPlacementPhase, playerPieces) => {
  let bestScore = -Infinity;
  let bestMove = null;

  const moves = getAvailableMoves(
    board,
    player,
    isPlacementPhase,
    playerPieces
  );

  for (let move of moves) {
    const newBoard = [...board];
    if (move.from !== null) newBoard[move.from] = null;
    newBoard[move.to] = player;

    const score = minimax(
      newBoard,
      5,
      -Infinity,
      Infinity,
      false,
      player === "X" ? "O" : "X",
      isPlacementPhase,
      playerPieces
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

export { getBestMove };
