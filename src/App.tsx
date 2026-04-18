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

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor
  }

  const runAnimation = async () => {
    if (started) return
    setStarted(true)
    
    // First type the initial code
    for (let i = 0; i <= targetCode.length; i++) {
      setText(targetCode.slice(0, i))
      await new Promise(r => setTimeout(r, 15))
    }
    
    // Then run through all replacements with small pauses
    for (let s = 0; s < replacements.length; s++) {
      const step = s
      const { from, to } = replacements[s]
      const currentText = text
      const idx = currentText.indexOf(from)
      
      if (idx === -1) {
        continue
      }
      
      const editor = editorRef.current
      if (!editor) continue
      
      // Select the text
      const selection = {
        startLineNumber: 1,
        startColumn: idx + 1,
        endLineNumber: 1,
        endColumn: idx + from.length + 1
      }
      editor.setSelection(selection)
      
      // Wait half second
      await new Promise(r => setTimeout(r, 500))
      
      // Delete and replace
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
      
      setText(currentText.slice(0, idx) + to + currentText.slice(idx + from.length))
      
      // Small pause between steps
      await new Promise(r => setTimeout(r, 200))
    }
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