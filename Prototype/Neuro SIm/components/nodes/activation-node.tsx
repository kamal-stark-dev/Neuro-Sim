"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { FunctionSquareIcon } from "lucide-react"

export const ActivationNode = memo(({ data, isConnectable }: NodeProps) => {
  const activation = data.activation || "relu"

  const getActivationColor = () => {
    switch (activation) {
      case "relu":
        return "text-red-500 dark:text-red-400"
      case "sigmoid":
        return "text-orange-500 dark:text-orange-400"
      case "tanh":
        return "text-yellow-500 dark:text-yellow-400"
      case "softmax":
        return "text-pink-500 dark:text-pink-400"
      case "leaky_relu":
        return "text-rose-500 dark:text-rose-400"
      default:
        return "text-red-500 dark:text-red-400"
    }
  }

  const getActivationBorderColor = () => {
    switch (activation) {
      case "relu":
        return "border-red-500/50 dark:border-red-400/50"
      case "sigmoid":
        return "border-orange-500/50 dark:border-orange-400/50"
      case "tanh":
        return "border-yellow-500/50 dark:border-yellow-400/50"
      case "softmax":
        return "border-pink-500/50 dark:border-pink-400/50"
      case "leaky_relu":
        return "border-rose-500/50 dark:border-rose-400/50"
      default:
        return "border-red-500/50 dark:border-red-400/50"
    }
  }

  const getActivationLabel = () => {
    switch (activation) {
      case "relu":
        return "ReLU"
      case "sigmoid":
        return "Sigmoid"
      case "tanh":
        return "Tanh"
      case "softmax":
        return "Softmax"
      case "leaky_relu":
        return "Leaky ReLU"
      default:
        return "ReLU"
    }
  }

  const getActivationFormula = () => {
    switch (activation) {
      case "relu":
        return "max(0, x)"
      case "sigmoid":
        return "1/(1+e^-x)"
      case "tanh":
        return "tanh(x)"
      case "softmax":
        return "e^x_i/sum(e^x_j)"
      case "leaky_relu":
        return "max(0.01x, x)"
      default:
        return "max(0, x)"
    }
  }

  return (
    <div className={`px-4 py-2 shadow-md rounded-md border-2 ${getActivationBorderColor()} bg-background`}>
      <div className="flex items-center">
        <FunctionSquareIcon className={`h-4 w-4 ${getActivationColor()} mr-2`} />
        <div className="font-bold">{data.label}</div>
      </div>

      <div className="mt-2">
        <div className="text-xs text-muted-foreground">Function: {getActivationLabel()}</div>
        <div className="text-xs text-muted-foreground mt-1">Formula: {getActivationFormula()}</div>
        <div className="flex justify-between mt-2">
          <Handle
            type="target"
            position={Position.Left}
            isConnectable={isConnectable}
            className={`w-2 h-2 ${getActivationColor().replace("text-", "bg-").replace(" dark:text-", " dark:bg-")}`}
          />
          <Handle
            type="source"
            position={Position.Right}
            isConnectable={isConnectable}
            className={`w-2 h-2 ${getActivationColor().replace("text-", "bg-").replace(" dark:text-", " dark:bg-")}`}
          />
        </div>
      </div>
    </div>
  )
})

ActivationNode.displayName = "ActivationNode"

