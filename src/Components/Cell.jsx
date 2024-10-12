import React from "react";

const Cell = ({ value, onClick, isSelected, canShift }) => {
  return (
    <button
      className={`w-20 h-20 text-4xl font-bold flex items-center text-black justify-center
${value ? "bg-blue-200" : "bg-white text-black"}
${isSelected ? "ring-4 ring-blue-500" : ""}
${canShift && !value ? "hover:bg-gray-200" : ""}
border border-gray-300 rounded-lg shadow-md
focus:outline-none focus:ring-2 focus:ring-blue-300`}
      onClick={onClick}
    >
      <h1 className="text-black">{value}</h1>
    </button>
  );
};

export default Cell;
