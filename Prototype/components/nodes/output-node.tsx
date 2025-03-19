"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { BoxIcon } from "lucide-react"

export const OutputNode = memo(({ data, isConnectable }: NodeProps) => {
  const units = Number.parseInt(data.units) || 1
  const values = data.values || Array(units).fill(0)
  const activation = data.activation || "sigmoid"

  // Get color based on activation value
  const getNodeColor = (value: number) => {
    if (value > 0.8) return "bg-node-output"
    if (value > 0.5) return "bg-node-output/80"
    if (value > 0.3) return "bg-node-output/60"
    if (value > 0.1) return "bg-node-output/40"
    return "bg-node-output/20"
  }

  return (
    <div className="px-4 py-2 shadow-md rounded-md border-2 node-output">
      <div className="flex items-center">
        <BoxIcon className="h-4 w-4 text-node-output mr-2" />
        <div className="font-bold">{data.label}</div>
      </div>

      <div className="mt-2">
        <div className="text-xs text-muted-foreground">Output Units: {units}</div>
        <div className="text-xs text-muted-foreground">Activation: {activation}</div>
        <div className="flex flex-col items-center mt-2 space-y-2">
          {Array.from({ length: units }).map((_, i) => (
            <div key={i} className="w-full flex justify-between items-center">
              <Handle
                type="target"
                position={Position.Left}
                id={`input-${i}`}
                isConnectable={isConnectable}
                className="w-2 h-2 bg-node-output"
              />
              <div className="text-xs mr-2 w-12 text-right overflow-hidden">{values[i]?.toFixed(4) || "0.0000"}</div>
              <div
                className={`h-4 w-4 rounded-full flex items-center justify-center text-white text-xs
                  ${getNodeColor(values[i] || 0)}`}
              >
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

OutputNode.displayName = "OutputNode"

