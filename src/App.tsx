import { useState } from 'react'
import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-typescript'
import 'prismjs/themes/prism.css'
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
        value={code}
        onValueChange={setCode}
        highlight={code => highlight(code, languages.ts, 'typescript')}
        padding={48}
        className="editor"
        textareaClassName="editor-textarea"
        style={{
          fontFamily: '"Fira Code", "Fira Mono", monospace',
          fontSize: 20,
          lineHeight: 1.6,
        }}
      />
    </div>
  )
}

export default App