export const GET_TRANSACTION_DETAILS = `
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
        input_index
        outpoint_transaction_hash
        outpoint_index
        sequence_number
        value_satoshis
        unlocking_bytecode
      }
      outputs {
        output_index
        value_satoshis
        locking_bytecode
        spent_by {
          input_index
          transaction {
            hash
          }
        }
      }
    }
  }
`;

export const GET_PARENT_TRANSACTION = `
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
`; 