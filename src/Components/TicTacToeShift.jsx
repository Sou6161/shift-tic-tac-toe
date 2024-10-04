import React, { useState, useEffect } from "react";
import Board from "./Boards";
import GameInfo from "./GameInfo";

const TicTacToeShift = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);
  const [movesX, setMovesX] = useState(0);
  const [movesO, setMovesO] = useState(0);
  const [powerCells, setPowerCells] = useState([
    { index: 0, type: "swap" },
    { index: 4, type: "block" },
    { index: 8, type: "wild" },
  ]);
  const [timeLeft, setTimeLeft] = useState(30);

  const handleMove = (index) => {
    if (board[index] || winner || (movesX >= 3 && movesO >= 3)) return;

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
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
      setTimeLeft(30); // Reset time for next player
    }
  };

  const handleShift = (from, to) => {
    if (
      movesX < 3 ||
      movesO < 3 ||
      board[from] !== currentPlayer ||
      board[to] !== null ||
      winner
    )
      return;

    const newBoard = [...board];
    newBoard[to] = currentPlayer;
    newBoard[from] = null;
    setBoard(newBoard);

    if (checkWinner(newBoard, currentPlayer)) {
      setWinner(currentPlayer);
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
      setTimeLeft(30); // Reset time for next player
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
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
    setMovesX(0);
    setMovesO(0);
    setPowerCells([
      { index: 0, type: "swap" },
      { index: 4, type: "block" },
      { index: 8, type: "wild" },
    ]);
    setTimeLeft(30);
  };

  const canShift = movesX >= 3 && movesO >= 3;

  useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
      } else {
        // Time's up! Switch player
        setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
        setTimeLeft(30);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, currentPlayer]);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl min-h-screen bg-gradient-to-r from-teal-500 via-slate-500 to-rose-500">
      <h1 className="text-4xl font-bold mb-8">Tic-Tac-Toe-Shift</h1>
      <Board
        board={board}
        onMove={handleMove}
        onShift={handleShift}
        canShift={canShift}
        currentPlayer={currentPlayer}
        powerCells={powerCells}
      />
      <GameInfo
        currentPlayer={currentPlayer}
        winner={winner}
        onReset={resetGame}
        movesX={movesX}
        movesO={movesO}
        timeLeft={timeLeft}
      />
    </div>
  );
};

export default TicTacToeShift;
