import React from "react";

const MultiplayerLobby = ({
    gameMode,
    board,
    currentPlayer,
    gameOver,
    handleMakeMove,
    handleResetGame,
    roomId,
  }) => {
    return (
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-xl font-bold mt-5 mb-5">
            Tic Tac Toe Shift - {gameMode} Mode
          </h1>
          <div className="grid grid-cols-3 gap-4">
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-3 gap-4">
                {row.map((cell, cellIndex) => (
                  <div
                    key={cellIndex}
                    className="h-20 w-20 flex items-center justify-center border-2 border-gray-700 cursor-pointer"
                    onClick={() => handleMakeMove(rowIndex, cellIndex)}
                  >
                    {cell}
                  </div>
                ))}
                        </div>
        ))}
      </div>
      {gameOver && (
        <p className="text-lg font-bold">
          Game Over! Player {currentPlayer === "X" ? "O" : "X"} wins!
        </p>
      )}
      {!gameOver && (
        <p className="text-lg font-bold">Current Player: {currentPlayer}</p>
      )}
      <button
        onClick={handleResetGame}
        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 mt-4"
      >
        Reset Game
      </button>
    </div>
  );
};

export default MultiplayerLobby;