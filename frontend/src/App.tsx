import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useState } from 'react'

function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        Vite + React 19 + TypeScript + Tailwind CSS v4 + React Router
      </div>

      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
        HarbourStrike<span className="text-cyan-400">X</span>
      </h1>
      <p className="max-w-2xl text-lg text-slate-400 mb-8">
        Monorepo frontend initialized successfully. Fast development setup with modern tooling ready for building the user interface.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
        <button
          onClick={() => setCount((c) => c + 1)}
          className="px-6 py-3 rounded-lg font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/25 cursor-pointer"
        >
          Interactive Counter: {count}
        </button>
        <Link
          to="/about"
          className="px-6 py-3 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          View About Page &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl w-full text-left mt-8">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="font-semibold text-white mb-2">⚡ Vite 6+</h3>
          <p className="text-sm text-slate-400">Lightning-fast HMR and optimized production bundling.</p>
        </div>
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="font-semibold text-white mb-2">🎨 Tailwind CSS v4</h3>
          <p className="text-sm text-slate-400">Engineered with @tailwindcss/vite for high-performance styling.</p>
        </div>
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="font-semibold text-white mb-2">🧭 React Router</h3>
          <p className="text-sm text-slate-400">Client-side declarative routing ready for multi-page application flows.</p>
        </div>
      </div>
    </div>
  )
}

function About() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-slate-200">
      <Link
        to="/"
        className="inline-flex items-center text-sm font-medium text-cyan-400 hover:text-cyan-300 mb-6"
      >
        &larr; Back to Home
      </Link>
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
        <h2 className="text-2xl font-bold text-white mb-4">About HarbourStrikeX</h2>
        <p className="text-slate-400 leading-relaxed mb-4">
          HarbourStrikeX is structured as a monorepo consisting of:
        </p>
        <ul className="space-y-2 text-slate-300 list-disc list-inside mb-6">
          <li><code className="text-cyan-400 font-mono">/frontend</code>: React, TypeScript, Tailwind CSS, React Router</li>
          <li><code className="text-cyan-400 font-mono">/backend</code>: Core backend services and APIs</li>
          <li><code className="text-cyan-400 font-mono">/attack-cli</code>: Command-line interface and testing utilities</li>
        </ul>
        <p className="text-sm text-slate-500">
          Navigation is functioning seamlessly with React Router.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold tracking-tight text-white">
              HarbourStrike<span className="text-cyan-400">X</span>
            </Link>
            <div className="flex gap-4">
              <Link
                to="/"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                About
              </Link>
            </div>
          </div>
        </nav>

        <main className="flex-1 flex items-center justify-center">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
