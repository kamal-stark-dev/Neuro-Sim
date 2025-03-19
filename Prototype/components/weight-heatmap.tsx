"use client"

import { useState, useEffect } from "react"
import type { Node } from "reactflow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Download, ZoomIn, ZoomOut, RotateCw, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface WeightHeatmapProps {
  node: Node
}

export function WeightHeatmap({ node }: WeightHeatmapProps) {
  const [activeTab, setActiveTab] = useState("weights")
  const [colorScale, setColorScale] = useState<[number, number]>([0, 1])
  const [autoScale, setAutoScale] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [highlightedNeuron, setHighlightedNeuron] = useState<number | null>(null)

  // Calculate min and max for color scaling
  useEffect(() => {
    if (!node?.data?.weights || !autoScale) return

    const allWeights = node.data.weights.flat()
    if (allWeights.length === 0) return

    const absMax = Math.max(...allWeights.map((w) => Math.abs(w)))
    setColorScale([-absMax, absMax])
  }, [node, autoScale])

  if (!node || !node.data || !node.data.weights) {
    return (
      <Card className="border-0 rounded-none h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Weight Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No weights available for this node.</p>
        </CardContent>
      </Card>
    )
  }

  const weights = node.data.weights
  const biases = node.data.biases || []

  // Get color for weight value
  const getWeightColor = (weight: number) => {
    if (weight === 0) return "bg-gray-200 dark:bg-gray-700 text-foreground"

    // Normalize weight to 0-1 range based on color scale
    const normalizedWeight = (weight - colorScale[0]) / (colorScale[1] - colorScale[0])

    if (weight > 0) {
      // Green for positive weights
      const intensity = Math.min(1, normalizedWeight)
      return `rgba(0, ${Math.round(100 + intensity * 155)}, 0, ${0.3 + intensity * 0.7})`
    } else {
      // Red for negative weights
      const intensity = Math.min(1, 1 - normalizedWeight)
      return `rgba(${Math.round(100 + intensity * 155)}, 0, 0, ${0.3 + intensity * 0.7})`
    }
  }

  // Get color for bias value
  const getBiasColor = (bias: number) => {
    if (bias === 0) return "bg-gray-200 dark:bg-gray-700 text-foreground"

    // Normalize bias to 0-1 range based on color scale
    const normalizedBias = (bias - colorScale[0]) / (colorScale[1] - colorScale[0])

    if (bias > 0) {
      // Blue for positive biases
      const intensity = Math.min(1, normalizedBias)
      return `rgba(0, 100, ${Math.round(150 + intensity * 105)}, ${0.3 + intensity * 0.7})`
    } else {
      // Purple for negative biases
      const intensity = Math.min(1, 1 - normalizedBias)
      return `rgba(${Math.round(150 + intensity * 105)}, 0, ${Math.round(150 + intensity * 105)}, ${0.3 + intensity * 0.7})`
    }
  }

  // Reset color scale to auto
  const resetColorScale = () => {
    setAutoScale(true)
    const allWeights = weights.flat()
    const absMax = Math.max(...allWeights.map((w) => Math.abs(w)))
    setColorScale([-absMax, absMax])
  }

  // Export weights as CSV
  const exportWeights = () => {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,"

    // Add headers (Input 1, Input 2, etc.)
    const numInputs = weights[0]?.length || 0
    csvContent += "," + Array.from({ length: numInputs }, (_, i) => `Input ${i + 1}`).join(",") + "\n"

    // Add weights for each neuron
    weights.forEach((neuronWeights, i) => {
      csvContent += `Neuron ${i + 1},` + neuronWeights.join(",") + "\n"
    })

    // Add biases
    csvContent += "Biases," + biases.join(",") + "\n"

    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${node.data.label}_weights.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Save heatmap as image
  const saveAsImage = () => {
    const heatmapElement = document.getElementById("weight-heatmap")
    if (!heatmapElement) return

    // Use html2canvas or similar library to capture the element
    // For this example, we'll just show an alert
    alert("Heatmap would be saved as an image (requires html2canvas or similar library)")
  }

  return (
    <Card className="border-0 rounded-none h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Weight Visualization</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={resetColorScale} title="Reset Scale">
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={exportWeights} title="Export as CSV">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={saveAsImage} title="Save as Image">
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{node.data.label}</p>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weights">Weights</TabsTrigger>
          <TabsTrigger value="biases">Biases</TabsTrigger>
        </TabsList>

        <TabsContent value="weights" className="pt-4">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">Weight Heatmap</div>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAutoScale(!autoScale)}>
                  {autoScale ? "Manual Scale" : "Auto Scale"}
                </Button>
              </div>

              {!autoScale && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Min: {colorScale[0].toFixed(2)}</span>
                    <span>Max: {colorScale[1].toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[colorScale[0], colorScale[1]]}
                    min={-2}
                    max={2}
                    step={0.01}
                    onValueChange={(values) => setColorScale([values[0], values[1]])}
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-1 mb-2">
                {weights.map((_, i) => (
                  <Badge
                    key={i}
                    variant={highlightedNeuron === i ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setHighlightedNeuron(highlightedNeuron === i ? null : i)}
                  >
                    Neuron {i + 1}
                  </Badge>
                ))}
              </div>

              <div
                id="weight-heatmap"
                className="weight-heatmap rounded-md border p-4"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "top left",
                  transition: "transform 0.2s ease-out",
                }}
              >
                {weights.map((neuronWeights, i) => (
                  <div
                    key={i}
                    className={`grid gap-1 mb-2 p-2 rounded-md ${highlightedNeuron === i ? "bg-accent/30" : ""} ${highlightedNeuron !== null && highlightedNeuron !== i ? "opacity-30" : ""}`}
                    style={{ gridTemplateColumns: `repeat(${neuronWeights.length}, 1fr)` }}
                  >
                    <div className="col-span-full mb-1 font-medium text-sm">Neuron {i + 1}</div>
                    {neuronWeights.map((weight, j) => (
                      <div
                        key={j}
                        className="weight-cell rounded-md flex items-center justify-center text-xs font-mono p-2 transition-all hover:scale-110"
                        style={{
                          backgroundColor: getWeightColor(weight),
                          color: Math.abs(weight) > (colorScale[1] - colorScale[0]) / 2 ? "white" : "black",
                        }}
                        title={`Neuron ${i + 1}, Input ${j + 1}: ${weight.toFixed(4)}`}
                      >
                        {weight.toFixed(2)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: "rgba(255, 0, 0, 0.7)" }}></div>
                  <span>Negative</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded-sm mr-1"></div>
                  <span>Zero</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: "rgba(0, 255, 0, 0.7)" }}></div>
                  <span>Positive</span>
                </div>
              </div>

              <div className="text-sm mt-4">
                <p className="text-muted-foreground">
                  Weights control how strongly each input affects the neuron's output. Positive weights (green) increase
                  activation, while negative weights (red) decrease it.
                </p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="biases" className="pt-4">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4">
              <div className="text-sm font-medium">Bias Values</div>
              <div className="grid gap-2">
                {biases.map((bias, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-24 text-sm">Neuron {i + 1}:</div>
                    <div
                      className="flex-1 h-10 rounded-md flex items-center justify-center font-medium transition-all hover:scale-105"
                      style={{
                        backgroundColor: getBiasColor(bias),
                        color: Math.abs(bias) > (colorScale[1] - colorScale[0]) / 2 ? "white" : "black",
                      }}
                    >
                      {bias.toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: "rgba(255, 0, 255, 0.7)" }}></div>
                  <span>Negative</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded-sm mr-1"></div>
                  <span>Zero</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: "rgba(0, 100, 255, 0.7)" }}></div>
                  <span>Positive</span>
                </div>
              </div>

              <div className="text-sm mt-4">
                <p className="text-muted-foreground">
                  Biases shift the activation function. A positive bias makes the neuron more likely to activate, while
                  a negative bias makes it less likely to activate.
                </p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

