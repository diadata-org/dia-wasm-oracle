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

    this.pair = new Keyring({ type: "sr25519" }).createFromJson(
      JSON.parse(this.privateKey)
    );
    this.pair.unlock(this.unlockPassword);
  }

  async init() {
    this.api = await ApiPromise.create({ provider: new WsProvider(this.rpc) });
    this.contract = new ContractPromise(this.api, abi, this.contractAddress);
  }

  async updateOracle(
    round: string,
    randomness: string,
    signature: string,
    previous_signature: string
  ) {
    const ADDR = this.pair.address;
    const gasLimit = await this.getGasLimit(
      round,
      randomness,
      signature,
      previous_signature
    );
    const nonce = await this.api.rpc.system.accountNextIndex(ADDR);

    try {
      const tx = await this.contract.tx
        .setRandomValue(
          { gasLimit, storageDepositLimit: null },
          round,
          randomness,
          signature,
          previous_signature
        )
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

  async getGasLimit(
    round: string,
    randomness: string,
    signature: string,
    previous_signature: string
  ): Promise<WeightV2> {
    const refTime = MAX_CALL_WEIGHT;
    const proofSize = PROOFSIZE;
    const storageDepositLimit = null;
    console.log("this.pair.address", this.pair.address);

    const { gasRequired, result, output } =
      await this.contract.query.setRandomValue(
        this.pair.address,
        {
          gasLimit: (await this.api.registry.createType("WeightV2", {
            refTime,
            proofSize,
          })) as WeightV2,
          storageDepositLimit: storageDepositLimit,
        },
        round,
        randomness,
        signature,
        previous_signature
      );

    return this.api.registry.createType("WeightV2", gasRequired) as WeightV2;
  }

  async getLastRound(): Promise<string> {
    const refTime = MAX_CALL_WEIGHT;
    const proofSize = PROOFSIZE;
    const storageDepositLimit = null;
    let f = "0x";

    try {
      const result = await this.contract.query.getLastRound(this.pair.address, {
        gasLimit: this.api.registry.createType("WeightV2", {
          refTime,
          proofSize,
        }) as WeightV2,
        storageDepositLimit,
      });

      if (result.result.isOk && result.output) {
        f = result.output.toHex();
        console.log("result.output", result.output.toHex());
        console.log("result.output", result.output);
      }

      let lastround = this.hexToString(f);

      console.log("lastround", lastround);

      return lastround;
    } catch (e) {
      console.log("error gas", e);
      return "";
    }
  }

  hexToString(hex: string): string {
    let str = "";
    for (let i = 2; i < hex.length; i += 2) {
      const charCode = parseInt(hex.substring(i, i + 2), 16);
      if (charCode) {
        str += String.fromCharCode(charCode);
      }
    }
    return str;
  }

  async startOracle() {
    console.log("Starting Oracle Service");
    await this.init();

    setInterval(async () => {
      let response = await fetch(this.baseUrl);
      const body = await response.text();
      let resp = JSON.parse(body);
      console.log(resp);

      let lastround = await this.getLastRound();

      console.log("lastround from api", Number(resp.round).toString());
      console.log("lastround from contract", lastround);

      if (Number(resp.round).toString() === lastround) {
        console.log("dont update ");
      } else {
        await this.updateOracle(
          resp.round,
          resp.randomness,
          resp.signature,
          resp.previous_signature
        );
      }

      await setTimeout(Number(this.frequencyInMillisecond));
    }, Number(this.frequencyInMillisecond));
  }
}

const randomOracleUpdater = new RandomOracleUpdater();
randomOracleUpdater.startOracle();
