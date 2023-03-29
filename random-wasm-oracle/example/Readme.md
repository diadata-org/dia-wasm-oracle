# Random Oracle Contract

This repository contains the implementation of a `RandomOracle` smart contract designed for the Substrate ecosystem. The `RandomOracle` contract is responsible for storing random values associated with different rounds, which can be updated by the owner of the contract.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Usage](#usage)
- [Example](#example)

## Overview

The `RandomOracle` contract is designed to store random values for different rounds. Each round has an associated `RandomData` struct containing a randomness value, a signature, and the previous signature. The contract provides methods for setting random values and retrieving random values for a given round.

## Setup

1. Clone the repository:

```bash
git clone https://github.com/diadata-org/dia-wasm-oracle.git
cd dia-wasm-oracle/random-wasm-oracle
```

2. Install required tools and dependencies:

```bash
cargo install --force --git https://github.com/paritytech/cargo-contract.git
rustup component add rust-src --toolchain nightly
rustup target add wasm32-unknown-unknown --toolchain nightly
```

## Usage

3. Build the contract:

```bash
cargo +nightly contract build
```

4. Deploy contract using this UI

```
https://contracts-ui.substrate.io/

```

## Example

To use the `RandomOracle` contract in your own project, follow these steps:

1. In your own project, add the `random-wasm-oracle` as a dependency. Open your project's Cargo.toml and add the following:

```rust
[dependencies]
random-wasm-oracle = { path = "path/to/dia-wasm-oracle/random-wasm-oracle" }
```

2. In your project's smart contract, import the necessary modules and types from the `random-wasm-oracle` crate:

```rust
use randomoracle::RandomOracleRef;

```

3. In your contract's storage, add a RandomOracleRef field:

```rust
#[ink(storage)]
pub struct YourContract {
    // Your other fields...
    random_oracle: RandomOracleRef,
}

```

4. In your contract's constructor, add a parameter for the `RandomOracle` contract's address and initialize the `RandomOracleRef`:

```rust
#[ink(constructor)]
pub fn new(random_oracle: AccountId) -> Self {
    Self {
        // Initialize your other fields...
        random_oracle: RandomOracleRef::from_account_id(random_oracle),
    }
}
```

5. Implement methods to interact with the `RandomOracle` contract, e.g., getting random values for a specific round:

```rust
#[ink(message)]
pub fn get_random_value_for_round(&self, round: Vec<u8>) -> Vec<u8> {
    self.random_oracle.get_random_value_for_round(round)
}
```

6. Build and deploy your contract, providing the `RandomOracle` contract's address when instantiating your contract.

7. Interact with your contract to call the methods that use the `RandomOracle` contract.









