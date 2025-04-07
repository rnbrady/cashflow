import { graphql } from "chaingraph-ts";

export const GET_TRANSACTION_DETAILS = graphql(`
  query GetTransactionDetails($txHash: bytea!) {
    transaction(where: { hash: { _eq: $txHash } }) {
      hash
      encoded_hex
      size_bytes
      is_coinbase
      locktime
      fee_satoshis
      block_inclusions {
        block {
          height
          hash
          timestamp
        }
      }
      inputs {
        transaction {
          hash
        }
        input_index
        outpoint {
          transaction_hash
          output_index
          token_category
          nonfungible_token_capability
          nonfungible_token_commitment
          fungible_token_amount
        }
        outpoint_transaction_hash
        outpoint_index
        sequence_number
        value_satoshis
        unlocking_bytecode
      }
      outputs {
        transaction_hash
        output_index
        value_satoshis
        locking_bytecode
        locking_bytecode_pattern
        nonfungible_token_capability
        nonfungible_token_commitment
        fungible_token_amount
        token_category
        spent_by {
          input_index
          transaction {
            hash
          }
        }
      }
    }
  }
`);

export const GET_PARENT_TRANSACTION = graphql(`
  query GetParentTransaction($txHash: bytea!) {
    transaction(where: { hash: { _eq: $txHash } }) {
      size_bytes
      fee_satoshis
      block_inclusions {
        block {
          height
          timestamp
        }
      }
    }
  }
`);
