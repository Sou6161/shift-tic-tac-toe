import React, { useState, useEffect } from "react";
import { getBestMove } from "./AI";

const SingleVsAi = ({ difficulty }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);
  const [moveCount, setMoveCount] = useState(0);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isPlacementPhase, setIsPlacementPhase] = useState(true);
  const [aiThinking, setAiThinking] = useState(false);

  useEffect(() => {
    if (currentPlayer === "O" && !winner) {
      setAiThinking(true);
      const timer = setTimeout(() => {
        makeAiMove();
        setAiThinking(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, winner]);

  const makeAiMove = () => {
    console.log("Making AI move");
    const bestMove = getBestMove(board, "O", isPlacementPhase, moveCount);

    // Implement mistake-making based on difficulty
    let finalMove = bestMove;
    if (shouldMakeMistake()) {
      finalMove = getRandomMove();
    }

    console.log("AI move:", finalMove);
    if (finalMove) {
      const newBoard = [...board];
      if (finalMove.from !== null) {
        newBoard[finalMove.from] = null;
      }
      newBoard[finalMove.to] = "O";
      setBoard(newBoard);
      setCurrentPlayer("X");
      setMoveCount((prev) => prev + 1);
      if (moveCount + 1 >= 6 && isPlacementPhase) {
        setIsPlacementPhase(false);
      }
    } else {
      console.log("No move found");
    }
  };

  const shouldMakeMistake = () => {
    const mistakeChance = {
      easy: 0.3,
      medium: 0.15,
      hard: 0.05,
    }[difficulty];
    return Math.random() < mistakeChance;
  };

  const getRandomMove = () => {
    const availableMoves = [];
    board.forEach((cell, index) => {
      if (!cell) {
        availableMoves.push({ from: null, to: index });
      }
    });
    if (!isPlacementPhase) {
      board.forEach((cell, fromIndex) => {
        if (cell === "O") {
          board.forEach((targetCell, toIndex) => {
            if (!targetCell) {
              availableMoves.push({ from: fromIndex, to: toIndex });
            }
          });
        }
      });
    }
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  const handleCellClick = (index) => {
    if (winner || currentPlayer !== "X" || aiThinking) return;

    if (isPlacementPhase) {
      if (!board[index]) {
        const newBoard = [...board];
        newBoard[index] = "X";
        setBoard(newBoard);
        setCurrentPlayer("O");
        setMoveCount((prev) => prev + 1);
        if (moveCount + 1 >= 6) {
          setIsPlacementPhase(false);
        }
      }
    } else {
      if (selectedCell === null) {
        if (board[index] === "X") {
          setSelectedCell(index);
        }
      } else {
        if (index !== selectedCell) {
          if (!board[index]) {
            const newBoard = [...board];
            newBoard[index] = newBoard[selectedCell];
            newBoard[selectedCell] = null;
            setBoard(newBoard);
            setSelectedCell(null);
            setCurrentPlayer("O");
          } else {
            setSelectedCell(null);
          }
        } else {
          setSelectedCell(null);
        }
      }
    }
  };

  const renderBoard = () => {
    return (
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, index) => (
          <button
            key={index}
            className={`w-20 h-20 text-4xl font-bold ${
              cell
                ? cell === "X"
                  ? "bg-blue-200"
                  : "bg-red-200"
                : "bg-gray-200"
            } ${selectedCell === index ? "border-4 border-yellow-400" : ""}`}
            onClick={() => handleCellClick(index)}
            disabled={aiThinking}
          >
            {cell}
          </button>
        ))}
      </div>
    );
  };

  useEffect(() => {
    checkWinner();
  }, [board]);

  const checkWinner = () => {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < winningCombinations.length; i++) {
      const [a, b, c] = winningCombinations[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        return;
      }
    }
    // if (moveCount === 9) setWinner("draw");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 w-[70vw]">
      <h2 className="text-2xl font-bold mb-4 font-semibold text-purple-400">
        TicTacToe Shift (Single Player vs AI)
      </h2>
      <p className="text-xl mb-4 text-white ">
        Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </p>
      {renderBoard()}
      {winner ? (
        <p className="mt-4 text-xl font-bold">{winner} wins!</p>
      ) : (
        <div className="ml-12">
          <p className="mt-4 font-semibold text-green-400">Current player: {currentPlayer}</p>
          <p className="font-semibold text-green-400">Moves: {moveCount}</p>
          <p className="font-semibold text-green-400">Phase: {isPlacementPhase ? "Placement" : "Shifting"}</p>
          {aiThinking ? (
            <p className="mt-2 text-blue-600 font-semibold">
              AI is thinking...
            </p>
          ) : (
            currentPlayer === "X" && (
              <p className="mt-2 font-semibold text-green-400">
                {isPlacementPhase
                  ? "Your turn: Place a piece on an empty cell"
                  : selectedCell === null
                  ? "Your turn: Select a piece to move"
                  : "Now select an empty space to move your piece"}
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default SingleVsAi;
