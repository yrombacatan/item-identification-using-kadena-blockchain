import React, { useState, useEffect } from "react";

import Pact from "pact-lang-api";
import { v4 as uuidv4 } from "uuid";

import { ToastifyContainer, toastError } from "../components/Toastify";
import ReactTable from "../components/Table";
import ErrorContainer from "../components/ErrorContainer";
import Modal from "../components/Modal";
import FeatherIcon from "feather-icons-react";

import { signTransaction, handleListen, checkWallet } from "../wallet";
import kadenaAPI from "../kadena-config";
import { removePrefixK } from "../utils";

const Form = ({ input, setInput, onSubmit, disableButton }) => {
  const [edit, setEdit] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setEdit(!edit);
  };

  const toggleClass = edit
    ? "border-gray-300 focus:border-blue-100"
    : "bg-gray-50 outline-none border-0";

  return (
    <>
      <div className="mb-5">
        <label className="text-sm font-medium text-gray-500">First Name</label>
        <input
          type="text"
          name="fname"
          className={`w-full rounded ${toggleClass}`}
          disabled={!edit}
          value={input.fname}
          onChange={handleInputChange}
        />
      </div>
      <div className="mb-5">
        <label className="text-sm font-medium text-gray-500">Last Name</label>
        <input
          type="text"
          name="lname"
          className={`w-full rounded ${toggleClass}`}
          disabled={!edit}
          value={input.lname}
          onChange={handleInputChange}
        />
      </div>
      <div className="mb-5">
        <label className="text-sm font-medium text-gray-500">Email</label>
        <input
          type="text"
          name="email"
          className={`w-full rounded ${toggleClass}`}
          disabled={!edit}
          value={input.email}
          onChange={handleInputChange}
        />
      </div>
      <div className="mb-5">
        <label className="text-sm font-medium text-gray-500">Website</label>
        <input
          type="text"
          name="website"
          className={`w-full rounded ${toggleClass}`}
          disabled={!edit}
          value={input.website}
          onChange={handleInputChange}
        />
      </div>
      <div className="mb-5">
        <label className="text-sm font-medium text-gray-500">
          Public Address
        </label>
        <input
          type="text"
          value={localStorage.getItem("accountAddress")}
          name="publicKey"
          className={`w-full rounded bg-gray-50 outline-none border-0`}
          disabled={true}
        />
      </div>
      <div className="mb-5 flex gap-5">
        {edit && (
          <button
            className="flex gap-2 bg-blue-500 font-medium px-5 py-2 rounded text-white shadow"
            onClick={onSubmit}
            disabled={disableButton}
          >
            <FeatherIcon icon="edit" className="w-5 h-5" /> Update
          </button>
        )}

        <button
          className={`flex gap-2 px-5 py-2 rounded shadow font-medium ${
            edit ? "bg-gray-200 text-black" : "bg-blue-500 text-white"
          }`}
          onClick={handleEdit}
        >
          {edit ? (
            "Cancel"
          ) : (
            <>
              <FeatherIcon icon="edit" className="w-5 h-5" /> Edit
            </>
          )}
        </button>
      </div>
    </>
  );
};

const Transaction = () => {
  const [transactions, setTransactions] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null);

  const getTransactions = async () => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/transaction/${localStorage.getItem(
          "accountAddress"
        )}`
      );
      const transactions = await res.json();
      const newTransactions = transactions.map((transaction) => ({
        ...transaction,
        onClick: () => {
          setModalData(transaction);
        },
      }));

      setLoading(false);
      setTransactions(newTransactions);
    } catch (error) {
      toastError(error.message);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: " ",
        columns: [
          {
            Header: "Request Key",
            accessor: "request_key",
          },
          {
            Header: "Item ID",
            accessor: "item_id",
          },
          {
            Header: "Gas",
            accessor: "gas",
          },
          {
            Header: "Event",
            accessor: "event",
          },
        ],
      },
    ],
    []
  );

  useEffect(() => {
    getTransactions();
  }, []);

  return (
    <div className="bg-white rounded">
      <p className="font-semibold text-left">Transaction History</p>
      {loading && <p>Loading...</p>}
      {transactions && (
        <ReactTable
          columns={columns}
          data={transactions}
          rowClass={`hover:bg-gray-50 cursor-pointer transition`}
        />
      )}

      {modalData && (
        <Modal onClose={() => setModalData(null)}>
          <div className="overflow-auto flex flex-col gap-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Request Key</p>
              <p className="px-2 py-1 rounded">{modalData.request_key}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Item Id</p>
              <p className="px-2 py-1 rounded">{modalData.item_id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">From</p>
              <p className="px-2 py-1 rounded">{modalData.from}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">To</p>
              <p className="px-2 py-1 rounded">{modalData.to}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Gas</p>
              <p className="px-2 py-1 rounded">{modalData.gas}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Event</p>
              <p className="px-2 py-1 rounded">{modalData.event}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Metadata</p>
              <pre>{JSON.stringify(modalData.meta_data, null, 4)}</pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const UserProfile = () => {
  const [requestKey, setRequestKey] = useState("");
  const [error, setError] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [input, setInput] = useState({
    id: null,
    fname: "",
    lname: "",
    email: "",
    website: "",
  });

  const handleInputValidation = () => {
    let errorList = [];
    if (input.fname === "" || input.fname === false) {
      errorList.push("First Name is required!");
    }
    if (input.lname === "" || input.lname === false) {
      errorList.push("Last Name is required!");
    }

    if (errorList.length > 0) {
      return { errors: errorList };
    }

    return { errors: false };
  };

  const handleSubmit = async () => {
    const email = input.email ?? "";
    const website = input.website ?? "";

    const { errors } = handleInputValidation();
    if (errors) {
      return setError(errors);
    }

    try {
      const userId = uuidv4();
      const account = checkWallet();

      const cap1 = Pact.lang.mkCap(
        "Gas Payer",
        "Payer",
        "item-identification-gas-station.GAS_PAYER",
        ["hi", { int: 1 }, 1.0]
      );

      const cap2 = Pact.lang.mkCap(
        "Allow User",
        "Some guard",
        "item_identification.ALLOW_USER",
        [input.id]
      );

      const method = input.id ? "update-user" : "create-user";
      const capabilities = input.id ? [cap1, cap2] : [cap1];

      // prettier-ignore
      const cmd = {
        pactCode: `(item_identification.${method} "${input.id ?? userId}" "${input.fname}" "${input.lname}" "${email}" "${website}" (read-keyset "user-keyset"))`,
        caps: capabilities,
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

      console.log("<--- cmd");
      console.log(cmd);
      console.log("<---- cmd end --->");

      const { requestKeys } = await signTransaction(cmd);
      setRequestKey(requestKeys[0]);
    } catch (error) {
      return toastError(error.message);
    }
  };

  const handleFetchAccount = async () => {
    try {
      const account = checkWallet();
      const cmd = {
        pactCode: `(item_identification.user-details (read-keyset "user-keyset"))`,
        envData: {
          "user-keyset": [removePrefixK(account)],
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

      const { result } = await Pact.fetch.local(cmd, kadenaAPI.meta.host);
      console.log("<--- result");
      console.log(result);
      console.log("<---- result end --->");

      if (result.status === "failure") {
        return toastError(result.error.message);
      }

      if (result.data.length > 0) setInput(result.data[0]);
    } catch (error) {
      toastError(error.message);
    }
  };

  useEffect(() => {
    handleFetchAccount();
  }, []);

  useEffect(() => {
    async function listen() {
      if (!requestKey) return;
      setDisableButton(true);
      const { result } = await handleListen(requestKey, {});
      if (!input.id) {
        const userId = result.data.split(" ").at(-1);
        setInput((prev) => ({ ...prev, id: userId }));
      }
      setDisableButton(false);
    }

    listen();
  }, [requestKey]);

  return (
    <main>
      <h1 className="text-2xl font-semibold text-center mb-10">Profile</h1>
      <div className="flex flex-wrap gap-10">
        <div className="flex-auto">
          {error && <ErrorContainer errors={error} setError={setError} />}
          <Form
            input={input}
            setInput={setInput}
            onSubmit={handleSubmit}
            disableButton={disableButton}
          />
        </div>
      </div>

      <div className="w-full border-t border-gray-100 shadow-lg my-10"></div>

      <Transaction />
      <ToastifyContainer />
    </main>
  );
};

export default UserProfile;
