import React from 'react';

const GameInfo = ({ currentPlayer, winner, onReset, movesX, movesO }) => {
  const isShiftingPhase = movesX >= 3 && movesO >= 3;

  return (
    <div className="text-center">
      {winner ? (
        <h2 className="text-2xl font-semibold mb-4">
          Player {winner} wins!
        </h2>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Current Player: {currentPlayer}
          </h2>
          {!isShiftingPhase && (
            <p className="text-lg mb-4">
              Moves left: X: {Math.max(0, 3 - movesX)}, O: {Math.max(0, 3 - movesO)}
            </p>
          )}
          <p className="text-lg mb-4">
            {isShiftingPhase ? 'Shifting phase' : 'Placement phase'}
          </p>
        </div>
      )}
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        onClick={onReset}
      >
        Reset Game
      </button>
    </div>
  );
};

export default GameInfo;