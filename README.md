# diadaia-wasm

Diadata Key/Value oracle written using wasm, can be deployed to supported substrate chains.


### Functions of oracle

*get* : Gets the latest value of the asset symbol with timestamp

*set* : Sets latest value of asset, requires price and timestamp. Can be called only by the owner of contract

### setup instructions for cargo contract 

https://github.com/paritytech/cargo-contract

### Deployed Contract

Network: Astar testnet (Shibuya) : 0x4a9c229ed1905dde10b863370b07f11dee983e022319fb297580e2f19b51e6fc


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