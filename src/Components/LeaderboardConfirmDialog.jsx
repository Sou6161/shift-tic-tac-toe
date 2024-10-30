import React from "react";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";

const LeaderboardConfirmDialog = ({ isOpen, onClose, onConfirm }) => {
  return (
    <div className={`fixed inset-0 z-10 ${isOpen ? "block" : "hidden"}`}>
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75"
        onClick={() => onClose(false)}
      ></div>
      <div className="inline-block align-bottom bg-white mt-[40vh] ml-[25vw] rounded-lg text-left overflow-hidden shadow-xl transform transition-all">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
              <AiOutlineCheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3
                className="text-lg leading-6 font-medium text-gray-900"
                id="modal-headline"
              >
                Join Leaderboards
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Do you want to get into Leaderboards?
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:py-3 flex justify-end">
          <button
            className="bg-gray-200 inline-flex hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded mr-2"
            onClick={() => {
              onClose(false);
              if (onConfirm) onConfirm(false);
            }}
          >
            <AiOutlineCloseCircle className="mr-2 mt-1   text-red-500" />
            No
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
            onClick={() => {
              onClose(false);
              if (onConfirm) onConfirm(true);
            }}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardConfirmDialog;
