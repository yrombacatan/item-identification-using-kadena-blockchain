import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import Pact from "pact-lang-api";
import kadenaAPI from "../kadena-config";

import { ToastifyContainer, toastError } from "../components/Toastify";
import ReactTable from "../components/Table";
import Identicon from "react-hooks-identicons";
import FeatherIcon from "feather-icons-react";

const ItemList = () => {
  const [items, setItems] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      const cmd = {
        pactCode: "(free.item_identification.item-all)",
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

      const { result, gas } = await Pact.fetch.local(cmd, kadenaAPI.meta.host);
      console.log(result);
      console.log(gas);

      if (result.status === "failure") {
        setItems("");
        return toastError(result.error.message);
      }

      const itemList = result.data.map((v) => ({
        ...v.body,
        keys: v.keys,
        link: `/items/${v.keys}`,
      }));

      setLoading(false);
      setItems(itemList);
    } catch (error) {
      setItems("");
      setLoading(false);
      return toastError(error.message);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: " ",
        columns: [
          {
            Header: "Item Name",
            accessor: "name",
          },
          {
            Header: "Description",
            accessor: "description",
          },
          {
            Header: "Date Minted",
            accessor: "date",
          },
        ],
      },
    ],
    []
  );

  const handleLogout = () => {
    localStorage.removeItem("accountAddress");
    navigate("/");
  };

  useEffect(() => {
    let allow = true;
    if (allow) fetchItems();

    // cleanup effect
    return () => (allow = false);
  }, []);

  return (
    <main className="sm:w-4/5 mx-auto mt-10 h-100 text-center p-5 sm:10 sm:p-10 shadow">
      <h1 className="text-2xl font-semibold text-center mb-10">Dashboard</h1>

      <div className="w-100 mx-auto bg-white rounded mb-10">
        <div className="flex items-center justify-end mb-10 gap-5">
          <button
            className="bg-blue-500 hover:bg-blue-400 rounded shadow text-white font-semibold px-10 py-2"
            onClick={() => navigate("/items/mint")}
          >
            <i class="fa-solid fa-plus"></i>Create
          </button>
          <button
            className="border text-red-500 rounded shadow px-5 py-2 hover:bg-red-500 hover:text-white transition-all"
            title="Logout"
            onClick={handleLogout}
          >
            <FeatherIcon icon="log-out" />
          </button>
        </div>

        <div
          className="w-40 h-28 bg-indigo-300 mx-auto rounded text mb-5"
          style={{ height: "fit-content", width: "fit-content" }}
        >
          <Identicon
            string={`k:${localStorage.getItem("accountAddress")}`}
            size="150"
          />
        </div>
        <p className="font-bold text-gray-700 overflow-auto">{`k:${localStorage.getItem(
          "accountAddress"
        )}`}</p>
      </div>

      <div className="bg-white rounded">
        <p className="font-semibold text-left">ITEM LIST</p>
        {loading && <p>Loading...</p>}
        {items && <ReactTable columns={columns} data={items} />}
      </div>

      <ToastifyContainer />
    </main>
  );
};

export default ItemList;
