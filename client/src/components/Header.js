import React, { useState } from "react";
import FeatherIcon from "feather-icons-react";
import OutsideClickHandler from "react-outside-click-handler";

import { useNavigate } from "react-router-dom";

const NavSmallScreen = ({ isOpenMenu, setIsOpenMenu }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accountAddress");
    navigate("/");
  };
  return (
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
                setIsOpenMenu(false);
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
                setIsOpenMenu(false);
                navigate("/items");
              }}
            >
              <FeatherIcon icon="bell" className="text-gray-500" />
              <span className="font-medium">Items</span>
            </button>
          </li>
          <li>
            <button
              className="w-full flex items-center gap-10 py-2"
              onClick={() => {}}
            >
              <FeatherIcon icon="bell" className="text-gray-500" />
              <span className="font-medium">Notification</span>
            </button>
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
              onClick={() => setIsOpenMenu(false)}
            >
              <FeatherIcon icon="x" className="text-gray-500" />
              <span className="font-medium">Close</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

const NavLargeScreen = () => {
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
              <ul className="">
                <li>Notification 1</li>
                <li>Notification 2</li>
              </ul>
            </NavOverlay>
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
        className={`absolute top-10 right-0 rounded shadow-md bg-gray-50 transition-all overflow-hidden ${
          isOpen ? "w-64 p-5 opacity-1" : "w-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </OutsideClickHandler>
  );
};

const Header = () => {
  const [isOpenMenu, setIsOpenMenu] = useState(false);

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
          <button onClick={() => setIsOpenMenu(true)}>
            <FeatherIcon icon="menu" className="text-gray-500" />
          </button>
        </div>

        {/* mobile screen only */}
        <NavSmallScreen isOpenMenu={isOpenMenu} setIsOpenMenu={setIsOpenMenu} />

        {/* medium to large screen*/}
        <NavLargeScreen />
      </div>
    </header>
  );
};

export default Header;
