import React, { useState } from "react";
import TicTacToeShift from "./TicTacToeShift";

const GameLauncher = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isRoomCreator, setIsRoomCreator] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [showRoomOptions, setShowRoomOptions] = useState(false);
  const [showRoomScreen, setShowRoomScreen] = useState(false);

  if (gameStarted && gameMode === "singleplayer") {
    return <TicTacToeShift gameMode={gameMode} />;
  }

  const handleGenerateRoomCode = () => {
    const code = Math.floor(10000 + Math.random() * 90000);
    setRoomCode(code);
    console.log(`${playerName} created a new room with code: ${code}`);
    setShowRoomScreen(true);
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    setShowRoomOptions(true);
  };

  const handlePlayGame = () => {
    if (gameMode === "multiplayer") {
      return (
        <div className="flex flex-col items-center justify-center">
          {!showRoomOptions && (
            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="px-4 py-2 rounded-lg border-2 border-gray-700 focus:outline-none focus:border-blue-500 w-64"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                Enter
              </button>
            </form>
          )}
          {showRoomOptions && (
            <div>
              <button
                onClick={() => {
                  setIsRoomCreator(true);
                  handleGenerateRoomCode();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                Create Room
              </button>
              {showRoomScreen && (
                <div className="flex flex-col items-center justify-center">
                  <h1 className="text-3xl font-bold mb-4">
                    {playerName} has entered the room
                  </h1>
                  <p className="text-lg font-bold">Room Code: {roomCode}</p>
                  <button
                    onClick={() => setGameStarted(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 mt-4"
                  >
                    Start Game
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <button
          onClick={() => setGameStarted(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          PLAY GAME
        </button>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r rounded-xl from-teal-500 via-slate-500 to-rose-500 flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-30 backdrop-blur-lg rounded-3xl p-8 w-full max-w-2xl shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            {!showRoomScreen ? (
              <>
                <h1 className="text-4xl font-bold mb-4 text-white">
                  Tic Tac Toe Shift - Strategic Board Game
                </h1>
                <p className="text-lg text-white mb-6">
                  Experience the classic game with a twist! Place your pieces,
                  then shift them strategically. Challenge AI or play with
                  friends in this exciting new take on Tic Tac Toe.
                </p>
                {!gameMode ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => setGameMode("singleplayer")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                    >
                      Single Player (vs AI)
                    </button>
                    <button
                      onClick={() => setGameMode("multiplayer")}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                    >
                      Multiplayer (with Friend)
                    </button>
                  </div>
                ) : (
                  handlePlayGame()
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold mb-4">
                  {playerName} has entered the room
                </h1>
                <p className="text-lg font-bold">Room Code: {roomCode}</p>
                <button
                  onClick={() => setGameStarted(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 mt-4"
                >
                  Start Game
                </button>
              </div>
            )}
          </div>
          <div className="w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
            <div className="text-6xl text-white font-bold">T³S</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLauncher;
