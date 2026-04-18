import { useState, useEffect } from 'react'
import './App.css'

const initialCode = `import { createSession } from "background-agents"

const session = await createSession("claude", {
  sandbox,
  env: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY },
})

await session.start("Add GitHub OAuth integration")`

const replacements = [
  { from: 'claude', to: 'codex' },
  { from: 'ANTHROPIC_API_KEY', to: 'OPENAI_API_KEY' },
  { from: 'codex', to: 'opencode' },
  { from: 'opencode', to: 'gemini' },
  { from: 'gemini', to: 'goose' },
  { from: 'goose', to: 'pi' },
]

function App() {
  const [code, setCode] = useState(initialCode)
  const [step, setStep] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (!animating || step >= replacements.length) return

    const current = replacements[step]
    const nextCode = code.replace(current.from, '')
    
    const interval = setInterval(() => {
      setCode(prev => {
        if (prev.length > nextCode.length) {
          clearInterval(interval)
          setTimeout(() => {
            setCode(prev + current.to)
            setAnimating(false)
          }, 100)
          return prev.slice(0, -1)
        }
        return prev.slice(0, -1)
      })
    }, 15)
    
    return () => clearInterval(interval)
  }, [animating, step])

  const handlePlay = () => {
    if (step === 0) {
      setCode('')
      setTimeout(() => setAnimating(true), 100)
    } else if (step < replacements.length) {
      setAnimating(true)
    }
    setStep(s => s + 1)
  }

  return (
    <div className="editor-container">
      <pre className="code-display"><code>{code}</code></pre>
      <button className="play-button" onClick={handlePlay}>▶</button>
    </div>
  )
}

export default App