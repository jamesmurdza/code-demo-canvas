import { useState, useEffect, useRef } from 'react'
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
  const [displayCode, setDisplayCode] = useState(initialCode)
  const [phase, setPhase] = useState<'idle' | 'typing' | 'deleting'>('idle')
  const [showPlay, setShowPlay] = useState(true)
  const currentRef = useRef(0)
  const targetRef = useRef(initialCode)

  useEffect(() => {
    if (phase === 'typing') {
      const timer = setTimeout(() => {
        const target = targetRef.current
        setDisplayCode(prev => {
          if (prev.length < target.length) {
            return target.slice(0, prev.length + 1)
          }
          setPhase('idle')
          if (currentRef.current < replacements.length) {
            setShowPlay(true)
          }
          return prev
        })
      }, 20)
      return () => clearTimeout(timer)
    }

    if (phase === 'deleting') {
      const current = replacements[currentRef.current - 1]
      const target = targetRef.current.replace(current.from, '')
      const timer = setTimeout(() => {
        setDisplayCode(prev => {
          if (prev.length > target.length) {
            return prev.slice(0, -1)
          }
          targetRef.current = prev.replace(current.from, current.to)
          setPhase('typing')
          setShowPlay(false)
          return prev
        })
      }, 8)
      return () => clearTimeout(timer)
    }
  }, [phase])

  const playAnimation = () => {
    if (currentRef.current === 0) {
      setDisplayCode('')
      targetRef.current = initialCode
      setPhase('typing')
      currentRef.current = 1
      setShowPlay(false)
      return
    }

    if (currentRef.current < replacements.length) {
      const current = replacements[currentRef.current - 1]
      const afterDelete = displayCode.replace(current.from, '')
      targetRef.current = afterDelete.replace(current.from, current.to)
      setPhase('deleting')
      currentRef.current++
      setShowPlay(false)
    }
  }

  return (
    <div className="editor-container">
      <pre className="code-display">
        <code>{displayCode}</code>
        {phase === 'typing' && <span className="cursor">|</span>}
      </pre>
      {showPlay && (
        <button className="play-button" onClick={playAnimation}>
          ▶
        </button>
      )}
    </div>
  )
}

export default App