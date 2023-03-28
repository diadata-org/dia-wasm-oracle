#![cfg_attr(not(feature = "std"), no_std, no_main)]
#![allow(clippy::new_without_default)]

use ink::prelude::vec::Vec;

#[ink::contract]
mod example {
    use ink::prelude::vec::Vec;
    use oracletraits::IRandomOracle; // Make sure to import the IRandomOracle trait

    #[ink(storage)]
    pub struct Example {
        value: bool,
        randomeoracle: ink::contract_ref!(IRandomOracle),
    }

    impl Example {
        #[ink(constructor)]
        pub fn new(init_value: bool, randomeoracle: AccountId) -> Self {
            Self {
                value: init_value,
                randomeoracle: randomeoracle.into(),
            }
        }

        #[ink(message)]
        pub fn flip(&mut self) {
            self.value = !self.value;
        }

        #[ink(message)]
        pub fn get(&self) -> bool {
            self.value
        }
    }

    impl IRandomOracle for Example {
        fn get_random_value_for_round(&self, round: Vec<u8>) -> Vec<u8> {
            self.randomeoracle.get_random_value_for_round(round)
        }
    }
}
