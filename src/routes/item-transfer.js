import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  ToastifyContainer,
  toastError,
  toastLoading,
  toastUpdate,
} from "../components/Toastify";
import FeatherIcon from "feather-icons-react";
import { QRCodeSVG } from "qrcode.react";

import Pact from "pact-lang-api";

import kadenaAPI from "../kadena-config";
import { checkWallet, signTransaction, fetchAccount } from "../wallet";
import { getDate, removePrefixK } from "../utils";

const ImageViewContainer = ({ url, show, setShowImage }) => {
  const toggleClass = `${show ? "top-0" : "-top-full"}`;
  return (
    <div
      className={`w-full min-h-full absolute left-0 z-10 transition-all overflow-hidden ${toggleClass}`}
    >
      <div
        className="absolute w-full min-h-screen bg-black opacity-90"
        onClick={() => setShowImage(!show)}
      ></div>
      <img
        src={url}
        className="w-full md:w-1/2 object-cover absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
};

const ItemTransfer = () => {
  const [item, setItem] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [requestKey, setRequestkey] = useState("");
  const [result, setResult] = useState("");
  const [showImage, setShowImage] = useState(false);
  const params = useParams();
  const navigate = useNavigate();

  const fetchItem = async (id) => {
    try {
      const cmd = {
        pactCode: `(free.item_identification.item-details "${id}")`,
        meta: Pact.lang.mkMeta(
          kadenaAPI.meta.sender,
          kadenaAPI.meta.chainId,
          kadenaAPI.meta.gasPrice,
          kadenaAPI.meta.gasLimit,
          kadenaAPI.meta.creationTime(),
          kadenaAPI.meta.ttl
        ),
        networkId: kadenaAPI.meta.networkId,
      };

      const { result } = await Pact.fetch.local(cmd, kadenaAPI.meta.host);

      if (result.status === "failure") {
        setItem("");
        return toastError(result.error.message);
      }

      const item = { ...result.data.body, keys: result.data.keys };
      console.log(result);
      setItem(item);
    } catch (error) {
      setItem("");
      return toastError(error.message);
    }
  };

  const handleInputChange = (e) => setReceiverAddress(e.target.value);

  const handleTransfer = async () => {
    try {
      await fetchAccount(receiverAddress);
      const account = checkWallet();
      const date = getDate();
      const activityList = [
        ...item.activities,
        {
          from: account,
          to: receiverAddress,
          date: date,
          event: "transfer",
        },
      ];

      const cap1 = Pact.lang.mkCap(
        "Gas Payer",
        "Payer",
        "free.item-identification-gas-station.GAS_PAYER",
        ["hi", { int: 1 }, 1.0]
      );

      const cap2 = Pact.lang.mkCap(
        "Allow Entry",
        "Some guard",
        "free.item_identification.ALLOW_ENTRY",
        [`${item.keys}`]
      );

      // prettier-ignore
      const cmd = {
        pactCode: `(free.item_identification.transfer-item "${item.keys}" ${JSON.stringify(activityList)} (read-keyset "receiver-keyset"))`,
        caps: [cap1, cap2],
        envData: {
          "receiver-keyset": [removePrefixK(receiverAddress)],
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
      setRequestkey(requestKeys[0]);
    } catch (error) {
      return toastError(error.message);
    }
  };

  const handleListen = async (requestKey) => {
    try {
      const id = toastLoading(
        `Transaction ${requestKey} is being process on the blockchain.`
      );
      setResult("");

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
      setResult(result);
      toastUpdate(id, {
        render: result.data,
        type: "success",
        isLoading: false,
      });
    } catch (error) {
      toastError(error.message);
    }
  };

  useEffect(() => {
    if (!params.id) return;
    let allow = true;
    if (allow) fetchItem(params.id);

    // cleanup effect
    return () => (allow = false);
  }, [params.id]);

  useEffect(() => {
    if (!requestKey) return;
    let allow = true;
    if (allow) handleListen(requestKey);

    // cleanup effect
    return () => (allow = false);
  }, [requestKey]);

  return (
    <>
      {item && (
        <main className="sm:w-4/5 mx-auto mt-10 h-100 p-5 sm:10 sm:p-10 shadow">
          <h1 className="text-2xl font-semibold text-center mb-20">
            Item Transfer
          </h1>
          <div className="w-100 my-10 mx-auto bg-white rounded mt-10">
            <div className="flex flex-col gap-10 my-10 md:flex-row clear-both">
              <div className="w-full md:flex-none md:w-2/5 relative">
                <img
                  src={item.url}
                  className="md:w-full max-h-96 object-cover cursor-pointer"
                  onClick={() => setShowImage(!showImage)}
                />
                <div
                  className="absolute top-2 right-2 cursor-pointer bg-gray-800 p-2 rounded"
                  onClick={() => window.open(item.url)}
                >
                  <FeatherIcon icon="external-link" className="text-white" />
                </div>
              </div>
              <div className="md:w-3/5">
                <h2 className="font-bold text-xl text-gray-700 mb-2">
                  {item.name}
                </h2>
                <div>
                  <QRCodeSVG value={window.location.href} size="150" />
                </div>

                <div>
                  <p className="font-semibold text-gray-500 text-sm mt-5">
                    Owned by
                  </p>
                  <p className="text-sm overflow-auto mt-1">
                    {item.guard.keys}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-gray-500 text-sm mt-5">
                    Description
                  </p>
                  <p className="text-sm overflow-auto mt-1 =">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-500">
                Account Address
              </label>
              <input
                type="text"
                name="receiver-address"
                className="w-full border-gray-300 p-2 rounded focus:border-blue-100"
                value={receiverAddress}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex gap-5">
              <div>
                <button
                  className="bg-blue-500 rounded shadow text-white font-semibold px-5 py-2 mt-5"
                  onClick={handleTransfer}
                >
                  Submit
                </button>
              </div>
              <div>
                <button
                  className="bg-gray-200 rounded shadow text-black font-semibold px-5 py-2 mt-5"
                  onClick={() => navigate(`/items/${params.id}`)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <ImageViewContainer
            url={item.url}
            show={showImage}
            setShowImage={setShowImage}
          />
          <ToastifyContainer className="md:w-1/2" />
        </main>
      )}
    </>
  );
};

export default ItemTransfer;
