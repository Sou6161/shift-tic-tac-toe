import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";  


const MultiplayerLobby = ({ onGameStart }) => {
  const [socket, setSocket] = useState(null);
  const [gameId, setGameId] = useState("");
  const [inputGameId, setInputGameId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [playersReady, setPlayersReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  useEffect(() => {
    const newSocket = io("http://localhost:8080", {
        reconnectionAttempts: 10,
        timeout: 20000,
        transports: ["polling", "websocket"],
      });

    newSocket.on("connect", () => {
      console.log("Connected to server");
      setConnectionStatus("Connected");
      setSocket(newSocket);
      setError("");
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setConnectionStatus("Connection failed");
      setError(`Failed to connect to server: ${err.message}`);
    });

    newSocket.on("error", (errorMessage) => {
      console.error("Server error:", errorMessage);
      setError(`Server error: ${errorMessage}`);
    });

    return () => {
      if (newSocket) newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("roomCreated", (id) => {
      console.log("Room created:", id);
      setGameId(id);
      setIsHost(true);
      setError("");
    });

    socket.on("joinedRoom", () => {
      setPlayersReady(true);
      setError("");
    });

    socket.on("playerJoined", () => {
      setPlayersReady(true);
    });

    socket.on("joinError", (message) => {
      setError(message);
      setIsJoining(false);
    });

    return () => {
      socket.off("roomCreated");
      socket.off("joinedRoom");
      socket.off("playerJoined");
      socket.off("joinError");
    };
  }, [socket]);

  const createRoom = () => {
    if (!socket) {
      setError("Not connected to server");
      return;
    }
    setError("");
    console.log("Creating room...");
    socket.emit("createRoom");
  };

  const joinRoom = () => {
    if (!inputGameId.trim()) {
      setError("Please enter a game ID");
      return;
    }
    setIsJoining(true);
    setError("");
    socket.emit("joinRoom", inputGameId);
  };

  const startGame = () => {
    socket.emit("startGame", gameId);
    onGameStart(socket, isHost);
    socket.emit("nextTurn", { gameId }); // Emit next turn event
  };

  return (
    <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white text-center">
        Multiplayer Lobby
      </h2>

      <p className="text-white mb-4 text-center">{connectionStatus}</p>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      {!gameId && !isJoining && connectionStatus === "Connected" && (
        <div className="space-y-4">
          <button
            onClick={createRoom}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            Create Room
          </button>
          <button
            onClick={() => setIsJoining(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            Join Room
          </button>
        </div>
      )}

      {gameId && (
        <div className="text-center">
          <p className="text-black mb-4">
            Game ID: <span className="font-bold text-red-600">{gameId}</span>
          </p>
          <p className="text-purple-500 mb-4">Share this ID with your opponent</p>
        </div>
      )}

      {isJoining && !gameId && (
        <div className="space-y-4">
          <input
            type="text"
            value={inputGameId}
            onChange={(e) => setInputGameId(e.target.value)}
            placeholder="Enter Game ID"
            className="w-full p-2 rounded-lg"
          />
          <button
            onClick={joinRoom}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            Join
          </button>
        </div>
      )}

      {playersReady && (
        <button
          onClick={startGame}
          className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg"
        >
          Start Game
        </button>
      )}
    </div>
  );
};

export default MultiplayerLobby;
