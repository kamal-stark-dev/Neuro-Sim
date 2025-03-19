"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Minimize2, Maximize2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface DataPanelProps {
  inputValues: number[]
  onInputChange: (values: number[]) => void
  outputValues: number[]
  networkPerformance?: {
    loss?: number
    accuracy?: number
    epoch?: number
    maxEpochs?: number
  }
}

export function DataPanel({ inputValues, onInputChange, outputValues, networkPerformance = {} }: DataPanelProps) {
  const [testData, setTestData] = useState([
    { inputs: [0, 0], expected: [0] },
    { inputs: [0, 1], expected: [1] },
    { inputs: [1, 0], expected: [1] },
    { inputs: [1, 1], expected: [0] },
  ])

  const [isMinimized, setIsMinimized] = useState(false)
  const [activeTab, setActiveTab] = useState("manual")

  const handleInputChange = (index: number, value: number) => {
    const newValues = [...inputValues]
    newValues[index] = value
    onInputChange(newValues)
  }

  // Calculate accuracy if expected values are available
  const calculateAccuracy = () => {
    if (activeTab === "test" && outputValues.length > 0) {
      const currentTest = testData.find((data) =>
        data.inputs.every((val, idx) => Math.abs(val - inputValues[idx]) < 0.1),
      )

      if (currentTest) {
        const matches = currentTest.expected.filter(
          (expected, idx) => Math.abs(expected - outputValues[idx]) < 0.2,
        ).length

        return (matches / currentTest.expected.length) * 100
      }
    }
    return null
  }

  const accuracy = calculateAccuracy()

  if (isMinimized) {
    return (
      <div className="p-2 w-full max-w-md flex justify-between items-center bg-background border-t border-x rounded-t-lg">
        <span className="text-sm font-medium">Data Panel</span>
        <Button variant="ghost" size="sm" onClick={() => setIsMinimized(false)} className="h-8 w-8 p-0">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 w-full max-w-md bg-background border-t border-x rounded-t-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Data Panel</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsMinimized(true)} className="h-8 w-8 p-0">
          <Minimize2 className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Input</TabsTrigger>
          <TabsTrigger value="test">Test Data</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4 mt-4">
          <div className="space-y-4">
            <h3 className="font-medium">Input Values</h3>
            {inputValues.map((value, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Input {index + 1}</span>
                  <span>{value.toFixed(2)}</span>
                </div>
                <Slider
                  value={[value]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([newValue]) => handleInputChange(index, newValue)}
                />
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t">
            <h3 className="font-medium">Output Values</h3>
            {outputValues.map((value, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>Output {index + 1}</span>
                <span className="font-medium">{value.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="test" className="space-y-4 mt-4">
          <div className="space-y-2">
            <h3 className="font-medium">Test Data Sets</h3>
            <div className="grid grid-cols-2 gap-2">
              {testData.map((data, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => onInputChange(data.inputs)}
                  className="justify-start"
                >
                  <div className="text-left">
                    <div className="text-xs">Inputs: [{data.inputs.join(", ")}]</div>
                    <div className="text-xs">Expected: [{data.expected.join(", ")}]</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <h3 className="font-medium">Current Output</h3>
            {outputValues.map((value, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>Output {index + 1}</span>
                <span className="font-medium">{value.toFixed(4)}</span>
              </div>
            ))}

            {accuracy !== null && (
              <div className="mt-2">
                <div className="flex justify-between text-sm">
                  <span>Prediction Accuracy:</span>
                  <span
                    className={`font-medium ${accuracy > 80 ? "text-green-500" : accuracy > 50 ? "text-amber-500" : "text-red-500"}`}
                  >
                    {accuracy.toFixed(1)}%
                  </span>
                </div>
                <Progress value={accuracy} className="h-1 mt-1" />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Network Performance Metrics */}
      {networkPerformance && (networkPerformance.loss !== undefined || networkPerformance.accuracy !== undefined) && (
        <Card className="p-3 mt-4">
          <h3 className="text-sm font-medium mb-2">Network Performance</h3>
          <div className="space-y-2 text-sm">
            {networkPerformance.epoch !== undefined && (
              <div className="flex justify-between">
                <span>Epoch:</span>
                <span className="font-medium">
                  {networkPerformance.epoch} / {networkPerformance.maxEpochs || "?"}
                </span>
              </div>
            )}

            {networkPerformance.loss !== undefined && (
              <div className="flex justify-between">
                <span>Loss:</span>
                <span className="font-medium">{networkPerformance.loss.toFixed(4)}</span>
              </div>
            )}

            {networkPerformance.accuracy !== undefined && (
              <div>
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span className="font-medium">{(networkPerformance.accuracy * 100).toFixed(1)}%</span>
                </div>
                <Progress value={networkPerformance.accuracy * 100} className="h-1 mt-1" />
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

