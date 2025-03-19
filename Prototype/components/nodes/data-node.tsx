"use client"

import type React from "react"

import { memo, useState, useRef, useEffect } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { DatabaseIcon, Upload, X, ChevronDown, ChevronUp, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card } from "@/components/ui/card"
import Papa from "papaparse"

export const DataNode = memo(({ data, isConnectable }: NodeProps) => {
  const [csvData, setCsvData] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [xColumns, setXColumns] = useState<string[]>([])
  const [yColumns, setYColumns] = useState<string[]>([])
  const [fileName, setFileName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showStats, setShowStats] = useState(false)
  const [dataStats, setDataStats] = useState<{
    [key: string]: { min: number; max: number; mean: number; stdDev: number }
  }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize from node data if available
  useEffect(() => {
    if (data.csvData && data.csvData.length > 0) {
      setCsvData(data.csvData)
    }
    if (data.columns && data.columns.length > 0) {
      setColumns(data.columns)
    }
    if (data.xColumns && data.xColumns.length > 0) {
      setXColumns(data.xColumns)
    }
    if (data.yColumns && data.yColumns.length > 0) {
      setYColumns(data.yColumns)
    }
    if (data.fileName) {
      setFileName(data.fileName)
    }
  }, [data.csvData, data.columns, data.xColumns, data.yColumns, data.fileName])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setProgress(0)
    setFileName(file.name)

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      step: (results, parser) => {
        // Update progress
        const progress = Math.min(100, Math.round((parser.streamer._input.indexOf("\n") / file.size) * 100))
        setProgress(progress)
      },
      complete: (results) => {
        setIsLoading(false)
        setProgress(100)

        if (results.data && results.data.length > 0) {
          const parsedData = results.data as any[]
          setCsvData(parsedData)

          // Extract column names
          const cols = results.meta.fields || []
          setColumns(cols)

          // Default: first column is X, last column is Y
          if (cols.length > 0) {
            // For X, select all columns except the last one
            const defaultXCols = cols.length > 1 ? cols.slice(0, -1) : [cols[0]]
            setXColumns(defaultXCols)

            // For Y, select the last column
            if (cols.length > 1) {
              setYColumns([cols[cols.length - 1]])
            } else {
              setYColumns([])
            }
          }

          // Calculate statistics for each column
          calculateDataStats(parsedData, cols)

          // Update node data
          data.csvData = parsedData
          data.columns = cols
          data.xColumns = cols.length > 1 ? cols.slice(0, -1) : [cols[0]]
          data.yColumns = cols.length > 1 ? [cols[cols.length - 1]] : []
          data.fileName = file.name
        }
      },
      error: () => {
        setIsLoading(false)
        setProgress(0)
      },
    })
  }

  const calculateDataStats = (data: any[], columns: string[]) => {
    const stats: { [key: string]: { min: number; max: number; mean: number; stdDev: number } } = {}

    columns.forEach((column) => {
      // Extract numeric values for this column
      const values = data.map((row) => Number.parseFloat(row[column])).filter((val) => !isNaN(val))

      if (values.length > 0) {
        // Calculate min, max, mean
        const min = Math.min(...values)
        const max = Math.max(...values)
        const sum = values.reduce((acc, val) => acc + val, 0)
        const mean = sum / values.length

        // Calculate standard deviation
        const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
        const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length
        const stdDev = Math.sqrt(variance)

        stats[column] = { min, max, mean, stdDev }
      }
    })

    setDataStats(stats)
  }

  const toggleColumnSelection = (column: string, type: "x" | "y") => {
    if (type === "x") {
      if (xColumns.includes(column)) {
        const newXColumns = xColumns.filter((col) => col !== column)
        setXColumns(newXColumns)
        data.xColumns = newXColumns
      } else {
        const newXColumns = [...xColumns, column]
        setXColumns(newXColumns)
        data.xColumns = newXColumns
      }
    } else {
      if (yColumns.includes(column)) {
        const newYColumns = yColumns.filter((col) => col !== column)
        setYColumns(newYColumns)
        data.yColumns = newYColumns
      } else {
        const newYColumns = [...yColumns, column]
        setYColumns(newYColumns)
        data.yColumns = newYColumns
      }
    }
  }

  const getDataPreview = () => {
    if (csvData.length === 0) return null

    const previewData = csvData.slice(0, 5)

    return (
      <div className="mt-2 text-xs">
        <div className="font-medium mb-1">Data Preview (first 5 rows):</div>
        <div className="border rounded overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-2 py-1 bg-muted text-left text-xs font-medium text-muted-foreground">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {previewData.map((row, i) => (
                <tr key={i}>
                  {columns.map((column) => (
                    <td key={`${i}-${column}`} className="px-2 py-1 whitespace-nowrap">
                      {row[column]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const getDataStats = () => {
    if (csvData.length === 0) return null

    return (
      <div className="mt-2 text-xs">
        <div className="font-medium mb-1">Dataset Statistics:</div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Rows:</span>
            <span className="font-medium">{csvData.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Columns:</span>
            <span className="font-medium">{columns.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Input Features:</span>
            <span className="font-medium">{xColumns.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Output Features:</span>
            <span className="font-medium">{yColumns.length}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-xs h-7"
            onClick={() => setShowStats(!showStats)}
          >
            {showStats ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Hide Column Statistics
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show Column Statistics
              </>
            )}
          </Button>

          {showStats && (
            <div className="mt-2 space-y-3">
              {Object.entries(dataStats).map(([column, stats]) => (
                <Card key={column} className="p-2">
                  <div className="font-medium">{column}</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                    <div className="flex justify-between">
                      <span>Min:</span>
                      <span>{stats.min.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max:</span>
                      <span>{stats.max.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mean:</span>
                      <span>{stats.mean.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Std Dev:</span>
                      <span>{stats.stdDev.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const getColumnSelectionUI = () => {
    return (
      <div className="space-y-2">
        <div>
          <div className="text-xs font-medium mb-1">Input Features (X):</div>
          <div className="flex flex-wrap gap-1">
            {columns.map((column) => (
              <TooltipProvider key={`x-${column}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant={xColumns.includes(column) ? "default" : "outline"}
                      className="text-xs cursor-pointer"
                      onClick={() => toggleColumnSelection(column, "x")}
                    >
                      {column}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>
                      {dataStats[column]
                        ? `Range: ${dataStats[column].min.toFixed(2)} to ${dataStats[column].max.toFixed(2)}`
                        : "No statistics available"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-medium mb-1">Output Features (Y):</div>
          <div className="flex flex-wrap gap-1">
            {columns.map((column) => (
              <TooltipProvider key={`y-${column}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant={yColumns.includes(column) ? "default" : "outline"}
                      className="text-xs cursor-pointer"
                      onClick={() => toggleColumnSelection(column, "y")}
                    >
                      {column}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>
                      {dataStats[column]
                        ? `Range: ${dataStats[column].min.toFixed(2)} to ${dataStats[column].max.toFixed(2)}`
                        : "No statistics available"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground mt-2">
          <p>Click on column names to select/deselect them as inputs or outputs.</p>
          <p className="mt-1">Selected X columns: {xColumns.length}</p>
          <p>Selected Y columns: {yColumns.length}</p>
        </div>
      </div>
    )
  }

  const getDataVisualization = () => {
    if (csvData.length === 0 || !xColumns.length || !yColumns.length)
      return <div className="text-xs text-muted-foreground">Select X and Y columns to visualize data</div>

    return (
      <div className="space-y-2">
        <div className="text-xs font-medium">Data Distribution</div>
        <div className="h-32 border rounded p-2 flex items-center justify-center">
          <BarChart2 className="h-8 w-8 text-muted-foreground" />
          <span className="text-xs text-muted-foreground ml-2">Data visualization available</span>
        </div>
        <div className="text-xs text-muted-foreground">
          <p>
            This dataset has {csvData.length} samples with {xColumns.length} input features and {yColumns.length} output
            features.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-2 shadow-md rounded-md border-2 node-data w-64">
      <div className="flex items-center">
        <DatabaseIcon className="h-4 w-4 text-node-data mr-2" />
        <div className="font-bold">{data.label || "Dataset"}</div>
      </div>

      <div className="mt-2">
        <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />

        {!fileName ? (
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-3 w-3 mr-1" />
            Upload CSV File
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium truncate max-w-[180px]">{fileName}</div>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => {
                  setFileName("")
                  setCsvData([])
                  setColumns([])
                  setXColumns([])
                  setYColumns([])
                  data.csvData = []
                  data.columns = []
                  data.xColumns = []
                  data.yColumns = []
                  data.fileName = ""
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {isLoading && (
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Loading file...</div>
                <Progress value={progress} className="h-1" />
              </div>
            )}

            {csvData.length > 0 && (
              <Tabs defaultValue="columns" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-7">
                  <TabsTrigger value="columns" className="text-xs">
                    Columns
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs">
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="text-xs">
                    Stats
                  </TabsTrigger>
                  <TabsTrigger value="viz" className="text-xs">
                    Visualize
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="columns" className="pt-2">
                  <ScrollArea className="h-32">{getColumnSelectionUI()}</ScrollArea>
                </TabsContent>

                <TabsContent value="preview" className="pt-2">
                  <ScrollArea className="h-32">{getDataPreview()}</ScrollArea>
                </TabsContent>

                <TabsContent value="stats" className="pt-2">
                  <ScrollArea className="h-32">{getDataStats()}</ScrollArea>
                </TabsContent>

                <TabsContent value="viz" className="pt-2">
                  <ScrollArea className="h-32">{getDataVisualization()}</ScrollArea>
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-4">
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          isConnectable={isConnectable}
          className="w-2 h-2 bg-node-data"
        />
      </div>
    </div>
  )
})

DataNode.displayName = "DataNode"

