import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { connectWallet } from "../wallet";

import { ToastifyContainer, toastError } from "../components/Toastify";

const Login = () => {
  const navigate = useNavigate();

  const handleConnectButton = async () => {
    try {
      // const { data } = await fetchAccount(address);
      const accountAddress = await connectWallet();
      localStorage.setItem("accountAddress", accountAddress);
      navigate("/items");
    } catch (error) {
      toastError(error.message);
    }
  };

  return (
    <main className="w-full flex justify-center items-center p-5">
      <div className="md:w-1/2 p-5 shadow -translate-y-10 md:p-10">
        <h1 className="text-2xl font-semibold">
          Item Identification |{" "}
          <span className="text-neutral-400">Powered by Kadena</span>
        </h1>

        {/* <div className="flex flex-col mt-5">
          <label className="text-gray-500 font-bold">Wallet Address</label>
          <input
            className="p-2 border rounded"
            value={address}
            onChange={handleInputChange}
          />
        </div> */}

        <div className="p-2 bg-blue-50 my-5 rounded text-sm">
          <p>
            This application requires users to share or allow their public
            address.
          </p>
        </div>

        <button
          className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 rounded shadow text-white"
          onClick={handleConnectButton}
        >
          Connect
        </button>
      </div>

      <ToastifyContainer />
    </main>
  );
};

export default Login;
