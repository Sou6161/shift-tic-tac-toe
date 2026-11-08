import React, { useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import LoginButton from "./LoginButton";
import { useAuthStore } from "../store/authStore";

const OpponentGameEndPopup = ({ handleRematch, opponentMoves, isCreator, winner, myPiece, opponentName, onBack }) => {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = Boolean(user);
  const [, setShowPopup] = useState(true);

  const won = winner && winner === myPiece;
  const title =
    winner === "draw"
      ? "A draw."
      : winner === "opponent left"
      ? "Your opponent left."
      : won
      ? "You won it."
      : `${opponentName || winner} takes the round.`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#1F1A14]/40 p-4 backdrop-blur-[2px] sm:items-center">
      <div className="pop-in relative w-full max-w-[420px] rounded-[28px] border border-line bg-card p-7 text-ink shadow-lift">
        <button onClick={onBack} className="btn-ghost -ml-2 -mt-2">
          <ArrowLeft className="h-4 w-4" /> Leave table
        </button>

        <h2 className="font-display mt-4 text-[34px] font-medium leading-tight tracking-tight">
          {title}
        </h2>
        <p className="mt-2 text-[15px] text-muted">
          You made {opponentMoves.length} {opponentMoves.length === 1 ? "move" : "moves"}.
          {user &&
            ` Your record: ${user.stats.wins} ${user.stats.wins === 1 ? "win" : "wins"} from ${user.stats.gamesPlayed} ${
              user.stats.gamesPlayed === 1 ? "game" : "games"
            }.`}
        </p>

        {isCreator ? (
          <button
            className="btn-ink mt-6 w-full"
            onClick={() => {
              handleRematch();
              setShowPopup(false);
            }}
          >
            <RotateCcw className="h-4 w-4" /> Rematch
          </button>
        ) : (
          <p className="mt-6 rounded-2xl bg-sunk px-4 py-3 text-center text-[14px] text-muted">
            Waiting for the host to call a rematch…
          </p>
        )}

        {!isLoggedIn && (
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-5">
            <span className="text-[14px] text-muted">Sign in so your next wins count.</span>
            <LoginButton compact />
          </div>
        )}

        {opponentMoves.length > 0 && (
          <details className="mt-5 border-t border-line pt-4">
            <summary className="cursor-pointer text-[14px] font-medium text-muted hover:text-ink">Your moves</summary>
            <ol className="mt-3 max-h-40 space-y-1 overflow-y-auto font-mono text-[12px] text-muted">
              {opponentMoves.map((move, index) => (
                <li key={index}>
                  {index + 1}.{" "}
                  {move.move.length > 1 ? `shift ${move.move[0] + 1} → ${move.move[1] + 1}` : `place ${move.move[0] + 1}`}
                </li>
              ))}
            </ol>
          </details>
        )}
      </div>
    </div>
  );
};

export default OpponentGameEndPopup;