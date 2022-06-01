#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

use ink_storage::traits::{PackedLayout, SpreadLayout};

pub use crate::diadata::{
    Diadata,
    DiadataRef,
};

#[derive(
    Copy, PartialEq, Debug, Clone, scale::Encode, scale::Decode, PackedLayout, SpreadLayout,
)]
#[cfg_attr(
    feature = "std",
    derive(scale_info::TypeInfo, ::ink_storage::traits::StorageLayout)
)]
pub struct ValueTime {
    price: i128,
    timestamp: i128,
}

impl ValueTime {
    pub fn new(price: i128, timestamp: i128) -> Self {
        ValueTime { price, timestamp }
    }
}

#[ink::contract]
pub mod diadata {
    pub use crate::ValueTime;

    use ink_prelude::string::String;
    use ink_storage::{traits::SpreadAllocate, Mapping};

    #[ink(storage)]
    #[derive(SpreadAllocate)]

    pub struct Diadata {
        values: Mapping<String, ValueTime>,
        owner: AccountId,
    }

    impl Diadata {
        #[ink(constructor)]
        pub fn new() -> Self {
            ink_lang::utils::initialize_contract(|contract: &mut Self| {
                contract.values.insert(
                    "",
                    &ValueTime {
                        price: 0,
                        timestamp: 0,
                    },
                );
                contract.owner = Self::env().caller();
            })
        }

        #[ink(constructor)]
        pub fn default() -> Self {
            ink_lang::utils::initialize_contract(|_| {})
        }

        #[ink(message)]
        pub fn get(&self, key: String) -> ValueTime {
            return self.values.get(key).unwrap();
        }

        #[ink(message)]
        pub fn set(&mut self, key: String, price: i128, timestamp: i128) {
            let caller = Self::env().caller();
            assert_eq!(caller, self.owner);
            self.values.insert(
                key,
                &ValueTime {
                    price: price,
                    timestamp: timestamp,
                },
            )
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        use ink_lang as ink;

        #[ink::test]
        fn it_test_get_set() {
            let mut diadata = Diadata::new();
            diadata.set(String::from("ETH"), 1, 3);
            assert_eq!(
                diadata.get(String::from("ETH")),
                ValueTime {
                    price: 1,
                    timestamp: 3,
                }
            );

            diadata.set(String::from("ETH"), 2, 5);
            assert_eq!(
                diadata.get(String::from("ETH")),
                ValueTime {
                    price: 2,
                    timestamp: 5,
                }
            );
        }
    }
}
