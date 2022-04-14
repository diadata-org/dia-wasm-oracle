// Import
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";

import { mnemonicGenerate } from "@polkadot/util-crypto";
import { Keyring } from "@polkadot/keyring";
import { setTimeout } from "timers/promises";
import fetch from "node-fetch";
import { timeStamp } from "console";

//init env vars
const privateKey = process.env.PRIVATE_KEY as string;
const unlockPassword = process.env.UNLOCK_PASSWORD as string;
const contractAddress = process.env.CONTRACT_ADDRESS as string; //"YpfUaqH4zMcEo8Kw1egpPrjAGmBDWu1VVTLEEimXr2Kzevb";
const rpc = process.env.RPC_ADDRESS as string; //wss://rpc.shibuya.astar.network";
const symbols = process.env.SYMBOLS as string;
console.log(symbols);
const symbolsfororacle = JSON.parse(symbols);

//Diadata API
const baseUrl = "https://api.diadata.org/v1/quotation/";

let abi = require("../metadata.json");

let value = 0;
const gasLimit = 3000n * 100000000n;

async function updateOracle(symbol: string, price: number, time: number) {
  const keyring = new Keyring({ type: "sr25519" });

  const pair = keyring.createFromJson(JSON.parse(privateKey));
  pair.unlock(unlockPassword);

  const ADDR = pair.address;

  // init wsprovider
  const wsProvider = new WsProvider(rpc);
  const api = await ApiPromise.create({ provider: wsProvider });

  const contract = new ContractPromise(api, abi, contractAddress);

  // const res = await contract.query.get(ADDR, { value: 0, gasLimit: -1 }, "ETH");
  console.log(pair.meta.name, "has address", pair.address);

  contract.tx
    .set({ value, gasLimit }, symbol, price, time)
    .signAndSend(pair, (result) => {
      if (result.isError) {
        console.log("err");
      }
      console.log("result.txHash", result.txHash.toHuman());
    });
}

async function startOracle() {
  console.log("Starting Oracle Service")
  setInterval(async () => {
    for (let index = 0; index < symbolsfororacle.length; index++) {
      const symbol = symbolsfororacle[index];
      let response = await fetch(baseUrl + symbol);
      const body = await response.text();
      let resp = JSON.parse(body);

      var d = new Date(resp.Time);
       updateOracle(
        resp.Symbol,
        Math.floor(resp.Price * 100000000),
        d.getTime()
      );
      await setTimeout(10000);
    }
  }, 10000);
}

startOracle();
