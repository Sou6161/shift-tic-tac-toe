import React, { useState, useEffect } from "react";
import TicTacToeShift from "./TicTacToeShift";
import SingleVsAi from "./SingleVsAi";
import LoginButton from "./LoginButton";
import { saveUserData, getUserData } from "../lib/database";

const GameLauncher = ({ isDark }) => {
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [showGameModes, setShowGameModes] = useState(false);
  const [showPlayNow, setShowPlayNow] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
      setIsLoggedIn(loginStatus);

      if (loginStatus) {
        try {
          const userId = localStorage.getItem("userId");
          if (userId) {
            const userData = await getUserData(userId);
            if (userData) {
              setPlayerData(userData);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    checkInitialLoginStatus();
  }, []);

  const handleLogin = (status) => {
    setIsLoggedIn(status);
  };

  const handleLoginSuccess = () => {
    console.log("Login success called");
    setIsLoggedIn(true);
  };

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
    // Reset game mode and difficulty selection
    setGameMode(null);
    setDifficulty(null);
    setShowPlayNow(false);
    setShowGameModes(false);
  };

  const renderDifficultySelection = () => (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4 text-white">Select Difficulty</h2>
      <div className="flex space-x-4">
        {["Easy", "Medium", "Hard"].map((level) => (
          <button
            key={level}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              setDifficulty(level.toLowerCase());
              setGameMode("single");
            }}
          >
            {level}
          </button>
        ))}
      </div>
      
    </div>
  );

  const renderGameEndPopup = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-4">Game Over</h2>
        <div className="mb-4">
          <p>Total Moves: {moveCount}</p>
          <p>Total Games Played: {playerData.gamesPlayed}</p>
          <p>Total Wins: {playerData.wins}</p>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            setShowPopup(false);
            handleBackFromGame();
          }}
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg min-h-screen mt-7 
      ${
        isDark
          ? "bg-gradient-to-r from-gray-90 via-gray-700 to-gray-500"
          : "bg-gradient-to-r from-cyan-400 via-purple-400 to-yellow-300"
      } 
      filter`}
    >
      {/* Login Button always visible at the top */}
      <div className="absolute top-2 right-4">
        <LoginButton
          handleLogin={handleLogin}
          isLoggedIn={isLoggedIn}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>

      {showPopup && renderGameEndPopup()}

      {!showGameModes && (
        <div className="border-2 backdrop-blur-md p-20 rounded-lg bg-white/30">
          <div className="flex items-center mb-8">
            <h1
              className={`text-4xl font-bold mb-4 text-transparent bg-clip-text ${
                isDark
                  ? "bg-gradient-to-b from-yellow-400 to-lime-500"
                  : "bg-gradient-to-b from-black to-dark-blue-900 text-black"
              }`}
            >
              Tic Tac Toe Shift - Strategic Board Game
            </h1>
            <div className="text-[3.5vw] px-4 py-6 bg-gradient-to-r from-[#061161] to-[#780206] border-2 rounded-full w-[8vw] h-[8vw] bg-slate-600 relative top-[12vh] font-bold ml-4 text-yellow-500">
              T<sup>3</sup>S
            </div>
          </div>
          <p className="playwrite-gb-s-font1 text-lg text-white mb-6 -mt-10 w-[30vw]">
            Experience the classic game with a twist! Place your pieces, then
            shift them strategically. Challenge AI or play with friends in this
            exciting new take on Tic Tac Toe.
          </p>
          <div className="">
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => setShowGameModes(true)}
            >
              Play Now
            </button>
          </div>
        </div>
      )}

      {showGameModes && !showPlayNow && (
        <div className="border-2 backdrop-blur-lg p-20 rounded-lg bg-white/30">
          <div className="flex space-x-4">
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 ml-[1vw] rounded"
              onClick={() => {
                setGameMode("single");
                setShowPlayNow(true);
              }}
            >
              Single Player (vs AI)
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                setGameMode("multi");
                setShowPlayNow(true);
              }}
            >
              Multiplayer (with Friend)
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded absolute -top-[37vh] -left-[23vw]"
              onClick={() => setShowGameModes(false)}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {showPlayNow && (
        <div className="p-20 rounded-lg w-full border-2 backdrop-blur-lg bg-white/30">
          {gameMode === "single" && (
            <div className="">
              {difficulty && (
                <SingleVsAi 
                  difficulty={difficulty} 
                  onBack={handleBackFromGame}
                  onGameEnd={handleGameEnd}
                  setMoveCount={setMoveCount}
                />
              )}
              {!difficulty && renderDifficultySelection()}
            </div>
          )}
          {gameMode === "multi" && (
            <div className="mt-20">
              <TicTacToeShift 
                isDark={isDark} 
                onBack={handleBackFromGame}
                onGameEnd={handleGameEnd}
                setMoveCount={setMoveCount}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameLauncher;