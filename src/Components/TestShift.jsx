// code
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import 'tailwindcss/tailwind.css';
import 'react-toastify/dist/ReactToastify.css';

const SOCKET_SERVER_URL = 'https://socketio-multiplayer-feature.onrender.com';

const socket = io(SOCKET_SERVER_URL, {
  withCredentials: true,
  transports: ['websocket'],
  cors: {
    origin: window.location.origin,
  }
});

function TestShift() {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('roomCreated', (code) => {
      setCreatedRoomCode(code);
    });

    socket.on('roomJoined', () => {
      setJoinedRoom(true);
    });

    socket.on('playerJoined', (username) => {
      toast.success(`${username} joined the room`);
      setPlayers((prevPlayers) => [...prevPlayers, username]);
    });

    socket.on('gameStarted', () => {
      setGameStarted(true);
    });

    socket.on('error', (message) => {
      toast.error(message);
    });
  }, [socket]);

  const handleCreateRoom = () => {
    socket.emit('createRoom', username);
  };

  const handleJoinRoom = () => {
    socket.emit('joinRoom', roomCode, username);
  };

  const handleStartGame = () => {
    socket.emit('startGame');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {!username && (
        <input
          type="text"
          placeholder="Enter your name"
          className="p-2 mb-4 border border-gray-400"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      )}

      {!createdRoomCode && !joinedRoom && (
        <div>
          <input
            type="text"
            placeholder="Room Code (to join)"
            className="p-2 mb-4 border border-gray-400"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleJoinRoom}
          >
            Join Room
          </button>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleCreateRoom}
          >
            Create Room
          </button>
        </div>
      )}

      {createdRoomCode && (
        <div>
          <p>Room Code: {createdRoomCode}</p>
          <button
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleStartGame}
          >
            Start Game
          </button>
        </div>
      )}

      {joinedRoom && (
        <div>
          <p>Players in room:</p>
          <ul>
            {players.map((player, index) => (
              <li key={index}>{player}</li>
            ))}
          </ul>
        </div>
      )}

      {gameStarted && <TicTacToeShift />}
    </div>
  );
}

export default TestShift;