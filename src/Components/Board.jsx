import React from "react";

export const XPiece = ({ className = "", animate = true }) => (
  <svg
    viewBox="0 0 100 100"
    className={`${animate ? "piece-draw" : ""} ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="11"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path pathLength="100" d="M24 22 Q52 48 78 78" />
    <path pathLength="100" d="M77 23 Q50 50 23 77" />
  </svg>
);

export const OPiece = ({ className = "", animate = true }) => (
  <svg
    viewBox="0 0 100 100"
    className={`${animate ? "piece-draw" : ""} ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="11"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path pathLength="100" d="M50 20 C70 19 81 33 80 51 C79 69 66 81 49 80 C31 79 20 66 21 49 C22 32 33 21 52 21" />
  </svg>
);

export const Piece = ({ value, className = "", animate = true }) =>
  value === "X" ? (
    <XPiece className={`text-xred ${className}`} animate={animate} />
  ) : value === "O" ? (
    <OPiece className={`text-oteal ${className}`} animate={animate} />
  ) : null;

const Board = ({ board, onCellClick, selectedCell = null, disabled = false, showTargets = false }) => {
  return (
    <div className="relative mx-auto w-full max-w-[340px] rounded-[28px] bg-sunk p-3 shadow-tile">
      <div className="grid grid-cols-3 gap-2.5">
        {board.map((cell, index) => {
          const isSelected = selectedCell === index;
          const isTarget = showTargets && selectedCell !== null && !cell;
          return (
            <button
              key={index}
              type="button"
              aria-label={`Cell ${index + 1}${cell ? `, ${cell}` : ", empty"}`}
              onClick={() => onCellClick(index)}
              disabled={disabled}
              className={`group relative aspect-square rounded-[18px] bg-card shadow-tile transition-all duration-200 ease-out
                ${disabled ? "cursor-default" : "cursor-pointer hover:-translate-y-0.5"}
                ${isSelected ? "-translate-y-1 ring-[3px] ring-mustard shadow-lift" : ""}`}
            >
              {cell ? (
                <span key={`${index}-${cell}`} className="pop-in absolute inset-[16%] block">
                  <Piece value={cell} className="h-full w-full" />
                </span>
              ) : isTarget ? (
                <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mustard/80 transition-transform group-hover:scale-150" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Board;
