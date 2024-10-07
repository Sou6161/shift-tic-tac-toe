// TicTacToeShift.jsx
import React, { useState, useEffect } from "react";
import Board from "./Boards";
import GameInfo from "./GameInfo";
import { getBestMove } from "./AI";

const TicTacToeShift = ({ gameMode, socket, isHost }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);
  const [movesX, setMovesX] = useState(0);
  const [movesO, setMovesO] = useState(0);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameId, setGameId] = useState(null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);

  const isAIGame = gameMode === "singleplayer";
  const isMultiplayerGame = gameMode === "multiplayer";

  // Player assignment for multiplayer
  const playerSymbol = isHost ? "X" : "O";
  const isPlayerTurn = currentPlayer === playerSymbol;

  useEffect(() => {
    if (isMultiplayerGame && socket) {
      socket.on("opponentMove", ({ index }) => {
        makeMove(index, true);
      });

      socket.on("opponentShift", ({ from, to }) => {
        makeShift(from, to, true);
      });

      socket.on("playerDisconnected", () => {
        setOpponentDisconnected(true);
      });

      socket.on("gameStarted", () => {
        resetGame();
      });

      return () => {
        socket.off("opponentMove");
        socket.off("opponentShift");
        socket.off("playerDisconnected");
        socket.off("gameStarted");
      };
    }
  }, [socket, isMultiplayerGame]);

  const isValidMove = (index, isOpponentMove = false) => {
    if (board[index] || winner || isAIThinking) return false;

    const isPlacementPhase = movesX < 3 || movesO < 3;
    if (!isPlacementPhase) return false;

    if (isMultiplayerGame && !isOpponentMove) {
      return isPlayerTurn;
    }

    return true;
  };

  const isValidShift = (from, to, isOpponentShift = false) => {
    if (
      board[from] !== currentPlayer ||
      board[to] !== null ||
      winner ||
      isAIThinking
    )
      return false;

    const isPlacementPhase = movesX < 3 || movesO < 3;
    if (isPlacementPhase) return false;

    if (isMultiplayerGame && !isOpponentShift) {
      return isPlayerTurn;
    }

    return true;
  };

  const makeMove = (index, isOpponentMove = false) => {
    if (!isValidMove(index, isOpponentMove)) return;

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
      setTimeLeft(30);
    }

    if (isMultiplayerGame && !isOpponentMove) {
      socket.emit("move", { index, gameId });
    }
  };

  const makeShift = (from, to, isOpponentShift = false) => {
    if (!isValidShift(from, to, isOpponentShift)) return;

    const newBoard = [...board];
    newBoard[to] = currentPlayer;
    newBoard[from] = null;
    setBoard(newBoard);

    if (checkWinner(newBoard, currentPlayer)) {
      setWinner(currentPlayer);
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
      setTimeLeft(30);
    }

    if (isMultiplayerGame && !isOpponentShift) {
      socket.emit("shift", { from, to, gameId });
    }
  };

  const handleMove = (index) => {
    if (isMultiplayerGame) {
      if (!isPlayerTurn) return;
      socket.emit("move", { index, gameId });
      socket.emit("nextTurn", { gameId }); // Emit next turn event
    }
    makeMove(index);
  };

  const handleShift = (from, to) => {
    if (isMultiplayerGame) {
      if (!isPlayerTurn) return;
      socket.emit("shift", { from, to, gameId });
      socket.emit("nextTurn", { gameId }); // Emit next turn event
    }
    makeShift(from, to);
  };

  const checkWinner = (board, player) => {
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
    setIsAIThinking(false);
    setTimeLeft(30);
    setOpponentDisconnected(false);
  };

  // AI Move Effect
  useEffect(() => {
    if (isAIGame && currentPlayer === "O" && !winner) {
      setIsAIThinking(true);

      const aiMoveTimeout = setTimeout(() => {
        const isPlacementPhase = movesO < 3;
        const bestMove = getBestMove(board, "O", isPlacementPhase, movesO);

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
  }, [currentPlayer, winner, board, movesO, isAIGame]);

  // Timer Effect
  useEffect(() => {
    if (winner || isAIThinking || (isMultiplayerGame && !isPlayerTurn)) return;

    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft((prev) => prev - 1);
      } else {
        // Time's up! Switch player
        setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
        setTimeLeft(30);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    timeLeft,
    currentPlayer,
    winner,
    isAIThinking,
    isMultiplayerGame,
    isPlayerTurn,
  ]);

  const canShift = movesX >= 3 && movesO >= 3;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-teal-500 via-slate-500 to-rose-500 p-4">
      <h1 className="text-4xl font-bold mb-8 text-white">Tic-Tac-Toe Shift</h1>
      {opponentDisconnected && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          Opponent disconnected. Please return to the lobby.
        </div>
      )}
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-8 shadow-xl">
        <Board
          board={board}
          onMove={handleMove}
          onShift={handleShift}
          canShift={canShift}
          currentPlayer={currentPlayer}
          disabled={isAIThinking || (isMultiplayerGame && !isPlayerTurn)}
        />
        <GameInfo
          currentPlayer={currentPlayer}
          winner={winner}
          onReset={resetGame}
          movesX={movesX}
          movesO={movesO}
          isAIThinking={isAIThinking}
          gameMode={gameMode}
          timeLeft={timeLeft}
          playerSymbol={playerSymbol}
          isPlayerTurn={isPlayerTurn}
        />
      </div>
    </div>
  );
};

export default TicTacToeShift;
