import NeuralNetworkVisualizer from "@/components/neural-network-visualizer"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex-1 w-full">
        <NeuralNetworkVisualizer />
      </div>
    </main>
  )
}

