import React, { useState, useEffect } from 'react';
import LoginButton from './LoginButton';

const GameEndPopup = ({ handleRematch, playerData }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPopup, setShowPopup] = useState(true);

  const handleLogin = (isLoggedIn) => {
    setIsLoggedIn(isLoggedIn);
  };

  useEffect(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    if (storedLoginStatus === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  // const handleLogout = () => {
  //   localStorage.removeItem("isLoggedIn");
  //   setIsLoggedIn(false);
  // };

  return (
    <div>
      {/* {isLoggedIn && (
        <button
          className="bg-yellow-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded absolute top-4 right-4"
          onClick={handleLogout}
        >
          Logout
        </button>
      )} */}

      {isLoggedIn ? (
        <button
          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mt-4"
          onClick={() => {
            handleRematch();
            setShowPopup(false);
          }}
        >
          Rematch
        </button>
      ) : (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded shadow-md w-80">
            <h2 className="text-lg font-bold mb-4">Save your score</h2>
            <LoginButton handleLogin={handleLogin} />
            <div className="text-center mt-4">OR</div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                handleRematch();
                setShowPopup(false);
              }}
            >
              Rematch
            </button>
            <div className="text-sm text-gray-700 mt-4">
              Your score: {playerData.wins} wins / {playerData.gamesPlayed} games played
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameEndPopup;