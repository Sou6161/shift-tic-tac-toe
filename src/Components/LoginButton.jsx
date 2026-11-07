import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X as Close, LogOut } from "lucide-react";
import { signIn, signUp, signOut, checkSession } from "../lib/auth";

const LoginButton = ({ handleLogin = () => {}, onLoginSuccess, compact = false }) => {
  const [showForm, setShowForm] = useState(false);
  const [signInView, setSignInView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  const checkLoginStatus = async () => {
    try {
      const session = await checkSession();
      const loginStatus = !!session;
      setIsLoggedIn(loginStatus);
      setUsername(localStorage.getItem("username") || "");
      handleLogin(loginStatus);
    } catch (error) {
      console.error("Session check error:", error);
      setIsLoggedIn(false);
      handleLogin(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
    const handleAuthChange = () => checkLoginStatus();
    window.addEventListener("authStateChanged", handleAuthChange);
    return () => window.removeEventListener("authStateChanged", handleAuthChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!showForm) return;
    const onKey = (e) => e.key === "Escape" && setShowForm(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showForm]);

  const finishAuth = async () => {
    setIsLoggedIn(true);
    handleLogin(true);
    if (onLoginSuccess) onLoginSuccess();
    setShowForm(false);
    setError(null);
    await checkLoginStatus();
  };

  const handleSubmitSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Those passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await signUp(email, password, name);
      await finishAuth();
    } catch (error) {
      console.error("Sign up error:", error);
      setError(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitSignIn = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signIn(email, password);
      await finishAuth();
    } catch (error) {
      console.error("Sign in error:", error);
      setError(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
      handleLogin(false);
      setShowForm(false);
      await checkLoginStatus();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const switchView = (toSignIn) => {
    setSignInView(toSignIn);
    setError(null);
  };

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        {!compact && username && (
          <span className="hidden items-center gap-2 text-[14px] font-medium text-muted sm:inline-flex">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-mustard font-display text-[14px] font-semibold text-[#1F1A14]">
              {username.charAt(0).toUpperCase()}
            </span>
            {username}
          </span>
        )}
        <button onClick={handleLogout} className="btn-ghost text-[14px]" title="Sign out">
          <LogOut className="h-4 w-4" />
          <span className={compact ? "" : "hidden sm:inline"}>Sign out</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="rounded-full border border-line bg-card px-4 py-2 text-[14px] font-semibold text-ink transition-colors hover:border-ink"
      >
        Sign in
      </button>

      {showForm && createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-[#1F1A14]/40 p-4 backdrop-blur-[2px] sm:items-center"
          onMouseDown={(e) => e.target === e.currentTarget && setShowForm(false)}
          role="dialog"
          aria-modal="true"
          aria-label={signInView ? "Sign in" : "Create an account"}
        >
          <div className="pop-in relative w-full max-w-[400px] rounded-[28px] border border-line bg-card p-7 text-left text-ink shadow-lift">
            <button
              onClick={() => setShowForm(false)}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-ink"
              aria-label="Close"
            >
              <Close className="h-4 w-4" />
            </button>

            <h4 className="font-display text-[28px] font-medium tracking-tight">
              {signInView ? "Welcome back." : "Grab a seat."}
            </h4>
            <p className="mt-1 text-[14px] text-muted">
              {signInView
                ? "Sign in to keep your record and join the table talk."
                : "An account keeps your wins on the books."}
            </p>

            <form onSubmit={signInView ? handleSubmitSignIn : handleSubmitSignUp} className="mt-6 space-y-3">
              {!signInView && (
                <input
                  type="text"
                  className="field"
                  placeholder="Your name"
                  aria-label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}
              <input
                type="email"
                className="field"
                placeholder="Email"
                aria-label="Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                className="field"
                placeholder="Password"
                aria-label="Password"
                autoComplete={signInView ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {!signInView && (
                <input
                  type="password"
                  className="field"
                  placeholder="Password, once more"
                  aria-label="Confirm password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              )}

              {error && (
                <p className="rounded-xl bg-xred/10 px-3 py-2 text-[14px] text-xred">{error}</p>
              )}

              <button type="submit" className="btn-ink mt-2 w-full" disabled={busy}>
                {busy ? "One sec…" : signInView ? "Sign in" : "Create account"}
              </button>
            </form>

            <p className="mt-5 text-center text-[14px] text-muted">
              {signInView ? "New here? " : "Already have an account? "}
              <button
                type="button"
                className="font-semibold text-ink underline decoration-mustard decoration-2 underline-offset-4"
                onClick={() => switchView(!signInView)}
              >
                {signInView ? "Make an account" : "Sign in"}
              </button>
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default LoginButton;
