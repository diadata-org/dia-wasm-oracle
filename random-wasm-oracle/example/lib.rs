#![cfg_attr(not(feature = "std"), no_std, no_main)]
#![allow(clippy::new_without_default)]

use ink::prelude::vec::Vec;
use randomoracle::RandomOracleRef;
use ink_env::call::FromAccountId;

#[ink::contract]
mod my_contract {
    use super::*;

    #[ink(storage)]
    pub struct MyContract {
        random_oracle: RandomOracleRef,
    }

    impl MyContract {
        #[ink(constructor)]
        pub fn new(random_oracle: AccountId) -> Self {
            Self {
                random_oracle: RandomOracleRef::from_account_id(random_oracle),
            }
        }


        #[ink(message)]
        pub fn get_random_value_for_round(&self, round: Vec<u8>) -> Option<Vec<u8>> {
            self.random_oracle.get_random_value_for_round(round)
        }
    }
}
