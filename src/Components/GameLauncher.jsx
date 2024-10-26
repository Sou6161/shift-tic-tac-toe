import React, { useState, useEffect } from "react";
import TicTacToeShift from "./TicTacToeShift";
import SingleVsAi from "./SingleVsAi";
import LoginButton from "./LoginButton";
import { saveUserData, getUserData } from '../lib/database';

const GameLauncher = () => {
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [showGameModes, setShowGameModes] = useState(false);
  const [showPlayNow, setShowPlayNow] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playerData, setPlayerData] = useState({
    totalMoves: 0,
    wins: 0,
    gamesPlayed: 0,
  });

  useEffect(() => {
    // Check login status on mount
    const loginStatus = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loginStatus);
  }, []);

  const handleLogin = (status) => {
    setIsLoggedIn(status);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const updatePlayerData = async (data) => {
    const userId = // get user ID from authentication
    await saveUserData(userId, data);
  };

  const handleGameEnd = (winner) => {
    const updatedData = {
      totalMoves: playerData.totalMoves + moveCount,
      wins: winner === 'X' ? playerData.wins + 1 : playerData.wins,
      gamesPlayed: playerData.gamesPlayed + 1,
    };
    updatePlayerData(updatedData);
    // show popup/screen
    setShowPopup(true);
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

  return (
    <div className="flex flex-col items-center justify-center rounded-lg min-h-screen mt-7 bg-gradient-to-r from-cyan-400 via-purple-400 to-yellow-300 filter">
      {/* Login Button always visible at the top */}
      <div className="absolute top-2 right-4">
      <LoginButton 
          handleLogin={handleLogin} 
          isLoggedIn={isLoggedIn}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
      
      {!showGameModes && (
        <div className="border-2 backdrop-blur-md p-20 rounded-lg bg-white/30">
          <div className="flex items-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-white">
              Tic Tac Toe Shift - Strategic Board Game
            </h1>
            <div className="text-5xl font-bold ml-4 text-yellow-500">
              T<sup>3</sup>S
            </div>
          </div>
          <p className="text-lg text-white mb-6 w-[30vw]">
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
          </div>
        </div>
      )}
      
      {showPlayNow && (
        <div className="p-20 rounded-lg w-full border-2 backdrop-blur-lg bg-white/30">
          {gameMode === "single" && (
            <div className="">
              {difficulty && <SingleVsAi difficulty={difficulty} />}
              {!difficulty && renderDifficultySelection()}
            </div>
          )}
          {gameMode === "multi" && (
            <div className="mt-20">
              <TicTacToeShift />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameLauncher;