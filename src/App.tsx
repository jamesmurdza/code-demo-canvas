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

  const deleteAndReplace = (editor: any, startCol: number, endCol: number, replaceWith: string) => {
    let pos = endCol
    const deleteInterval = setInterval(() => {
      if (pos > startCol) {
        pos--
        const range = {
          startLineNumber: 1,
          startColumn: pos,
          endLineNumber: 1,
          endColumn: pos + 1
        }
        editor.executeEdits('', [{ range, text: '', forceMoveMarkers: true }])
        
        const current = fullTextRef.current
        fullTextRef.current = current.slice(0, pos - 1) + current.slice(pos)
        setText(fullTextRef.current)
      } else {
        clearInterval(deleteInterval)
        // Then type the new word
        let typePos = 0
        const typeInterval = setInterval(() => {
          if (typePos < replaceWith.length) {
            const atPos = startCol - 1 + typePos
            const range = {
              startLineNumber: 1,
              startColumn: atPos + 1,
              endLineNumber: 1,
              endColumn: atPos + 2
            }
            editor.executeEdits('', [{ range, text: replaceWith[typePos], forceMoveMarkers: true }])
            fullTextRef.current = fullTextRef.current.slice(0, atPos) + replaceWith[typePos] + fullTextRef.current.slice(atPos)
            setText(fullTextRef.current)
            typePos++
          } else {
            clearInterval(typeInterval)
            stepRef.current++
            setTimeout(selectAndReplace, 200)
          }
        }, 50)
      }
    }, 30)
  }

  const selectAndReplace = () => {
    const s = stepRef.current
    
    if (s >= replacements.length || !editorRef.current) return
    
    const { from, to } = replacements[s]
    const currentText = fullTextRef.current
    const idx = currentText.indexOf(from)
    
    if (idx === -1) {
      stepRef.current++
      setTimeout(selectAndReplace, 200)
      return
    }
    
    const editor = editorRef.current
    const startCol = idx + 1
    const endCol = idx + from.length + 1
    
    const range = {
      startLineNumber: 1,
      startColumn: startCol,
      endLineNumber: 1,
      endColumn: endCol
    }
    
    editor.setSelection(range)
    
    setTimeout(() => {
      deleteAndReplace(editor, startCol, endCol, to)
    }, 400)
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
        setTimeout(selectAndReplace, 300)
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