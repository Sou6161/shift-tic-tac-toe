import React, { useEffect, useState } from "react";
import { signIn, signUp, signOut, checkSession } from "../lib/auth";

const LoginButton = ({ handleLogin, onLoginSuccess }) => {
  const [showForm, setShowForm] = useState(false);
  const [signInView, setSignInView] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status whenever it might change
  const checkLoginStatus = async () => {
    try {
      const session = await checkSession();
      const loginStatus = !!session;
      console.log("Login status checked:", loginStatus); // Debug log
      setIsLoggedIn(loginStatus);
      handleLogin(loginStatus);
    } catch (error) {
      console.error("Session check error:", error);
      setIsLoggedIn(false);
      handleLogin(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();

    // Add listener for auth state changes
    const handleAuthChange = () => {
      checkLoginStatus();
    };

    window.addEventListener("authStateChanged", handleAuthChange);

    return () => {
      window.removeEventListener("authStateChanged", handleAuthChange);
    };
  }, []);

  const handleSubmitSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await signUp(email, password, name);
      console.log("Sign up successful"); // Debug log
      setIsLoggedIn(true);
      handleLogin(true);
      if (onLoginSuccess) onLoginSuccess();
      setShowForm(false);
      setError(null);
      await checkLoginStatus(); // Recheck login status after signup
    } catch (error) {
      console.error("Sign up error:", error); // Debug log
      setError(error.message);
    }
  };

  const handleSubmitSignIn = async (e) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      console.log("Sign in successful"); // Debug log
      setIsLoggedIn(true);
      handleLogin(true);
      if (onLoginSuccess) onLoginSuccess();
      setShowForm(false);
      setError(null);
      await checkLoginStatus(); // Recheck login status after signin
    } catch (error) {
      console.error("Sign in error:", error); // Debug log
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      console.log("Logout successful"); // Debug log
      setIsLoggedIn(false);
      handleLogin(false);
      setShowForm(false);
      setSignInView(false);
      await checkLoginStatus(); // Recheck login status after logout
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Debug log for current state
  // console.log("Current login state:", isLoggedIn);

  const toggleSignIn = () => {
    setSignInView(true);
    setShowForm(true);
  };

  const toggleSignUp = () => {
    setSignInView(false);
    setShowForm(true);
  };

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
          onClick={() => setShowForm(!showForm)} // Toggle showForm state
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {showForm ? "Close" : "SIGN UP OR SIGN IN"}
        </button>
      )}

      {showForm &&
        !isLoggedIn && ( // Only show popup when not logged in
          <div
            className={
              showForm
                ? "absolute right-[10vw] mt- z-10 top-[28vh] bg-white p-4 rounded shadow-md w-80"
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
                {error && <p className="text-red-500 mt-2">{error}</p>}
              </form>
            )}
          </div>
        )}
    </div>
  );
};

export default LoginButton;
