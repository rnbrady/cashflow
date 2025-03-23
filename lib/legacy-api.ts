// Types for Bitcoin transactions
type ScriptSig = {
  asm: string;
  hex: string;
}

type ScriptPubKey = {
  asm: string;
  hex: string;
  type: string;
  addresses?: string[];
  data?: string;
}

type TxInput = {
  txid?: string;
  vout?: number;
  coinbase?: string;
  scriptSig?: ScriptSig;
  sequence: number;
}

type TxOutput = {
  value: number;
  n: number;
  scriptPubKey: ScriptPubKey;
}

type Transaction = {
  txid: string;
  hash: string;
  version: number;
  size: number;
  locktime: number;
  vin: TxInput[];
  vout: TxOutput[];
  confirmations: number;
  time: number;
}

type TransactionMap = {
  [key: string]: Transaction;
}

const mockTransactions: TransactionMap = {
  // Transaction 1 - A coinbase transaction
  "9f4a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790201": {
    txid: "9f4a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790201",
    hash: "9f4a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790201",
    version: 1,
    size: 225,
    locktime: 0,
    vin: [
      {
        coinbase:
          "04ffff001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73",
        sequence: 4294967295,
      },
    ],
    vout: [
      {
        value: 50,
        n: 0,
        scriptPubKey: {
          asm: "04678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5f OP_CHECKSIG",
          hex: "4104678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5fac",
          type: "pubkey",
          addresses: ["1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"],
        },
      },
    ],
    confirmations: 100000,
    time: 1645029411,
  },

  // Transaction 2 - Spends from Transaction 1 and other sources
  "8d31992e377afbec5539623bb1fdb3c9e9c442c88b1475859ed9cc7595b644b5": {
    txid: "8d31992e377afbec5539623bb1fdb3c9e9c442c88b1475859ed9cc7595b644b5",
    hash: "8d31992e377afbec5539623bb1fdb3c9e9c442c88b1475859ed9cc7595b644b5",
    version: 1,
    size: 225,
    locktime: 0,
    vin: [
      {
        txid: "9f4a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790201",
        vout: 0,
        scriptSig: {
          asm: "3045022100a5c1b6c32c5fedcda0e4e6300a9ea771b2c16fd27a3a1eb6a4b2d020ae868b0022067ba8c52f8b6e2d90d5855ac7490e43d36ad31b2c13e2a9966b6a0b9c0ce050c[ALL] 03e232cda91e719075aa36f7ee6e05f3a14721826c2a5c7c432870259e81cf8c1b",
          hex: "483045022100a5c1b6c32c5fedcda0e4e6300a9ea771b2c16fd27a3a1eb6a4b2d020ae868b0022067ba8c52f8b6e2d90d5855ac7490e43d36ad31b2c13e2a9966b6a0b9c0ce050c012103e232cda91e719075aa36f7ee6e05f3a14721826c2a5c7c432870259e81cf8c1b",
        },
        sequence: 4294967295,
      },
      // Additional inputs from unknown sources
      {
        txid: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
        vout: 1,
        scriptSig: {
          asm: "304402207515cf147d201f411092e6be5a64a6006f9308fad7b2a8fdaab22cd86ce764c202200974b8aca7bf51dbf54150d3884e1ae04f675637b926ec33bf75939446f6ca2801 02757c10f4d5db3a3489a9ad578a3fa13880303dc8d9c454a6a6a1e0e2b20e9166",
          hex: "47304402207515cf147d201f411092e6be5a64a6006f9308fad7b2a8fdaab22cd86ce764c202200974b8aca7bf51dbf54150d3884e1ae04f675637b926ec33bf75939446f6ca28012102757c10f4d5db3a3489a9ad578a3fa13880303dc8d9c454a6a6a1e0e2b20e9166",
        },
        sequence: 4294967295,
      },
      {
        txid: "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b3c4",
        vout: 0,
        scriptSig: {
          asm: "3044022062eb7a556107a7c73f45ac4ab5a1dddf6f7075fb1275969a7f383efff784bcb202200c05dbb7470dbf2f08557dd356c7325c1ed30913e996cd3840945db12228da5f01 03202522f9f1f129c1d1db5ce65d97bb2007d8fef4d3d1b63c0eec9ef0f4636135",
          hex: "473044022062eb7a556107a7c73f45ac4ab5a1dddf6f7075fb1275969a7f383efff784bcb202200c05dbb7470dbf2f08557dd356c7325c1ed30913e996cd3840945db12228da5f012103202522f9f1f129c1d1db5ce65d97bb2007d8fef4d3d1b63c0eec9ef0f4636135",
        },
        sequence: 4294967295,
      },
    ],
    vout: [
      {
        value: 25,
        n: 0,
        scriptPubKey: {
          asm: "OP_DUP OP_HASH160 8fd139bb39ced713f231c58a4d07bf6954d1c201 OP_EQUALVERIFY OP_CHECKSIG",
          hex: "76a9148fd139bb39ced713f231c58a4d07bf6954d1c20188ac",
          type: "pubkeyhash",
          addresses: ["1DZTzaBHUDM7T3QvUKBz4qXMRpkg8jsfB5"],
        },
      },
      {
        value: 24.99,
        n: 1,
        scriptPubKey: {
          asm: "OP_DUP OP_HASH160 5f7f0c71f6f2b179d46b3715cf652b04c6e3f2a8 OP_EQUALVERIFY OP_CHECKSIG",
          hex: "76a9145f7f0c71f6f2b179d46b3715cf652b04c6e3f2a888ac",
          type: "pubkeyhash",
          addresses: ["19Nrc2Xm226xmSbeGZ1BVtX7DUm4oCx8Pm"],
        },
      },
    ],
    confirmations: 100000,
    time: 1645029411,
  },

  // Transaction 3 - Spends from Transaction 2
  "f930b57b2e5b3e8c22934e421ffd251e772a156db5e3b3c6fd96dbb770b03e22": {
    txid: "f930b57b2e5b3e8c22934e421ffd251e772a156db5e3b3c6fd96dbb770b03e22",
    hash: "f930b57b2e5b3e8c22934e421ffd251e772a156db5e3b3c6fd96dbb770b03e22",
    version: 1,
    size: 225,
    locktime: 0,
    vin: [
      {
        txid: "8d31992e377afbec5539623bb1fdb3c9e9c442c88b1475859ed9cc7595b644b5",
        vout: 0,
        scriptSig: {
          asm: "3045022100a5c1b6c32c5fedcda0e4e6300a9ea771b2c16fd27a3a1eb6a4b2d020ae868b0022067ba8c52f8b6e2d90d5855ac7490e43d36ad31b2c13e2a9966b6a0b9c0ce050c[ALL] 03e232cda91e719075aa36f7ee6e05f3a14721826c2a5c7c432870259e81cf8c1b",
          hex: "483045022100a5c1b6c32c5fedcda0e4e6300a9ea771b2c16fd27a3a1eb6a4b2d020ae868b0022067ba8c52f8b6e2d90d5855ac7490e43d36ad31b2c13e2a9966b6a0b9c0ce050c012103e232cda91e719075aa36f7ee6e05f3a14721826c2a5c7c432870259e81cf8c1b",
        },
        sequence: 4294967295,
      },
    ],
    vout: [
      {
        value: 12.5,
        n: 0,
        scriptPubKey: {
          asm: "OP_DUP OP_HASH160 8fd139bb39ced713f231c58a4d07bf6954d1c201 OP_EQUALVERIFY OP_CHECKSIG",
          hex: "76a9148fd139bb39ced713f231c58a4d07bf6954d1c20188ac",
          type: "pubkeyhash",
          addresses: ["1DZTzaBHUDM7T3QvUKBz4qXMRpkg8jsfB5"],
        },
      },
      {
        value: 12.49,
        n: 1,
        scriptPubKey: {
          asm: "OP_HASH160 5f7f0c71f6f2b179d46b3715cf652b04c6e3f2a8 OP_EQUAL",
          hex: "a9145f7f0c71f6f2b179d46b3715cf652b04c6e3f2a887",
          type: "scripthash",
          addresses: ["3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy"],
        },
      },
    ],
    confirmations: 100000,
    time: 1645029411,
  },

  // Transaction 4 - Multi-input, multi-output transaction with change
  "d4a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790202": {
    txid: "d4a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790202",
    hash: "d4a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790202",
    version: 1,
    size: 374,
    locktime: 0,
    vin: [
      {
        txid: "f930b57b2e5b3e8c22934e421ffd251e772a156db5e3b3c6fd96dbb770b03e22",
        vout: 0,
        scriptSig: {
          asm: "304502210088b0c9f3715c980a4ec2c4304c449911574d01c40098e2f9c47b657f8f3a24a502202c7594c6b36e8b82b79bc944c2d162f649a3a3aa37ad6b7779458de02f8b795a[ALL] 02757c10f4d5db3a3489a9ad578a3fa13880303dc8d9c454a6a6a1e0e2b20e9166",
          hex: "48304502210088b0c9f3715c980a4ec2c4304c449911574d01c40098e2f9c47b657f8f3a24a502202c7594c6b36e8b82b79bc944c2d162f649a3a3aa37ad6b7779458de02f8b795a012102757c10f4d5db3a3489a9ad578a3fa13880303dc8d9c454a6a6a1e0e2b20e9166",
        },
        sequence: 4294967295,
      },
      {
        txid: "f930b57b2e5b3e8c22934e421ffd251e772a156db5e3b3c6fd96dbb770b03e22",
        vout: 1,
        scriptSig: {
          asm: "304402207515cf147d201f411092e6be5a64a6006f9308fad7b2a8fdaab22cd86ce764c202200974b8aca7bf51dbf54150d3884e1ae04f675637b926ec33bf75939446f6ca2801 02757c10f4d5db3a3489a9ad578a3fa13880303dc8d9c454a6a6a1e0e2b20e9166",
          hex: "47304402207515cf147d201f411092e6be5a64a6006f9308fad7b2a8fdaab22cd86ce764c202200974b8aca7bf51dbf54150d3884e1ae04f675637b926ec33bf75939446f6ca28012102757c10f4d5db3a3489a9ad578a3fa13880303dc8d9c454a6a6a1e0e2b20e9166",
        },
        sequence: 4294967295,
      }
    ],
    vout: [
      {
        value: 15,
        n: 0,
        scriptPubKey: {
          asm: "OP_DUP OP_HASH160 8fd139bb39ced713f231c58a4d07bf6954d1c201 OP_EQUALVERIFY OP_CHECKSIG",
          hex: "76a9148fd139bb39ced713f231c58a4d07bf6954d1c20188ac",
          type: "pubkeyhash",
          addresses: ["1DZTzaBHUDM7T3QvUKBz4qXMRpkg8jsfB5"],
        },
      },
      {
        value: 9.98,
        n: 1,
        scriptPubKey: {
          asm: "OP_DUP OP_HASH160 5f7f0c71f6f2b179d46b3715cf652b04c6e3f2a8 OP_EQUALVERIFY OP_CHECKSIG",
          hex: "76a9145f7f0c71f6f2b179d46b3715cf652b04c6e3f2a888ac",
          type: "pubkeyhash",
          addresses: ["19Nrc2Xm226xmSbeGZ1BVtX7DUm4oCx8Pm"],
        },
      }
    ],
    confirmations: 95000,
    time: 1645129411,
  },

  // Transaction 5 - Transaction with OP_RETURN message
  "e5a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790203": {
    txid: "e5a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790203",
    hash: "e5a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790203",
    version: 1,
    size: 300,
    locktime: 0,
    vin: [
      {
        txid: "d4a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790202",
        vout: 0,
        scriptSig: {
          asm: "304502210088b0c9f3715c980a4ec2c4304c449911574d01c40098e2f9c47b657f8f3a24a502202c7594c6b36e8b82b79bc944c2d162f649a3a3aa37ad6b7779458de02f8b795a[ALL] 02757c10f4d5db3a3489a9ad578a3fa13880303dc8d9c454a6a6a1e0e2b20e9166",
          hex: "48304502210088b0c9f3715c980a4ec2c4304c449911574d01c40098e2f9c47b657f8f3a24a502202c7594c6b36e8b82b79bc944c2d162f649a3a3aa37ad6b7779458de02f8b795a012102757c10f4d5db3a3489a9ad578a3fa13880303dc8d9c454a6a6a1e0e2b20e9166",
        },
        sequence: 4294967295,
      }
    ],
    vout: [
      {
        value: 14.99,
        n: 0,
        scriptPubKey: {
          asm: "OP_DUP OP_HASH160 8fd139bb39ced713f231c58a4d07bf6954d1c201 OP_EQUALVERIFY OP_CHECKSIG",
          hex: "76a9148fd139bb39ced713f231c58a4d07bf6954d1c20188ac",
          type: "pubkeyhash",
          addresses: ["1DZTzaBHUDM7T3QvUKBz4qXMRpkg8jsfB5"],
        },
      },
      {
        value: 0,
        n: 1,
        scriptPubKey: {
          asm: "OP_RETURN 48656c6c6f20576f726c6421",
          hex: "6a0c48656c6c6f20576f726c6421",
          type: "nulldata",
          data: "Hello World!"
        },
      }
    ],
    confirmations: 90000,
    time: 1645229411,
  },

  // Transaction 6 - Spends from Transaction 5
  "f6a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790204": {
    txid: "f6a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790204",
    hash: "f6a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790204",
    version: 1,
    size: 225,
    locktime: 0,
    vin: [
      {
        txid: "e5a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790203",
        vout: 0,
        scriptSig: {
          asm: "304502210088b0c9f3715c980a4ec2c4304c449911574d01c40098e2f9c47b657f8f3a24a502202c7594c6b36e8b82b79bc944c2d162f649a3a3aa37ad6b7779458de02f8b795a[ALL] 02757c10f4d5db3a3489a9ad578a3fa13880303dc8d9c454a6a6a1e0e2b20e9166",
          hex: "48304502210088b0c9f3715c980a4ec2c4304c449911574d01c40098e2f9c47b657f8f3a24a502202c7594c6b36e8b82b79bc944c2d162f649a3a3aa37ad6b7779458de02f8b795a012102757c10f4d5db3a3489a9ad578a3fa13880303dc8d9c454a6a6a1e0e2b20e9166",
        },
        sequence: 4294967295,
      }
    ],
    vout: [
      {
        value: 7.495,
        n: 0,
        scriptPubKey: {
          asm: "OP_DUP OP_HASH160 8fd139bb39ced713f231c58a4d07bf6954d1c201 OP_EQUALVERIFY OP_CHECKSIG",
          hex: "76a9148fd139bb39ced713f231c58a4d07bf6954d1c20188ac",
          type: "pubkeyhash",
          addresses: ["1DZTzaBHUDM7T3QvUKBz4qXMRpkg8jsfB5"],
        },
      },
      {
        value: 7.494,
        n: 1,
        scriptPubKey: {
          asm: "OP_DUP OP_HASH160 5f7f0c71f6f2b179d46b3715cf652b04c6e3f2a8 OP_EQUALVERIFY OP_CHECKSIG",
          hex: "76a9145f7f0c71f6f2b179d46b3715cf652b04c6e3f2a888ac",
          type: "pubkeyhash",
          addresses: ["19Nrc2Xm226xmSbeGZ1BVtX7DUm4oCx8Pm"],
        },
      }
    ],
    confirmations: 85000,
    time: 1645329411,
  }
}

export async function fetchTransactionData(txId: string) {
  // In a real app, this would call a Bitcoin Cash node or API
  // For demo purposes, we'll return mock data
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const tx = mockTransactions[txId]
      if (tx) {
        resolve(tx)
      } else {
        // If we don't have the specific transaction, return the first one for demo
        resolve(mockTransactions[Object.keys(mockTransactions)[0]])
      }
    }, 500)
  })
}

export async function getDefaultTransactions() {
  // Return 6 default transactions to display
  return Promise.resolve([
    mockTransactions["f6a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790204"],
    mockTransactions["e5a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790203"],
    mockTransactions["d4a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790202"],
    mockTransactions["f930b57b2e5b3e8c22934e421ffd251e772a156db5e3b3c6fd96dbb770b03e22"],
    mockTransactions["8d31992e377afbec5539623bb1fdb3c9e9c442c88b1475859ed9cc7595b644b5"],
    mockTransactions["9f4a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790201"],
  ])
}

export async function fetchBlockData(blockHeightOrHash: string) {
  // Mock implementation for fetching block data
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate fetching block data based on height or hash
      const blockData = {
        height: Number.parseInt(blockHeightOrHash),
        hash: "0000000000000000000000000000000000000000000000000000000000000000", // Replace with a real hash if needed
        timestamp: Date.now() / 1000,
        transactions: [
          "9f4a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790201",
          "8d31992e377afbec5539623bb1fdb3c9e9c442c88b1475859ed9cc7595b644b5",
          "f930b57b2e5b3e8c22934e421ffd251e772a156db5e3b3c6fd96dbb770b03e22",
          "d4a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790202",
          "e5a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790203",
          "f6a9b73b0713c5da01c0a47f97c6c001af9028d6bdd9e264dfacbc4e6790204"
        ],
      }
      resolve(blockData)
    }, 500)
  })
}

