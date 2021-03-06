import Pact from "pact-lang-api";
import kadenaAPI from "./kadena-config";

import { removePrefixK } from "./utils";
import { toastLoading, toastUpdate } from "./components/Toastify";

const connectWallet = async () => {
  const hasXwallet = window?.kadena?.isKadena === true;
  //if (account) {
  if (hasXwallet) {
    await window.kadena.request({
      method: "kda_disconnect",
      networkId: kadenaAPI.meta.networkId,
    });
    const result = await window.kadena.request({
      method: "kda_connect",
      networkId: kadenaAPI.meta.networkId,
    });

    if (result.status === "fail") {
      throw new Error(result.message);
    }

    return result.account.account;
    // if (result.account.account !== account) {
    //   throw new Error(
    //     "Tried to connect to X Wallet but not with the account entered. Make sure you have logged into the right account in X Wallet"
    //   );
    // }
  } else {
    const host = "http://localhost:9467/v1/accounts";
    //const newAccount = removePrefixK(account);
    const res = await fetch(host, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        asset: "kadena",
      }),
    });

    const { data, status } = await res.json();

    if (status === "error") {
      throw new Error(data);
    }

    if (data.length > 1) {
      throw new Error("Please share only single address for this application.");
    }

    return data[0];

    // if (!data.includes(newAccount) && !data.includes(`k:${newAccount}`)) {
    //   throw new Error(
    //     "Tried to connect to X Wallet but not with the account entered. Make sure you have logged into the right account in X Wallet"
    //   );
    // }
  }
  //}
};

const fetchAccount = async (address) => {
  const cmd = {
    pactCode: `(coin.details "${address}")`,
    meta: Pact.lang.mkMeta(
      "",
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
    if (address === "") {
      throw new Error(`Account address is required`);
    }

    throw new Error(
      `Account address "${address}" does not exist on the blockchain!`
    );
  }

  return result;
};

const checkWallet = () => {
  if (localStorage.getItem("accountAddress")) {
    return localStorage.getItem("accountAddress");
  }

  throw new Error("Account is required, please connect account address.");
};

const verifyAccount = async (account) => {
  console.log("start verifying...");
  await window.kadena.request({
    method: "kda_disconnect",
    networkId: kadenaAPI.meta.networkId,
  });

  console.log("after disconnecting...");
  await window.kadena.request({
    method: "kda_connect",
    networkId: kadenaAPI.meta.networkId,
  });

  const accountConnectedRes = await window.kadena.request({
    method: "kda_requestAccount",
    networkId: kadenaAPI.meta.networkId,
    domain: window.location.hostname,
  });

  console.log(accountConnectedRes);

  if (accountConnectedRes?.status !== "success") {
    throw new Error("X Wallet connection was lost, please re-connect");
  } else if (
    accountConnectedRes?.wallet?.account &&
    accountConnectedRes.wallet.account !== account
  ) {
    throw new Error(
      `Wrong X Wallet account selected in extension, please select ${account}`
    );
  } else if (accountConnectedRes?.wallet?.chainId != kadenaAPI.meta.chainId) {
    throw new Error(
      `Wrong chain selected in X Wallet, please select ${kadenaAPI.meta.chainId}`
    );
  }

  return accountConnectedRes;
};

const signTransaction = async (cmdToSign) => {
  const hasXWallet = window?.kadena?.isKadena === true;
  const account = checkWallet();
  let signedCmd = "";

  if (hasXWallet) {
    await verifyAccount(account);
    const xwalletSignRes = await window.kadena.request({
      method: "kda_requestSign",
      networkId: kadenaAPI.meta.networkId,
      data: { networkId: kadenaAPI.meta.networkId, signingCmd: cmdToSign },
    });

    if (xwalletSignRes.status !== "success") {
      throw new Error("Failed to sign the command in X-Wallet");
    }

    signedCmd = xwalletSignRes.signedCmd;
  } else {
    // default zelcore/chainweaver
    signedCmd = await Pact.wallet.sign(cmdToSign);
  }

  // test the request first in local
  const localRes = await fetch(`${kadenaAPI.meta.host}/api/v1/local`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(signedCmd),
  });

  const parseLocalRes = await localRes.json();

  if (parseLocalRes?.result?.status !== "success") {
    throw new Error(parseLocalRes?.result?.error?.message);
  }

  // test request in mainnet
  return await Pact.wallet.sendSigned(signedCmd, kadenaAPI.meta.host);
};

const handleListen = async (
  requestKey,
  { navigate = false, location = "" }
) => {
  const id = toastLoading(
    `Transaction ${requestKey} is being process on the blockchain.`
  );

  try {
    const data = await Pact.fetch.listen(
      { listen: requestKey },
      kadenaAPI.meta.host
    );

    if (data.result.status === "failure") {
      return toastUpdate(id, {
        render: data.result.error.message,
        type: "error",
        isLoading: false,
      });
    }

    toastUpdate(id, {
      render: data.result.data,
      type: "success",
      isLoading: false,
      autoClose: 3000,
      onClose: () => (navigate ? navigate(location) : {}),
    });

    console.log(data);
    return data;
  } catch (error) {
    toastUpdate(id, {
      render: error.message,
      type: "error",
      isLoading: false,
    });
  }
};

export {
  checkWallet,
  fetchAccount,
  connectWallet,
  signTransaction,
  handleListen,
};
