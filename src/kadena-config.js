/* WARNING: This file is for development purpose only */

/*

BLOCKCHAIN CONFIGURATION FILE

  initalize all data for pact-lang-api kadena blockchain calls

  modify this file to interact with different
    chains, networks, contracts

  documentation:
    https://pact-language.readthedocs.io/en/stable/

  pact tutorials:
    https://pactlang.org/

*/

//chain that contract lives on
//CHAINID -> selected string 0-19
var chainId = "1";

//id of network version
const networkId = "testnet04";
//var networkId = "mainnet01";

//network node
const node = "api.testnet.chainweb.com"
//var node = "us-e1.chainweb.com";

//unique contract name
//DEPLOY OWN -> "memory-wall-hash(currentTime + projectName)"
var contractName = "product_identification";

//unique gas station contract name
//DEPLOY OWN -> "memory-wall-gas-station-hash(currentTime + projectName)"
var gasStationName = "basic-payment-gas-station";

//namespace that precedes contract name
var namespace = "jbsi";

//api host to send requests
var host = `https://${node}/chainweb/0.0/${networkId}/chain/${chainId}/pact`;
var localhost = "http://localhost:9001";

//creation time for request
var creationTime = () => Math.round(new Date().getTime() / 1000) - 15;

//JSON with all necessary blockchain call data
var kadenaAPI = {
  contractName: contractName,
  gasStationName: gasStationName,
  namespace: namespace,
  contractAddress: `${namespace}.${contractName}`,
  gasStationAddress: `${namespace}.${gasStationName}`,
  explorerURL: `https://explorer.chainweb.com/${networkId.slice(0, -2)}`,
  meta: {
    networkId: networkId,
    chainId: chainId,
    host: host,
    localhost: localhost,
    creationTime: creationTime,
    //gas price at lowest possible denomination
    gasPrice: 0.00000001,
    //high gas limit for tx
    gasLimit: 30000,
    //time a tx lives in mempool since creationTime
    ttl: 28800,
    //sender === gas payer of the transaction
    //  set to our gas station account defined in memory-wall-gas-station.pact
    sender: "k:9fa7295ffe6cb6151a91682992c7652191f94c071260313f7b60657f75a9d8d9",
    //nonce here doesnt matter since the tx will never have the same hash
    nonce: "some nonce that doesnt matter",
  },
};

export default kadenaAPI