"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { CircleIcon } from "lucide-react"

export const InputNode = memo(({ data, isConnectable }: NodeProps) => {
  const units = Number.parseInt(data.units) || 1
  const values = data.values || Array(units).fill(0)

  return (
    <div className="px-4 py-2 shadow-md rounded-md border-2 node-input">
      <div className="flex items-center">
        <CircleIcon className="h-4 w-4 text-node-input mr-2" />
        <div className="font-bold">{data.label}</div>
      </div>

      <div className="mt-2">
        <div className="text-xs text-muted-foreground">Input Units: {units}</div>
        <div className="text-xs text-muted-foreground">Activation: {data.activation || "linear"}</div>
        <div className="flex flex-col items-center mt-2 space-y-2">
          {Array.from({ length: units }).map((_, i) => (
            <div key={i} className="w-full flex justify-between items-center">
              <div className="text-xs mr-2 w-12 text-right overflow-hidden">{values[i]?.toFixed(2) || "0.00"}</div>
              <div
                className={`h-4 w-4 rounded-full flex items-center justify-center text-white text-xs
                  ${values[i] > 0.5 ? "bg-node-input" : "bg-node-input/50"}`}
              >
                {i + 1}
              </div>
              <Handle
                type="source"
                position={Position.Right}
                id={`output-${i}`}
                isConnectable={isConnectable}
                className="w-2 h-2 bg-node-input"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

InputNode.displayName = "InputNode"

