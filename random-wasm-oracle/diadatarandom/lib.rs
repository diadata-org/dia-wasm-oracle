#![cfg_attr(not(feature = "std"), no_std)]

use ink::{
     prelude::string::String
};
 
#[derive(PartialEq, Debug, Clone, scale::Encode, scale::Decode)]
#[cfg_attr(
    feature = "std",
    derive(scale_info::TypeInfo,::ink::storage::traits::StorageLayout)
)]

pub struct Randomdata {
    randomness: String,
    signature: String,
    previous_signature: String,
}

#[ink::contract]
pub mod randomoracle {
    pub use crate::Randomdata;
    use ink::storage::Mapping;
    use ink::prelude::string::String;


    #[ink(storage)]
    #[derive(Default)]

    pub struct RandomOracle {
        value: Mapping<String, Randomdata>,
    }

    impl RandomOracle {
        #[ink(constructor)]
        pub fn new() -> Self {
            Default::default()
        }

   
        #[ink(message)]
        pub fn set_random_value(
            &mut self,
            round: String,
            randomness: String,
            signature: String,
            previous_signature: String,
        ) {
            // set access
            self.value.insert(
                round,
                &Randomdata {
                    randomness: randomness,
                    signature: signature,
                    previous_signature: previous_signature,
                },
            );
        }

        #[ink(message)]
        pub fn get_random_value_for_round(
            &self,
            round: String,
        ) -> String {
            return self.value.get(round).unwrap().randomness  
        }

        #[ink(message)]
        pub fn get_round(
            &self,
            round: String,
        ) -> Randomdata {
            return self.value.get(round).unwrap()  
        }
    }
}
