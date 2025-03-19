// Neural Network implementation

// Activation functions
const activationFunctions = {
  linear: {
    activate: (x: number) => x,
    derivative: () => 1,
  },
  relu: {
    activate: (x: number) => Math.max(0, x),
    derivative: (x: number) => (x > 0 ? 1 : 0),
  },
  sigmoid: {
    activate: (x: number) => 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, x)))),
    derivative: (x: number) => {
      const fx = 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, x))))
      return fx * (1 - fx)
    },
  },
  tanh: {
    activate: (x: number) => Math.tanh(x),
    derivative: (x: number) => 1 - Math.pow(Math.tanh(x), 2),
  },
  softmax: {
    // Softmax is applied to all outputs together
    activate: (x: number, allX: number[]) => {
      // Prevent overflow by subtracting max value
      const maxVal = Math.max(...allX)
      const expValues = allX.map((val) => Math.exp(Math.min(20, val - maxVal)))
      const sumExp = expValues.reduce((a, b) => a + b, 0)
      return Math.exp(Math.min(20, x - maxVal)) / sumExp
    },
    derivative: (x: number, j: number, allX: number[]) => {
      // Prevent overflow by subtracting max value
      const maxVal = Math.max(...allX)
      const softmaxValues = allX.map((val) => {
        const expValues = allX.map((v) => Math.exp(Math.min(20, v - maxVal)))
        const sumExp = expValues.reduce((a, b) => a + b, 0)
        return Math.exp(Math.min(20, val - maxVal)) / sumExp
      })
      const sj = softmaxValues[j]
      return x === j ? sj * (1 - sj) : -sj * softmaxValues[x]
    },
  },
  leaky_relu: {
    activate: (x: number) => (x > 0 ? x : 0.01 * x),
    derivative: (x: number) => (x > 0 ? 1 : 0.01),
  },
}

// Layer interface
interface Layer {
  id: string
  type: string
  units: number
  activation: string
  weights?: number[][]
  biases?: number[]
  values: number[]
}

export interface NetworkPerformance {
  loss?: number
  accuracy?: number
  epoch?: number
  maxEpochs?: number
  learningRate?: number
  timestamp?: number
}

export class NeuralNetwork {
  private layers: Layer[] = []
  private layerConnections: { [key: string]: string[] } = {}
  private inputValues: { [key: string]: number[] } = {}
  private performance: NetworkPerformance = {}
  private trainingHistory: NetworkPerformance[] = []
  private isTraining = false
  private shouldStopTraining = false

  constructor() {}

  // Build network from React Flow nodes
  buildFromNodes(nodes: any[]) {
    // Sort nodes by position (left to right)
    const sortedNodes = [...nodes].sort((a, b) => a.position.x - b.position.x)

    // Create layers
    this.layers = sortedNodes.map((node) => ({
      id: node.id,
      type: node.type,
      units: Number.parseInt(node.data.units) || 1,
      activation: node.data.activation || "linear",
      weights: node.data.weights || [],
      biases: node.data.biases || [],
      values: node.data.values || Array(Number.parseInt(node.data.units) || 1).fill(0),
    }))

    // Create connections
    this.layerConnections = {}
    sortedNodes.forEach((node) => {
      this.layerConnections[node.id] = []
    })

    // Find connections between nodes
    const edges = nodes.filter((node) => node.source && node.target)
    edges.forEach((edge) => {
      const sourceId = edge.source
      const targetId = edge.target

      if (sourceId && targetId) {
        if (!this.layerConnections[sourceId]) {
          this.layerConnections[sourceId] = []
        }
        this.layerConnections[sourceId].push(targetId)
      }
    })
  }

  // Set input values for a specific layer
  setInputValues(layerId: string, values: number[]) {
    this.inputValues[layerId] = values

    // Update the layer's values
    const layer = this.layers.find((l) => l.id === layerId)
    if (layer) {
      layer.values = values
    }
  }

  // Process CSV data from data node
  processDataNode(dataNode: any) {
    if (!dataNode || !dataNode.data || !dataNode.data.csvData) {
      return null
    }

    const { csvData, xColumns, yColumns } = dataNode.data

    if (!csvData.length || !xColumns || !xColumns.length || !yColumns || !yColumns.length) {
      return null
    }

    // Extract X and Y values from CSV data
    const inputs: number[][] = []
    const outputs: number[][] = []

    csvData.forEach((row: any) => {
      // Extract X values (input features)
      const xValues = xColumns.map((col: string) => {
        const value = Number.parseFloat(row[col])
        return isNaN(value) ? 0 : value
      })

      // Extract Y values (output targets)
      const yValues = yColumns.map((col: string) => {
        const value = Number.parseFloat(row[col])
        return isNaN(value) ? 0 : value
      })

      // Skip rows with NaN values
      if (!xValues.some(isNaN) && !yValues.some(isNaN)) {
        inputs.push(xValues)
        outputs.push(yValues)
      }
    })

    // Normalize data if needed
    const normalizedData = this.normalizeData(inputs, outputs)

    return normalizedData || { inputs, outputs }
  }

  // Normalize data to improve training
  normalizeData(inputs: number[][], outputs: number[][]) {
    if (inputs.length === 0 || outputs.length === 0) return null

    // Calculate min and max for each input feature
    const inputFeatures = inputs[0].length
    const inputMins = Array(inputFeatures).fill(Number.MAX_VALUE)
    const inputMaxs = Array(inputFeatures).fill(Number.MIN_VALUE)

    inputs.forEach((sample) => {
      sample.forEach((value, i) => {
        inputMins[i] = Math.min(inputMins[i], value)
        inputMaxs[i] = Math.max(inputMaxs[i], value)
      })
    })

    // Calculate min and max for each output feature
    const outputFeatures = outputs[0].length
    const outputMins = Array(outputFeatures).fill(Number.MAX_VALUE)
    const outputMaxs = Array(outputFeatures).fill(Number.MIN_VALUE)

    outputs.forEach((sample) => {
      sample.forEach((value, i) => {
        outputMins[i] = Math.min(outputMins[i], value)
        outputMaxs[i] = Math.max(outputMaxs[i], value)
      })
    })

    // Normalize inputs to [0, 1] range
    const normalizedInputs = inputs.map((sample) =>
      sample.map((value, i) => {
        // If min and max are the same, return 0.5 to avoid division by zero
        if (inputMins[i] === inputMaxs[i]) return 0.5
        return (value - inputMins[i]) / (inputMaxs[i] - inputMins[i])
      }),
    )

    // Normalize outputs to [0, 1] range
    const normalizedOutputs = outputs.map((sample) =>
      sample.map((value, i) => {
        // If min and max are the same, return 0.5 to avoid division by zero
        if (outputMins[i] === outputMaxs[i]) return 0.5
        return (value - outputMins[i]) / (outputMaxs[i] - outputMins[i])
      }),
    )

    return {
      inputs: normalizedInputs,
      outputs: normalizedOutputs,
      metadata: {
        inputMins,
        inputMaxs,
        outputMins,
        outputMaxs,
      },
    }
  }

  // Forward pass through the network
  forwardPass() {
    const layerOutputs: { [key: string]: number[] } = {}

    // Process each layer in order
    this.layers.forEach((layer) => {
      if (layer.type === "input") {
        // Input layer just passes its values
        layerOutputs[layer.id] = layer.values
      } else if (layer.type === "hidden" || layer.type === "output") {
        // Find all incoming connections
        const incomingLayers = this.layers.filter((l) =>
          Object.keys(this.layerConnections).some(
            (sourceId) => sourceId === l.id && this.layerConnections[sourceId].includes(layer.id),
          ),
        )

        // Concatenate all incoming values
        const incomingValues: number[] = []
        incomingLayers.forEach((incomingLayer) => {
          incomingValues.push(...layerOutputs[incomingLayer.id])
        })

        // Calculate weighted sum and apply activation
        const outputs: number[] = []

        for (let i = 0; i < layer.units; i++) {
          let sum = layer.biases?.[i] || 0

          // Apply weights if available
          if (layer.weights && layer.weights[i]) {
            for (let j = 0; j < incomingValues.length; j++) {
              sum += (layer.weights[i][j] || 0) * incomingValues[j]
            }
          }

          // Apply activation function
          let output: number
          if (layer.activation === "softmax") {
            // For softmax, we need all weighted sums
            const allSums = Array(layer.units)
              .fill(0)
              .map((_, idx) => {
                let weightedSum = layer.biases?.[idx] || 0
                if (layer.weights && layer.weights[idx]) {
                  for (let j = 0; j < incomingValues.length; j++) {
                    weightedSum += (layer.weights[idx][j] || 0) * incomingValues[j]
                  }
                }
                return weightedSum
              })

            output = activationFunctions.softmax.activate(sum, allSums)
          } else {
            // For other activation functions
            const activationFn =
              activationFunctions[layer.activation as keyof typeof activationFunctions] || activationFunctions.linear
            output = activationFn.activate(sum)
          }

          outputs.push(output)
        }

        layerOutputs[layer.id] = outputs

        // Update the layer's values
        layer.values = outputs
      } else if (layer.type === "activation") {
        // Activation layer applies its function to all incoming values
        const incomingLayers = this.layers.filter((l) =>
          Object.keys(this.layerConnections).some(
            (sourceId) => sourceId === l.id && this.layerConnections[sourceId].includes(layer.id),
          ),
        )

        // Concatenate all incoming values
        const incomingValues: number[] = []
        incomingLayers.forEach((incomingLayer) => {
          incomingValues.push(...layerOutputs[incomingLayer.id])
        })

        // Apply activation function
        const activationFn =
          activationFunctions[layer.activation as keyof typeof activationFunctions] || activationFunctions.relu

        const outputs = incomingValues.map((value) => {
          if (layer.activation === "softmax") {
            return activationFunctions.softmax.activate(value, incomingValues)
          } else {
            return activationFn.activate(value)
          }
        })

        layerOutputs[layer.id] = outputs

        // Update the layer's values
        layer.values = outputs
      } else if (layer.type === "data") {
        // Data node doesn't produce outputs directly
        layerOutputs[layer.id] = []
      }
    })

    return layerOutputs
  }

  // Train the network on a batch of data
  trainBatch(inputs: number[][], targets: number[][], learningRate = 0.01) {
    if (!inputs.length || !targets.length) return

    let totalLoss = 0
    let correctPredictions = 0

    // Process each example in the batch
    for (let i = 0; i < inputs.length; i++) {
      // Set input values
      const inputLayer = this.layers.find((l) => l.type === "input")
      if (inputLayer) {
        this.setInputValues(inputLayer.id, inputs[i])
      }

      // Forward pass
      const outputs = this.forwardPass()

      // Get output layer
      const outputLayer = this.layers.find((l) => l.type === "output")
      if (!outputLayer) continue

      const outputValues = outputLayer.values
      const targetValues = targets[i]

      // Calculate loss (mean squared error)
      let exampleLoss = 0
      for (let j = 0; j < outputValues.length; j++) {
        exampleLoss += Math.pow(outputValues[j] - targetValues[j], 2)
      }
      exampleLoss /= outputValues.length
      totalLoss += exampleLoss

      // Check if prediction is correct (for classification)
      if (outputValues.length === 1 && targetValues.length === 1) {
        // Binary classification
        if ((outputValues[0] > 0.5 && targetValues[0] > 0.5) || (outputValues[0] <= 0.5 && targetValues[0] <= 0.5)) {
          correctPredictions++
        }
      } else {
        // Multi-class classification
        const predictedClass = outputValues.indexOf(Math.max(...outputValues))
        const targetClass = targetValues.indexOf(Math.max(...targetValues))
        if (predictedClass === targetClass) {
          correctPredictions++
        }
      }

      // Backpropagation implementation
      this.backpropagate(targetValues, learningRate)
    }

    // Update performance metrics
    this.performance.loss = totalLoss / inputs.length
    this.performance.accuracy = correctPredictions / inputs.length
    this.performance.learningRate = learningRate

    return this.performance
  }

  // Backpropagation implementation
  private backpropagate(targetValues: number[], learningRate: number) {
    // Find output layer
    const outputLayer = this.layers.find((l) => l.type === "output")
    if (!outputLayer) return

    // Calculate output layer error
    const outputErrors = outputLayer.values.map((value, i) => {
      return targetValues[i] - value
    })

    // Propagate errors backward through the network
    const layerErrors: { [key: string]: number[] } = {}
    layerErrors[outputLayer.id] = outputErrors

    // Process layers in reverse order
    const reversedLayers = [...this.layers].reverse()

    for (const layer of reversedLayers) {
      if (layer.type !== "hidden" && layer.type !== "output") continue

      // Skip if no errors for this layer
      if (!layerErrors[layer.id]) continue

      // Get incoming layers
      const incomingLayers = this.layers.filter((l) =>
        Object.keys(this.layerConnections).some(
          (sourceId) => sourceId === l.id && this.layerConnections[sourceId].includes(layer.id),
        ),
      )

      // Update weights and biases for this layer
      if (layer.weights && layer.biases) {
        const errors = layerErrors[layer.id]

        // Get activation function derivative
        const activationFn =
          activationFunctions[layer.activation as keyof typeof activationFunctions] || activationFunctions.linear

        // Get incoming values
        const incomingValues: number[] = []
        incomingLayers.forEach((incomingLayer) => {
          incomingValues.push(...incomingLayer.values)
        })

        // Update weights and biases
        for (let i = 0; i < layer.units; i++) {
          const error = errors[i]
          const output = layer.values[i]

          // Calculate gradient based on activation function
          let gradient: number
          if (layer.activation === "softmax") {
            // Simplified gradient for softmax
            gradient = error
          } else {
            // For other activation functions
            const derivative = activationFn.derivative(output)
            gradient = error * derivative
          }

          // Update biases
          layer.biases[i] += learningRate * gradient

          // Update weights
          for (let j = 0; j < incomingValues.length; j++) {
            layer.weights[i][j] += learningRate * gradient * incomingValues[j]
          }

          // Propagate error to previous layer
          for (const incomingLayer of incomingLayers) {
            if (!layerErrors[incomingLayer.id]) {
              layerErrors[incomingLayer.id] = Array(incomingLayer.units).fill(0)
            }

            // Distribute error based on weights
            for (let j = 0; j < incomingLayer.units; j++) {
              const weightIndex = incomingLayers.indexOf(incomingLayer) * incomingLayer.units + j
              layerErrors[incomingLayer.id][j] += error * (layer.weights[i][weightIndex] || 0)
            }
          }
        }
      }
    }
  }

  // Async training function that can be stopped
  async trainNetwork(
    inputs: number[][],
    targets: number[][],
    epochs: number,
    batchSize: number,
    learningRate: number,
    onEpochComplete: (performance: NetworkPerformance) => void,
  ) {
    if (!inputs.length || !targets.length) return

    this.isTraining = true
    this.shouldStopTraining = false
    this.trainingHistory = []

    // Shuffle data
    const shuffledIndices = Array.from({ length: inputs.length }, (_, i) => i)
    for (let i = shuffledIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]]
    }

    const shuffledInputs = shuffledIndices.map((i) => inputs[i])
    const shuffledTargets = shuffledIndices.map((i) => targets[i])

    // Learning rate decay
    const initialLearningRate = learningRate
    const decayRate = 0.95
    let currentLearningRate = learningRate

    for (let epoch = 1; epoch <= epochs; epoch++) {
      if (this.shouldStopTraining) break

      // Apply learning rate decay every 10 epochs
      if (epoch % 10 === 0) {
        currentLearningRate = initialLearningRate * Math.pow(decayRate, Math.floor(epoch / 10))
      }

      // Train in batches
      let epochLoss = 0
      let epochAccuracy = 0
      let batchCount = 0

      for (let i = 0; i < shuffledInputs.length; i += batchSize) {
        if (this.shouldStopTraining) break

        const batchInputs = shuffledInputs.slice(i, i + batchSize)
        const batchTargets = shuffledTargets.slice(i, i + batchSize)

        const batchPerformance = this.trainBatch(batchInputs, batchTargets, currentLearningRate)
        if (batchPerformance) {
          epochLoss += batchPerformance.loss || 0
          epochAccuracy += batchPerformance.accuracy || 0
          batchCount++
        }

        // Small delay to allow UI updates
        await new Promise((resolve) => setTimeout(resolve, 0))
      }

      // Calculate epoch performance
      const performance: NetworkPerformance = {
        loss: epochLoss / batchCount,
        accuracy: epochAccuracy / batchCount,
        epoch,
        maxEpochs: epochs,
        learningRate: currentLearningRate,
        timestamp: Date.now(),
      }

      // Update performance and history
      this.performance = performance
      this.trainingHistory.push({ ...performance })

      // Notify caller
      onEpochComplete(performance)

      // Small delay between epochs
      await new Promise((resolve) => setTimeout(resolve, 10))
    }

    this.isTraining = false
    return this.performance
  }

  // Stop ongoing training
  stopTraining() {
    this.shouldStopTraining = true
  }

  // Get current performance metrics
  getPerformance(): NetworkPerformance {
    return this.performance
  }

  // Get training history
  getTrainingHistory(): NetworkPerformance[] {
    return this.trainingHistory
  }

  // Reset performance metrics
  resetPerformance() {
    this.performance = {}
    this.trainingHistory = []
  }

  // Check if network is currently training
  isNetworkTraining(): boolean {
    return this.isTraining
  }
}

