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
    const middleText = currentText.replace(from, '')
    
    setStep(step + 1)
    
    let i = currentText.length
    const deleteInterval = setInterval(() => {
      if (i > middleText.length) {
        i--
        setText(text.slice(0, i))
      } else {
        clearInterval(deleteInterval)
        let j = 0
        const typeInterval = setInterval(() => {
          if (j < to.length) {
            j++
            setText(middleText + to.slice(0, j))
          } else {
            clearInterval(typeInterval)
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