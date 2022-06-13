import React, { useState } from "react";
import FeatherIcon from "feather-icons-react";
import OutsideClickHandler from "react-outside-click-handler";
import Notification from "./Notification";

import { useNavigate } from "react-router-dom";

const NavSmallScreen = ({
  isOpenMenu,
  setOpenMenu,
  hasNotification,
  setHasNotification,
}) => {
  const navigate = useNavigate();
  const [isNotificationOpen, setNotificationOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("accountAddress");
    navigate("/");
  };

  const handleCloseBoth = () => {
    setNotificationOpen(false);
    setOpenMenu(false);
  };

  return (
    <OutsideClickHandler
      onOutsideClick={() => {
        setOpenMenu(false);
        setNotificationOpen(false);
      }}
    >
      <div
        className={`sm:hidden absolute w-full left-0 bg-gray-50 p-5 transition-all overflow-hidden shadow-md z-50 ${
          isOpenMenu ? "top-0" : "-top-full"
        }`}
      >
        <nav>
          <ul className="flex flex-col gap-5 mb-10">
            <li>
              <h1 className="text-lg font-bold uppercase text-slate-800">
                Item Identification
              </h1>
            </li>
            <li>
              <button
                className="w-full flex items-center gap-10 py-2"
                onClick={() => {
                  setOpenMenu(false);
                  navigate("/profiles");
                }}
              >
                <FeatherIcon icon="user" className="text-gray-500" />
                <span className="font-medium">Profile</span>
              </button>
            </li>
            <li>
              <button
                className="w-full flex items-center gap-10 py-2"
                onClick={() => {
                  setOpenMenu(false);
                  navigate("/items");
                }}
              >
                <FeatherIcon icon="bell" className="text-gray-500" />
                <span className="font-medium">Items</span>
              </button>
            </li>
            <li
              className={`${
                hasNotification ? "flex justify-between items-center" : ""
              }`}
            >
              <button
                className="w-full flex items-center gap-10 py-2"
                onClick={() => setNotificationOpen(true)}
              >
                <FeatherIcon icon="bell" className="text-gray-500" />
                <span className="font-medium">Notification</span>
              </button>

              {hasNotification && (
                <span className="w-3 h-3 rounded-full bg-blue-400 top-0 left-1/2 "></span>
              )}
            </li>
            <li>
              <button
                className="w-full flex items-center gap-10 py-2"
                onClick={() => handleLogout()}
              >
                <FeatherIcon icon="log-out" className="text-gray-500" />
                <span className="font-medium">Logout</span>
              </button>
            </li>
            <li>
              <hr className="mb-5" />
              <button
                className="w-full flex items-center gap-10 py-2"
                onClick={() => setOpenMenu(false)}
              >
                <FeatherIcon icon="x" className="text-gray-500" />
                <span className="font-medium">Close</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Notification wrapper*/}
      <div
        className={`sm:hidden absolute w-full top-0 bg-gray-50 p-5 transition-all overflow-hidden shadow-md z-50 ${
          isNotificationOpen ? "right-0" : "-right-full"
        }`}
      >
        <div>
          <Notification
            setIsOpen={handleCloseBoth}
            setHasNotification={setHasNotification}
          >
            <div>
              <button
                className="bg-gray-200 px-5 py-2 rounded shadow"
                onClick={() => setNotificationOpen(false)}
              >
                Back
              </button>
            </div>
          </Notification>
        </div>
      </div>
    </OutsideClickHandler>
  );
};

const NavLargeScreen = ({ hasNotification, setHasNotification }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accountAddress");
    navigate("/");
  };
  return (
    <div className="hidden sm:block">
      <nav>
        <ul className="flex flex-row gap-10">
          <li className="relative">
            <button
              className="w-full flex items-center gap-10 py-2"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            >
              <FeatherIcon icon="bell" className="text-gray-500" />
            </button>

            <NavOverlay
              isOpen={isNotificationOpen}
              setIsOpen={setIsNotificationOpen}
            >
              <Notification
                setIsOpen={setIsNotificationOpen}
                setHasNotification={setHasNotification}
              />
            </NavOverlay>

            {hasNotification && (
              <span className="absolute w-3 h-3 rounded-full bg-blue-400 top-0 left-1/2 -translate-x-1/2 -z-10"></span>
            )}
          </li>
          <li className="relative">
            <button
              className="w-full flex items-center gap-10 py-2"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <FeatherIcon icon="user" className="text-gray-500" />
            </button>

            <NavOverlay isOpen={isProfileOpen} setIsOpen={setIsProfileOpen}>
              <ul className="flex flex-col gap-3">
                <li>
                  <button
                    className="text-gray-500 transition-all hover:text-blue-400"
                    onClick={() => navigate("/profiles")}
                  >
                    Profile
                  </button>
                </li>
                <li>
                  <button
                    className="text-gray-500 transition-all hover:text-blue-400"
                    onClick={() => navigate("/items")}
                  >
                    Items
                  </button>
                </li>
                <li>
                  <button
                    className="flex gap-2 items-center transition-all text-red-500 hover:text-red-400"
                    onClick={() => handleLogout()}
                  >
                    <FeatherIcon
                      icon="log-out"
                      className="text-red-500 w-4 h-4"
                    />
                    Logout
                  </button>
                </li>
              </ul>
            </NavOverlay>
          </li>
        </ul>
      </nav>
    </div>
  );
};

const NavOverlay = ({ isOpen, setIsOpen, children }) => {
  return (
    <OutsideClickHandler onOutsideClick={() => setIsOpen(false)}>
      <div
        className={`absolute top-10 right-0 rounded shadow-md bg-gray-50 transition-all overflow-hidden z-50 ${
          isOpen ? "w-96 p-5 opacity-1" : "w-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </OutsideClickHandler>
  );
};

const Header = () => {
  const [isOpenMenu, setOpenMenu] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);

  return (
    <header className="flex justify-between items-center mb-10">
      <div>
        <h1 className="text-lg font-bold uppercase text-slate-800">
          Item Identification
        </h1>
      </div>
      <div>
        {/* mobile screen only */}
        <div className="sm:hidden">
          <button onClick={() => setOpenMenu(true)}>
            <FeatherIcon icon="menu" className="text-gray-500" />
          </button>
        </div>

        {/* mobile screen only */}
        <NavSmallScreen
          isOpenMenu={isOpenMenu}
          setOpenMenu={setOpenMenu}
          hasNotification={hasNotification}
          setHasNotification={setHasNotification}
        />

        {/* medium to large screen*/}
        <NavLargeScreen
          hasNotification={hasNotification}
          setHasNotification={setHasNotification}
        />
      </div>
    </header>
  );
};

export default Header;
