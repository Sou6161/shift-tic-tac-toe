import React, { useState, useEffect } from "react";
import { getUserData } from "../lib/database";
import { account } from './appwrite';

const ProfilePage = () => {
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const userId = account.getUserId(); 
    if (userId) {
      getUserData(userId).then((data) => setUserData(data));
    } 
  }, []);

  return (
    <div>
      <h1>Profile Page</h1>
      <p>Email: {userData.email}</p>
      <p>Name: {userData.name}</p>
      <p>Score: {userData.score}</p>
      <p>Matches Played: {userData.matchesPlayed}</p>
    </div>
  );
};

export default ProfilePage;