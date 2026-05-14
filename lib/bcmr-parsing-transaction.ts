import type { Node, XYPosition } from "@xyflow/react";

import type {
  InputNodeType,
  OutputNodeType,
  Transaction,
  TransactionNodeType,
} from "@/lib/types";

const nodeWidth = 400;
const inputOutputWidth = 180;
const inputOutputHeight = 93;

export const bcmrParsingTransactionNodeId = "bcmr-parsing-transaction";

const zeroHash =
  "0000000000000000000000000000000000000000000000000000000000000000";

export function createBcmrParsingTransactionNodes({
  position,
}: {
  position: XYPosition;
}): Node[] {
  const transaction: Transaction = {
    hash: zeroHash,
    encoded_hex: null,
    size_bytes: "0",
    is_coinbase: false,
    locktime: "0",
    fee_satoshis: null,
    block_inclusions: [],
    inputs: [
      {
        transaction: { hash: zeroHash },
        input_index: "0",
        outpoint_transaction_hash: "",
        outpoint_index: "0",
        value_satoshis: "0",
        sequence_number: "0",
        unlocking_bytecode: "",
        unlocking_bytecode_pattern: null,
        redeem_bytecode_pattern: null,
        outpoint: {
          transaction_hash: "",
          output_index: "0",
          locking_bytecode: null,
          locking_bytecode_pattern: null,
          value_satoshis: "0",
          nonfungible_token_capability: null,
          nonfungible_token_commitment: null,
          fungible_token_amount: null,
          token_category: null,
        },
      },
      {
        transaction: { hash: zeroHash },
        input_index: "1",
        outpoint_transaction_hash: zeroHash,
        outpoint_index: "0",
        value_satoshis: "0",
        sequence_number: "0",
        unlocking_bytecode: "\\x51",
        unlocking_bytecode_pattern: "51",
        redeem_bytecode_pattern: null,
        outpoint: {
          transaction_hash: zeroHash,
          output_index: "0",
          locking_bytecode: null,
          locking_bytecode_pattern: null,
          value_satoshis: "0",
        },
      },
    ],
    outputs: [
      {
        transaction_hash: zeroHash,
        output_index: "0",
        locking_bytecode: "\\x6a",
        locking_bytecode_pattern: "6a",
        value_satoshis: "0",
        spent_by: [],
      },
    ],
  };

  const transactionNode: TransactionNodeType = {
    id: bcmrParsingTransactionNodeId,
    type: "transaction",
    data: {
      transaction,
      placeholder: false,
      synthetic: true,
    },
    position,
  };

  const inputNodes: InputNodeType[] = transaction.inputs.map((input) => ({
    id: `${bcmrParsingTransactionNodeId}-input-${input.input_index}`,
    type: "input",
    data: {
      input,
      placeholder: false,
      synthetic: true,
    },
    parentId: bcmrParsingTransactionNodeId,
    extent: "parent" as const,
    position: {
      x: 0,
      y: 45 + Number(input.input_index) * inputOutputHeight,
    },
    style: { width: inputOutputWidth, padding: "0px", border: "none" },
    dragHandle: "nonexistent-class-to-prevent-dragging",
  }));

  const outputNodes: OutputNodeType[] = transaction.outputs.map((output) => ({
    id: `${bcmrParsingTransactionNodeId}-output-${output.output_index}`,
    type: "output",
    data: {
      output,
      placeholder: false,
      synthetic: true,
    },
    parentId: bcmrParsingTransactionNodeId,
    extent: "parent" as const,
    position: {
      x: nodeWidth - inputOutputWidth,
      y: 45 + Number(output.output_index) * inputOutputHeight,
    },
    style: { width: inputOutputWidth, padding: "0px", border: "none" },
    dragHandle: "nonexistent-class-to-prevent-dragging",
  }));

  return [transactionNode, ...inputNodes, ...outputNodes];
}
