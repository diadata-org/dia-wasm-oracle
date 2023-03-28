#![cfg_attr(not(feature = "std"), no_std)]

use ink::prelude::vec::Vec;

pub use crate::randomoracle::{
    RandomOracle,
    RandomOracleRef,
};

#[ink::trait_definition]
pub trait IRandomOracle {

    #[ink(message)]
    fn get_random_value_for_round(&self, round: Vec<u8>) -> Vec<u8>;
 
    #[ink(message)]
     fn get_last_round(&self) -> Vec<u8>;
}

#[derive(PartialEq, Debug, Clone, scale::Encode, scale::Decode)]
#[cfg_attr(
    feature = "std",
    derive(scale_info::TypeInfo, ::ink::storage::traits::StorageLayout)
)]

pub struct RandomData {
    randomness: Vec<u8>,
    signature: Vec<u8>,
    previous_signature: Vec<u8>,
}

#[ink::contract]
pub mod randomoracle {
    use super::*;
    pub use crate::RandomData;

    use ink::storage::Mapping;

    #[ink(storage)]

    pub struct RandomOracle {
        value: Mapping<Vec<u8>, RandomData>,
        owner: AccountId,
        last_round: Vec<u8>,

    }

    impl RandomOracle {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                value: Mapping::default(),
                owner: Self::env().caller(),
                last_round: Vec::default(),
            }
        }

        #[ink(message)]
        pub fn set_random_value(
            &mut self,
            round: Vec<u8>,
            randomness: Vec<u8>,
            signature: Vec<u8>,
            previous_signature: Vec<u8>,
        ) {
            let caller = Self::env().caller();
            assert_eq!(caller, self.owner);
            self.last_round = round.clone();
            self.value.insert(
                round,
                &RandomData {
                    randomness: randomness,
                    signature: signature,
                    previous_signature: previous_signature,
                },
            );
        }

        #[ink(message)]
        pub fn get_round(&self, round: Vec<u8>) -> Option<RandomData> {
            if let Some(random_data) = self.value.get(round) {
                Some(random_data.clone())
            } else {
                None
            }
        }
    }

    impl IRandomOracle for RandomOracle {

        #[ink(message)]
          fn get_random_value_for_round(&self, round: Vec<u8>) -> Vec<u8> {
            return self.value.get(round).unwrap().randomness.clone();
        }


        #[ink(message)]
          fn get_last_round(&self) -> Vec<u8> {
            return self.last_round.clone();
        }
    }
    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn test_all() {
            let mut contract = RandomOracle::new();
            let round_invalid = vec![1u8, 1, 3];

            let round = vec![1u8, 2, 3];
            let randomness = vec![4u8, 5, 6];
            let signature = vec![7u8, 8, 9];
            let previous_signature = vec![10u8, 11, 12];
            contract.set_random_value(round.clone(), randomness.clone(), signature.clone(), previous_signature.clone());

            assert_eq!(contract.get_random_value_for_round(round.clone()), randomness);
            contract.get_round(round_invalid.clone());
            assert_eq!(contract.get_last_round(), round);
        }
    }
}
