import React, { useState, useEffect } from "react";
import Board from "./Boards";
import GameInfo from "./GameInfo";
import { getBestMove } from "./AI";

const TicTacToeShift = () => {
  const [playerSymbol, setPlayerSymbol] = useState(
    Math.random() < 0.5 ? "X" : "O"
  );
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);
  const [movesX, setMovesX] = useState(0);
  const [movesO, setMovesO] = useState(0);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ X: 30, O: 30 });

  const aiSymbol = playerSymbol === "X" ? "O" : "X";

  const isValidMove = (index) => {
    if (board[index] || winner) return false;
    const isPlacementPhase = movesX < 3 || movesO < 3;
    return isPlacementPhase;
  };

  const isValidShift = (from, to) => {
    if (board[to] !== null || winner) return false;
    const isPlacementPhase = movesX < 3 || movesO < 3;
    if (isPlacementPhase) return false;
    return board[from] === currentPlayer;
  };

  const makeMove = (index) => {
    if (!isValidMove(index)) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    if (currentPlayer === "X") {
      setMovesX(movesX + 1);
    } else {
      setMovesO(movesO + 1);
    }

    if (checkWinner(newBoard, currentPlayer)) {
      setWinner(currentPlayer);
    } else {
      switchTurn();
    }
  };

  const makeShift = (from, to) => {
    if (!isValidShift(from, to)) return;

    const newBoard = [...board];
    newBoard[to] = board[from];
    newBoard[from] = null;
    setBoard(newBoard);

    if (checkWinner(newBoard, currentPlayer)) {
      setWinner(currentPlayer);
    } else {
      switchTurn();
    }
  };

  const switchTurn = () => {
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    setTimeLeft((prev) => ({
      ...prev,
      X: 30,
      O: 30,
    }));
  };

  const handleMove = (index) => {
    if (currentPlayer === playerSymbol && isValidMove(index)) {
      makeMove(index);
    }
  };

  const handleShift = (from, to) => {
    if (currentPlayer === playerSymbol && isValidShift(from, to)) {
      makeShift(from, to);
    }
  };

  const checkWinner = (board, player) => {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    return winPatterns.some((pattern) =>
      pattern.every((index) => board[index] === player)
    );
  };

  const resetGame = () => {
    setPlayerSymbol(Math.random() < 0.5 ? "X" : "O");
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
    setMovesX(0);
    setMovesO(0);
    setIsAIThinking(false);
    setTimeLeft({ X: 30, O: 30 });
  };

  useEffect(() => {
    if (currentPlayer === aiSymbol && !winner) {
      setIsAIThinking(true);

      const aiMoveTimeout = setTimeout(() => {
        const isPlacementPhase = aiSymbol === "X" ? movesX < 3 : movesO < 3;
        const bestMove = getBestMove(
          board,
          aiSymbol,
          isPlacementPhase,
          aiSymbol === "X" ? movesX : movesO
        );

        if (bestMove) {
          if (isPlacementPhase) {
            makeMove(bestMove.to);
          } else {
            makeShift(bestMove.from, bestMove.to);
          }
        }
        setIsAIThinking(false);
      }, 1000);

      return () => clearTimeout(aiMoveTimeout);
    }
  }, [currentPlayer, winner, board, movesX, movesO, aiSymbol]);

  useEffect(() => {
    if (winner || isAIThinking) return;

    const timer = setInterval(() => {
      if (timeLeft[currentPlayer] > 0) {
        setTimeLeft((prev) => ({
          ...prev,
          [currentPlayer]: prev[currentPlayer] - 1,
        }));
      } else {
        switchTurn();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, currentPlayer, winner, isAIThinking]);

  const canShift = movesX >= 3 && movesO >= 3;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-teal-500 via-slate-500 to-rose-500 p-4">
      <h1 className="text-4xl font-bold mb-8 text-white">Tic-Tac-Toe Shift</h1>
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-8 shadow-xl">
        <Board
          board={board}
          onMove={handleMove}
          onShift={handleShift}
          canShift={canShift}
          currentPlayer={currentPlayer}
        />
        <GameInfo
          currentPlayer={currentPlayer}
          winner={winner}
          onReset={resetGame}
          movesX={movesX}
          movesO={movesO}
          isAIThinking={isAIThinking}
          gameMode="singleplayer"
          timeLeft={timeLeft[currentPlayer]}
          playerSymbol={playerSymbol}
          isPlayerTurn={currentPlayer === playerSymbol}
        />
      </div>
    </div>
  );
};

export default TicTacToeShift;
