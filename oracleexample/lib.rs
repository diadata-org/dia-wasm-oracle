#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod oracleexample {
    use diadata::DiadataRef;
    use ink_prelude::string::String;

    #[derive(
        PartialEq,
        Eq,
    )]
 
    #[ink(storage)]
    pub struct OracleExample {
        diadata: DiadataRef,
    }

    impl OracleExample {
        #[ink(constructor)]
        pub fn new(
            version: u32,
            oracle_code_hash: Hash,
 
        ) -> Self {
            let total_balance = Self::env().balance();
            let salt = version.to_le_bytes();
            let diadata = DiadataRef::new()
                .endowment(total_balance/2)
                .code_hash(oracle_code_hash)
                .salt_bytes(salt)
                .instantiate()
                .unwrap_or_else(|error| {
                    panic!(
                        "failed at instantiating the Oracle contract: {:?}",
                        error
                    )
                });
          
            Self {
                diadata
            }
        }

        #[ink(message)]
        pub fn get(&self ) -> diadata::ValueTime {
            return self.diadata.get(String::from("ETH"));
        }

         #[ink(message)]
         pub fn gettest(&self) -> diadata::ValueTime {
             return diadata::ValueTime::new(12, 12);
          }

    }
} 