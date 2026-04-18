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
  { from: 'gemini', to: 'goose' },
  { from: 'goose', to: 'pi' },
]

function App() {
  const [text, setText] = useState(targetCode)
  const [step, setStep] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
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
    setIsTyping(true)
    
    const typeInterval = setInterval(() => {
      if (i < toText.length) {
        i++
        setText(toText.slice(0, i))
      } else {
        clearInterval(typeInterval)
        setIsTyping(false)
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
    
    if (idx === -1) return
    
    setStep(step + 1)
    setIsTyping(true)
    
    // Delete character by character backwards (like pressing backspace)
    let deletePos = idx + from.length
    const deleteInterval = setInterval(() => {
      const now = text
      if (deletePos > idx) {
        deletePos--
        setText(now.slice(0, deletePos) + now.slice(deletePos + 1))
      } else {
        clearInterval(deleteInterval)
        // Type the new word character by character
        let typePos = 0
        const typeInterval = setInterval(() => {
          if (typePos < to.length) {
            const insertAt = idx
            setText(text.slice(0, insertAt) + to.slice(0, typePos + 1))
            typePos++
          } else {
            clearInterval(typeInterval)
            setIsTyping(false)
          }
        }, 80)
      }
    }, 15)
  }

  return (
    <div className="editor-container">
      <pre className="code-display">
        <code dangerouslySetInnerHTML={{ __html: highlighted }}></code>
        {isTyping && <span className="cursor">|</span>}
      </pre>
      {step < replacements.length && (
        <button className="play-button" onClick={handlePlay}>▶</button>
      )}
    </div>
  )
}

export default App