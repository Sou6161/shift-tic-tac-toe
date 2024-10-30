const PlayerMoves = ({ playerMoves }) => {
    const [moves, setMoves] = useState([]);
  
    useEffect(() => {
      setMoves(playerMoves[currentPlayer]);
    }, [playerMoves, currentPlayer]);
  
    return (
      <div>
        <h2>Player Moves:</h2>
        <ul>
          {moves.map((move, index) => (
            <li key={index}>
              Move {index + 1}: {move.move.join(", ")} (Timestamp: {move.timestamp})
            </li>
          ))}
        </ul>
      </div>
    );
  };

  export default PlayerMoves;