import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Pact from "pact-lang-api";
import { create } from "ipfs-http-client";
import { v4 as uuidv4 } from "uuid";

import PreviewDropzone from "../components/Dropzone";
import { ToastifyContainer, toastError } from "../components/Toastify";
import ErrorContainer from "../components/ErrorContainer";

import kadenaAPI from "../kadena-config";
import { checkWallet, signTransaction, handleListen } from "../wallet";
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
    tag: "",
    tagList: [],
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

  const handleTags = ({ code }) => {
    if (code === "Backspace") {
      if (inputList.tag != "") return;
      return setInputList((prev) => ({
        ...prev,
        tagList: prev.tagList.slice(0, -1),
      }));
    }
    if (inputList.tag.trim() === "" || inputList.tag == false) return;
    if (code === "Space" || code === "Enter") {
      setInputList((prev) => ({
        ...prev,
        tagList: [...prev.tagList, prev.tag, ""],
        tag: "",
      }));
    }
  };

  const captureFile = ([file]) => {
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
      const activity = [
        { from: account, to: "", date: date, event: "creation" },
      ];
      const tags = inputList.tagList.filter((tag) => tag !== "");

      const cap1 = Pact.lang.mkCap(
        "Gas Payer",
        "Payer",
        "item-identification-gas-station.GAS_PAYER",
        ["hi", { int: 1 }, 1.0]
      );

      const cap2 = Pact.lang.mkCap(
        "Allow Guard",
        "Some guard",
        "item_identification.ALLOW_GUARD",
        [{ keys: [removePrefixK(account)], pred: "keys-all" }]
      );

      // prettier-ignore
      const cmd = {
        pactCode: `(item_identification.create-item "${itemId}" "${inputList.name}" "${url}" "${inputList.description}" ${JSON.stringify(tags)} "${date}" ${JSON.stringify(activity)} (read-keyset "user-keyset"))`,
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
      console.log(cmd);
      const { requestKeys } = await signTransaction(cmd);
      setRequestKey(requestKeys[0]);
    } catch (error) {
      toastError(error.message);
    }
  };

  const handleCreateTransaction = async ({ result, reqKey, metaData, gas }) => {
    // create transaction api
    // call after minting
    try {
      const body = {
        item_id: result.data.split(" ").at(1),
        request_key: reqKey,
        gas: gas,
        meta_data: metaData,
        from: localStorage.getItem("accountAddress"),
        event: "creation",
      };

      const res = await fetch("http://localhost:3001/api/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      console.log(json);
    } catch (error) {
      console.log(error);
    }
  };

  const TagList = ({ tagList }) => {
    const newTagList = tagList.filter((tag) => tag !== "");
    return newTagList.map((tag) => (
      <span key={tag} className="px-2 py-1 rounded shadow bg-gray-100">
        {tag}
      </span>
    ));
  };

  useEffect(() => {
    if (!requestKey) return;

    async function listen() {
      const data = await handleListen(requestKey, {
        navigate,
        location: "/items",
      });

      // remove on testnet
      data.metaData = {};
      await handleCreateTransaction(data);
    }

    let allow = true;
    if (allow) {
      listen();
    }

    // cleanup effect
    return () => (allow = false);
  }, [requestKey]);

  return (
    <main>
      <div className="sm:w-3/4 sm:mx-auto text-center w-full">
        <h1 className="text-2xl font-bold">Create your Item</h1>
        {error && <ErrorContainer errors={error} setError={setError} />}
        <div className="md:flex gap-10 mt-5">
          <div className="md:w-2/5">
            <p className="text-left text-gray-500 text-sm font-medium mt-5">
              Supported file: JPEG, PNG
            </p>
            <PreviewDropzone additionalFunction={captureFile} />
          </div>
          <div className="md:w-3/5 mt-5">
            <div className="flex flex-col mb-5">
              <label className="text-left text-gray-500 text-sm font-medium sm:basis-1/4">
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
              <label className="text-left text-gray-500 text-sm font-medium sm:basis-1/4">
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

            <div className="flex flex-col mb-5">
              <label className="text-left text-gray-500 text-sm font-medium sm:basis-1/4">
                Tags
              </label>
              <div className="w-full flex flex-wrap gap-2 p-2 border rounded border-gray-300">
                {/* {inputList.tagList.length > 0 && ( */}
                <TagList tagList={inputList.tagList} />
                {/* )} */}
                <input
                  name="tag"
                  className="focus:outline-none flex-auto"
                  value={inputList.tag}
                  onChange={handleInputChange}
                  onKeyUp={handleTags}
                />
              </div>
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
