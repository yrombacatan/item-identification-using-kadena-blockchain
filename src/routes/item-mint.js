import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Pact from "pact-lang-api";
import { create } from "ipfs-http-client";
import { v4 as uuidv4 } from "uuid";

import PreviewDropzone from "../components/Dropzone";
import {
  ToastifyContainer,
  toastError,
  toastLoading,
  toastUpdate,
} from "../components/Toastify";
import ErrorContainer from "../components/ErrorContainer";

import kadenaAPI from "../kadena-config";
import { checkWallet, signTransaction } from "../wallet";
import { getDate, removePrefixK } from "../utils";

const ipfsClient = create("https://ipfs.infura.io:5001/api/v0");

const ItemMint = () => {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [requestKey, setRequestKey] = useState("");
  const [inputList, setInputList] = useState({
    name: "",
    description: "",
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

  const handleInputValidation = () => {
    let errorList = [];
    if (inputList.name === "" || inputList.name === false) {
      errorList.push("Name is required!");
    }
    if (inputList.description === "" || inputList.description === false) {
      errorList.push("Description is required!");
    }
    if (imageBuffer.buffer === "" || imageBuffer.buffer === false) {
      errorList.push("Image is required!");
    }

    if (errorList.length > 0) {
      return { errors: errorList };
    }

    return { errors: false };
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

  const uploadImageToIpfs = async () => {
    const ipfsBaseUrl = "https://ipfs.infura.io/ipfs/";
    const addedImage = await ipfsClient.add(imageBuffer.buffer);
    const imageURI = ipfsBaseUrl + addedImage.path;
    console.log(imageURI);
    return imageURI;
  };

  const handleMintButton = async () => {
    const { errors } = handleInputValidation();
    if (errors) {
      return setError(errors);
    }

    try {
      const account = checkWallet();
      const date = getDate();
      const itemId = uuidv4();
      const url = await uploadImageToIpfs();
      const activity = { from: account, to: "", date: date, event: "creation" };

      const cap1 = Pact.lang.mkCap(
        "Gas Payer",
        "Payer",
        "free.item-identification-gas-station.GAS_PAYER",
        ["hi", { int: 1 }, 1.0]
      );

      const cap2 = Pact.lang.mkCap(
        "Allow Guard",
        "Some guard",
        "free.item_identification.ALLOW_GUARD",
        [{ keys: [removePrefixK(account)], pred: "keys-all" }]
      );

      // prettier-ignore
      const cmd = {
        pactCode: `(free.item_identification.create-item "${itemId}" "${inputList.name}" "${url}" "${inputList.description}" "${date}" ${JSON.stringify(activity)} (read-keyset "user-keyset"))`,
        caps: [cap1, cap2],
        envData: {
          "user-keyset": [removePrefixK(account)],
        },
        sender: kadenaAPI.meta.sender,
        chainId: kadenaAPI.meta.chainId,
        gasLimit: kadenaAPI.meta.gasLimit,
        gasPrice: kadenaAPI.meta.gasPrice,
        signingPubKey: removePrefixK(account), // account with no prefix k here
        ttl: kadenaAPI.meta.ttl,
        networkId: kadenaAPI.meta.networkId,
      };

      const { requestKeys } = await signTransaction(cmd);
      setRequestKey(requestKeys[0]);
    } catch (error) {
      toastError(error.message);
    }
  };

  const handleListen = async (requestKey) => {
    const id = toastLoading(
      `Transaction ${requestKey} is being process on the blockchain.`
    );

    try {
      const { result, gas } = await Pact.fetch.listen(
        { listen: requestKey },
        kadenaAPI.meta.host
      );
      if (result.status === "failure") {
        return toastUpdate(id, {
          render: result.error.message,
          type: "error",
          isLoading: false,
        });
      }

      console.log(result);
      toastUpdate(id, {
        render: result.data,
        type: "success",
        isLoading: false,
        autoClose: 3000,
        onClose: () => navigate("/items"),
      });
    } catch (error) {
      toastUpdate(id, {
        render: error.message,
        type: "error",
        isLoading: false,
      });
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
    <main className="flex justify-center items-center p-5">
      <div className="sm:w-1/2 -translate-y-10 text-center w-full p-5 md:p-10 shadow rounded">
        <h1 className="text-2xl font-bold">Create your Item</h1>
        {error && <ErrorContainer errors={error} setError={setError} />}
        <div className="md:flex gap-10">
          <div className="md:w-2/5">
            <PreviewDropzone onCapture={captureFile} />
          </div>
          <div className="md:w-3/5 mt-5">
            <div className="flex flex-col mb-5">
              <label className="text-left text-gray-500 sm:basis-1/4">
                Name
              </label>
              <input
                type="text"
                name="name"
                className="flex-auto border-gray-300 p-2 rounded focus:border-blue-100"
                value={inputList.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col mb-5">
              <label className="text-left text-gray-500 sm:basis-1/4">
                Description
              </label>
              <textarea
                type="text"
                name="description"
                className="flex-auto border-gray-300 p-2 rounded focus:border-blue-100"
                value={inputList.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex gap-5 flex-col md:flex-row">
              <button
                className="py-2 px-5 bg-blue-500 rounded shadow font-medium text-white"
                onClick={handleMintButton}
              >
                Mint
              </button>
              <button
                className="py-2 px-5 bg-gray-200 rounded shadow font-medium text-black"
                onClick={() => navigate("/items")}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastifyContainer className="md:w-1/2" />
    </main>
  );
};

export default ItemMint;
