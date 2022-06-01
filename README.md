# DIA WASM oracle

This project contains the diadata Key/Value oracle written using wasm, can be deployed to supported substrate chains.


### Functions of the wasm oracle

*get* : Gets the latest value of the asset symbol with timestamp

*set* : Sets latest value of asset, requires price and timestamp. Can be called only by the owner of contract

### setup instructions for cargo contract

https://github.com/paritytech/cargo-contract

### Deployed Contract

Network: Astar testnet (Shibuya) : [X5NLwAUYX7FwVk25a8JwaXtuVJQsW87GQcKxYoF3aLyu8Pz](https://shibuya.subscan.io/account/YpfUaqH4zMcEo8Kw1egpPrjAGmBDWu1VVTLEEimXr2Kzevb)

### Running Oracle Service

Set required environment variables

````
PRIVATE_KEY=
UNLOCK_PASSWORD=
CONTRACT_ADDRESS=
RPC_ADDRESS=
SYMBOLS=

````

after setting up environmnet variables run these command to start service


````
cd oracle
npm run build
npm run start

````

### Using Diadata Oracle in your contracts

To access value from diadata wasm oracles you need to copy diadata directory to your contract so that you can access diadata structs from it


#### Changes in your contract

Create storage with DiaDataref, this is used to access values from oracle

````

    #[ink(storage)]
    pub struct OracleExample {
        diadata: DiadataRef,
        ....
        ....
    }

````

thsi diadata can be used to access pub functions from the oracle contract


#### Link Diadataref with Diadata oracle

To access oracle you need to pass diadata orale address, either using constructor or you can create a separate write function to update the value of oracle in later stage

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

Here oracle_address refers to diadata oracle address


#### Access value

To access value you can simple call diadata oracle function 


````
 pub fn get(&self ) -> diadata::ValueTime {
            return self.diadata.get(String::from("ETH"));
        }

````

This gives ETH value time given by the oracle


#### Config changes

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

Make sure Version of ink should be v3.0.1


 
