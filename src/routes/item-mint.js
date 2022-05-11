import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PreviewDropzone from "../components/Dropzone";
import { ToastifyContainer, toastError, toastLoading, toastUpdate } from "../components/Toastify";

import Pact from "pact-lang-api";
import kadenaAPI from "../kadena-config";
import { checkWallet, signTransaction } from "../wallet";
import { getDate } from "../utils";

import { v4 as uuidv4 } from "uuid";

import { create } from "ipfs-http-client";
const ipfsClient = create("https://ipfs.infura.io:5001/api/v0");

const ItemMint = () => {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [requestKey, setRequestKey] = useState("");
  const [inputList, setInputList] = useState({
    name: "",
    description: "",
    attributes: "",
  });
  const [imageBuffer, setImageBuffer] = useState({
    buffer: "",
    type: "",
    name: "",
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputList((prev) => ({ ...prev, [name]: value }));
  };

  const captureFile = (file) => {
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setImageBuffer({
        buffer: Buffer(reader.result),
        type: file.type,
        name: file.name,
      });
    };
  };

  const uploadImageToIpfs = async() => {
    const ipfsBaseUrl = "https://ipfs.infura.io/ipfs/";
    const addedImage = await ipfsClient.add(imageBuffer.buffer);
    const imageURI = ipfsBaseUrl + addedImage.path;
    console.log(imageURI);
    return imageURI
  }

  const handleMintButton = async () => {
    try {
      const account = checkWallet();
      const date = getDate();
      const itemId = uuidv4();
      const activityId = uuidv4();
      const url = await uploadImageToIpfs();

      const cmd = {
        pactCode: `(jbsi.product_identification.create-item "${itemId}" "${inputList.name}" "${url}" "${inputList.description}" "${date}" (read-keyset "user-keyset") "${activityId}")`,
        caps: [],
        envData: {
          "user-keyset": [account],
        },
        sender: `k:${account}`,
        chainId: kadenaAPI.meta.chainId,
        gasLimit: kadenaAPI.meta.gasLimit,
        gasPrice: kadenaAPI.meta.gasPrice,
        signingPubKey: account, // account with no prefix k here
        ttl: kadenaAPI.meta.creationTime(),
        networkId: kadenaAPI.meta.networkId,
      };

      const { requestKeys } = await signTransaction(cmd);
      setRequestKey(requestKeys[0]);
    } catch (error) {
      toastError(error.message);
    }
  };

  const handleListen = async (requestKey) => {
    const id = toastLoading(`Transaction ${requestKey} is being process on the blockchain.`)

    try {
      const { result, gas } = await Pact.fetch.listen(
        { listen: requestKey },
        kadenaAPI.meta.localhost
      );
      if (result.status === "failure") {
        return toastUpdate(id, { render: result.error.message, type: "error", isLoading: false,})
      }

      console.log(result);
      toastUpdate(id, { render: result.data, type: "success", isLoading: false,})
    } catch (error) {
      toastUpdate(id, { render: error.message, type: "error", isLoading: false,})
      console.log("im here");
    }
  };

  useEffect(() => {
    if (!requestKey) return;
    let allow = true;
    if (allow) handleListen(requestKey);

    // cleanup effect
    return () => (allow = false);
  }, [requestKey]);

  return (
    <main className="flex justify-center min-h-screen items-center p-5">
      <div className="text-center w-full">
        <h1 className="text-2xl font-bold">Mint your Item</h1>
        {/* <div className='w-36 h-36 bg-gray-500 rounded mx-auto my-10'></div> */}
        <PreviewDropzone onCapture={captureFile} />
        <div className="sm:w-1/2 mx-auto">
          <div className="flex flex-col mb-5 sm:flex-row sm:items-center">
            <label className="text-left font-semibold text-gray-500 sm:basis-1/4">
              Name
            </label>
            <input
              type="text"
              name="name"
              className="flex-auto border p-2 rounded"
              value={inputList.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex flex-col mb-5 sm:flex-row sm:items-center">
            <label className="text-left font-semibold text-gray-500 sm:basis-1/4">
              Description
            </label>
            <input
              type="text"
              name="description"
              className="flex-auto border p-2 rounded"
              value={inputList.description}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="flex justify-center gap-5">
          <button
            className="py-2 px-5 bg-blue-500 rounded shadow font-medium text-white"
            onClick={handleMintButton}
          >
            Submit
          </button>
          <button
            className="py-2 px-5 bg-gray-200 rounded shadow font-medium text-black"
            onClick={() => navigate("/items")}
          >
            Cancel
          </button>
        </div>
      </div>

      <ToastifyContainer className="md:w-1/2" />
    </main>
  );
};

export default ItemMint;
