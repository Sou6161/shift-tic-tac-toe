import React, { useState, useEffect } from "react";
import io from "socket.io-client";
// import GameEndPopup from "./GameEndPopup";
import OpponentGameEndPopup from "./OpponentGameEndPopup";
import { Copy } from "lucide-react";

const socket = io("http://localhost:8080");

const TicTacToeShift = ({ isDark }) => {
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
  const [timer, setTimer] = useState(20);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [playerData, setPlayerData] = useState({
    totalMoves: 0,
    wins: 0,
    gamesPlayed: 0,
  });

  const [opponentData, setOpponentData] = useState({
    wins: 0,
    gamesPlayed: 0,
  });

  const [myMoves, setMyMoves] = useState([]);
  const [opponentMoves, setOpponentMoves] = useState([]);
  const [myMoveCount, setMyMoveCount] = useState(0);
  const [opponentMoveCount, setOpponentMoveCount] = useState(0);
  const [playerMoves, setPlayerMoves] = useState({ X: [], O: [] });
  const [showRoomControls, setShowRoomControls] = useState(false);

  const handleBack = () => {
    // Reset necessary state
    setGameState("initial");
    setBoard(Array(9).fill(null));
    setWinner(null);
    setMoveCount(0);
    setMyMoves([]);
    setOpponentMoves([]);
    setMyMoveCount(0);
    setOpponentMoveCount(0);
    setShowPopup(false);

    // Emit a leave room event if needed
    socket.emit("leaveRoom", roomCode);

    // Reset room-related state
    setRoomCode("");
    setOpponentName("");
    setIsCreator(false);
  };

  const handleRematch = () => {
    // Reset game state for creator
    setGameState("playing");
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
    setMoveCount(0);
    setTimer(20);
    setIsMyTurn(isCreator);
    setTimerActive(isCreator);
    setSelectedCell(null);
    setMyMoves([]);
    setOpponentMoves([]);
    setMyMoveCount(0);
    setOpponentMoveCount(0);
    setShowPopup(false);

    // Emit rematch event to server
    socket.emit("rematch", { room: roomCode });
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      setShowRoomControls(true);
    }
  };

  const handleLeaveRoom = () => {
    socket.emit("leaveRoom", roomCode);
    // Reset all necessary state variables
    setRoomCode("");
    setOpponentName("");
    setGameState("initial");
    setShowPopup(false);
    setShowRoomControls(false); // Reset room controls visibility
    setName(""); // Clear the name input
    setRoom(""); // Clear the room input
    // Reset game-related states
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
    setMoveCount(0);
    setMyMoves([]);
    setOpponentMoves([]);
    setMyMoveCount(0);
    setOpponentMoveCount(0);
    setIsCreator(false);
  };

  const handleCreateRoom = () => {
    socket.emit("createRoom", name);
  };

  useEffect(() => {
    const board = localStorage.getItem("gameBoard");
    const moves = localStorage.getItem("moves");
    if (board) setBoard(JSON.parse(board));
    if (moves) setMoves(JSON.parse(moves));
  }, []);

  useEffect(() => {
    socket.on("gameUpdated", (data) => {
      setGameState(data.gameState);
      setBoard(data.board);
      setCurrentPlayer(data.currentPlayer);
      setMoveCount(data.moveCount);
      setTimer(data.timer);
      setPlayerMoves(data.playerMoves);
      setMyMoveCount(data.moveCount);
      setOpponentMoveCount(data.moveCount);
      setShowPopup(false); // Hide OpponentGameEndPopup
    });
  }, []);

  useEffect(() => {
    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      // Reconnect after a short delay
      setTimeout(() => {
        socket.io.reconnect();
      }, 1000);
    });
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
      setTimer(20);
      setIsMyTurn(isCreator);
      setTimerActive(isCreator);
    });

    socket.on("updateBoard", (newBoard) => {
      setBoard(newBoard);
      setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
      setMoveCount((prev) => prev + 1);
      setTimer(20);
      setIsMyTurn((prev) => !prev);
      setTimerActive((prev) => !prev);
    });

    socket.on("updateMoveCounts", (counts) => {
      if (isCreator) {
        setMyMoveCount(counts.X);
        setOpponentMoveCount(counts.O);
      } else {
        setMyMoveCount(counts.O);
        setOpponentMoveCount(counts.X);
      }
    });

    socket.on("gameOver", (data) => {
      setWinner(data.winner);
      setTimerActive(false);
      if (isCreator) {
        setMyMoveCount(data.moveCounts.X);
      } else {
        setMyMoveCount(data.moveCounts.O);
      }

      // Update player score
      if (data.winner === (isCreator ? "X" : "O")) {
        setPlayerData((prevData) => ({
          ...prevData,
          wins: prevData.wins + 1,
          gamesPlayed: prevData.gamesPlayed + 1,
        }));
      } else {
        setPlayerData((prevData) => ({
          ...prevData,
          gamesPlayed: prevData.gamesPlayed + 1,
        }));
      }
    });

    socket.on("opponentLeft", () => {
      setGameState("abandoned");
      setWinner("opponent left");
      setShowPopup(true);
      setTimeout(() => {
        setGameState("waiting");
        setShowPopup(false);
      }, 5000); // Reset game state after 5 seconds
    });

    socket.on("playerLeft", (name) => {
      if (gameState === "playing" || gameState === "waiting") {
        // Update opponent's name to empty string
        setOpponentName("");

        // Update game state to 'waiting'
        setGameState("waiting");

        // Show a message indicating the player has left
        alert(`${name} has left the game`);

        // Optionally, reset the board and move count
        setBoard(Array(9).fill(null));
        setMoveCount(0);
      }
    });

    socket.on("updateTimer", (newTimer) => {
      setTimer(newTimer);
    });

    socket.on("turnChange", (newCurrentPlayer) => {
      setCurrentPlayer(newCurrentPlayer);
      setIsMyTurn(
        (isCreator && newCurrentPlayer === "X") ||
          (!isCreator && newCurrentPlayer === "O")
      );
      setTimerActive(
        (isCreator && newCurrentPlayer === "X") ||
          (!isCreator && newCurrentPlayer === "O")
      );
      setTimer(20);
    });

    socket.on("updateMoves", (data) => {
      const isMyMove =
        (isCreator && data.player === "X") ||
        (!isCreator && data.player === "O");

      if (isMyMove) {
        setMyMoveCount(data.moveCount);
      }
    });

    socket.on("rematchInitiated", () => {
      // Reset game state for opponent
      setGameState("playing");
      setBoard(Array(9).fill(null));
      setCurrentPlayer("X");
      setWinner(null);
      setMoveCount(0);
      setTimer(20);
      setIsMyTurn(!isCreator); // Opponent's turn will be opposite of creator's
      setTimerActive(!isCreator);
      setSelectedCell(null);
      setMyMoves([]);
      setOpponentMoves([]);
      setMyMoveCount(0);
      setOpponentMoveCount(0);
      setShowPopup(false);
    });

    socket.on("rematchAccepted", (data) => {
      // Reset game state for ALL players
      setGameState("playing");
      setBoard(data.board);
      setCurrentPlayer(data.currentPlayer);
      setWinner(null);
      setMoveCount(data.moveCount);
      setTimer(data.timer);
      setIsMyTurn(isCreator); // Creator (X) starts first
      setTimerActive(isCreator);
      setSelectedCell(null);
      setMyMoves([]);
      setOpponentMoves([]);
      setMyMoveCount(0);
      setOpponentMoveCount(0);
      setShowPopup(false);
    });

    return () => {
      socket.off("roomCreated");
      socket.off("roomJoined");
      socket.off("opponentJoined");
      socket.off("gameStarted");
      socket.off("updateBoard");
      socket.off("updateMoves");
      socket.off("gameOver");
      socket.off("turnChange");
      socket.off("rematchInitiated");
      socket.off("rematchAccepted");
      socket.off("disconnect");
    };
  }, [isCreator, socket]);

  useEffect(() => {
    socket.on("rematch", () => {
      // Reset game state
      setGameState("playing");
      setBoard(Array(9).fill(null));
      setCurrentPlayer("X");
      setWinner(null);
      setMoveCount(0);
      setTimer(20);
      setIsMyTurn(isCreator);
      setTimerActive(isCreator);
      setSelectedCell(null);

      // Reset moves data for both players
      setMyMoves([]);
      setOpponentMoves([]);
      setMyMoveCount(0);
      setOpponentMoveCount(0);
    });
  }, [isCreator, roomCode]);

  useEffect(() => {
    let interval;
    if (gameState === "playing" && timerActive && !winner) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer > 0) {
            return prevTimer - 1;
          } else {
            socket.emit("timeUp", { room: roomCode });
            return 0;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timerActive, winner, roomCode]);

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
    if (winner || !isMyTurn) return;

    if (moveCount < 6) {
      if (!board[index]) {
        const newBoard = [...board];
        newBoard[index] = currentPlayer;

        // Only track my move
        const timestamp = Date.now();
        const moveData = {
          move: [index],
          timestamp: timestamp,
        };

        setMyMoves((prevMoves) => [...prevMoves, moveData]);

        socket.emit("move", {
          room: roomCode,
          board: newBoard,
          player: currentPlayer,
          timestamp: timestamp,
          move: [index],
        });
      }
    } else {
      if (selectedCell === null) {
        if (board[index] === currentPlayer) {
          setSelectedCell(index);
        }
      } else {
        if (index !== selectedCell && !board[index]) {
          const newBoard = [...board];
          newBoard[index] = newBoard[selectedCell];
          newBoard[selectedCell] = null;

          // Only track my move
          const timestamp = Date.now();
          const moveData = {
            move: [selectedCell, index],
            timestamp: timestamp,
          };

          setMyMoves((prevMoves) => [...prevMoves, moveData]);

          socket.emit("move", {
            room: roomCode,
            board: newBoard,
            player: currentPlayer,
            timestamp: timestamp,
            move: [selectedCell, index],
          });
          setSelectedCell(null);
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
    <div className="flex flex-col items-center justify-center min-h-screen -mt-[10vh] rounded-lg bg-gray-900 w-[70vw]">
      {gameState === "initial" && (
        <div className="space-y-4">
          <form
            onSubmit={handleNameSubmit}
            className="flex flex-col items-center gap-4"
          >
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 py-2 border rounded w-64 text-center"
            />
            {!showRoomControls && (
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Enter
              </button>
            )}
          </form>

          {showRoomControls && (
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={createRoom}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors w-64"
              >
                Create Room
              </button>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter room code"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="px-4 py-2 border rounded w-48"
                />
                <button
                  onClick={joinRoom}
                  className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Join Room
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {gameState === "waiting" && isCreator && (
        <div className="text-center text-white">
          <p>Waiting for opponent to join...</p>
          <div className="flex items-center">
            <p>Room Code: {roomCode}</p>
            <button
              className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold p-1 rounded"
              onClick={() => {
                navigator.clipboard.writeText(roomCode);
                // alert("Copied to clipboard!");
              }}
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
          <button
            className="bg-lime-400 p-2 rounded-lg text-black font-bold mt-5"
            onClick={handleLeaveRoom}
          >
            Leave Room
          </button>
        </div>
      )}

      {gameState === "waiting" && !isCreator && (
        <div className="text-center text-white">
          <p>Waiting for the game to start...</p>
          <p>Room Code: {roomCode}</p>
          <p>Opponent: {opponentName}</p>
        </div>
      )}

      {gameState === "ready" && isCreator && (
        <div className="text-center text-white">
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
          <div className="mt-4 space-y-2 text-white">
            <p>Your moves: {myMoveCount}</p>
            {myMoves.length > 0 && (
              <div className="mt-2">
                <h3>Your Move History:</h3>
                <ul>
                  {myMoves.map((move, index) => (
                    <li key={index}>
                      Move {index + 1}: Position
                      {move.move.length > 1 ? "s" : ""} {move.move.join(" → ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {winner ? (
              <p className="text-4xl font-bold">
                {winner === "draw" ? "It's a draw!" : `${winner} wins!`}
              </p>
            ) : (
              <div>
                <p>Current player: {currentPlayer}</p>
                <p>Timer: {isMyTurn ? timer : "-"} seconds</p>
                {moveCount >= 6 && (
                  <p>
                    {isMyTurn
                      ? selectedCell === null
                        ? "Your turn: Select a piece to move"
                        : "Now select an empty space to move your piece"
                      : `Waiting for ${opponentName}'s move`}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {gameState === "abandoned" && (
        <div>
          <h2>Game Abandoned!</h2>
          <h2>{winner}</h2>
          <button onClick={handleCreateRoom}>Create New Room</button>
        </div>
      )}

      {gameState === "playing" && winner !== null && (
        <OpponentGameEndPopup
          handleRematch={handleRematch}
          playerData={playerData}
          opponentMoves={myMoves}
          isCreator={isCreator}
          isDark={isDark}
          winner={winner}
          onBack={handleBack} // Add this line
        />
      )}
    </div>
  );
};

export default TicTacToeShift;
