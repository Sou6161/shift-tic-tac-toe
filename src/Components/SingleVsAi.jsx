import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { getBestMove } from "./AI";
import Board, { Piece } from "./Board";
import { useAuthStore } from "../store/authStore";

const SingleVsAi = ({ difficulty, onBack, onReset }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);
  const [moveCount, setMoveCount] = useState(0);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isPlacementPhase, setIsPlacementPhase] = useState(true);
  const [aiThinking, setAiThinking] = useState(false);
  const [playerMoves, setPlayerMoves] = useState(0);
  // "idle" | "saving" | "saved" | "error" | "guest"
  const [saveState, setSaveState] = useState("idle");
  const recorded = useRef(false);
  const signedIn = useAuthStore((s) => Boolean(s.user));
  const recordAiGame = useAuthStore((s) => s.recordAiGame);

  // Save the finished game to the player's record (once per round).
  useEffect(() => {
    if (!winner || recorded.current) return;
    recorded.current = true;
    if (!signedIn) return setSaveState("guest");
    setSaveState("saving");
    recordAiGame({ winner, moves: playerMoves, difficulty })
      .then(() => setSaveState("saved"))
      .catch(() => setSaveState("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner]);

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
    const bestMove = getBestMove(board, "O", isPlacementPhase, moveCount);

    // Implement mistake-making based on difficulty
    let finalMove = bestMove;
    if (shouldMakeMistake()) {
      finalMove = getRandomMove();
    }

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
        setPlayerMoves((n) => n + 1);
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
            setPlayerMoves((n) => n + 1);
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

  const handleBackClick = () => {
    // Call onBack to go back to game modes
    onBack();
    // Optionally, call onReset to reset the difficulty selection
    if (onReset) {
      onReset();
    }
  };

  const handleNewRound = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
    setMoveCount(0);
    setSelectedCell(null);
    setIsPlacementPhase(true);
    setAiThinking(false);
    setPlayerMoves(0);
    setSaveState("idle");
    recorded.current = false;
  };

  const label = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const placed = Math.min(moveCount, 6);

  let message;
  if (winner === "X") message = "You win. Nicely shifted.";
  else if (winner) message = "The computer takes this one.";
  else if (aiThinking) message = null;
  else if (isPlacementPhase) message = "Your turn. Place a piece on any empty square.";
  else if (selectedCell === null) message = "Your turn. Pick up one of your pieces.";
  else message = "Now drop it on an empty square, or tap it again to put it back.";

  const Seat = ({ who, piece, active, sub }) => (
    <div
      className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-colors ${
        active ? "border-ink bg-card" : "border-transparent bg-sunk/60"
      }`}
    >
      <span className="h-8 w-8 shrink-0">
        <Piece value={piece} className="h-full w-full" animate={false} />
      </span>
      <div className="min-w-0">
        <div className="text-[15px] font-semibold leading-tight">{who}</div>
        <div className="text-[13px] text-muted">{sub}</div>
      </div>
      {active && !winner && <span className="ml-auto h-2 w-2 rounded-full bg-mustard" />}
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <button className="btn-ghost -ml-2" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4" /> Leave
        </button>
        <span className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-xred" /> vs computer · {label}
        </span>
      </div>

      <div className="grid items-center gap-8 md:grid-cols-[1fr_300px] md:gap-12">
        <div>
          <Board
            board={board}
            onCellClick={handleCellClick}
            selectedCell={selectedCell}
            disabled={aiThinking || !!winner}
            showTargets={!isPlacementPhase}
          />
        </div>

        <aside className="space-y-3">
          <Seat who="You" piece="X" active={currentPlayer === "X"} sub="Red, moves first" />
          <Seat
            who="Computer"
            piece="O"
            active={currentPlayer === "O"}
            sub={aiThinking ? <span className="think">thinking<span>.</span><span>.</span><span>.</span></span> : `${label} difficulty`}
          />

          <div className="rounded-2xl border border-line p-4">
            <div className="flex items-center justify-between">
              <span className="eyebrow">{isPlacementPhase ? "Placing" : "Shifting"}</span>
              <span className="font-mono text-[12px] text-muted">{placed}/6 placed</span>
            </div>
            <div className="mt-3 grid grid-cols-6 gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-colors duration-300 ${
                    i < placed ? (i % 2 === 0 ? "bg-xred" : "bg-oteal") : "bg-line"
                  }`}
                />
              ))}
            </div>
            {message && (
              <p className={`mt-4 text-[15px] leading-snug ${winner ? "font-display text-[22px]" : ""}`}>
                {message}
              </p>
            )}
            {winner && saveState !== "idle" && (
              <p className="mt-2 text-[13px] text-muted">
                {saveState === "saving" && "Saving to your record…"}
                {saveState === "saved" && "Saved to your record."}
                {saveState === "error" && "Couldn't save this one. Check your connection."}
                {saveState === "guest" && "Sign in to keep a record of your wins."}
              </p>
            )}
            {winner && (
              <button className="btn-ink mt-4 w-full" onClick={handleNewRound}>
                <RotateCcw className="h-4 w-4" /> Another round
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SingleVsAi;  