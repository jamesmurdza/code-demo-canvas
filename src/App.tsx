import TextareaCodeEditor from '@uiw/react-textarea-code-editor'
import './App.css'

const defaultCode = `// TypeScript Code Editor
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const message: string = greet("World");
console.log(message);
`

function App() {
  return (
    <div className="editor-container">
      <TextareaCodeEditor
        value={defaultCode}
        language="typescript"
        style={{
          minHeight: '100vh',
          fontSize: 20,
          fontFamily: '"Fira Code", "Fira Mono", monospace',
          backgroundColor: '#ffffff',
          lineHeight: 1.6,
        }}
        padding={48}
      />
    </div>
  )
}

export default App