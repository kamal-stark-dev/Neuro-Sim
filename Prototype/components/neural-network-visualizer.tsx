"use client"

import type React from "react"

import { useCallback, useState, useRef, useEffect } from "react"
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow"
import "reactflow/dist/style.css"
import { Sidebar } from "./sidebar"
import { PropertiesPanel } from "./properties-panel"
import { InputNode } from "./nodes/input-node"
import { HiddenNode } from "./nodes/hidden-node"
import { OutputNode } from "./nodes/output-node"
import { ActivationNode } from "./nodes/activation-node"
import { DataNode } from "./nodes/data-node"
import { DataPanel } from "./data-panel"
import { NeuralNetwork, type NetworkPerformance } from "@/lib/neural-network"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Upload, Download, HelpCircle } from "lucide-react"
import { ThemeProvider } from "@/components/theme-provider"
import { WeightHeatmap } from "./weight-heatmap"
import { TrainingPanel } from "./training-panel"
import { PerformanceChart } from "./performance-chart"
import { Walkthrough } from "./walkthrough"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define custom node types
const nodeTypes: NodeTypes = {
  input: InputNode,
  hidden: HiddenNode,
  output: OutputNode,
  activation: ActivationNode,
  data: DataNode,
}

// Initial nodes and edges
const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: { label: "Input", units: 2, values: [0, 0], activation: "linear" },
    position: { x: 100, y: 200 },
  },
  {
    id: "2",
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
    id: "3",
    type: "output",
    data: {
      label: "Output",
      units: 1,
      values: [0],
      activation: "sigmoid",
      weights: [[0.7], [0.8], [0.9]],
      biases: [0.1],
    },
    position: { x: 500, y: 200 },
  },
]

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: false },
  { id: "e2-3", source: "2", target: "3", animated: false },
]

// Network templates
const networkTemplates = {
  xor: {
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
  classifier: {
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
  regression: {
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
  "data-driven": {
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
}

function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isTraining, setIsTraining] = useState(false)
  const [inputValues, setInputValues] = useState<number[]>([0, 0])
  const [neuralNetwork, setNeuralNetwork] = useState<NeuralNetwork | null>(null)
  const [networkPerformance, setNetworkPerformance] = useState<NetworkPerformance>({})
  const [trainingHistory, setTrainingHistory] = useState<NetworkPerformance[]>([])
  const [showWeightHeatmap, setShowWeightHeatmap] = useState(false)
  const [learningRate, setLearningRate] = useState(0.01)
  const [epochs, setEpochs] = useState(100)
  const [batchSize, setBatchSize] = useState(10)
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [rightPanelTab, setRightPanelTab] = useState<string>("properties")
  const [showWalkthrough, setShowWalkthrough] = useState(false)
  const { project } = useReactFlow()

  // Check if it's the first visit and show walkthrough
  useEffect(() => {
    const hasSeenWalkthrough = localStorage.getItem("hideWalkthrough") === "true"
    if (!hasSeenWalkthrough) {
      // Small delay to ensure everything is loaded
      const timer = setTimeout(() => {
        setShowWalkthrough(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  // Initialize neural network
  useEffect(() => {
    const nn = new NeuralNetwork()
    nn.buildFromNodes(nodes)
    setNeuralNetwork(nn)
  }, [nodes])

  // Handle connections between nodes
  const onConnect = useCallback(
    (params: Connection) => {
      // Check if connection is valid (no cycles, etc.)
      setEdges((eds) => addEdge({ ...params, animated: false }, eds))
    },
    [setEdges],
  )

  // Handle node selection
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node)
      setRightPanelTab("properties")
    },
    [setSelectedNode],
  )

  // Handle node deselection
  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [setSelectedNode])

  // Add a new node to the canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData("application/reactflow/type")
      const label = event.dataTransfer.getData("application/reactflow/label")
      const activation = event.dataTransfer.getData("application/reactflow/activation") || "relu"

      // Check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return
      }

      // Get position where the element is dropped
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      const position = reactFlowBounds
        ? project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          })
        : { x: event.clientX, y: event.clientY }

      // Generate a unique node ID
      const id = `${type}-${Date.now()}`

      // Create default data based on node type
      const data: any = { label, activation }

      if (type === "input") {
        data.units = 2
        data.values = [0, 0]
        data.activation = "linear"
      } else if (type === "hidden") {
        data.units = 3
        data.values = [0, 0, 0]
        data.weights = [
          [0.1, 0.1, 0.1],
          [0.1, 0.1, 0.1],
          [0.1, 0.1, 0.1],
        ]
        data.biases = [0.1, 0.1, 0.1]
      } else if (type === "output") {
        data.units = 1
        data.values = [0]
        data.weights = [[0.1], [0.1], [0.1]]
        data.biases = [0.1]
      } else if (type === "activation") {
        data.activation = activation
      } else if (type === "data") {
        data.fileName = ""
        data.csvData = []
        data.columns = []
        data.xColumns = []
        data.yColumns = []
      }

      const newNode: Node = {
        id,
        type,
        position,
        data,
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [project, setNodes],
  )

  // Update node properties
  const updateNodeProperties = useCallback(
    (id: string, data: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            // If units changed, update values array
            if (data.units && data.units !== node.data.units) {
              const newValues = Array(Number.parseInt(data.units)).fill(0)
              data.values = newValues

              // Initialize weights and biases for hidden and output layers
              if (node.type === "hidden" || node.type === "output") {
                // Find incoming connections
                const incomingEdges = edges.filter((e) => e.target === node.id)
                const incomingNodes = incomingEdges
                  .map((e) => nodes.find((n) => n.id === e.source))
                  .filter(Boolean) as Node[]

                // Calculate total input units
                const totalInputUnits = incomingNodes.reduce((sum, n) => sum + Number.parseInt(n.data.units), 0)

                if (totalInputUnits > 0) {
                  // Initialize weights with small random values
                  data.weights = Array(Number.parseInt(data.units))
                    .fill(0)
                    .map(() =>
                      Array(totalInputUnits)
                        .fill(0)
                        .map(() => Math.random() * 0.2 - 0.1),
                    )

                  // Initialize biases
                  data.biases = Array(Number.parseInt(data.units))
                    .fill(0)
                    .map(() => Math.random() * 0.2 - 0.1)
                }
              }
            }

            return { ...node, data: { ...node.data, ...data } }
          }
          return node
        }),
      )

      // Update the selected node as well
      if (selectedNode && selectedNode.id === id) {
        setSelectedNode((prev) => (prev ? { ...prev, data: { ...prev.data, ...data } } : null))
      }
    },
    [setNodes, selectedNode, edges, nodes],
  )

  // Load a network template
  const loadTemplate = useCallback(
    (templateId: string) => {
      if (networkTemplates[templateId as keyof typeof networkTemplates]) {
        const template = networkTemplates[templateId as keyof typeof networkTemplates]
        setIsRunning(false)
        setIsTraining(false)
        setNodes(template.nodes)
        setEdges(template.edges)
        setSelectedNode(null)
        setNetworkPerformance({})
        setTrainingHistory([])
        setCurrentEpoch(0)

        // Update input values based on the first input node
        const inputNode = template.nodes.find((n) => n.type === "input")
        if (inputNode && inputNode.data.values) {
          setInputValues(inputNode.data.values)
        }
      }
    },
    [setNodes, setEdges],
  )

  // Run a forward pass through the network
  const runForwardPass = useCallback(() => {
    if (!neuralNetwork) return

    // Find input nodes
    const inputNodes = nodes.filter((n) => n.type === "input")

    // Set input values to the network
    inputNodes.forEach((node) => {
      neuralNetwork.setInputValues(node.id, node.data.values)
    })

    // Run forward pass
    const outputs = neuralNetwork.forwardPass()

    // Update node values
    setNodes((nds) =>
      nds.map((node) => {
        if (outputs[node.id]) {
          return {
            ...node,
            data: {
              ...node.data,
              values: outputs[node.id],
            },
          }
        }
        return node
      }),
    )

    // Animate edges
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        animated: true,
      })),
    )

    // After animation, stop animation
    setTimeout(() => {
      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          animated: false,
        })),
      )
    }, 1000)
  }, [neuralNetwork, nodes, setNodes, setEdges])

  // Handle input value changes
  const handleInputChange = useCallback(
    (values: number[]) => {
      setInputValues(values)

      // Update input node values
      setNodes((nds) =>
        nds.map((node) => {
          if (node.type === "input") {
            return {
              ...node,
              data: {
                ...node.data,
                values: values.slice(0, node.data.units),
              },
            }
          }
          return node
        }),
      )
    },
    [setNodes],
  )

  // Toggle running state
  const toggleRunning = useCallback(() => {
    setIsRunning(!isRunning)
  }, [isRunning])

  // Run simulation continuously when isRunning is true
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning) {
      interval = setInterval(() => {
        runForwardPass()
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, runForwardPass])

  // Start training the network
  const startTraining = useCallback(async () => {
    if (!neuralNetwork) return

    setIsTraining(true)
    setCurrentEpoch(0)

    // Find data nodes
    const dataNode = nodes.find((n) => n.type === "data")

    if (dataNode && dataNode.data.csvData) {
      // Process data from CSV
      const processedData = neuralNetwork.processDataNode(dataNode)

      if (processedData && processedData.inputs.length > 0) {
        // Train the network on the data
        await neuralNetwork.trainNetwork(
          processedData.inputs,
          processedData.outputs,
          epochs,
          batchSize,
          learningRate,
          (performance) => {
            // Update performance metrics
            setNetworkPerformance(performance)
            setCurrentEpoch(performance.epoch || 0)
            setTrainingHistory((prev) => [...prev, { ...performance }])

            // Update node values after training
            runForwardPass()
          },
        )
      }
    } else {
      // Use test data if no CSV data is available
      const testData = [
        { inputs: [0, 0], outputs: [0] },
        { inputs: [0, 1], outputs: [1] },
        { inputs: [1, 0], outputs: [1] },
        { inputs: [1, 1], outputs: [0] },
      ]

      // Train the network on the test data
      await neuralNetwork.trainNetwork(
        testData.map((d) => d.inputs),
        testData.map((d) => d.outputs),
        epochs,
        batchSize,
        learningRate,
        (performance) => {
          // Update performance metrics
          setNetworkPerformance(performance)
          setCurrentEpoch(performance.epoch || 0)
          setTrainingHistory((prev) => [...prev, { ...performance }])

          // Update node values after training
          runForwardPass()
        },
      )
    }

    setIsTraining(false)
  }, [neuralNetwork, nodes, learningRate, epochs, batchSize, runForwardPass])

  // Stop training
  const stopTraining = useCallback(() => {
    if (neuralNetwork) {
      neuralNetwork.stopTraining()
    }
    setIsTraining(false)
  }, [neuralNetwork])

  // Reset the network
  const resetTraining = useCallback(() => {
    setNetworkPerformance({})
    setTrainingHistory([])
    setCurrentEpoch(0)

    if (neuralNetwork) {
      neuralNetwork.resetPerformance()
    }
  }, [neuralNetwork])

  // Reset the network
  const resetNetwork = useCallback(() => {
    setIsRunning(false)
    setIsTraining(false)
    setNodes(initialNodes)
    setEdges(initialEdges)
    setSelectedNode(null)
    setInputValues([0, 0])
    setNetworkPerformance({})
    setTrainingHistory([])
    setCurrentEpoch(0)

    if (neuralNetwork) {
      neuralNetwork.resetPerformance()
    }
  }, [setNodes, setEdges, neuralNetwork])

  // Export network configuration
  const exportNetwork = useCallback(() => {
    const networkConfig = {
      nodes,
      edges,
    }

    const dataStr = JSON.stringify(networkConfig, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `neural-network-config-${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }, [nodes, edges])

  // Import network configuration
  const importNetwork = useCallback(() => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"

    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const config = JSON.parse(event.target?.result as string)
          if (config.nodes && config.edges) {
            setNodes(config.nodes)
            setEdges(config.edges)
            setSelectedNode(null)
            setNetworkPerformance({})
            setTrainingHistory([])
            setCurrentEpoch(0)
          }
        } catch (error) {
          console.error("Error importing network configuration:", error)
        }
      }
      reader.readAsText(file)
    }

    input.click()
  }, [setNodes, setEdges])

  return (
    <div className="flex h-full">
      <Sidebar
        loadTemplate={loadTemplate}
        showWeightHeatmap={showWeightHeatmap}
        setShowWeightHeatmap={setShowWeightHeatmap}
        learningRate={learningRate}
        setLearningRate={setLearningRate}
        startTraining={startTraining}
        stopTraining={stopTraining}
        isTraining={isTraining}
      />
      <div className="flex-1 h-full" ref={reactFlowWrapper} onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />

          <Panel position="top-right" className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isRunning ? "destructive" : "default"}
                    size="sm"
                    onClick={toggleRunning}
                    disabled={isTraining}
                  >
                    {isRunning ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                    {isRunning ? "Stop" : "Run"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Run the network continuously</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={runForwardPass} disabled={isRunning || isTraining}>
                    <Play className="h-4 w-4 mr-1" />
                    Step
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Run a single forward pass</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={resetNetwork} disabled={isTraining}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset the network to initial state</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={exportNetwork}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export network configuration</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={importNetwork} disabled={isRunning || isTraining}>
                    <Upload className="h-4 w-4 mr-1" />
                    Import
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Import network configuration</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setShowWalkthrough(true)}>
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show walkthrough</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {selectedNode && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id))
                  setSelectedNode(null)
                }}
                disabled={isTraining}
              >
                Delete
              </Button>
            )}
          </Panel>

          <Panel position="bottom-center" className="bg-background border rounded-t-lg shadow-lg">
            <DataPanel
              inputValues={inputValues}
              onInputChange={handleInputChange}
              outputValues={nodes.find((n) => n.type === "output")?.data.values || [0]}
              networkPerformance={networkPerformance}
            />
          </Panel>
        </ReactFlow>
      </div>
      {selectedNode ? (
        <div className="w-64 bg-muted border-l overflow-y-auto">
          <Tabs value={rightPanelTab} onValueChange={setRightPanelTab}>
            <TabsList className="w-full">
              <TabsTrigger value="properties" className="flex-1">
                Properties
              </TabsTrigger>
              <TabsTrigger value="training" className="flex-1">
                Training
              </TabsTrigger>
            </TabsList>
            <TabsContent value="properties" className="p-0">
              {showWeightHeatmap && (selectedNode.type === "hidden" || selectedNode.type === "output") ? (
                <WeightHeatmap node={selectedNode} />
              ) : (
                <PropertiesPanel
                  selectedNode={selectedNode}
                  updateNodeProperties={updateNodeProperties}
                  nodes={nodes}
                />
              )}
            </TabsContent>
            <TabsContent value="training" className="p-0">
              <TrainingPanel
                isTraining={isTraining}
                startTraining={startTraining}
                stopTraining={stopTraining}
                resetTraining={resetTraining}
                learningRate={learningRate}
                setLearningRate={setLearningRate}
                epochs={epochs}
                setEpochs={setEpochs}
                batchSize={batchSize}
                setBatchSize={setBatchSize}
                currentEpoch={currentEpoch}
                performance={networkPerformance}
                trainingHistory={trainingHistory}
              />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="w-64 bg-muted border-l overflow-y-auto">
          <Tabs defaultValue="chart">
            <TabsList className="w-full">
              <TabsTrigger value="chart" className="flex-1">
                Performance
              </TabsTrigger>
              <TabsTrigger value="training" className="flex-1">
                Training
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chart" className="p-4">
              <PerformanceChart trainingHistory={trainingHistory} width={220} height={180} />
            </TabsContent>
            <TabsContent value="training" className="p-0">
              <TrainingPanel
                isTraining={isTraining}
                startTraining={startTraining}
                stopTraining={stopTraining}
                resetTraining={resetTraining}
                learningRate={learningRate}
                setLearningRate={setLearningRate}
                epochs={epochs}
                setEpochs={setEpochs}
                batchSize={batchSize}
                setBatchSize={setBatchSize}
                currentEpoch={currentEpoch}
                performance={networkPerformance}
                trainingHistory={trainingHistory}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      <Walkthrough open={showWalkthrough} onOpenChange={setShowWalkthrough} />
    </div>
  )
}

export default function NeuralNetworkVisualizer() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="neural-network-theme">
      <div className="h-screen">
        <ReactFlowProvider>
          <FlowCanvas />
        </ReactFlowProvider>
      </div>
    </ThemeProvider>
  )
}

