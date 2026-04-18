import { useState, useRef } from 'react'
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
  const [started, setStarted] = useState(false)
  const editorRef = useRef<any>(null)
  const stepRef = useRef(0)
  const runningRef = useRef(false)

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor
  }

  const runNextStep = () => {
    const currentText = text
    const s = stepRef.current
    
    if (s >= replacements.length) {
      runningRef.current = false
      return
    }
    
    const { from, to } = replacements[s]
    const idx = currentText.indexOf(from)
    
    if (idx === -1) {
      stepRef.current++
      setTimeout(runNextStep, 200)
      return
    }
    
    const editor = editorRef.current
    if (!editor) return
    
    // Select the text
    const selection = {
      startLineNumber: 1,
      startColumn: idx + 1,
      endLineNumber: 1,
      endColumn: idx + from.length + 1
    }
    editor.setSelection(selection)
    editor.revealLineInCenter(1)
    
    // Wait half second, then replace
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
      
      // Update state with new text
      const newText = currentText.slice(0, idx) + to + currentText.slice(idx + from.length)
      setText(newText)
      stepRef.current++
      
      // Continue to next step
      setTimeout(runNextStep, 200)
    }, 500)
  }

  const runAnimation = () => {
    if (started) return
    
    setStarted(true)
    runningRef.current = true
    
    // First type the initial code
    let i = 0
    const typeInterval = setInterval(() => {
      if (i <= targetCode.length) {
        setText(targetCode.slice(0, i))
        i++
      } else {
        clearInterval(typeInterval)
        // Start replacements
        stepRef.current = 0
        setTimeout(runNextStep, 300)
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
        onMount={handleEditorMount}
        theme="vs"
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
          selectionHighlight: true,
        }}
        beforeMount={(monaco) => {
          monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
          })
        }}
      />
      <button className="play-button" onClick={runAnimation}>▶</button>
    </div>
  )
}

export default App