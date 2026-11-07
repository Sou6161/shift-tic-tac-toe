import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Cpu, Users } from "lucide-react";
import TicTacToeShift from "./TicTacToeShift";
import SingleVsAi from "./SingleVsAi";
import { XPiece, OPiece } from "./Board";
import { saveUserData, getUserData } from "../lib/database";

const difficulties = [
  { id: "easy", label: "Easy", note: "Slips up about one move in three.", dots: 1 },
  { id: "medium", label: "Medium", note: "Plays well and sometimes gets careless.", dots: 2 },
  { id: "hard", label: "Hard", note: "Almost never misses a block.", dots: 3 },
];

const GameLauncher = ({ isDark }) => {
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [showPlayNow, setShowPlayNow] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [playerData, setPlayerData] = useState({
    totalMoves: 0,
    wins: 0,
    gamesPlayed: 0,
  });

  useEffect(() => {
    const checkInitialLoginStatus = async () => {
      const loginStatus = localStorage.getItem("isLoggedIn") === "true";
      if (loginStatus) {
        try {
          const userId = localStorage.getItem("userId");
          if (userId) {
            const userData = await getUserData(userId);
            if (userData) setPlayerData(userData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    checkInitialLoginStatus();
  }, []);

  const updatePlayerData = async (data) => {
    try {
      const userId = localStorage.getItem("userId");
      if (userId) {
        await saveUserData(userId, data);
        setPlayerData(data);
      }
    } catch (error) {
      console.error("Error updating player data:", error);
    }
  };

  const handleGameEnd = (winner) => {
    const updatedData = {
      totalMoves: playerData.totalMoves + moveCount,
      wins: winner === "X" ? playerData.wins + 1 : playerData.wins,
      gamesPlayed: playerData.gamesPlayed + 1,
    };
    updatePlayerData(updatedData);
    setShowPopup(true);
    setMoveCount(0);
  };

  const handleBackFromGame = () => {
    setGameMode(null);
    setDifficulty(null);
    setShowPlayNow(false);
  };

  const pick = (mode) => {
    setGameMode(mode);
    setShowPlayNow(true);
  };

  /* ---------- Step 1: choose who to play */
  const renderModes = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <button
        onClick={() => pick("single")}
        className="group relative overflow-hidden rounded-[24px] border-2 border-line bg-paper p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:border-ink sm:p-8"
      >
        <div className="flex items-center justify-between">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-xred/10 text-xred">
            <Cpu className="h-5 w-5" />
          </span>
          <XPiece className="h-16 w-16 rotate-6 text-xred/25 transition-transform duration-300 group-hover:rotate-12" animate={false} />
        </div>
        <h3 className="font-display mt-8 text-[28px] font-medium tracking-tight">Play the computer</h3>
        <p className="mt-2 max-w-[36ch] text-[15px] leading-relaxed text-muted">
          A good way to learn how shifting works. Pick how hard you want it to play.
        </p>
        <span className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold">
          Choose difficulty
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </button>

      <button
        onClick={() => pick("multi")}
        className="group relative overflow-hidden rounded-[24px] border-2 border-ink bg-ink p-6 text-left text-paper transition-all dark:border-oteal/60 dark:bg-sunk dark:text-ink duration-200 hover:-translate-y-1 sm:p-8"
      >
        <div className="flex items-center justify-between">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-paper/10 text-mustard dark:bg-oteal/15">
            <Users className="h-5 w-5" />
          </span>
          <OPiece className="h-16 w-16 -rotate-6 text-oteal/50 transition-transform duration-300 group-hover:-rotate-12" animate={false} />
        </div>
        <h3 className="font-display mt-8 text-[28px] font-medium tracking-tight">Play a friend</h3>
        <p className="mt-2 max-w-[36ch] text-[15px] leading-relaxed text-paper/65 dark:text-muted">
          Open a room, send the code, and play the same board live. 20 seconds per turn.
        </p>
        <span className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-mustard">
          Open a room
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </button>
    </div>
  );

  /* ---------- Step 2 (vs computer): difficulty */
  const renderDifficultySelection = () => (
    <div className="mx-auto max-w-3xl py-6 text-center">
      <p className="eyebrow">Versus the computer</p>
      <h3 className="font-display mt-2 text-[32px] font-medium tracking-tight">How tough should it be?</h3>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {difficulties.map((d) => (
          <button
            key={d.id}
            onClick={() => {
              setDifficulty(d.id);
              setGameMode("single");
            }}
            className="group rounded-[20px] border-2 border-line bg-paper p-5 text-left transition-all hover:-translate-y-1 hover:border-ink"
          >
            <div className="flex gap-1">
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  className={`h-2 w-5 rounded-full ${n <= d.dots ? "bg-xred" : "bg-line"}`}
                />
              ))}
            </div>
            <div className="font-display mt-4 text-[22px] font-medium">{d.label}</div>
            <p className="mt-1 text-[14px] leading-snug text-muted">{d.note}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderGameEndPopup = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F1A14]/40 p-4 backdrop-blur-[2px]">
      <div className="pop-in w-full max-w-sm rounded-[28px] border border-line bg-card p-8 text-center shadow-lift">
        <h2 className="font-display text-[30px] font-medium">Good game.</h2>
        <dl className="mt-6 grid grid-cols-3 gap-2 text-center">
          {[
            ["Moves", moveCount],
            ["Played", playerData.gamesPlayed],
            ["Wins", playerData.wins],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-sunk px-2 py-3">
              <dd className="font-display text-[26px] font-medium">{v}</dd>
              <dt className="eyebrow mt-1 !text-[10px]">{k}</dt>
            </div>
          ))}
        </dl>
        <button
          className="btn-ink mt-6 w-full"
          onClick={() => {
            setShowPopup(false);
            handleBackFromGame();
          }}
        >
          Back to the table
        </button>
      </div>
    </div>
  );

  const inGame = showPlayNow && (gameMode === "multi" || difficulty);

  return (
    <div className="relative">
      {showPopup && renderGameEndPopup()}

      {showPlayNow && !inGame && (
        <button onClick={handleBackFromGame} className="btn-ghost -ml-2 mb-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      )}

      {!showPlayNow && renderModes()}

      {showPlayNow && gameMode === "single" && (
        <>
          {difficulty ? (
            <SingleVsAi
              difficulty={difficulty}
              onBack={handleBackFromGame}
              onGameEnd={handleGameEnd}
              setMoveCount={setMoveCount}
            />
          ) : (
            renderDifficultySelection()
          )}
        </>
      )}

      {showPlayNow && gameMode === "multi" && (
        <TicTacToeShift
          isDark={isDark}
          onBack={handleBackFromGame}
          onGameEnd={handleGameEnd}
          setMoveCount={setMoveCount}
        />
      )}
    </div>
  );
};

export default GameLauncher;
