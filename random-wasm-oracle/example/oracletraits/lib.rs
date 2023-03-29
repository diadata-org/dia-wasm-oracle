#![cfg_attr(not(feature = "std"), no_std, no_main)]
use ink::prelude::vec::Vec;

#[ink::trait_definition]
pub trait IRandomOracle {

    #[ink(message)]
    fn get_random_value_for_round(&self, round: Vec<u8>) -> Vec<u8>;
 
    // #[ink(message)]
    //  fn get_last_round(&self) -> Vec<u8>;
}
