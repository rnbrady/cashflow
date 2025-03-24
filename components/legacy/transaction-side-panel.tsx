import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function TransactionDetails({ transaction }) {
  if (!transaction) {
    return <div className="text-gray-500 text-center p-4">Select a transaction to view details</div>
  }

  return (
    <div className="space-y-4 max-h-[calc(100vh-150px)] overflow-y-auto pr-2">
      <div>
        <h3 className="font-medium mb-1 text-gray-800">Transaction ID</h3>
        <p className="text-sm break-all text-gray-600">{transaction.txid}</p>
      </div>

      <Separator className="bg-gray-200" />

      <div>
        <h3 className="font-medium mb-2 text-gray-800">Inputs ({transaction.vin.length})</h3>
        <div className="space-y-3">
          {transaction.vin.map((input, index) => (
            <Card key={`input-${index}`} className="bg-white border-gray-200">
              <CardContent className="p-3 text-sm">
                {input.coinbase ? (
                  <div>
                    <span className="font-medium text-gray-800">Coinbase</span>
                    <p className="text-xs text-gray-500 break-all mt-1">{input.coinbase}</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-800">Previous TX</span>
                      <span className="text-gray-600">Output: {input.vout}</span>
                    </div>
                    <p className="text-xs text-gray-500 break-all mt-1">{input.txid}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator className="bg-gray-200" />

      <div>
        <h3 className="font-medium mb-2 text-gray-800">Outputs ({transaction.vout.length})</h3>
        <div className="space-y-3">
          {transaction.vout.map((output, index) => (
            <Card
              key={`output-${index}`}
              className={
                transaction.focusedOutput === index ? "border-blue-500 bg-blue-50" : "bg-white border-gray-200"
              }
            >
              <CardContent className="p-3 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-gray-800">Output #{index}</span>
                  <span className="text-gray-600">{output.value} BCH</span>
                </div>
                <div className="mt-1">
                  <span className="text-xs text-gray-500">Type: {output.scriptPubKey.type}</span>
                  {output.scriptPubKey.addresses && (
                    <div className="mt-1">
                      <span className="text-xs text-gray-700">Address:</span>
                      <p className="text-xs text-gray-500 break-all">{output.scriptPubKey.addresses[0]}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {transaction.confirmations !== undefined && (
        <>
          <Separator className="bg-gray-200" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-800">Confirmations</h3>
              <p className="text-sm text-gray-600">{transaction.confirmations}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800">Size</h3>
              <p className="text-sm text-gray-600">{transaction.size} bytes</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800">Time</h3>
              <p className="text-sm text-gray-600">
                {transaction.time ? new Date(transaction.time * 1000).toLocaleString() : "Pending"}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

