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
  const fullTextRef = useRef('')
  const stepRef = useRef(0)

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor
  }

  const selectAndReplace = () => {
    const s = stepRef.current
    const currentText = fullTextRef.current
    
    console.log('Step', s, 'looking for:', replacements[s])
    console.log('Text:', currentText.substring(0, 100))
    
    if (s >= replacements.length || !editorRef.current) return
    
    const { from, to } = replacements[s]
    const idx = currentText.indexOf(from)
    
    console.log('Found at index:', idx, 'word:', from)
    
    if (idx === -1) {
      stepRef.current++
      setTimeout(selectAndReplace, 200)
      return
    }
    
    const editor = editorRef.current
    const startCol = idx + 1
    const endCol = idx + from.length + 1
    
    console.log('Selecting columns:', startCol, 'to', endCol)
    
    // Focus and select
    window.setTimeout(() => {
      editor.focus()
      const sel = {
        startLineNumber: 1,
        startColumn: startCol,
        endLineNumber: 1,
        endColumn: endCol
      }
      editor.setSelection(sel)
      console.log('Selection set')
    }, 10)
    
    // After selection, replace after delay
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
      
      const newText = currentText.slice(0, idx) + to + currentText.slice(idx + from.length)
      fullTextRef.current = newText
      setText(newText)
      stepRef.current++
      
      setTimeout(selectAndReplace, 200)
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
        
        // After typing complete, focus and start replacing
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.focus()
          }
          selectAndReplace()
        }, 300)
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