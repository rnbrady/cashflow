import { Node } from "@xyflow/react"

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
  transaction_hash: string;
  output_index: string;
  locking_bytecode: string;
  locking_bytecode_pattern: string;
  value_satoshis: string;
  nonfungible_token_capability?: string | null;
  nonfungible_token_commitment?: string | null;
  fungible_token_amount?: string | null;
  token_category?: string | null;
  spent_by?: SpentBy[];
}

export interface Input {
  transaction: {
    hash: string;
  };
  input_index: string;
  outpoint_transaction_hash: string;
  outpoint_index: string;
  value_satoshis: string | null;
  sequence_number: string;
  unlocking_bytecode: string;
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

export type InputNodeType = Node<{
  input: Input
} | {
  placeholder: true,
  input: Partial<Input>
}, 'input'> 

export type OutputNodeType = Node<{
  output: Output
} | {
  placeholder: true,
  output: Partial<Output>
}, 'output'> 

export type TransactionNodeType = Node<{
  transaction: Transaction
} | {
  placeholder: true,
  transaction: Partial<Transaction>
}, 'transaction'> 