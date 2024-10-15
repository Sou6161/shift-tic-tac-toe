import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import TicTacToeShift from "./TicTacToeShift";

const socket = io("http://localhost:8080");

const GameLauncher = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [players, setPlayers] = useState([]);
  const [showRoomScreen, setShowRoomScreen] = useState(false);
  const [showRoomOptions, setShowRoomOptions] = useState(false);
  const [message, setMessage] = useState("");
  const [isRoomCreator, setIsRoomCreator] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("playerJoined", (data) => {
      console.log("Player joined event received:", data);
      if (data && data.message) {
        setMessage(data.message);
      } else {
        console.error("Received playerJoined event with invalid data:", data);
      }
    });

    socket.on("updatePlayerList", (playersInRoom) => {
      console.log("Update player list event received:", playersInRoom);
      if (Array.isArray(playersInRoom)) {
        setPlayers(playersInRoom);
      } else {
        console.error(
          "Received updatePlayerList event with invalid data:",
          playersInRoom
        );
      }
    });

    socket.on("roomCreated", (roomCode) => {
      console.log("Room created event received:", roomCode);
      setRoomId(roomCode);
      setShowRoomScreen(true);
      setIsRoomCreator(true);
      setRoomCode(roomCode);
      setMessage(`Room ${roomCode} created successfully`);
    });

    socket.on("roomJoined", (roomCode) => {
      console.log("Room joined event received:", roomCode);
      setRoomId(roomCode);
      setShowRoomScreen(true);
      setMessage(`Joined room ${roomCode} successfully`);
    });

    socket.on("roomError", (errorMessage) => {
      console.error("Room error event received:", errorMessage);
      setError(errorMessage || "An error occurred. Please try again.");
    });

    socket.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("roomFull", () => {
      setError("Room is full. Please try another room.");
    });

    return () => {
      socket.off("connect");
      socket.off("playerJoined");
      socket.off("updatePlayerList");
      socket.off("roomCreated");
      socket.off("roomJoined");
      socket.off("roomError");
      socket.off("newMessage");
    };
  }, []);

  const handleCreateRoom = () => {
    socket.emit("createRoom");
  };

  const handleJoinRoom = () => {
    socket.emit("joinRoom", roomCode);
  };

  const handleSendMessage = () => {
    socket.emit("sendMessage", roomCode, message);
    setMessage("");
  };

  if (gameStarted && gameMode === "singleplayer") {
    return <TicTacToeShift gameMode={gameMode} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r rounded-xl from-teal-500 via-slate-500 to-rose-500 flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-30 backdrop-blur-lg rounded-3xl p-8 w-full max-w-2xl shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            {!gameMode ? (
              <>
                <h1 className="text-4xl font-bold mb-4 text-white">
                  Tic Tac Toe Shift - Strategic Board Game
                </h1>
                <p className="text-lg text-white mb-6">
                  Experience the classic game with a twist! Place your pieces,
                  then shift them strategically. Challenge AI or play with
                  friends in this exciting new take on Tic Tac Toe.
                </p>
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      console.log("Single player mode selected");
                      setGameMode("singleplayer");
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                  >
                    Single Player (vs AI)
                  </button>
                  <button
                    onClick={() => {
                      console.log("Multiplayer mode selected");
                      setGameMode("multiplayer");
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                  >
                    Multiplayer (with Friend)
                  </button>
                </div>
              </>
            ) : (
              <>
                {!showRoomOptions && (
                  <form onSubmit={(e) => e.preventDefault()}>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name"
                      className="px-4 py-2 rounded-lg border-2 border-gray-700 focus:outline-none focus:border-blue-500 w-64"
                    />
                    <button
                      onClick={() => setShowRoomOptions(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                    >
                      Enter
                    </button>
                  </form>
                )}
                {showRoomOptions && (
                  <div>
                    {gameMode === "multiplayer" ? (
                      <>
                        <button
                          onClick={handleCreateRoom}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                        >
                          Create Room
                        </button>
                        <input
                          type="text"
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value)}
                          placeholder="Enter room code"
                          className="px-4 py-2 mt- rounded-lg border-2 border-gray-700 focus:outline-none focus:border-blue-500 w-64"
                        />
                        <button
                          onClick={handleJoinRoom}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                        >
                          Join Room
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setGameStarted(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                      >
                        PLAY GAME
                      </button>
                    )}
                  </div>
                )}
                {showRoomScreen && gameMode === "multiplayer" && (
                  <div className="flex flex-col items-center justify-center">
                    <h1 className="text-xl font-bold mt-5 mb-5">
                      Room: {roomCode}
                    </h1>
                    {/* <p className="text-lg font-bold">{message}</p> */}
                    <div>
                      {/* <h2>Players in room:</h2> */}
                      {players.map((player, index) => (
                        <div key={index}>
                          <h3>{player}</h3>
                        </div>
                      ))}
                    </div>
                    {players.length === 2 && (
                      <button
                        onClick={() => {
                          console.log("Starting multiplayer game");
                          setGameStarted(true);
                        }}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 mt-4"
                      >
                        Start Game
                      </button>
                    )}
                    {players.length < 2 && players.includes(playerName) && (
                      <p>Waiting for another player to join...</p>
                    )}
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message"
                      className="px-4 py-2 mt- rounded-lg border-2 border-gray-700 focus:outline-none focus:border-blue-500 w-64"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                    >
                      Send Message
                    </button>
                    <ul>
                      {messages.map((message, index) => (
                        <li key={index}>{message}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {error && <p className="text-red-500">{error}</p>}
              </>
            )}
          </div>
          {!showRoomScreen && (
            <div className="w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
              <div className="text-6xl text-white font-bold">T³S</div>
            </div>
          )}
        </div>
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLauncher;
