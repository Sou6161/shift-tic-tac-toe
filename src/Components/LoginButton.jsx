import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X as Close, LogOut, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../store/authStore";

// Defined outside LoginButton so it isn't recreated per keystroke, which would drop focus.
const PasswordField = ({ label, ...props }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} aria-label={label} className="field pr-12" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
        aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        aria-pressed={visible}
        title={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
      </button>
    </div>
  );
};

const LoginButton = ({ onLoginSuccess, compact = false }) => {
  const user = useAuthStore((s) => s.user);
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const signOut = useAuthStore((s) => s.signOut);

  const [showForm, setShowForm] = useState(false);
  const [signInView, setSignInView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!showForm) return;
    const onKey = (e) => e.key === "Escape" && setShowForm(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showForm]);

  const finishAuth = () => {
    if (onLoginSuccess) onLoginSuccess();
    setShowForm(false);
    setError(null);
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmitSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Those passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Use a password of at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      await signUp(name, email, password);
      finishAuth();
    } catch (error) {
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
      finishAuth();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    setShowForm(false);
    signOut();
  };

  const switchView = (toSignIn) => {
    setSignInView(toSignIn);
    setError(null);
  };

  if (user) {
    const username = user.name;
    const { wins, gamesPlayed } = user.stats;
    return (
      <div className="flex items-center gap-2">
        {!compact && (
          <span
            className="hidden items-center gap-2 text-[14px] font-medium text-muted sm:inline-flex"
            title={`${wins} ${wins === 1 ? "win" : "wins"} from ${gamesPlayed} ${gamesPlayed === 1 ? "game" : "games"}`}
          >
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
              <PasswordField
                label="Password"
                placeholder={signInView ? "Password" : "Password (8+ characters)"}
                autoComplete={signInView ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                required
              />
              {!signInView && (
                <PasswordField
                  label="Confirm password"
                  placeholder="Password, once more"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError(null);
                  }}
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
