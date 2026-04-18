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
  { from: 'process.env.ANTHROPIC_API_KEY', to: 'process.env.OPENAI_API_KEY' },
  { from: 'codex', to: 'opencode' },
  { from: 'opencode', to: 'gemini' },
  { from: 'process.env.OPENAI_API_KEY', to: 'process.env.GEMINI_API_KEY' },
  { from: 'gemini', to: 'goose' },
  { from: 'goose', to: 'pi' },
]

function App() {
  const [text, setText] = useState('')
  const [started, setStarted] = useState(false)
  const editorRef = useRef<any>(null)
  const fullTextRef = useRef('')
  const stepRef = useRef(0)

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor
  }

  const runReplacement = () => {
    const s = stepRef.current
    
    if (s >= replacements.length || !editorRef.current) return
    
    const { from, to } = replacements[s]
    const currentText = fullTextRef.current
    const idx = currentText.indexOf(from)
    
    if (idx === -1) {
      stepRef.current++
      setTimeout(runReplacement, 200)
      return
    }
    
    const editor = editorRef.current
    const startCol = idx + 1
    const endCol = idx + from.length + 1
    
    // Select text (show selection briefly)
    const range = {
      startLineNumber: 1,
      startColumn: startCol,
      endLineNumber: 1,
      endColumn: endCol
    }
    editor.setSelection(range)
    
    // After selection delay, delete and type
    setTimeout(() => {
      // Use executeEdits to replace the selected text
      const editRange = {
        startLineNumber: 1,
        startColumn: startCol,
        endLineNumber: 1,
        endColumn: endCol
      }
      
      editor.executeEdits('', [{
        range: editRange,
        text: to,
        forceMoveMarkers: true
      }])
      
      // Update state
      const newText = currentText.slice(0, idx) + to + currentText.slice(idx + from.length)
      fullTextRef.current = newText
      setText(newText)
      
      stepRef.current++
      setTimeout(runReplacement, 200)
    }, 500)
  }

  const runAnimation = () => {
    if (started) return
    
    setStarted(true)
    fullTextRef.current = ''
    stepRef.current = 0
    
    let i = 0
    const interval = setInterval(() => {
      const partial = targetCode.slice(0, i)
      fullTextRef.current = partial
      setText(partial)
      
      if (i >= targetCode.length) {
        clearInterval(interval)
        setTimeout(runReplacement, 300)
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
          renderLineHighlight: 'line',
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
      <button className="play-button" onClick={runAnimation}>▶</button>
    </div>
  )
}

export default App