"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Pause, RotateCcw, LineChart, BarChart2 } from "lucide-react"
import type { NetworkPerformance } from "@/lib/neural-network"

interface TrainingPanelProps {
  isTraining: boolean
  startTraining: () => void
  stopTraining: () => void
  resetTraining: () => void
  learningRate: number
  setLearningRate: (rate: number) => void
  epochs: number
  setEpochs: (epochs: number) => void
  batchSize: number
  setBatchSize: (size: number) => void
  currentEpoch: number
  performance: NetworkPerformance
  trainingHistory: NetworkPerformance[]
}

export function TrainingPanel({
  isTraining,
  startTraining,
  stopTraining,
  resetTraining,
  learningRate,
  setLearningRate,
  epochs,
  setEpochs,
  batchSize,
  setBatchSize,
  currentEpoch,
  performance,
  trainingHistory,
}: TrainingPanelProps) {
  const [activeTab, setActiveTab] = useState("parameters")

  // Calculate training progress
  const trainingProgress = epochs > 0 ? (currentEpoch / epochs) * 100 : 0

  return (
    <Card className="border-0 rounded-none h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Training</CardTitle>
        <CardDescription>Configure and monitor network training</CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="parameters" className="pt-4">
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Learning Rate:</span>
                  <span className="font-mono">{learningRate.toFixed(4)}</span>
                </div>
                <Slider
                  value={[learningRate]}
                  min={0.0001}
                  max={0.1}
                  step={0.0001}
                  onValueChange={([value]) => setLearningRate(value)}
                  disabled={isTraining}
                />
                <p className="text-xs text-muted-foreground">
                  Controls how quickly the network learns. Lower values are more stable but train slower.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Epochs:</span>
                  <span className="font-mono">{epochs}</span>
                </div>
                <Slider
                  value={[epochs]}
                  min={1}
                  max={1000}
                  step={1}
                  onValueChange={([value]) => setEpochs(value)}
                  disabled={isTraining}
                />
                <p className="text-xs text-muted-foreground">Number of complete passes through the training dataset.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Batch Size:</span>
                  <span className="font-mono">{batchSize}</span>
                </div>
                <Slider
                  value={[batchSize]}
                  min={1}
                  max={128}
                  step={1}
                  onValueChange={([value]) => setBatchSize(value)}
                  disabled={isTraining}
                />
                <p className="text-xs text-muted-foreground">
                  Number of samples processed before updating the network weights.
                </p>
              </div>

              {isTraining && (
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span>Training Progress:</span>
                    <span className="font-mono">
                      {currentEpoch} / {epochs}
                    </span>
                  </div>
                  <Progress value={trainingProgress} className="h-2" />
                </div>
              )}

              <div className="flex gap-2 mt-4">
                {!isTraining ? (
                  <Button className="flex-1" onClick={startTraining}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Training
                  </Button>
                ) : (
                  <Button className="flex-1" variant="destructive" onClick={stopTraining}>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Training
                  </Button>
                )}
                <Button variant="outline" onClick={resetTraining} disabled={isTraining}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="metrics" className="pt-4">
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">Loss</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="text-2xl font-bold">
                      {performance.loss !== undefined ? performance.loss.toFixed(4) : "N/A"}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="text-2xl font-bold">
                      {performance.accuracy !== undefined ? `${(performance.accuracy * 100).toFixed(1)}%` : "N/A"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-sm">Current Metrics</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Epoch:</span>
                      <span>
                        {currentEpoch} / {epochs}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Learning Rate:</span>
                      <span>{learningRate.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Batch Size:</span>
                      <span>{batchSize}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center p-4">
                <div className="flex flex-col items-center text-muted-foreground">
                  <LineChart className="h-16 w-16 mb-2" />
                  <span className="text-sm">Metrics visualization</span>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="pt-4">
          <ScrollArea className="h-[calc(100vh-250px)]">
            {trainingHistory.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-center p-4">
                  <div className="flex flex-col items-center">
                    <BarChart2 className="h-16 w-16 mb-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Training history chart</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Training History</div>
                  <div className="border rounded-md">
                    <div className="grid grid-cols-4 gap-2 p-2 border-b bg-muted text-xs font-medium">
                      <div>Epoch</div>
                      <div>Loss</div>
                      <div>Accuracy</div>
                      <div>Learning Rate</div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {trainingHistory.map((record, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 p-2 text-xs border-b last:border-0">
                          <div>{record.epoch}</div>
                          <div>{record.loss?.toFixed(4) || "N/A"}</div>
                          <div>{record.accuracy !== undefined ? `${(record.accuracy * 100).toFixed(1)}%` : "N/A"}</div>
                          <div>{learningRate.toFixed(4)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <BarChart2 className="h-16 w-16 mb-2" />
                <p className="text-sm">No training history available</p>
                <p className="text-xs mt-2">Start training to see metrics history</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

