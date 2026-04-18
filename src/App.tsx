import { useState, useEffect, useCallback } from 'react'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-typescript'
import 'prismjs/themes/prism.css'
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
  const [text, setText] = useState(targetCode)
  const [step, setStep] = useState(0)
  const [cursorPos, setCursorPos] = useState(0)
  const [highlighted, setHighlighted] = useState('')

  const highlightCode = (code: string) => {
    try {
      return highlight(code, languages.ts, 'typescript')
    } catch {
      return code
    }
  }

  useEffect(() => {
    setHighlighted(highlightCode(text))
  }, [text])

  const animate = useCallback((toText: string, onComplete: () => void) => {
    let i = 0
    setCursorPos(1)
    const typeInterval = setInterval(() => {
      if (i < toText.length) {
        i++
        setCursorPos(i + 1)
        setText(toText.slice(0, i))
      } else {
        clearInterval(typeInterval)
        setCursorPos(toText.length + 1)
        onComplete()
      }
    }, 15)
    return () => clearInterval(typeInterval)
  }, [])

  useEffect(() => {
    setText('')
    setTimeout(() => {
      animate(targetCode, () => {})
    }, 100)
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
    setCursorPos(idx + 1)
    
    let deletePos = idx + from.length
    const deleteInterval = setInterval(() => {
      if (deletePos > idx) {
        deletePos--
        setCursorPos(deletePos)
        setText(text.slice(0, deletePos) + text.slice(deletePos + 1))
      } else {
        clearInterval(deleteInterval)
        let typePos = 0
        const typeInterval = setInterval(() => {
          if (typePos < to.length) {
            typePos++
            setCursorPos(idx + typePos)
            setText(text.slice(0, idx) + to.slice(0, typePos) + text.slice(idx + from.length))
          } else {
            clearInterval(typeInterval)
            setCursorPos(idx + to.length)
          }
        }, 80)
      }
    }, 15)
  }

  const renderWithCursor = () => {
    if (cursorPos === 0) {
      return (
        <pre className="code-display">
          <code dangerouslySetInnerHTML={{ __html: highlighted }}></code>
          <span className="cursor">|</span>
        </pre>
      )
    }
    const plain = text
    const before = plain.slice(0, cursorPos - 1)
    const char = plain[cursorPos - 1] || ''
    const after = plain.slice(cursorPos - 1)
    
    return (
      <pre className="code-display">
        <code dangerouslySetInnerHTML={{ __html: before }}></code>
        <span className="cursor">{char}</span>
        <code dangerouslySetInnerHTML={{ __html: after }}></code>
      </pre>
    )
  }

  return (
    <div className="editor-container">
      {renderWithCursor()}
      {step < replacements.length && (
        <button className="play-button" onClick={handlePlay}>▶</button>
      )}
    </div>
  )
}

export default App