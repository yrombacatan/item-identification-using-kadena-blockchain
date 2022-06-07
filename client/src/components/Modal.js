import React from "react";
import OutsideClickHandler from "react-outside-click-handler";

const Modal = ({ children, onClose }) => {
  return (
    <div
      className="fixed top-0 left-0 w-full min-h-screen no overflow-hidden cursor-pointer"
      style={{ backgroundColor: "rgb(0, 0, 0, 0.2)" }}
    >
      <OutsideClickHandler onOutsideClick={onClose}>
        <div className="w-full md:w-3/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-5 pt-10 rounded-md shadow cursor-default">
          <div className="w-full h-5 absolute top-0 left-0 rounded-t-md bg-gray-200"></div>
          {children}
          <div className="flex justify-end">
            <button
              className="px-5 py-2 bg-gray-200 rounded shadow hover:bg-gray-100 transition-all"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </OutsideClickHandler>
    </div>
  );
};

export default Modal;
