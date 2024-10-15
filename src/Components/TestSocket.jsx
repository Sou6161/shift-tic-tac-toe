import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:8080');

function TestSocket() {
  const [roomCode, setRoomCode] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isRoomCreator, setIsRoomCreator] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);

  useEffect(() => {
    socket.on("roomCreated", (roomCode) => {
      console.log("Room created event received:", roomCode);
      setRoomId(roomCode);
      setShowRoomScreen(true);
      setIsRoomCreator(true);
      setRoomCode(roomCode);
      setMessage(`Room ${roomCode} created successfully`);
    });
    socket.on('roomJoined', () => {
      setIsInRoom(true);
    });

    socket.on('roomNotFound', () => {
      alert('Room not found');
    });

    socket.on('newMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('newPlayerJoined', (playerId) => {
      alert(`Player ${playerId} joined`);
    });

    socket.on('playerLeft', (playerId) => {
      alert(`Player ${playerId} left`);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.off('roomCreated');
      socket.off('roomJoined');
      socket.off('roomNotFound');
      socket.off('newMessage');
      socket.off('newPlayerJoined');
      socket.off('playerLeft');
      socket.off('disconnect');
    };
  }, []);

  const handleCreateRoom = () => {
    socket.emit('createRoom');
  };

  const handleJoinRoom = () => {
    socket.emit('joinRoom', roomCode);
  };

  const handleSendMessage = () => {
    socket.emit('sendMessage', roomCode, message);
    setMessage('');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {isRoomCreator ? (
        <div>
          <h2>Room Code: {roomCode}</h2>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleSendMessage}
          >
            Send Message
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border border-gray-400 rounded py-2 px-4"
          />
          <ul>
            {messages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      ) : isInRoom ? (
        <div>
          <h2>Room Code: {roomCode}</h2>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleSendMessage}
          >
            Send Message
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border border-gray-400 rounded py-2 px-4"
          />
          <ul>
            {messages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleCreateRoom}
          >
            Create Room
          </button>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="Enter Room Code"
            className="border border-gray-400 rounded py-2 px-4"
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleJoinRoom}
          >
            Join Room
          </button>
        </div>
      )}
    </div>
  );
}

export default TestSocket;