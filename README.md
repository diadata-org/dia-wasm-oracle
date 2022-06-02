# DIA WASM Oracle

This project contains the diadata Key/Value oracle written using wasm (web-assembly), which can be deployed to supported substrate chains.
A demo instance is currently deployed on Shibuya testnet.

## Functions of the Wasm Oracle

*get* : Gets the latest value of the asset symbol with timestamp. Can be called by anyone.

*set* : Sets latest value of asset, requires price and timestamp. Can be called only by the owner of contract.

## Deployed Contracts

A demo instance of this contract is currently deployed to Astar Shibuya Testnet:

| Network Name            | Contract address |
| ----------------------- | ---------------- |
| Astar testnet (Shibuya) | [X5NLwAUYX7FwVk25a8JwaXtuVJQsW87GQcKxYoF3aLyu8Pz](https://shibuya.subscan.io/account/X5NLwAUYX7FwVk25a8JwaXtuVJQsW87GQcKxYoF3aLyu8Pz) |

## Using a DIA Oracle in Your Contracts

To access values from DIA wasm oracles you need to copy the `diadata` directory to your contract so that you can access DIA structs, that contain the oracle data.

### Changes in Your Contract

Create storage with DiaDataref, this is used to access values from oracle

````
    #[ink(storage)]
    pub struct OracleExample {
        diadata: DiadataRef,
        ....
        ....
    }
````

This struct can be used to access data from pub functions from the oracle contract.

### Link DiadataRef with Deployed DIA Oracle

To instantiate a contract's access to the oracle you need to pass the DIA oracle address, either using the constructor or by creating a separate write function to update with the value of oracle at a later stage.

Example using constructor

````

        #[ink(constructor)]
        pub fn new(
            oracle_address: AccountId, 
        ) -> Self {
            let diadata: DiadataRef = ink_env::call::FromAccountId::from_account_id(oracle_address);  
            Self {
                diadata
            }
        }

````

Here,`oracle_address` refers to the DIA oracle address of a [deployed oracle contract](#deployed-contracts).


### Access Value

Next, to access an oracle value you can simple call the `get()` function

````
 pub fn get(&self ) -> diadata::ValueTime {
            return self.diadata.get(String::from("ETH"));
        }

````

This gives the ETH price value time given by the oracle.


### Config Changes

Make sure you add diadata/std in you config

````

std = [
    "ink_metadata/std",
    "ink_env/std",
    "ink_storage/std",
    "ink_primitives/std",
    "scale/std",
    "scale-info/std",
    "diadata/std",

]

````

Make sure the version of ink you are on is v3.0.1

## Running the Oracle Service Yourself

You can also run a copy of the oracle service yourself on any supported wasm chain.
This is not necessary to access data on an existing oracle.

### Deploy the Oracle Contract

You can deploy the oracle contract using the polkadot.js web interface: https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc.shibuya.astar.network#/contracts

### Setup Instructions for Cargo Contract

To develop smart contracts in wasm with ink, run the setup of cargo-contract first:

https://github.com/paritytech/cargo-contract

Set the required environment variables for the oracle feeder:

````
PRIVATE_KEY=<private key of the updater address in json format>
UNLOCK_PASSWORD=<optional password for the private key>
CONTRACT_ADDRESS=<address of deployed wasm contract>
RPC_ADDRESS=<HTTP address of the node to connect to>
SYMBOLS=<comma separated values of asset symbols to update>
````

After setting up these environmnet variables you can run the following commands to start the feeder service:

````
cd oracle
npm run build
npm run start
````
