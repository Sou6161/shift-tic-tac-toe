import React, { useState } from 'react';

const LeaderBoards = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const totalItems = 10; // Replace with your actual total number of items
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const displayedItems = [1, 2, 3, 4, 5,6,7,8].slice(startIndex, endIndex); // Replace with your actual data

  return (
    <>
      <div className="container mx-auto p-4 mt-10">
        <h2 className="text-4xl font-bold text-center text-yellow-400 mb-10">Leaderboards</h2>

        <table className="w-full text-left text-gray-500 dark:text-gray-400 table-auto border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-gray-400 text-white backdrop-filter backdrop-blur-lg rounded-xl">
              <th scope="col" className="px-6 py-3">
                Player Name
              </th>
              <th scope="col" className="px-6 py-3">
                Matches Won
              </th>
              <th scope="col" className="px-6 py-3">
                Total Matches Played
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-00">
            {displayedItems.map((index) => (
              <tr
                key={index}
                className="bg-white text-stone-800 bg-opacity-30 backdrop-filter backdrop-blur-lg rounded-xl"
              >
                <td className="px-6 py-3 font-semibold">Player {index}</td>
                <td className="px-6 py-3 font-semibold">10</td>
                <td className="px-6 py-3 font-semibold">50</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-center mt-4">
          <button
            className={`px-4 py-2 rounded-md bg-blue-500 text-white mr-2 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className={`px-4 py-2 rounded-md bg-blue-500 text-white ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default LeaderBoards;