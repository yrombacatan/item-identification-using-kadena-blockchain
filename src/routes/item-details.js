import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { ToastifyContainer, toastError } from "../components/Toastify";
import FeatherIcon from "feather-icons-react";
import { QRCodeSVG } from "qrcode.react";

import { removePrefixK } from "../utils";

import Pact from "pact-lang-api";
import kadenaAPI from "../kadena-config";

const ActivityRow = ({ activityList }) => {
  return activityList.map((activity, _i) => {
    return (
      <tr className="whitespace-nowrap" key={_i}>
        <td className="px-6 py-4 text-sm text-gray-500">
          <div className="text-sm text-gray-500">{activity.event}</div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-500">{activity.from}</div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-500">{activity.to}</div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-500">{activity.date}</div>
        </td>
      </tr>
    );
  });
};

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

const ItemDetails = () => {
  const [item, setItem] = useState("");
  const [activities, setActivities] = useState("");
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
        setActivities("");
        return toastError(result.error.message);
      }

      setItem(result.data[0]);
      setActivities(result.data[0].activities);
    } catch (error) {
      setItem("");
      setActivities("");
      toastError(error.message);
    }
  };

  useEffect(() => {
    let allow = true;
    if (allow) fetchItem(params.id);

    // cleanup effect
    return () => (allow = false);
  }, [params.id]);

  return (
    <>
      {item && (
        <main>
          <h1 className="text-2xl font-semibold text-center mb-10">
            Item Details
          </h1>

          <div className="w-100 mx-auto bg-white rounded mb-10">
            <div className="flex gap-5 justify-end">
              {item.guard.keys[0] ===
              removePrefixK(localStorage.getItem("accountAddress")) ? (
                <button
                  onClick={() => navigate(`/items/${item.id}/transfer`)}
                  className="bg-blue-500 rounded shadow text-white font-semibold px-5 py-2"
                >
                  Transfer
                </button>
              ) : null}
              <button
                onClick={() => navigate(`/items`)}
                className="bg-gray-200 rounded shadow text-black font-semibold px-5 py-2"
              >
                Back
              </button>
            </div>

            <div className="flex flex-col gap-5 my-10 md:flex-row clear-both">
              <div className="w-full md:flex-none md:w-2/5 relative">
                <img
                  src={item.url}
                  className="md:w-full max-h-96 object-cover bg-no-repeat cursor-pointer rounded shadow-md overflow-hidden"
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

                <div>
                  <p className="font-semibold text-gray-500 text-sm mt-5">
                    Tags
                  </p>
                  <div className="flex gap-2 text-sm overflow-auto mt-1">
                    {item.tags.map((tag) => (
                      <span className="px-2 py-1 rounded bg-gray-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5">
              <h2 className="font-bold text-xl text-gray-700 mb-2">
                Item Activity
              </h2>
              <div className="border-b border-gray-200 shadow overflow-auto text-center">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-2 text-xs text-gray-500">Event</th>
                      <th className="px-6 py-2 text-xs text-gray-500">From</th>
                      <th className="px-6 py-2 text-xs text-gray-500">To</th>
                      <th className="px-6 py-2 text-xs text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {activities ? (
                      <ActivityRow activityList={activities} />
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <ImageViewContainer
            url={item.url}
            show={showImage}
            setShowImage={setShowImage}
          />
          <ToastifyContainer />
        </main>
      )}
    </>
  );
};

export default ItemDetails;
