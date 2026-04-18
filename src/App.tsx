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
  const fullTextRef = useRef('')

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor
  }

  const runNextStep = () => {
    const s = stepRef.current
    let currentText = fullTextRef.current
    
    if (s >= replacements.length) {
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
      
      // Update both the state and the ref
      const newText = currentText.slice(0, idx) + to + currentText.slice(idx + from.length)
      fullTextRef.current = newText
      setText(newText)
      stepRef.current++
      
      // Continue to next step
      setTimeout(runNextStep, 200)
    }, 500)
  }

  const runAnimation = () => {
    if (started) return
    
    setStarted(true)
    
    // First type the initial code
    let i = 0
    fullTextRef.current = ''
    stepRef.current = 0
    
    const typeInterval = setInterval(() => {
      const partial = targetCode.slice(0, i)
      fullTextRef.current = partial
      setText(partial)
      
      if (i >= targetCode.length) {
        clearInterval(typeInterval)
        // Start replacements
        setTimeout(runNextStep, 300)
      } else {
        i++
      }
    }, 15)
  }

  return (
    <div className="editor-container">
      <Editor
        height="100vh"
        language="typescript"
        value={text}
        onChange={value => {
          const v = value || ''
          fullTextRef.current = v
          setText(v)
        }}
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