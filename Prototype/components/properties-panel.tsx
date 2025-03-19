"use client"

import type React from "react"

import type { Node } from "reactflow"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PropertiesPanelProps {
  selectedNode: Node | null
  updateNodeProperties: (id: string, data: any) => void
  nodes: Node[]
}

export function PropertiesPanel({ selectedNode, updateNodeProperties, nodes }: PropertiesPanelProps) {
  if (!selectedNode) {
    return (
      <div className="w-64 bg-muted p-4 border-l overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
            <CardDescription>Select a node to edit its properties</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeProperties(selectedNode.id, { label: e.target.value })
  }

  const handleUnitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const units = Number.parseInt(e.target.value) || 1
    updateNodeProperties(selectedNode.id, { units: Math.max(1, Math.min(10, units)) })
  }

  const handleActivationChange = (value: string) => {
    updateNodeProperties(selectedNode.id, { activation: value })
  }

  const handleWeightChange = (layerIndex: number, neuronIndex: number, value: number) => {
    const newWeights = [...selectedNode.data.weights]
    newWeights[neuronIndex][layerIndex] = value
    updateNodeProperties(selectedNode.id, { weights: newWeights })
  }

  const handleBiasChange = (neuronIndex: number, value: number) => {
    const newBiases = [...selectedNode.data.biases]
    newBiases[neuronIndex] = value
    updateNodeProperties(selectedNode.id, { biases: newBiases })
  }

  // Find incoming connections for weight editing
  const incomingEdges = nodes
    .filter((node) => node.id !== selectedNode.id)
    .filter((node) => {
      return nodes
        .flatMap((n) => (n.id === selectedNode.id ? nodes.filter((source) => source.id !== selectedNode.id) : []))
        .map((n) => n.id)
        .includes(node.id)
    })

  return (
    <div className="w-64 bg-muted p-4 border-l overflow-y-auto">
      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="weights" disabled={selectedNode.type === "input"}>
            Weights
          </TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="node-label">Label</Label>
            <Input id="node-label" value={selectedNode.data.label} onChange={handleLabelChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-units">Units</Label>
            <Input
              id="node-units"
              type="number"
              min="1"
              max="10"
              value={selectedNode.data.units}
              onChange={handleUnitsChange}
            />
            <p className="text-xs text-muted-foreground">Number of neurons (1-10)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activation-function">Activation Function</Label>
            <Select value={selectedNode.data.activation} onValueChange={handleActivationChange}>
              <SelectTrigger id="activation-function">
                <SelectValue placeholder="Select function" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Linear</SelectItem>
                <SelectItem value="relu">ReLU</SelectItem>
                <SelectItem value="sigmoid">Sigmoid</SelectItem>
                <SelectItem value="tanh">Tanh</SelectItem>
                <SelectItem value="softmax">Softmax</SelectItem>
                <SelectItem value="leaky_relu">Leaky ReLU</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4">
            <p className="text-xs text-muted-foreground">
              Node ID: {selectedNode.id}
              <br />
              Type: {selectedNode.type}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="weights" className="space-y-4 mt-4">
          {selectedNode.type !== "input" && selectedNode.data.weights && (
            <div className="space-y-4">
              <h4 className="font-medium">Weights</h4>
              {Array.from({ length: selectedNode.data.units }).map((_, neuronIndex) => (
                <div key={`neuron-${neuronIndex}`} className="space-y-2 border-b pb-3">
                  <p className="text-sm font-medium">Neuron {neuronIndex + 1}</p>
                  {selectedNode.data.weights[neuronIndex]?.map((weight: number, weightIndex: number) => (
                    <div key={`weight-${neuronIndex}-${weightIndex}`} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Weight {weightIndex + 1}</span>
                        <span>{weight.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={[weight]}
                        min={-1}
                        max={1}
                        step={0.01}
                        onValueChange={([value]) => handleWeightChange(weightIndex, neuronIndex, value)}
                      />
                    </div>
                  ))}
                  <div className="space-y-1 mt-2">
                    <div className="flex justify-between text-xs">
                      <span>Bias</span>
                      <span>{selectedNode.data.biases[neuronIndex].toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[selectedNode.data.biases[neuronIndex]]}
                      min={-1}
                      max={1}
                      step={0.01}
                      onValueChange={([value]) => handleBiasChange(neuronIndex, value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Current Values</Label>
            <div className="bg-background p-2 rounded-md text-sm">
              {selectedNode.data.values?.map((value: number, index: number) => (
                <div key={index} className="flex justify-between">
                  <span>Neuron {index + 1}:</span>
                  <span>{value.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Position</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">X</Label>
                <Input value={selectedNode.position.x.toFixed(0)} disabled />
              </div>
              <div>
                <Label className="text-xs">Y</Label>
                <Input value={selectedNode.position.y.toFixed(0)} disabled />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

