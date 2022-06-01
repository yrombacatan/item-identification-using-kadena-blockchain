import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import Pact from "pact-lang-api";
import kadenaAPI from "../kadena-config";

import { ToastifyContainer, toastError } from "../components/Toastify";
import ReactTable from "../components/Table";
import Identicon from "react-hooks-identicons";

import { removePrefixK } from "../utils";

const Transactions = () => {
  const [items, setItems] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      const cmd = {
        pactCode:
          "(item_identification.item-all-by-guard (read-keyset 'user-keyset))",
        envData: {
          "user-keyset": [
            removePrefixK(localStorage.getItem("accountAddress")),
          ],
        },
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
        ...v,
        link: `/items/${v.id}`,
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

  useEffect(() => {
    let allow = true;
    if (allow) fetchItems();

    // cleanup effect
    return () => (allow = false);
  }, []);

  return (
    <main>
      <h1 className="text-2xl font-semibold text-center mb-10">Transactions</h1>

      <div className="w-100 mx-auto bg-white rounded mb-10">
        <div
          className="w-40 h-28 bg-indigo-300 mx-auto rounded text mb-5"
          style={{ height: "fit-content", width: "fit-content" }}
        >
          <Identicon
            string={localStorage.getItem("accountAddress")}
            size="150"
          />
        </div>
        <p className="font-bold text-gray-700 overflow-auto text-center">
          {localStorage.getItem("accountAddress")}
        </p>
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

export default Transactions;