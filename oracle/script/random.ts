import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import { mnemonicGenerate } from "@polkadot/util-crypto";
import { Keyring } from "@polkadot/keyring";
import { setTimeout } from "timers/promises";
import fetch from "node-fetch";
import { WeightV2 } from "@polkadot/types/interfaces";
import { BN_ONE } from "@polkadot/util";

const BN = require("bn.js");


const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
const PROOFSIZE = new BN(1_000_000);

const abi = require("../randomoracle.json");

class RandomOracleUpdater {
  private privateKey: string;
  private unlockPassword: string;
  private contractAddress: string;
  private rpc: string;
  private frequencyInMillisecond: string;
  private pair: any;
  private api: ApiPromise;
  private contract!: ContractPromise;
  private baseUrl = "https://drand.cloudflare.com/public/latest";


  constructor() {
    this.privateKey = process.env.PRIVATE_KEY as string;
    this.unlockPassword = process.env.UNLOCK_PASSWORD as string;
    this.contractAddress = process.env.CONTRACT_ADDRESS as string;
    this.rpc = process.env.RPC_ADDRESS as string;
    this.frequencyInMillisecond = process.env.FREQUENCY_MILLISECOND as string;

    this.api = new ApiPromise({ provider: new WsProvider(this.rpc) });
    // this.contract = new ContractPromise(this.api, abi, this.contractAddress);

    this.pair = new Keyring({ type: "sr25519" }).createFromJson(JSON.parse(this.privateKey));
    this.pair.unlock(this.unlockPassword);
  }

  async init() {
    this.api = await ApiPromise.create({ provider: new WsProvider(this.rpc) });
    this.contract = new ContractPromise(this.api, abi, this.contractAddress);
  }

  async updateOracle(round: string, randomness: string, signature: string, previous_signature: string) {
    const ADDR = this.pair.address;
    const gasLimit = await this.getGasLimit(round, randomness, signature, previous_signature);
    const nonce = await this.api.rpc.system.accountNextIndex(ADDR);

    try {
      const tx = await this.contract.tx
        .setRandomValue({ gasLimit, storageDepositLimit: null }, round, randomness, signature, previous_signature)
        .signAndSend(this.pair, { nonce }, (result) => {
          console.log(result.isError ? "err" : "completed", result.toHuman());
        //   console.log("isInBlock", result.isInBlock);
          console.log("status", result.status.toHuman());
        });

      console.log("tx", tx.toString());
    } catch (err) {
      console.log("err", err);
    }
  }

  async getGasLimit(round: string, randomness: string, signature: string, previous_signature: string): Promise<WeightV2> {
    const refTime = MAX_CALL_WEIGHT;
    const proofSize = PROOFSIZE;
    const storageDepositLimit = null;
    console.log("this.pair.address",this.pair.address)

    const { gasRequired, result, output } = await this.contract.query.setRandomValue(
      this.pair.address,
      { gasLimit: (await this.api.registry.createType("WeightV2", { refTime, proofSize })) as WeightV2, storageDepositLimit: storageDepositLimit },
      round, randomness, signature, previous_signature
    );

    return this.api.registry.createType("WeightV2", gasRequired) as WeightV2;
  }
  async startOracle() {
    console.log("Starting Oracle Service");
    await this.init();
    // await this.getRound("2759336");

    setInterval(async () => {
      let response = await fetch(this.baseUrl);
      const body = await response.text();
      let resp = JSON.parse(body);
      console.log(resp)


      await this.updateOracle(
        resp.round,
        resp.randomness,
        resp.signature,
        resp.previous_signature
      );
      await setTimeout(Number(this.frequencyInMillisecond));
    }, Number(this.frequencyInMillisecond));
  }
}




const randomOracleUpdater = new RandomOracleUpdater();
randomOracleUpdater.startOracle();


