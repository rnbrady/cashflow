import {
  Transaction,
  InputNodeType,
  OutputNodeType,
  TransactionNodeType,
  SpentEdgeType,
} from "@/lib/types";
import { fetchTransactionData } from "@/lib/chaingraph-api";
import { Edge, Node } from "@xyflow/react";

const defaultInputHeight = 93;

const defaultOutputHeight = 93;

export async function fetchAndDraw({
  transactionHashes,
  addNodesAndEdges,
}: {
  transactionHashes: string[];
  addNodesAndEdges: ({
    newNodes,
    newEdges,
    layout,
  }: {
    newNodes: Node[];
    newEdges: Edge[];
    layout?: boolean;
  }) => void;
}) {
  const nodesAndEdges: { nodes: Node[]; edges: Edge[] }[] = await Promise.all(
    transactionHashes.map(async (transactionHash) => {
      const transaction: Transaction = await fetchTransactionData(
        transactionHash
      );

      const mainTransaction = {
        id: transaction.hash,
        type: "transaction",
        data: {
          transaction: transaction,
          placeholder: false,
        },
        position: {
          x: 0,
          y: 0,
        },
      };

      const inputs: InputNodeType[] = transaction.inputs.map((input) => ({
        id: `${input.transaction.hash}-input-${input.input_index}`,
        type: "input",
        data: {
          input: input,
          placeholder: false,
        },
        parentId: input.transaction.hash,
        extent: "parent" as const,
        position: {
          x: 0,
          y: 45 + Number(input.input_index) * defaultInputHeight,
        },
        style: { width: 180, padding: "0px", border: "none" },
        dragHandle: "nonexistent-class-to-prevent-dragging",
      }));

      const upstreamTransactions = transaction.inputs
        .filter(
          (input) =>
            input.outpoint_transaction_hash !==
            "\\x0000000000000000000000000000000000000000000000000000000000000000"
        )
        .map((input) => ({
          id: `${input.outpoint_transaction_hash}`,
          type: "transaction",
          data: {
            transaction: {
              hash: input.outpoint_transaction_hash,
              minOutputs: Number(input.outpoint_index) + 1,
            },
            placeholder: true,
          },
          position: {
            x: -500,
            y: 0,
          },
        }));

      const upstreamOutputs = transaction.inputs
        .filter(
          (input) =>
            input.outpoint_transaction_hash !==
            "\\x0000000000000000000000000000000000000000000000000000000000000000"
        )
        .map((input) => ({
          id: `${input.outpoint_transaction_hash}-output-${input.outpoint_index}`,
          type: "output",
          data: {
            output: {
              transaction_hash: input.outpoint_transaction_hash,
              output_index: input.outpoint_index,
              value_satoshis: input.value_satoshis,
              unlocking_bytecode: input.unlocking_bytecode,
              unlocking_bytecode_pattern: input.unlocking_bytecode_pattern,
              redeem_bytecode_pattern: input.redeem_bytecode_pattern,
            },
            placeholder: true,
          },
          // parentId: input.outpoint_transaction_hash,
          // extent: "parent" as const,
          position: {
            x: -500,
            y: 45 + Number(input.outpoint_index) * defaultOutputHeight,
          },
          style: { width: 180, padding: "0px", border: "none" },
        }));

      const upstreamEdges: SpentEdgeType[] = transaction.inputs
        .filter(
          (input) =>
            input.outpoint_transaction_hash !==
            "\\x0000000000000000000000000000000000000000000000000000000000000000"
        )
        .map((input) => ({
          id: `${input.transaction.hash}-edge-${input.input_index}`,
          source: `${input.outpoint_transaction_hash}-output-${input.outpoint_index}`,
          target: `${input.transaction.hash}-input-${input.input_index}`,
          data: {
            output: input.outpoint,
          },
        }));

      const outputs: OutputNodeType[] = transaction.outputs.map((output) => ({
        id: `${output.transaction_hash}-output-${output.output_index}`,
        type: "output",
        data: {
          output: output,
          placeholder: false,
        },
        parentId: output.transaction_hash,
        extent: "parent" as const,
        position: {
          x: 220,
          y: 45 + Number(output.output_index) * defaultOutputHeight,
        },
        style: { width: 180, padding: "0px", border: "none" },
        dragHandle: "nonexistent-class-to-prevent-dragging",
      }));

      const downstreamTransactions: TransactionNodeType[] = transaction.outputs
        .filter((output) => output.spent_by && output.spent_by.length > 0)
        .map((output) => ({
          id: `${output.spent_by![0].transaction.hash}`,
          type: "transaction",
          data: {
            transaction: {
              hash: output.spent_by![0].transaction.hash,
              minInputs: Number(output.spent_by![0].input_index) + 1,
            },
            placeholder: true,
          },
          position: {
            x: 500,
            y: 0,
          },
        }));

      const downstreamInputs: InputNodeType[] = transaction.outputs
        .filter((output) => output.spent_by && output.spent_by.length > 0)
        .map((output) => ({
          id: `${output.spent_by![0].transaction.hash}-input-${
            output.spent_by![0].input_index
          }`,
          type: "input",
          data: {
            input: {
              outpoint_transaction_hash: output.transaction_hash,
              outpoint_index: output.output_index,
              transaction: {
                hash: output.spent_by![0].transaction.hash,
              },
              input_index: output.spent_by![0].input_index,
              value_satoshis: output.value_satoshis,
            },
            placeholder: true,
          },
          // parentId: output.spent_by![0].transaction.hash,
          // extent: "parent" as const,
          position: {
            x: 1000,
            y:
              45 + Number(output.spent_by![0].input_index) * defaultInputHeight,
          },
          style: { width: 180, padding: "0px", border: "none" },
        }));

      const downstreamEdges: SpentEdgeType[] = transaction.outputs
        .filter((output) => output.spent_by && output.spent_by.length > 0)
        .map((output) => ({
          id: `${output.spent_by![0].transaction.hash}-edge-${
            output.spent_by![0].input_index
          }`,
          source: `${output.transaction_hash}-output-${output.output_index}`,
          target: `${output.spent_by![0].transaction.hash}-input-${
            output.spent_by![0].input_index
          }`,
          data: {
            output: output,
          },
        }));

      console.log(
        "Omitting",
        upstreamTransactions.length,
        "upstreamTransactions"
      );
      console.log(
        "Omitting",
        downstreamTransactions.length,
        "downstreamTransactions"
      );

      const nodes = [
        mainTransaction,
        ...inputs,
        ...outputs,
        ...upstreamOutputs,
        ...downstreamInputs,
        // ...upstreamTransactions,
        // ...downstreamTransactions,
      ];
      const edges = [...upstreamEdges, ...downstreamEdges];

      return { nodes, edges };
    })
  );

  const nodes = nodesAndEdges.flatMap(({ nodes }) => nodes);
  const edges = nodesAndEdges.flatMap(({ edges }) => edges);

  addNodesAndEdges({ newNodes: nodes, newEdges: edges, layout: true });
}
