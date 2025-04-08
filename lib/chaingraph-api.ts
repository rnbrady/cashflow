import { Transaction } from "@/lib/types";
import { ChaingraphClient } from "chaingraph-ts";
import { GET_TRANSACTION_DETAILS } from "@/lib/queries";

// Data source configuration
export type DataSource = "mock" | "mainnet";

let currentDataSource: DataSource = "mock";

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
  const result = await chaingraphClient.query(GET_TRANSACTION_DETAILS, {
    txHash: hash,
  });

  if (!result.data?.transaction?.[0]) {
    throw new Error("Transaction could not be found.");
  }

  return result.data.transaction[0];
}

export async function fetchTransactionData(hash: string): Promise<Transaction> {
  if (currentDataSource === "mock") {
    const formattedHash = hash.startsWith("\\x")
      ? hash.slice(2, 10)
      : hash.slice(0, 8);

    const transaction = await import(`@/tests/data/${formattedHash}.json`);

    if (!transaction) {
      throw new Error("Transaction could not be found in mock data folder.");
    }

    return transaction;
  } else {
    const formattedHash = hash.startsWith("\\x") ? hash : `\\x${hash}`;

    return fetchMainnetTransaction(formattedHash);
  }
}
