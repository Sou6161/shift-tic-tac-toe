import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:8080");

const TicTacToeShift = () => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [gameState, setGameState] = useState("initial");
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);
  const [moveCount, setMoveCount] = useState(0);
  const [roomCode, setRoomCode] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [opponentName, setOpponentName] = useState("");
  const [selectedCell, setSelectedCell] = useState(null);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    socket.on("roomCreated", (code) => {
      setRoomCode(code);
      setGameState("waiting");
      setIsCreator(true);
    });

    socket.on("roomJoined", (data) => {
      setRoomCode(data.room);
      setGameState("waiting");
      setIsCreator(false);
      setOpponentName(data.opponentName);
    });

    socket.on("opponentJoined", (opponentName) => {
      setOpponentName(opponentName);
      setGameState("ready");
    });

    socket.on("gameStarted", () => {
      setGameState("playing");
      setMoveCount(0);
      setBoard(Array(9).fill(null));
      setCurrentPlayer("X");
      setWinner(null);
      setTimer(30);
    });

    socket.on("updateBoard", (newBoard) => {
      setBoard(newBoard);
      setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
      setMoveCount((prev) => prev + 1);
      setTimer(30);
    });

    socket.on("gameOver", (winner) => setWinner(winner));

    socket.on("updateTimer", (newTimer) => {
      setTimer(newTimer);
    });

    return () => {
      socket.off("roomCreated");
      socket.off("roomJoined");
      socket.off("opponentJoined");
      socket.off("gameStarted");
      socket.off("updateBoard");
      socket.off("gameOver");
      socket.off("updateTimer");
    };
  }, []);

  const createRoom = () => {
    if (name) {
      socket.emit("createRoom", name);
    }
  };

  const joinRoom = () => {
    if (name && room) {
      socket.emit("joinRoom", { name, room });
    }
  };

  const startGame = () => {
    socket.emit("startGame", roomCode);
  };

  const handleCellClick = (index) => {
    if (winner || currentPlayer !== (isCreator ? "X" : "O")) return;

    if (moveCount < 6) {
      if (!board[index]) {
        const newBoard = [...board];
        newBoard[index] = currentPlayer;
        socket.emit("move", { room: roomCode, board: newBoard });
      }
    } else {
      if (selectedCell === null) {
        if (board[index] === currentPlayer) {
          setSelectedCell(index);
        }
      } else {
        if (index !== selectedCell) {
          if (!board[index]) {
            const newBoard = [...board];
            newBoard[index] = newBoard[selectedCell];
            newBoard[selectedCell] = null;
            socket.emit("move", { room: roomCode, board: newBoard });
            setSelectedCell(null);
          } else {
            setSelectedCell(null);
          }
        } else {
          setSelectedCell(null);
        }
      }
    }
  };

  const renderBoard = () => {
    return (
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, index) => (
          <button
            key={index}
            className={`w-20 h-20 text-4xl font-bold ${
              cell
                ? cell === "X"
                  ? "bg-blue-200"
                  : "bg-red-200"
                : "bg-gray-200"
            } ${selectedCell === index ? "border-4 border-yellow-400" : ""}`}
            onClick={() => handleCellClick(index)}
          >
            {cell}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {gameState === "initial" && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2 border rounded"
          />
          <div>
            <button
              onClick={createRoom}
              className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
            >
              Create Room
            </button>
            <input
              type="text"
              placeholder="Enter room code"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="px-4 py-2 border rounded mr-2"
            />
            <button
              onClick={joinRoom}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Join Room
            </button>
          </div>
        </div>
      )}

      {gameState === "waiting" && isCreator && (
        <div className="text-center">
          <p>Waiting for opponent to join...</p>
          <p>Room Code: {roomCode}</p>
        </div>
      )}

      {gameState === "waiting" && !isCreator && (
        <div className="text-center">
          <p>Waiting for the game to start...</p>
          <p>Room Code: {roomCode}</p>
          <p>Opponent: {opponentName}</p>
        </div>
      )}

      {gameState === "ready" && isCreator && (
        <div className="text-center">
          <p>Opponent {opponentName} has joined the room!</p>
          <p>Room Code: {roomCode}</p>
          <button
            onClick={startGame}
            className="px-4 py-2 bg-yellow-500 text-white rounded mt-4"
          >
            Start Game
          </button>
        </div>
      )}

      {gameState === "playing" && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">TicTacToe Shift</h2>
          {renderBoard()}
          {winner ? (
            <p className="mt-4 text-xl font-bold">
              {winner === "draw" ? "It's a draw!" : `${winner} wins!`}
            </p>
          ) : (
            <div>
              <p className="mt-4">Current player: {currentPlayer}</p>
              <p>Moves: {moveCount}</p>
              <p>Timer: {timer} seconds</p>
              {moveCount >= 6 && (
                <p>
                  {currentPlayer === (isCreator ? "X" : "O")
                    ? selectedCell === null
                      ? "Your turn: Select a piece to move"
                      : "Now select an empty space to move your piece"
                    : `${currentPlayer}'s turn`}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TicTacToeShift;