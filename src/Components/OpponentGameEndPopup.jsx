import React, { useState, useEffect } from "react";
import LoginButton from "./LoginButton";

const OpponentGameEndPopup = ({
  handleRematch,
  playerData,
  opponentMoves,
  isCreator,
  isDark,
  winner,
  onBack // New prop for handling back navigation
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [showLeaderboardConfirm, setShowLeaderboardConfirm] = useState(false);

  const handleLogin = (isLoggedIn) => {
    setIsLoggedIn(isLoggedIn);
    if (isLoggedIn) {
      setShowLeaderboardConfirm(true);
    }
  };

  const handleLeaderboardConfirm = (confirmed) => {
    if (confirmed) {
      console.log("User confirmed joining leaderboard");
    }
    setShowLeaderboardConfirm(false);
  };

  useEffect(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    if (storedLoginStatus === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const renderMoves = () => (
    <div>
      <h2
        className={`font-bold mb-2 ${
          isDark ? "text-gray-200" : "text-gray-800"
        }`}
      >
        Your Moves:
      </h2>
      <ul className={isDark ? "text-gray-300" : "text-gray-600"}>
        {opponentMoves.map((move, index) => (
          <li key={index}>
            Move {index + 1}: Position{move.move.length > 1 ? "s" : ""}{" "}
            {move.move.join(" → ")}
          </li>
        ))}
      </ul>
      <div
        className={`text-md mt-4 ${isDark ? "text-gray-400" : "text-gray-700"}`}
      >
        You played {opponentMoves.length} moves
      </div>
      <div
        className={`text-md mt-2 ${isDark ? "text-gray-400" : "text-gray-700"}`}
      >
        Your score: {playerData.wins} wins / {playerData.gamesPlayed} games
        played
      </div>
    </div>
  );

  const renderRematchButton = () => {
    if (isCreator) {
      return (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 mb-4 w-full"
          onClick={() => {
            handleRematch();
            setShowPopup(false);
          }}
        >
          Rematch
        </button>
      );
    }
    return (
      <div
        className={`text-center mt-4 mb-4 ${
          isDark ? "text-gray-400" : "text-gray-700"
        }`}
      >
        Waiting for room creator to start rematch...
      </div>
    );
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center">
      <div
        className={`p-6 rounded-lg shadow-md w-96 mt-10 relative ${
          isDark ? "bg-gray-800 border border-gray-700" : "bg-white"
        }`}
      > 
        {/* Back Button */}
        <button
          onClick={onBack}
          className={`absolute top-2 left-2 px-4 py-2 rounded-lg
            ${isDark 
              ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            } transition-colors duration-200`}
        >
          <span className="-mt-1">←</span> Back
        </button>
        
        <h2
          className={`text-[1.7vw] ml-[6vw] font-bold mb-4 ${
            isDark ? "text-gray-200" : "text-gray-800"
          }`}
        >
          {winner === "draw"
            ? "It's a Draw!"
            : winner === "opponent left"
            ? "Opponent Left the Game"
            : `${winner} Wins!`}
        </h2>
        <div className="ml-16">
          <LoginButton handleLogin={handleLogin} isDark={isDark} />
        </div>
        <div
          className={`text-center my-4 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          OR
        </div>
        {renderRematchButton()}
        {renderMoves()}
      </div>
    </div>
  );
};

export default OpponentGameEndPopup;