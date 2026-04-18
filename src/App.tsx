import { useState, useEffect, useRef } from 'react'
import type { OnMount } from '@monaco-editor/react'
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
  const editorRef = useRef<any>(null)

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor
  }

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
    const editor = editorRef.current
    if (!editor) return
    
    // Select the text first
    const selection = {
      startLineNumber: 1,
      startColumn: idx + 1,
      endLineNumber: 1,
      endColumn: idx + from.length + 1
    }
    editor.setSelection(selection)
    
    // After half second pause, delete and type
    setTimeout(() => {
      const range = {
        startLineNumber: 1,
        startColumn: idx + 1,
        endLineNumber: 1,
        endColumn: idx + from.length + 1
      }
      
      editor.executeEdits('', [{
        range,
        text: to,
        forceMoveMarkers: true
      }])
      
      // Update state after edit
      setText(currentText.slice(0, idx) + to + currentText.slice(idx + from.length))
    }, 500)
  }

  return (
    <div className="editor-container">
      <Editor
        height="100vh"
        language="typescript"
        value={text}
        onChange={value => setText(value || '')}
        onMount={handleEditorMount}
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
          formatOnPaste: false,
          formatOnType: false,
        }}
        beforeMount={(monaco) => {
          monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
          })
        }}
      />
      {step < replacements.length && (
        <button className="play-button" onClick={handlePlay}>▶</button>
      )}
    </div>
  )
}

export default App