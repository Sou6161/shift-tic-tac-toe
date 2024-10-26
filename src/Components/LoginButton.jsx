import React, { useEffect, useState } from "react";
import { signIn, signUp, signOut, checkSession } from "../lib/auth";

const LoginButton = ({ handleLogin }) => {
  const [showForm, setShowForm] = useState(false);
  const [signInView, setSignInView] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const session = await checkSession();
        const loginStatus = !!session;
        setIsLoggedIn(loginStatus);
        handleLogin(loginStatus);
      } catch (error) {
        console.error("Session check error:", error);
        setIsLoggedIn(false);
        handleLogin(false);
      }
    };
    
    checkLoginStatus();
  }, [handleLogin]);


  // useEffect(() => {
  //   const storedLoginStatus = localStorage.getItem("isLoggedIn");
  //   if (storedLoginStatus === "true") {
  //     setIsLoggedIn(true);
  //   }
  // }, []);

   const handleSubmitSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await signUp(email, password, name);
      setIsLoggedIn(true);
      handleLogin(true);
      setShowForm(false);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSubmitSignIn = async (e) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      setIsLoggedIn(true);
      handleLogin(true);
      setShowForm(false);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
      handleLogin(false);
      setShowForm(false);
      setSignInView(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleSignIn = () => {
    setSignInView(true);
    setShowForm(true);
  };

  const toggleSignUp = () => {
    setSignInView(false);
    setShowForm(true);
  };

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <div>
       {isLoggedIn ? (
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Login
        </button>
      )}
       { showForm && ( // Only show popup when not logged in
        <div
          className={
            showForm
              ? "absolute right-14 mt- z-10 top-12 bg-white p-4 rounded shadow-md w-80"
              : "hidden"
          }
        >
          {signInView ? (
            <form onSubmit={handleSubmitSignIn}>
              <h4 className="text-lg font-bold mb-4">Sign In</h4>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Sign In
              </button>
              <p className="text-sm text-gray-700 mt-4">
                Don't have an account?{" "}
                <span
                  className="text-blue-500 cursor-pointer"
                  onClick={toggleSignUp}
                >
                  Sign Up
                </span>
              </p>
              {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
          ) : (
            <form onSubmit={handleSubmitSignUp}>
              <h4 className="text-lg font-bold mb-4">Sign Up</h4>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Sign Up
              </button>
              <p className="text-sm text-gray-700 mt-4">
                Already have an account?{" "}
                <span
                  className="text-blue-500 cursor-pointer"
                  onClick={toggleSignIn}
                >
                  Sign In
                </span>
              </p>
              {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default LoginButton;
