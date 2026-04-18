import { useState } from 'react'
import Editor from '@monaco-editor/react'
import './App.css'

const defaultCode = `// TypeScript Code Editor
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const message: string = greet("World");
console.log(message);
`

function App() {
  const [code, setCode] = useState(defaultCode)

  return (
    <div className="editor-container">
      <Editor
        height="100vh"
        defaultLanguage="typescript"
        value={code}
        onChange={value => setCode(value || '')}
        theme="light"
        options={{
          fontSize: 20,
          fontFamily: '"Fira Code", "Fira Mono", monospace',
          lineHeight: 1.6,
          wordWrap: 'on',
          padding: { top: 48, bottom: 48 },
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'off',
          folding: false,
          glyphMargin: false,
          contextmenu: false,
        }}
      />
    </div>
  )
}

export default App