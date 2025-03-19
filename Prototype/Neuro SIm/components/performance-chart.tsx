"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { NetworkPerformance } from "@/lib/neural-network"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface PerformanceChartProps {
  trainingHistory: NetworkPerformance[]
}

export function PerformanceChart({ trainingHistory }: PerformanceChartProps) {
  // Format data for recharts
  const chartData = trainingHistory.map((record, index) => ({
    epoch: record.epoch || index + 1,
    loss: record.loss || 0,
    accuracy: record.accuracy || 0,
  }))

  if (trainingHistory.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Performance Chart</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-sm text-muted-foreground">No training data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Performance Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="epoch"
                label={{ value: "Epochs", position: "insideBottomRight", offset: -5 }}
                fontSize={11}
              />
              <YAxis
                yAxisId="left"
                label={{ value: "Loss", angle: -90, position: "insideLeft" }}
                fontSize={11}
                domain={[0, "auto"]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: "Accuracy", angle: 90, position: "insideRight" }}
                domain={[0, 1]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                fontSize={11}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "accuracy") return [`${(Number(value) * 100).toFixed(1)}%`, "Accuracy"]
                  return [value.toFixed(4), "Loss"]
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="loss"
                stroke="#ef4444"
                activeDot={{ r: 8 }}
                name="Loss"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="accuracy"
                stroke="#22c55e"
                name="Accuracy"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <div>Total Epochs: {trainingHistory.length}</div>
          <div>
            Final Loss: {trainingHistory[trainingHistory.length - 1].loss?.toFixed(4) || "N/A"} | Accuracy:{" "}
            {trainingHistory[trainingHistory.length - 1].accuracy !== undefined
              ? `${(trainingHistory[trainingHistory.length - 1].accuracy * 100).toFixed(1)}%`
              : "N/A"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

