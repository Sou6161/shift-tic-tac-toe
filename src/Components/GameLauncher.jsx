import React, { useState } from "react";
import TicTacToeShift from "./TicTacToeShift";
import MultiplayerLobby from "./MultiplayerLobby";

const GameLauncher = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isHost, setIsHost] = useState(false);

  const handleMultiplayerStart = (socketInstance, hostStatus) => {
    setSocket(socketInstance);
    setIsHost(hostStatus);
    setGameStarted(true);
  };

  if (gameStarted && gameMode === 'multiplayer') {
    return <TicTacToeShift gameMode={gameMode} socket={socket} isHost={isHost} />;
  }

  if (gameStarted && gameMode === 'singleplayer') {
    return <TicTacToeShift gameMode={gameMode} />;
  }

  if (gameMode === 'multiplayer' && !gameStarted) {
    return <MultiplayerLobby onGameStart={handleMultiplayerStart} />;
  }

  
  return (
    <div className="min-h-screen bg-gradient-to-r rounded-xl from-teal-500 via-slate-500 to-rose-500 flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-30 backdrop-blur-lg rounded-3xl p-8 w-full max-w-2xl shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4 text-white">
              Tic Tac Toe Shift - Strategic Board Game
            </h1>
            <p className="text-lg text-white mb-6">
              Experience the classic game with a twist! Place your pieces, then
              shift them strategically. Challenge AI or play with friends in
              this exciting new take on Tic Tac Toe.
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
              <button
                onClick={() => setGameStarted(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                PLAY GAME
              </button>
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
