// Import
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import type {
  BTreeMap,
  Compact,
  Enum,
  Option,
  Struct,
  Vec,
} from "@polkadot/types-codec";

import { mnemonicGenerate } from "@polkadot/util-crypto";
import { Keyring } from "@polkadot/keyring";
import { setTimeout } from "timers/promises";
import fetch from "node-fetch";
import { timeStamp } from "console";
import type { WeightV2 } from "@polkadot/types/interfaces";
import { BN_ONE } from "@polkadot/util";

const BN = require("bn.js");

const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
const PROOFSIZE = new BN(1_000_000);

//init env vars
const privateKey = process.env.PRIVATE_KEY as string;
const unlockPassword = process.env.UNLOCK_PASSWORD as string;
const contractAddress = process.env.CONTRACT_ADDRESS as string; //"YpfUaqH4zMcEo8Kw1egpPrjAGmBDWu1VVTLEEimXr2Kzevb";
const rpc = process.env.RPC_ADDRESS as string; //wss://rpc.shibuya.astar.network";
const symbols = process.env.SYMBOLS as string;
const frequencyinmilisecond = process.env.FREQUENCY_MILLISECOND as string;

console.log(symbols);
console.log("frequencyinmilisecond", frequencyinmilisecond);
console.log("rpc", rpc);
console.log("contractAddress", contractAddress);

//DRAND API
const baseUrl = "https://api.drand.sh/public/latest";

let abi = require("../randomoracle.json");

console.log(abi);

let gasLimit: WeightV2;

const proofSize = PROOFSIZE;
const refTime = MAX_CALL_WEIGHT;
const storageDepositLimit = null;

const keyring = new Keyring({ type: "sr25519" });
const pair = keyring.createFromJson(JSON.parse(privateKey));
pair.unlock(unlockPassword);
const ADDR = pair.address;
let api:  ApiPromise
let contract: ContractPromise;
let  account: any;
async function Init(){
  const wsProvider = new WsProvider(rpc);
  api = await ApiPromise.create({ provider: wsProvider });

  contract = new ContractPromise(api, abi, contractAddress);
  console.log(pair.meta.name, "has address", pair.address);




}

async function updateOracle(
  round: string,
  randomness: string,
  signature: string,
  previous_signature: string
) {
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

  const account: any = await api.query.system.account(ADDR);
  // console.log("accountdata",account)
  let noncestring = account.nonce as string;

  // let nonce = new BN(noncestring.toString());

  // nonce = nonce.add(new BN(1));

  // console.log(symbol,price,time);

  // var query = await contract.query.get( "XmVR4FbKWLYQgyHVxkFiBYScVo662WgSCoS84uZZPWNrtRT",{ gasLimit: -1 },["ETH"])
  // console.log("query",query)

  let nonce = await api.rpc.system.accountNextIndex(ADDR);

  console.log("nonce", nonce);
  console.log("round", round);
  console.log("round", round);

  try {
    const { gasRequired, result, output } = await contract.query.setRandomValue(
      pair.address,
      {
        gasLimit: (await api.registry.createType("WeightV2", {
          refTime,
          proofSize,
        })) as WeightV2,
        storageDepositLimit,
      },
      round,
      randomness,
      signature,
      previous_signature
    );

    console.log("storageDepositLimit", storageDepositLimit);

    console.log("gasRequired", gasRequired.toHuman());

    gasLimit = api.registry.createType("WeightV2", gasRequired) as WeightV2;

    console.log("gasLimit", gasLimit.toHuman());
  } catch (e) {
    console.log("erro gas", e);
  }

  try {
    let tx = await contract.tx
      .setRandomValue(
        { gasLimit: gasLimit, storageDepositLimit },
        round,
        randomness,
        signature,
        previous_signature
      )
      .signAndSend(pair, { nonce: nonce }, (result) => {
        if (result.isError) {
          console.log("err", result);
        } else {
          console.log("completed", result.isCompleted);
          console.log("isInBlock", result.isInBlock);
          console.log("status", result.status.toHuman());
        }
      });

    console.log("tx", tx.toString());
  } catch (err) {
    console.log("err", err);
  }
}
async function getRound(
  round: string
) {

  try {
    const { gasRequired, result, output } = await contract.query.getRandomValueForRound(
      pair.address,
      {
        gasLimit: (api.registry.createType("WeightV2", {
          refTime,
          proofSize,
        })) as WeightV2,
        storageDepositLimit,
      },
      round
     
    );

    console.log("result", result);
    console.log("output", output);

 
  } catch (e) {
    console.log("erro gas", e);
  }

   
}

async function startOracle() {
  console.log("Starting Oracle Service");
  await Init()
  await getRound("2759336")
  console.log("start");

  setInterval(async () => {
    let response = await fetch(baseUrl);
    const body = await response.text();
    let resp = JSON.parse(body);

    var d = new Date(resp.Time);
    updateOracle(
      resp.round,
      resp.randomness,
      resp.signature,
      resp.previous_signature
    );
    await setTimeout(Number(frequencyinmilisecond));
  }, Number(frequencyinmilisecond));
}

startOracle();
