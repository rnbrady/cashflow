"use client"

import { useCallback, useEffect, useState } from "react"
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, MarkerType, Panel } from "reactflow"
import "reactflow/dist/style.css"
import { fetchTransactionData, getDefaultTransactions } from "@/lib/api"

// Custom node types
import TransactionNode from "@/components/nodes/transaction-node"
import InputNode from "@/components/nodes/input-node"
import OutputNode from "@/components/nodes/output-node"

// Generate a color from a hash string
const hashToColor = (hash) => {
  if (!hash) return "#6366f1" // Default indigo color

  // Take the first 6 characters of the hash and use as a hex color
  const color = `#${hash.substring(0, 6)}`

  // Check if it's a valid hex color
  if (/^#[0-9A-F]{6}$/i.test(color)) {
    return color
  }

  // If not valid, generate a color based on hash sum
  let sum = 0
  for (let i = 0; i < hash.length; i++) {
    sum += hash.charCodeAt(i)
  }

  // Generate hue based on hash (0-360)
  const hue = sum % 360
  // Use a fixed saturation and lightness for good visibility
  return `hsl(${hue}, 70%, 60%)`
}

const nodeTypes = {
  transaction: TransactionNode,
  input: InputNode,
  output: OutputNode,
}

export default function TransactionGraph({ transactionData, onTransactionSelect }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(true)

  // Load default transactions on initial render
  useEffect(() => {
    const loadDefaultTransactions = async () => {
      setLoading(true)
      try {
        const defaultTxs = await getDefaultTransactions()

        const newNodes = []
        const newEdges = []
        const processedTxs = new Set()

        // Process each default transaction
        for (let i = 0; i < defaultTxs.length; i++) {
          const tx = defaultTxs[i]
          const txId = tx.txid
          const txColor = hashToColor(txId)

          if (!processedTxs.has(txId)) {
            // Add transaction node as parent
            newNodes.push({
              id: txId,
              type: "transaction",
              data: {
                ...tx,
                onSelect: () => onTransactionSelect(tx),
                isMain: true,
                color: txColor,
              },
              position: { x: 250, y: 100 + i * 350 },
              style: { width: 450 },
            })

            processedTxs.add(txId)

            // Add input child nodes
            tx.vin.forEach((input, inputIndex) => {
              newNodes.push({
                id: `${txId}-input-${inputIndex}`,
                type: "input",
                data: {
                  input,
                  index: inputIndex,
                  parentColor: txColor,
                },
                parentId: txId,
                extent: "parent",
                position: { x: 0, y: 45 + inputIndex * 85 },
                style: { width: 180, padding: "0px", border: "none" },
              })

              // For the specific transaction with additional inputs, add invisible source nodes
              if (txId === "8d31992e377afbec5539623bb1fdb3c9e9c442c88b1475859ed9cc7595b644b5" && inputIndex > 0) {
                // Create an invisible node for each additional input
                const invisibleNodeId = `invisible-source-${txId}-${inputIndex}`
                newNodes.push({
                  id: invisibleNodeId,
                  type: "output", // Using output type as it has a source handle
                  data: {
                    output: { value: "?", n: 0 },
                    index: 0,
                    parentColor: "#cccccc",
                  },
                  position: { x: -500, y: 100 + i * 350 + inputIndex * 80 },
                  style: { opacity: 0 }, // Make it invisible
                })

                // Connect invisible node to the input
                newEdges.push({
                  id: `edge-invisible-${txId}-${inputIndex}`,
                  source: invisibleNodeId,
                  target: `${txId}-input-${inputIndex}`,
                  type: "bezier",
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: "#10b981"
                  },
                  style: { stroke: "#10b981", strokeWidth: 2 },
                })
              }
            })

            // Add output child nodes
            tx.vout.forEach((output, outputIndex) => {
              newNodes.push({
                id: `${txId}-output-${outputIndex}`,
                type: "output",
                data: {
                  output,
                  index: outputIndex,
                  parentColor: txColor,
                },
                parentId: txId,
                extent: "parent",
                position: { x: 270, y: 45 + outputIndex * 85 },
                style: { width: 180, padding: "0px", border: "none" },
              })
            })

            // Process inputs (parent transactions)
            for (let j = 0; j < tx.vin.length; j++) {
              const input = tx.vin[j]
              // Only process the first input for the transaction with multiple inputs
              // to avoid fetching non-existent transactions
              if (
                input.txid &&
                (txId !== "8d31992e377afbec5539623bb1fdb3c9e9c442c88b1475859ed9cc7595b644b5" || j === 0)
              ) {
                // Only fetch if we haven't processed this tx yet
                if (!processedTxs.has(input.txid)) {
                  try {
                    const parentTx = await fetchTransactionData(input.txid)
                    const parentColor = hashToColor(input.txid)

                    // Add parent transaction node
                    newNodes.push({
                      id: input.txid,
                      type: "transaction",
                      data: {
                        ...parentTx,
                        onSelect: () => onTransactionSelect(parentTx),
                        color: parentColor,
                      },
                      position: { x: -250, y: 50 + i * 350 + j * 200 },
                      style: { width: 450 },
                    })

                    // Add output child nodes for parent transaction
                    parentTx.vout.forEach((output, outputIndex) => {
                      newNodes.push({
                        id: `${input.txid}-output-${outputIndex}`,
                        type: "output",
                        data: {
                          output,
                          index: outputIndex,
                          parentColor: parentColor,
                        },
                        parentId: input.txid,
                        extent: "parent",
                        position: { x: 270, y: 70 + outputIndex * 80 },
                        style: { width: 180, padding: "0px", border: "none"  },
                      })
                    })

                    processedTxs.add(input.txid)
                  } catch (error) {
                    console.error("Error fetching parent transaction:", error)
                  }
                }

                // Add edge from parent output to child input
                newEdges.push({
                  id: `${input.txid}-${input.vout}-${txId}-${j}`,
                  source: `${input.txid}-output-${input.vout}`,
                  target: `${txId}-input-${j}`,
                  type: "bezier",
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: "#10b981"
                  },
                  style: { stroke: "#10b981", strokeWidth: 2 },
                })
              }
            }
          }
        }

        setNodes(newNodes)
        setEdges(newEdges)
      } catch (error) {
        console.error("Error loading default transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDefaultTransactions()
  }, [onTransactionSelect, setEdges, setNodes])

  // Process single transaction data when searched
  useEffect(() => {
    if (transactionData) {
      setLoading(true)

      const newNodes = []
      const newEdges = []
      const processedTxs = new Set()

      // Add the main transaction node
      const txId = transactionData.txid
      const txColor = hashToColor(txId)

      newNodes.push({
        id: txId,
        type: "transaction",
        data: {
          ...transactionData,
          onSelect: () => onTransactionSelect(transactionData),
          isMain: true,
          color: txColor,
        },
        position: { x: 250, y: 250 },
        style: { width: 450 },
      })

      processedTxs.add(txId)

      // Add input child nodes
      transactionData.vin.forEach((input, inputIndex) => {
        newNodes.push({
          id: `${txId}-input-${inputIndex}`,
          type: "input",
          data: {
            input,
            index: inputIndex,
            parentColor: txColor,
          },
          parentId: txId,
          extent: "parent",
          position: { x: 0, y: 70 + inputIndex * 80 },
          style: { width: 180, padding: "0px", border: "none"  },
        })

        // For the specific transaction with additional inputs, add invisible source nodes
        if (txId === "8d31992e377afbec5539623bb1fdb3c9e9c442c88b1475859ed9cc7595b644b5" && inputIndex > 0) {
          // Create an invisible node for each additional input
          const invisibleNodeId = `invisible-source-${txId}-${inputIndex}`
          newNodes.push({
            id: invisibleNodeId,
            type: "output", // Using output type as it has a source handle
            data: {
              output: { value: "?", n: 0 },
              index: 0,
              parentColor: "#cccccc",
            },
            position: { x: -500, y: 250 + inputIndex * 80 },
            style: { opacity: 0 }, // Make it invisible
          })

          // Connect invisible node to the input
          newEdges.push({
            id: `edge-invisible-${txId}-${inputIndex}`,
            source: invisibleNodeId,
            target: `${txId}-input-${inputIndex}`,
            type: "bezier",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#10b981"
            },
            style: { stroke: "#10b981", strokeWidth: 2 },
          })
        }
      })

      // Add output child nodes
      transactionData.vout.forEach((output, outputIndex) => {
        newNodes.push({
          id: `${txId}-output-${outputIndex}`,
          type: "output",
          data: {
            output,
            index: outputIndex,
            parentColor: txColor,
          },
          parentId: txId,
          extent: "parent",
          position: { x: 270, y: 70 + outputIndex * 80 },
          style: { width: 180, padding: "0px", border: "none"  },
        })
      })

      // Process input transactions
      const processInputs = async () => {
        try {
          for (let i = 0; i < transactionData.vin.length; i++) {
            const input = transactionData.vin[i]
            // Only process the first input for the transaction with multiple inputs
            if (
              input.txid &&
              (txId !== "8d31992e377afbec5539623bb1fdb3c9e9c442c88b1475859ed9cc7595b644b5" || i === 0)
            ) {
              // Only fetch if we haven't processed this tx yet
              if (!processedTxs.has(input.txid)) {
                try {
                  const parentTx = await fetchTransactionData(input.txid)
                  const parentColor = hashToColor(input.txid)

                  // Add parent transaction node
                  newNodes.push({
                    id: input.txid,
                    type: "transaction",
                    data: {
                      ...parentTx,
                      onSelect: () => onTransactionSelect(parentTx),
                      color: parentColor,
                    },
                    position: { x: -250, y: 100 + i * 200 },
                    style: { width: 450 },
                  })

                  // Add output child nodes for parent transaction
                  parentTx.vout.forEach((output, outputIndex) => {
                    newNodes.push({
                      id: `${input.txid}-output-${outputIndex}`,
                      type: "output",
                      data: {
                        output,
                        index: outputIndex,
                        parentColor: parentColor,
                      },
                      parentId: input.txid,
                      extent: "parent",
                      position: { x: 270, y: 70 + outputIndex * 80 },
                      style: { width: 180, padding: "0px", border: "none"  },
                    })
                  })

                  processedTxs.add(input.txid)
                } catch (error) {
                  console.error("Error fetching parent transaction:", error)
                }
              }

              // Add edge from parent output to child input
              newEdges.push({
                id: `${input.txid}-${input.vout}-${txId}-${i}`,
                source: `${input.txid}-output-${input.vout}`,
                target: `${txId}-input-${i}`,
                type: "bezier",
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: "#10b981"
                },
                style: { stroke: "#10b981", strokeWidth: 2 },
              })
            }
          }

          setNodes(newNodes)
          setEdges(newEdges)
        } catch (error) {
          console.error("Error processing transaction data:", error)
        } finally {
          setLoading(false)
        }
      }

      processInputs()
    }
  }, [transactionData, onTransactionSelect, setEdges, setNodes])

  const onNodeClick = useCallback((_, node) => {
    if (node.type === "transaction" && node.data.onSelect) {
      node.data.onSelect()
    }
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading transaction graph...</div>
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        className="bg-gray-50"
        minZoom={0.2}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: "bezier",
          style: { strokeWidth: 2 },
        }}
      >
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => (n.data?.isMain ? "#3b82f6" : "#9ca3af")}
          nodeColor={(n) => n.data?.color || "#ffffff"}
        />
        <Background variant="dots" gap={12} size={1} color="#e5e7eb" />
        <Panel position="top-left" className="bg-white p-2 rounded shadow-md">
          <h3 className="text-sm font-medium">Bitcoin Cash Transaction Graph</h3>
        </Panel>
      </ReactFlow>
    </div>
  )
}

