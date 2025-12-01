import { ReindeerChart } from './components/ReindeerChart/ReindeerChart'

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Reindeer Chart</h1>
        <p className="text-gray-400">Vertical Timeline Visualization</p>
      </header>
      
      <main className="container mx-auto">
        <ReindeerChart width={1000} height={800} />
      </main>
    </div>
  )
}

export default App
