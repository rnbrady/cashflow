import { Transaction } from "@/lib/types";
import { ChaingraphClient } from "chaingraph-ts";
import { GET_TRANSACTION_DETAILS } from "@/lib/queries";

// Data source configuration
export type DataSource = 'mock' | 'mainnet';
let currentDataSource: DataSource = 'mainnet';

export function setDataSource(source: DataSource) {
  currentDataSource = source;
}

export function getCurrentDataSource(): DataSource {
  return currentDataSource;
}

async function fetchMainnetTransaction(hash: string): Promise<Transaction> {
  const chaingraphUrl = process.env.NEXT_PUBLIC_CHAINGRAPH_URL;
  if (!chaingraphUrl) {
    throw new Error("Chaingraph URL not configured");
  }

  const chaingraphClient = new ChaingraphClient(chaingraphUrl);
  const result = await chaingraphClient.query(GET_TRANSACTION_DETAILS, { txHash: hash });

  if (!result.data?.transaction?.[0]) {
    throw new Error("Transaction could not be found.");
  }

  return result.data.transaction[0];
}

export async function fetchTransactionData(hash: string): Promise<Transaction> {
  // Simulate network delay for mock data only
  if (currentDataSource === 'mock') {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (currentDataSource === 'mock') {
    const transaction = mockTransactions[hash];
    if (!transaction) {
      throw new Error("Transaction could not be found.");
    }
    return transaction;
  } else {
    // For mainnet, we need to add the \x prefix if it's not there
    const formattedHash = hash.startsWith('\\x') ? hash : `\\x${hash}`;
    return fetchMainnetTransaction(formattedHash);
  }
}

export async function getDefaultTransactions(): Promise<Transaction[]> {
  // Simulate network delay for mock data only
  if (currentDataSource === 'mock') {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (currentDataSource === 'mock') {
    // Return a list of default transactions to display
    return Object.values(mockTransactions);
  } else {
    // TODO: Implement fetching recent transactions from mainnet
    throw new Error("Mainnet default transactions not yet implemented");
  }
}

// This is just for development - will be removed once we have the actual data
export function __updateMockData(transactions: Record<string, Transaction>) {
  Object.assign(mockTransactions, transactions);
}

// Mock data to be replaced with actual Chaingraph responses
const mockTransactions: Record<string, Transaction> = {
  "5a4f6b25243c1a2dabb2434e3d9e574f65c31764ce0e7eb4127a46fa74657691": {
    "hash": "\\x5a4f6b25243c1a2dabb2434e3d9e574f65c31764ce0e7eb4127a46fa74657691",
    "encoded_hex": "02000000012cd3a4e63451443f2e5b157b595fadb3f85c0d070b8c5998adbdc0445b48e76e010000006441968c7852e408869e3931640b1f7bba0a60f0652e6f779e1a5a5c954ad4962ac8bdfb2c853305143ae06bd0d87f9ec1e90e7b2e098d5ed07b6314f498f0ec2da5412103ef5d6aa43de4c9bc8a1b7f2c2e325e0b9b2866782779248224be4d2c0c630f5d0000000002e8030000000000001976a91486403657f0c7b1789eb23472f10725061940f7b488ac84ef2300000000001976a91486403657f0c7b1789eb23472f10725061940f7b488ac00000000",
    "size_bytes": "219",
    "is_coinbase": false,
    "locktime": "0",
    "fee_satoshis": "231",
    "block_inclusions": [
      {
        "block": {
          "height": "825261",
          "hash": "\\x0000000000000000024e7aa609a09eba6cc3925edcbac9895c97cec34d8db7e1",
          "timestamp": "1703525009"
        }
      }
    ],
    "inputs": [
      {
        "input_index": "0",
        "outpoint_transaction_hash": "\\x6ee7485b44c0bdad98598c0b070d5cf8b3ad5f597b155b2e3f445134e6a4d32c",
        "outpoint_index": "1",
        "sequence_number": "0",
        "value_satoshis": "2356307",
        "unlocking_bytecode": "\\x41968c7852e408869e3931640b1f7bba0a60f0652e6f779e1a5a5c954ad4962ac8bdfb2c853305143ae06bd0d87f9ec1e90e7b2e098d5ed07b6314f498f0ec2da5412103ef5d6aa43de4c9bc8a1b7f2c2e325e0b9b2866782779248224be4d2c0c630f5d"
      }
    ],
    "outputs": [
      {
        "output_index": "0",
        "value_satoshis": "1000",
        "locking_bytecode": "\\x76a91486403657f0c7b1789eb23472f10725061940f7b488ac",
        "locking_bytecode_pattern": "76a91488ac",
        "nonfungible_token_capability": null,
        "nonfungible_token_commitment": null,
        "token_category": null,
        "spent_by": [
          {
            "input_index": "0",
            "transaction": {
              "hash": "\\x25872a2d5f05d708ba8f28c8a44539a6650f942708ac76cdc6af86969ad157bf"
            }
          }
        ]
      },
      {
        "output_index": "1",
        "value_satoshis": "2355076",
        "locking_bytecode": "\\x76a91486403657f0c7b1789eb23472f10725061940f7b488ac",
        "locking_bytecode_pattern": "76a91488ac",
        "nonfungible_token_capability": null,
        "nonfungible_token_commitment": null,
        "token_category": null,
        "spent_by": [
          {
            "input_index": "0",
            "transaction": {
              "hash": "\\x105494c7e477172f563ba8baf3e890c2ad20fd6cabbf67a28c59f74d753ee494"
            }
          }
        ]
      }
    ]
  },
  "25872a2d5f05d708ba8f28c8a44539a6650f942708ac76cdc6af86969ad157bf": {
    "hash": "\\x25872a2d5f05d708ba8f28c8a44539a6650f942708ac76cdc6af86969ad157bf",
    "encoded_hex": "020000000391766574fa467a12b47e0ece6417c3654f579e3d4e43b2ab2d1a3c24256b4f5a0000000064414900bddcf2342c3ad1dda9aa8034ffbd6e175c74844b6e3940eaf380d3071cfaef4bcb7a19f4fce0f9998b2ee75787c96fd6e0b6f0f21202f8b82de69d33819b412103ef5d6aa43de4c9bc8a1b7f2c2e325e0b9b2866782779248224be4d2c0c630f5d0000000094e43e754df7598ca267bfab6cfd20adc290e8f3baa83b562f1777e4c794541000000000644124d82c4b3deb834fa4233bf8682a203294d4e23a2e8492abf57e00954d9c4ef08d6372a02dfab3a112ecd71ea2c86cc68c63316e0a9ac8d3075ba7066ea9748d412103ef5d6aa43de4c9bc8a1b7f2c2e325e0b9b2866782779248224be4d2c0c630f5d0000000094e43e754df7598ca267bfab6cfd20adc290e8f3baa83b562f1777e4c794541001000000644187b52aadc376bc232af87900b31b0713ae8dba0594bd1b44a854a959c203a85a714176049aa50f039ffc23d85d45349165c9840df9b019687029458cb644cf91412103ef5d6aa43de4c9bc8a1b7f2c2e325e0b9b2866782779248224be4d2c0c630f5d0000000004e80300000000000039ef91766574fa467a12b47e0ece6417c3654f579e3d4e43b2ab2d1a3c24256b4f5a22a91453be7acaf98c40b09a65f0566d13939cb247e93487e8030000000000003def94e43e754df7598ca267bfab6cfd20adc290e8f3baa83b562f1777e4c794541060010076a91486403657f0c7b1789eb23472f10725061940f7b488ac0000000000000000b56a0442434d5220cb35a401d6a0124952433ea3b5caed1ce7dc421420a083ccc31916d98bce1f904c506e667473746f726167652e6c696e6b2f697066732f6261666b726569676c6777736164767661636a657665717a36756f32347633693434376f6565666261756362347a71797a63336d797874713773613b6261666b726569676c6777736164767661636a657665717a36756f32347633693434376f6565666261756362347a71797a63336d797874713773617ae72300000000001976a91486403657f0c7b1789eb23472f10725061940f7b488ac00000000",
    "size_bytes": "793",
    "is_coinbase": false,
    "locktime": "0",
    "fee_satoshis": "827",
    "block_inclusions": [
      {
        "block": {
          "height": "825261",
          "hash": "\\x0000000000000000024e7aa609a09eba6cc3925edcbac9895c97cec34d8db7e1",
          "timestamp": "1703525009"
        }
      }
    ],
    "inputs": [
      {
        "input_index": "0",
        "outpoint_transaction_hash": "\\x5a4f6b25243c1a2dabb2434e3d9e574f65c31764ce0e7eb4127a46fa74657691",
        "outpoint_index": "0",
        "sequence_number": "0",
        "value_satoshis": "1000",
        "unlocking_bytecode": "\\x414900bddcf2342c3ad1dda9aa8034ffbd6e175c74844b6e3940eaf380d3071cfaef4bcb7a19f4fce0f9998b2ee75787c96fd6e0b6f0f21202f8b82de69d33819b412103ef5d6aa43de4c9bc8a1b7f2c2e325e0b9b2866782779248224be4d2c0c630f5d"
      },
      {
        "input_index": "1",
        "outpoint_transaction_hash": "\\x105494c7e477172f563ba8baf3e890c2ad20fd6cabbf67a28c59f74d753ee494",
        "outpoint_index": "0",
        "sequence_number": "0",
        "value_satoshis": "1000",
        "unlocking_bytecode": "\\x4124d82c4b3deb834fa4233bf8682a203294d4e23a2e8492abf57e00954d9c4ef08d6372a02dfab3a112ecd71ea2c86cc68c63316e0a9ac8d3075ba7066ea9748d412103ef5d6aa43de4c9bc8a1b7f2c2e325e0b9b2866782779248224be4d2c0c630f5d"
      },
      {
        "input_index": "2",
        "outpoint_transaction_hash": "\\x105494c7e477172f563ba8baf3e890c2ad20fd6cabbf67a28c59f74d753ee494",
        "outpoint_index": "1",
        "sequence_number": "0",
        "value_satoshis": "2353845",
        "unlocking_bytecode": "\\x4187b52aadc376bc232af87900b31b0713ae8dba0594bd1b44a854a959c203a85a714176049aa50f039ffc23d85d45349165c9840df9b019687029458cb644cf91412103ef5d6aa43de4c9bc8a1b7f2c2e325e0b9b2866782779248224be4d2c0c630f5d"
      }
    ],
    "outputs": [
      {
        "output_index": "0",
        "value_satoshis": "1000",
        "locking_bytecode": "\\xa91453be7acaf98c40b09a65f0566d13939cb247e93487",
        "locking_bytecode_pattern": "a91487",
        "nonfungible_token_capability": "minting",
        "nonfungible_token_commitment": "\\x",
        "token_category": "\\x5a4f6b25243c1a2dabb2434e3d9e574f65c31764ce0e7eb4127a46fa74657691",
        "spent_by": [
          {
            "input_index": "0",
            "transaction": {
              "hash": "\\xe365b2acecf035a6e291125c29e9edcc2606e70859512d3968bf61c5e8c9a0d5"
            }
          }
        ]
      },
      {
        "output_index": "1",
        "value_satoshis": "1000",
        "locking_bytecode": "\\x76a91486403657f0c7b1789eb23472f10725061940f7b488ac",
        "locking_bytecode_pattern": "76a91488ac",
        "nonfungible_token_capability": "none",
        "nonfungible_token_commitment": "\\x00",
        "token_category": "\\x105494c7e477172f563ba8baf3e890c2ad20fd6cabbf67a28c59f74d753ee494",
        "spent_by": [
          {
            "input_index": "1",
            "transaction": {
              "hash": "\\xe365b2acecf035a6e291125c29e9edcc2606e70859512d3968bf61c5e8c9a0d5"
            }
          }
        ]
      },
      {
        "output_index": "2",
        "value_satoshis": "0",
        "locking_bytecode": "\\x6a0442434d5220cb35a401d6a0124952433ea3b5caed1ce7dc421420a083ccc31916d98bce1f904c506e667473746f726167652e6c696e6b2f697066732f6261666b726569676c6777736164767661636a657665717a36756f32347633693434376f6565666261756362347a71797a63336d797874713773613b6261666b726569676c6777736164767661636a657665717a36756f32347633693434376f6565666261756362347a71797a63336d797874713773617a",
        "locking_bytecode_pattern": "6a04204c3b",
        "nonfungible_token_capability": null,
        "nonfungible_token_commitment": null,
        "token_category": null,
        "spent_by": []
      },
      {
        "output_index": "3",
        "value_satoshis": "2353018",
        "locking_bytecode": "\\x76a91486403657f0c7b1789eb23472f10725061940f7b488ac",
        "locking_bytecode_pattern": "76a91488ac",
        "nonfungible_token_capability": null,
        "nonfungible_token_commitment": null,
        "token_category": null,
        "spent_by": [
          {
            "input_index": "2",
            "transaction": {
              "hash": "\\x0ae56eb887446de16003261b833905a3c3472d19525a238125006b943c60a30a"
            }
          }
        ]
      }
    ]
  },
  "e365b2acecf035a6e291125c29e9edcc2606e70859512d3968bf61c5e8c9a0d5": {
    "hash": "\\xe365b2acecf035a6e291125c29e9edcc2606e70859512d3968bf61c5e8c9a0d5",
    "encoded_hex": "0200000003bf57d19a9686afc6cd76ac0827940f65a63945a4c8288fba08d7055f2d2a8725000000003251302094e43e754df7598ca267bfab6cfd20adc290e8f3baa83b562f1777e4c794541051ce8851d0009d6300cdc0c7886851feffffffbf57d19a9686afc6cd76ac0827940f65a63945a4c8288fba08d7055f2d2a8725010000006441087d42a4e6e929038e9b237fbfb77e55c1284ce693760a33090810ea70f65c10aa0660a85c85d5bfa7f3522eec670fb6a2c5f039bd2d4165c0ead71d66a13e57412103ef5d6aa43de4c9bc8a1b7f2c2e325e0b9b2866782779248224be4d2c0c630f5dfeffffff8d6696de5d000834c1bd75698e78c4b5f28ccadfb2c5b238d3f53b720b91e03b01000000644109a1af1642f811185d8c2d07d0986e843ef1f80aa1bc844e291d20069c11f658570f9b98afbfed893dba91109c7f64d12de0d64403f13c67fd12c7e293f62abe412103ef5d6aa43de4c9bc8a1b7f2c2e325e0b9b2866782779248224be4d2c0c630f5dfeffffff04e8030000000000003bef91766574fa467a12b47e0ece6417c3654f579e3d4e43b2ab2d1a3c24256b4f5a620101a91453be7acaf98c40b09a65f0566d13939cb247e93487e8030000000000003def94e43e754df7598ca267bfab6cfd20adc290e8f3baa83b562f1777e4c794541060010076a91486403657f0c7b1789eb23472f10725061940f7b488ace8030000000000003def91766574fa467a12b47e0ece6417c3654f579e3d4e43b2ab2d1a3c24256b4f5a60010176a91486403657f0c7b1789eb23472f10725061940f7b488acb0d92300000000001976a91486403657f0c7b1789eb23472f10725061940f7b488acb1970c00",
    "size_bytes": "625",
    "is_coinbase": false,
    "locktime": "825265",
    "fee_satoshis": "1186",
    "block_inclusions": [
      {
        "block": {
          "height": "825266",
          "hash": "\\x000000000000000002b859c00f526276a9538e4a6bb728f551a45a4135d766c7",
          "timestamp": "1703529437"
        }
      }
    ],
    "inputs": [
      {
        "input_index": "0",
        "outpoint_transaction_hash": "\\x25872a2d5f05d708ba8f28c8a44539a6650f942708ac76cdc6af86969ad157bf",
        "outpoint_index": "0",
        "sequence_number": "4294967294",
        "value_satoshis": "1000",
        "unlocking_bytecode": "\\x51302094e43e754df7598ca267bfab6cfd20adc290e8f3baa83b562f1777e4c794541051ce8851d0009d6300cdc0c7886851"
      },
      {
        "input_index": "1",
        "outpoint_transaction_hash": "\\x25872a2d5f05d708ba8f28c8a44539a6650f942708ac76cdc6af86969ad157bf",
        "outpoint_index": "1",
        "sequence_number": "4294967294",
        "value_satoshis": "1000",
        "unlocking_bytecode": "\\x41087d42a4e6e929038e9b237fbfb77e55c1284ce693760a33090810ea70f65c10aa0660a85c85d5bfa7f3522eec670fb6a2c5f039bd2d4165c0ead71d66a13e57412103ef5d6aa43de4c9bc8a1b7f2c2e325e0b9b2866782779248224be4d2c0c630f5d"
      },
      {
        "input_index": "2",
        "outpoint_transaction_hash": "\\x3be0910b723bf5d338b2c5b2dfca8cf2b5c4788e6975bdc13408005dde96668d",
        "outpoint_index": "1",
        "sequence_number": "4294967294",
        "value_satoshis": "2351674",
        "unlocking_bytecode": "\\x4109a1af1642f811185d8c2d07d0986e843ef1f80aa1bc844e291d20069c11f658570f9b98afbfed893dba91109c7f64d12de0d64403f13c67fd12c7e293f62abe412103ef5d6aa43de4c9bc8a1b7f2c2e325e0b9b2866782779248224be4d2c0c630f5d"
      }
    ],
    "outputs": [
      {
        "output_index": "0",
        "value_satoshis": "1000",
        "locking_bytecode": "\\xa91453be7acaf98c40b09a65f0566d13939cb247e93487",
        "locking_bytecode_pattern": "a91487",
        "nonfungible_token_capability": "minting",
        "nonfungible_token_commitment": "\\x01",
        "token_category": "\\x5a4f6b25243c1a2dabb2434e3d9e574f65c31764ce0e7eb4127a46fa74657691",
        "spent_by": [
          {
            "input_index": "0",
            "transaction": {
              "hash": "\\x45f7ba33678a86e2cc35e34292e0d14d6048a5f9610450d7b35b80083109d893"
            }
          }
        ]
      },
      {
        "output_index": "1",
        "value_satoshis": "1000",
        "locking_bytecode": "\\x76a91486403657f0c7b1789eb23472f10725061940f7b488ac",
        "locking_bytecode_pattern": "76a91488ac",
        "nonfungible_token_capability": "none",
        "nonfungible_token_commitment": "\\x00",
        "token_category": "\\x105494c7e477172f563ba8baf3e890c2ad20fd6cabbf67a28c59f74d753ee494",
        "spent_by": [
          {
            "input_index": "1",
            "transaction": {
              "hash": "\\x45f7ba33678a86e2cc35e34292e0d14d6048a5f9610450d7b35b80083109d893"
            }
          }
        ]
      },
      {
        "output_index": "2",
        "value_satoshis": "1000",
        "locking_bytecode": "\\x76a91486403657f0c7b1789eb23472f10725061940f7b488ac",
        "locking_bytecode_pattern": "76a91488ac",
        "nonfungible_token_capability": "none",
        "nonfungible_token_commitment": "\\x01",
        "token_category": "\\x5a4f6b25243c1a2dabb2434e3d9e574f65c31764ce0e7eb4127a46fa74657691",
        "spent_by": [
          {
            "input_index": "0",
            "transaction": {
              "hash": "\\x7df6a0e8d09defaa052704c13a0b89baee4ad82b1e7205d079914b5edb39058a"
            }
          }
        ]
      },
      {
        "output_index": "3",
        "value_satoshis": "2349488",
        "locking_bytecode": "\\x76a91486403657f0c7b1789eb23472f10725061940f7b488ac",
        "locking_bytecode_pattern": "76a91488ac",
        "nonfungible_token_capability": null,
        "nonfungible_token_commitment": null,
        "token_category": null,
        "spent_by": [
          {
            "input_index": "2",
            "transaction": {
              "hash": "\\x45f7ba33678a86e2cc35e34292e0d14d6048a5f9610450d7b35b80083109d893"
            }
          }
        ]
      }
    ]
  }
};

