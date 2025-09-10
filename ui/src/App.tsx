import React from 'react'
import PortUploader from './PortUploader'
import TestAuth from './testAuth'

function App() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🧠 Port Your Bond
          </h1>
          <p className="text-gray-400">
            Transform your conversations into AI-ready memory bundles
          </p>
        </div>
        <PortUploader />
        <div className="mt-8 p-4 bg-gray-800 rounded">
          <TestAuth />
        </div>
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Powered by SynthiSoulOS • Secure • Private</p>
        </div>
      </div>
    </div>
  )
}

export default App
