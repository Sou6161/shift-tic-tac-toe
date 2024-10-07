// GameInfo.jsx
const GameInfo = ({ 
  currentPlayer, 
  winner, 
  onReset, 
  movesX, 
  movesO, 
  isAIThinking, 
  gameMode,
  timeLeft,
  playerSymbol,
  isPlayerTurn
}) => {
  const isShiftingPhase = movesX >= 3 && movesO >= 3;

  const getPlayerDisplay = () => {
    if (gameMode === 'multiplayer') {
      return isPlayerTurn ? "Your turn" : "Opponent's turn";
    } else {
      return `Current Player: ${currentPlayer === 'O' && gameMode === 'singleplayer' ? 'AI' : currentPlayer}`;
    }
  };

  return (
    <div className="text-center text-white mt-6">
      {winner ? (
        <h2 className="text-2xl font-semibold mb-4">
          {gameMode === 'singleplayer' && winner === 'O' ? 'AI' : 
           gameMode === 'multiplayer' ? (winner === playerSymbol ? 'You' : 'Opponent') :
           `Player ${winner}`} wins!
        </h2>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            {isAIThinking ? 'AI is thinking...' : getPlayerDisplay()}
          </h2>
          {gameMode === 'multiplayer' && (
            <p className="text-xl mb-2">You are Player {playerSymbol}</p>
          )}
          <p className="text-xl mb-2">Time Left: {timeLeft}s</p>
          {!isShiftingPhase && (
            <p className="text-lg mb-4">
              Moves left - X: {Math.max(0, 3 - movesX)}, 
              {gameMode === 'singleplayer' ? ' AI' : ' O'}: {Math.max(0, 3 - movesO)}
            </p>
          )}
          <p className="text-lg mb-4">
            {isShiftingPhase ? 'Shifting phase' : 'Placement phase'}
          </p>
        </div>
      )}
      <button
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-200"
        onClick={onReset}
      >
        New Game
      </button>
    </div>
  );
};

export default GameInfo;