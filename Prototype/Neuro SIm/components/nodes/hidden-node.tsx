"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { NetworkIcon } from "lucide-react"

export const HiddenNode = memo(({ data, isConnectable }: NodeProps) => {
  const units = Number.parseInt(data.units) || 1
  const values = data.values || Array(units).fill(0)
  const activation = data.activation || "relu"

  // Get color based on activation value
  const getNodeColor = (value: number) => {
    if (value > 0.8) return "bg-node-hidden"
    if (value > 0.5) return "bg-node-hidden/80"
    if (value > 0.3) return "bg-node-hidden/60"
    if (value > 0.1) return "bg-node-hidden/40"
    return "bg-node-hidden/20"
  }

  return (
    <div className="px-4 py-2 shadow-md rounded-md border-2 node-hidden">
      <div className="flex items-center">
        <NetworkIcon className="h-4 w-4 text-node-hidden mr-2" />
        <div className="font-bold">{data.label}</div>
      </div>

      <div className="mt-2">
        <div className="text-xs text-muted-foreground">Hidden Units: {units}</div>
        <div className="text-xs text-muted-foreground">Activation: {activation}</div>
        <div className="flex flex-col items-center mt-2 space-y-2">
          {Array.from({ length: units }).map((_, i) => (
            <div key={i} className="w-full flex justify-between items-center">
              <Handle
                type="target"
                position={Position.Left}
                id={`input-${i}`}
                isConnectable={isConnectable}
                className="w-2 h-2 bg-node-hidden"
              />
              <div className="text-xs mr-2 w-12 text-right overflow-hidden">{values[i]?.toFixed(2) || "0.00"}</div>
              <div
                className={`h-4 w-4 rounded-full flex items-center justify-center text-white text-xs
                  ${getNodeColor(values[i] || 0)}`}
              >
                {i + 1}
              </div>
              <Handle
                type="source"
                position={Position.Right}
                id={`output-${i}`}
                isConnectable={isConnectable}
                className="w-2 h-2 bg-node-hidden"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

HiddenNode.displayName = "HiddenNode"

