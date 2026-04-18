import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import './App.css'

const targetCode = `import { createSession } from "background-agents"

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
  { from: 'OPENAI_API_KEY', to: 'GEMINI_API_KEY' },
  { from: 'gemini', to: 'goose' },
  { from: 'goose', to: 'pi' },
]

function App() {
  const [text, setText] = useState('')
  const [step, setStep] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (loaded) return
    setLoaded(true)
    let i = 0
    const typeInterval = setInterval(() => {
      if (i < targetCode.length) {
        i++
        setText(targetCode.slice(0, i))
      } else {
        clearInterval(typeInterval)
      }
    }, 15)
    return () => clearInterval(typeInterval)
  }, [])

  const handlePlay = () => {
    if (step >= replacements.length) return
    
    const { from, to } = replacements[step]
    const currentText = text
    const idx = currentText.indexOf(from)
    
    if (idx === -1) {
      setStep(s => s + 1)
      return
    }
    
    setStep(s => s + 1)
    
    let deletePos = idx + from.length
    const deleteInterval = setInterval(() => {
      if (deletePos > idx) {
        deletePos--
        setText(text.slice(0, deletePos) + text.slice(deletePos + 1))
      } else {
        clearInterval(deleteInterval)
        let typePos = 0
        const typeInterval = setInterval(() => {
          if (typePos < to.length) {
            typePos++
            setText(text.slice(0, idx) + to.slice(0, typePos) + text.slice(idx + from.length))
          } else {
            clearInterval(typeInterval)
          }
        }, 80)
      }
    }, 15)
  }

  return (
    <div className="editor-container">
      <Editor
        height="100vh"
        language="typescript"
        value={text}
        onChange={value => setText(value || '')}
        theme="light"
        options={{
          fontSize: 20,
          fontFamily: '"Fira Code", monospace',
          minimap: { enabled: false },
          lineNumbers: 'off',
          folding: false,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          padding: { top: 48, bottom: 48 },
          cursorStyle: 'line',
          cursorBlinking: 'smooth',
          renderLineHighlight: 'none',
          automaticLayout: true,
        }}
      />
      {step < replacements.length && (
        <button className="play-button" onClick={handlePlay}>▶</button>
      )}
    </div>
  )
}

export default App