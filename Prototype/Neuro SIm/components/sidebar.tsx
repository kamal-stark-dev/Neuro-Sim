"use client"

import type React from "react"

import { CircleIcon, NetworkIcon, BoxIcon, FunctionSquareIcon, Sun, Moon, DatabaseIcon, BarChart2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"

// Network templates
const networkTemplates = [
  {
    id: "xor",
    name: "XOR Network",
    description: "Classic XOR problem network",
    nodes: [
      {
        id: "input-1",
        type: "input",
        data: { label: "Input", units: 2, values: [0, 0], activation: "linear" },
        position: { x: 100, y: 200 },
      },
      {
        id: "hidden-1",
        type: "hidden",
        data: {
          label: "Hidden",
          units: 2,
          values: [0, 0],
          activation: "sigmoid",
          weights: [
            [0.5, 0.5],
            [-0.5, -0.5],
          ],
          biases: [-0.5, 0.5],
        },
        position: { x: 300, y: 200 },
      },
      {
        id: "output-1",
        type: "output",
        data: {
          label: "Output",
          units: 1,
          values: [0],
          activation: "sigmoid",
          weights: [[0.5], [0.5]],
          biases: [-0.5],
        },
        position: { x: 500, y: 200 },
      },
    ],
    edges: [
      { id: "e1-2", source: "input-1", target: "hidden-1", animated: false },
      { id: "e2-3", source: "hidden-1", target: "output-1", animated: false },
    ],
  },
  {
    id: "classifier",
    name: "Simple Classifier",
    description: "Binary classification network",
    nodes: [
      {
        id: "input-1",
        type: "input",
        data: { label: "Features", units: 3, values: [0, 0, 0], activation: "linear" },
        position: { x: 100, y: 200 },
      },
      {
        id: "hidden-1",
        type: "hidden",
        data: {
          label: "Hidden Layer 1",
          units: 4,
          values: [0, 0, 0, 0],
          activation: "relu",
          weights: [
            [0.1, 0.2, 0.3],
            [0.4, 0.5, 0.6],
            [0.7, 0.8, 0.9],
            [0.1, 0.2, 0.3],
          ],
          biases: [0.1, 0.1, 0.1, 0.1],
        },
        position: { x: 300, y: 150 },
      },
      {
        id: "hidden-2",
        type: "hidden",
        data: {
          label: "Hidden Layer 2",
          units: 2,
          values: [0, 0],
          activation: "relu",
          weights: [
            [0.1, 0.2, 0.3, 0.4],
            [0.5, 0.6, 0.7, 0.8],
          ],
          biases: [0.1, 0.1],
        },
        position: { x: 500, y: 200 },
      },
      {
        id: "output-1",
        type: "output",
        data: {
          label: "Classification",
          units: 1,
          values: [0],
          activation: "sigmoid",
          weights: [[0.1], [0.2]],
          biases: [0.1],
        },
        position: { x: 700, y: 200 },
      },
    ],
    edges: [
      { id: "e1-2", source: "input-1", target: "hidden-1", animated: false },
      { id: "e2-3", source: "hidden-1", target: "hidden-2", animated: false },
      { id: "e3-4", source: "hidden-2", target: "output-1", animated: false },
    ],
  },
  {
    id: "regression",
    name: "Regression Network",
    description: "Simple regression model",
    nodes: [
      {
        id: "input-1",
        type: "input",
        data: { label: "Input", units: 2, values: [0, 0], activation: "linear" },
        position: { x: 100, y: 200 },
      },
      {
        id: "hidden-1",
        type: "hidden",
        data: {
          label: "Hidden",
          units: 3,
          values: [0, 0, 0],
          activation: "relu",
          weights: [
            [0.1, 0.2],
            [0.3, 0.4],
            [0.5, 0.6],
          ],
          biases: [0.1, 0.1, 0.1],
        },
        position: { x: 300, y: 200 },
      },
      {
        id: "output-1",
        type: "output",
        data: {
          label: "Output",
          units: 1,
          values: [0],
          activation: "linear",
          weights: [[0.7], [0.8], [0.9]],
          biases: [0.1],
        },
        position: { x: 500, y: 200 },
      },
    ],
    edges: [
      { id: "e1-2", source: "input-1", target: "hidden-1", animated: false },
      { id: "e2-3", source: "hidden-1", target: "output-1", animated: false },
    ],
  },
  {
    id: "data-driven",
    name: "Data-Driven Network",
    description: "Network with CSV data input",
    nodes: [
      {
        id: "data-1",
        type: "data",
        data: { label: "CSV Data", fileName: "" },
        position: { x: 100, y: 200 },
      },
      {
        id: "input-1",
        type: "input",
        data: { label: "Features", units: 2, values: [0, 0], activation: "linear" },
        position: { x: 300, y: 200 },
      },
      {
        id: "hidden-1",
        type: "hidden",
        data: {
          label: "Hidden",
          units: 4,
          values: [0, 0, 0, 0],
          activation: "relu",
          weights: [
            [0.1, 0.2],
            [0.3, 0.4],
            [0.5, 0.6],
            [0.7, 0.8],
          ],
          biases: [0.1, 0.1, 0.1, 0.1],
        },
        position: { x: 500, y: 200 },
      },
      {
        id: "output-1",
        type: "output",
        data: {
          label: "Prediction",
          units: 1,
          values: [0],
          activation: "sigmoid",
          weights: [[0.1], [0.2], [0.3], [0.4]],
          biases: [0.1],
        },
        position: { x: 700, y: 200 },
      },
    ],
    edges: [
      { id: "e1-2", source: "data-1", target: "input-1", animated: false },
      { id: "e2-3", source: "input-1", target: "hidden-1", animated: false },
      { id: "e3-4", source: "hidden-1", target: "output-1", animated: false },
    ],
  },
]

const nodeTypes = [
  {
    type: "input",
    label: "Input Layer",
    icon: <CircleIcon className="h-5 w-5" />,
    description: "Input nodes for your neural network",
  },
  {
    type: "hidden",
    label: "Hidden Layer",
    icon: <NetworkIcon className="h-5 w-5" />,
    description: "Hidden layer nodes",
  },
  {
    type: "output",
    label: "Output Layer",
    icon: <BoxIcon className="h-5 w-5" />,
    description: "Output nodes for predictions",
  },
  {
    type: "data",
    label: "Data Source",
    icon: <DatabaseIcon className="h-5 w-5" />,
    description: "Import CSV data for training",
  },
]

const activationFunctions = [
  { value: "relu", label: "ReLU", description: "Rectified Linear Unit: max(0, x)" },
  { value: "sigmoid", label: "Sigmoid", description: "Sigmoid: 1/(1+e^-x)" },
  { value: "tanh", label: "Tanh", description: "Hyperbolic Tangent: tanh(x)" },
  { value: "softmax", label: "Softmax", description: "Softmax: e^x_i/sum(e^x_j)" },
  { value: "leaky_relu", label: "Leaky ReLU", description: "Leaky ReLU: max(0.01x, x)" },
]

interface SidebarProps {
  loadTemplate: (templateId: string) => void
  showWeightHeatmap: boolean
  setShowWeightHeatmap: (show: boolean) => void
  learningRate: number
  setLearningRate: (rate: number) => void
  startTraining: () => void
  stopTraining: () => void
  isTraining: boolean
}

export function Sidebar({
  loadTemplate,
  showWeightHeatmap,
  setShowWeightHeatmap,
  learningRate,
  setLearningRate,
  startTraining,
  stopTraining,
  isTraining,
}: SidebarProps) {
  const { theme, setTheme } = useTheme()
  const [epochs, setEpochs] = useState(100)

  const onDragStart = (event: React.DragEvent, nodeType: string, nodeLabel: string) => {
    event.dataTransfer.setData("application/reactflow/type", nodeType)
    event.dataTransfer.setData("application/reactflow/label", nodeLabel)
    event.dataTransfer.effectAllowed = "move"
  }

  const onActivationDragStart = (event: React.DragEvent, activation: string) => {
    event.dataTransfer.setData("application/reactflow/type", "activation")
    event.dataTransfer.setData("application/reactflow/label", `${activation} Function`)
    event.dataTransfer.setData("application/reactflow/activation", activation)
    event.dataTransfer.effectAllowed = "move"
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="w-64 bg-muted p-4 border-r overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Neural Network Visualizer</h3>
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <Accordion type="single" collapsible defaultValue="layers">
        <AccordionItem value="layers">
          <AccordionTrigger>Layers</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 mt-2">
              {nodeTypes.map((node) => (
                <div
                  key={node.type}
                  className="flex items-center p-3 bg-background rounded-md border cursor-grab hover:bg-accent transition-colors"
                  draggable
                  onDragStart={(event) => onDragStart(event, node.type, node.label)}
                >
                  <div className="mr-2 text-primary">{node.icon}</div>
                  <div>
                    <div className="font-medium">{node.label}</div>
                    <div className="text-xs text-muted-foreground">{node.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="activations">
          <AccordionTrigger>Activation Functions</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 mt-2">
              {activationFunctions.map((func) => (
                <div
                  key={func.value}
                  className="flex items-center p-3 bg-background rounded-md border cursor-grab hover:bg-accent transition-colors"
                  draggable
                  onDragStart={(event) => onActivationDragStart(event, func.value)}
                >
                  <div className="mr-2 text-primary">
                    <FunctionSquareIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">{func.label}</div>
                    <div className="text-xs text-muted-foreground">{func.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="templates">
          <AccordionTrigger>Network Templates</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 mt-2">
              {networkTemplates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="w-full justify-start text-left flex flex-col items-start"
                  onClick={() => loadTemplate(template.id)}
                >
                  <span>{template.name}</span>
                  <span className="text-xs text-muted-foreground">{template.description}</span>
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="training">
          <AccordionTrigger>Training Options</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="learning-rate" className="text-sm">
                    Learning Rate
                  </Label>
                  <span className="text-xs font-mono">{learningRate.toFixed(4)}</span>
                </div>
                <Slider
                  id="learning-rate"
                  min={0.0001}
                  max={0.1}
                  step={0.0001}
                  value={[learningRate]}
                  onValueChange={([value]) => setLearningRate(value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="epochs" className="text-sm">
                    Epochs
                  </Label>
                  <span className="text-xs font-mono">{epochs}</span>
                </div>
                <Slider
                  id="epochs"
                  min={1}
                  max={1000}
                  step={1}
                  value={[epochs]}
                  onValueChange={([value]) => setEpochs(value)}
                />
              </div>

              <div className="flex justify-between gap-2">
                <Button variant="default" size="sm" className="flex-1" onClick={startTraining} disabled={isTraining}>
                  Start Training
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={stopTraining} disabled={!isTraining}>
                  Stop
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="visualization">
          <AccordionTrigger>Visualization</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 mt-2">
              <div className="flex items-center space-x-2">
                <Switch id="weight-heatmap" checked={showWeightHeatmap} onCheckedChange={setShowWeightHeatmap} />
                <Label htmlFor="weight-heatmap">Show Weight Heatmap</Label>
              </div>

              <Button variant="outline" size="sm" className="w-full" onClick={() => {}}>
                <BarChart2 className="h-4 w-4 mr-2" />
                Open Performance Chart
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator className="my-4" />

      <div className="space-y-4">
        <h3 className="font-semibold">Instructions</h3>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>1. Drag layers and activation functions onto the canvas</p>
          <p>2. Connect nodes by dragging from node handles</p>
          <p>3. Click on a node to edit its properties</p>
          <p>4. Use the Run/Step buttons to see the network in action</p>
          <p>5. Import CSV data with the Data Source node</p>
        </div>
      </div>
    </div>
  )
}

