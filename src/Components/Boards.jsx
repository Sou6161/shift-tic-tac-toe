import React, { useState } from 'react';
import Cell from './Cell';

const Board = ({ board, onMove, onShift, canShift, currentPlayer }) => {
  const [selectedCell, setSelectedCell] = useState(null);

  const handleCellClick = (index) => {
    if (!canShift) {
      onMove(index);
    } else if (selectedCell === null) {
      if (board[index] === currentPlayer) {
        setSelectedCell(index);
      }
    } else {
      if (board[index] === null) {
        onShift(selectedCell, index);
        setSelectedCell(null);
      } else if (board[index] === currentPlayer) {
        setSelectedCell(index);
      }
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2 mb-8">
      {board.map((cell, index) => (
        <Cell
          key={index}
          value={cell}
          onClick={() => handleCellClick(index)}
          isSelected={index === selectedCell}
          canShift={canShift}
        />
      ))}
    </div>
  );
};

export default Board;