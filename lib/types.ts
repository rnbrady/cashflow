export interface Block {
  height: string;
  hash: string;
  timestamp: string;
}

export interface BlockInclusion {
  block: Block;
}

export interface SpendingTransaction {
  hash: string;
}

export interface SpentBy {
  input_index: string;
  transaction: SpendingTransaction;
}

export interface Output {
  output_index: string;
  value_satoshis: string;
  locking_bytecode: string;
  locking_bytecode_pattern: string;
  nonfungible_token_capability: string | null;
  nonfungible_token_commitment: string | null;
  token_category: string | null;
  spent_by?: SpentBy[];
}

export interface Input {
  input_index: string;
  outpoint_transaction_hash: string;
  outpoint_index: string;
  sequence_number: string;
  value_satoshis: string | null;
  unlocking_bytecode?: string;
}

export interface Transaction {
  hash: string;
  encoded_hex: string | null;
  size_bytes: string;
  is_coinbase: boolean;
  locktime: string;
  fee_satoshis: string | null;
  block_inclusions: BlockInclusion[];
  inputs: Input[];
  outputs: Output[];
}

export interface ParentTransaction {
  size_bytes: string;
  fee_satoshis: string | null;
  block_inclusions?: Array<{
    block: {
      height: string;
      timestamp: string;
    };
  }>;
} 