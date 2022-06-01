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
            oracle_address: AccountId, 
        ) -> Self {
            let diadata: DiadataRef = ink_env::call::FromAccountId::from_account_id(oracle_address);  
            Self {
                diadata
            }
        }

        #[ink(message)]
        pub fn get(&self,key:String ) -> diadata::ValueTime {
            return self.diadata.get(key);
        }

         #[ink(message)]
         pub fn gettest(&self) -> diadata::ValueTime {
             return diadata::ValueTime::new(12, 12);
          }

    }
}