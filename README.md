# DIA WASM oracle

This project contains the diadata Key/Value oracle written using wasm, can be deployed to supported substrate chains.


### Functions of the wasm oracle

*get* : Gets the latest value of the asset symbol with timestamp

*set* : Sets latest value of asset, requires price and timestamp. Can be called only by the owner of contract

### setup instructions for cargo contract

https://github.com/paritytech/cargo-contract

### Deployed Contract

Network: Astar testnet (Shibuya) : [YpfUaqH4zMcEo8Kw1egpPrjAGmBDWu1VVTLEEimXr2Kzevb](https://shibuya.subscan.io/account/YpfUaqH4zMcEo8Kw1egpPrjAGmBDWu1VVTLEEimXr2Kzevb)

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
