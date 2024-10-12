const GameInfo = ({
  currentPlayer,
  winner,
  onReset,
  movesX,
  movesO,
  isAIThinking,
  timeLeft,
  playerSymbol,
}) => {
  const isShiftingPhase = movesX >= 3 && movesO >= 3;

  const getPlayerDisplay = () => {
    return `Current Player: ${
      currentPlayer === "O" ? "AI" : currentPlayer
    }`;
  };

  const getTurnText = () => {
    if (winner) return "";
    return isAIThinking
      ? "AI is thinking..."
      : `Current Player: ${currentPlayer}`;
  };

  const getTimeLeftText = () => {
    return `Time Left: ${timeLeft}s`;
  };

  return (
    <div className="text-center text-white mt-6">
      {winner ? (
        <h2 className="text-2xl font-semibold mb-4">
          {winner === "O" ? "AI" : "Player X"} wins!
        </h2>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold mb-4">{getTurnText()}</h2>
          <p className="text-xl mb-2">You are Player X</p>
          <p className="text-xl mb-2">{getTimeLeftText()}</p>
          {!isShiftingPhase && (
            <p className="text-lg mb-4">
              Moves left - X: {Math.max(0, 3 - movesX)}, AI:{" "}
              {Math.max(0, 3 - movesO)}
            </p>
          )}
          <p className="text-lg mb-4">
            {isShiftingPhase ? "Shifting phase" : "Placement phase"}
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