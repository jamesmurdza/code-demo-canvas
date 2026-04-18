import { useState, useEffect, useRef } from 'react'
import './App.css'

const steps: { code: string; deleteFrom?: string; replaceWith?: string }[] = [
  { code: `import { createSession } from "background-agents"

const session = await createSession("claude", {
  sandbox,
  env: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY },
})

await session.start("Add GitHub OAuth integration")` },
  { code: `import { createSession } from "background-agents"

const session = await createSession("codex", {
  sandbox,
  env: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY },
})

await session.start("Add GitHub OAuth integration")`, deleteFrom: 'claude', replaceWith: 'codex' },
  { code: `import { createSession } from "background-agents"

const session = await createSession("codex", {
  sandbox,
  env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY },
})

await session.start("Add GitHub OAuth integration")`, deleteFrom: 'ANTHROPIC_API_KEY', replaceWith: 'OPENAI_API_KEY' },
  { code: `import { createSession } from "background-agents"

const session = await createSession("opencode", {
  sandbox,
  env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY },
})

await session.start("Add GitHub OAuth integration")`, deleteFrom: 'codex', replaceWith: 'opencode' },
  { code: `import { createSession } from "background-agents"

const session = await createSession("gemini", {
  sandbox,
  env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY },
})

await session.start("Add GitHub OAuth integration")`, deleteFrom: 'opencode', replaceWith: 'gemini' },
  { code: `import { createSession } from "background-agents"

const session = await createSession("goose", {
  sandbox,
  env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY },
})

await session.start("Add GitHub OAuth integration")`, deleteFrom: 'gemini', replaceWith: 'goose' },
  { code: `import { createSession } from "background-agents"

const session = await createSession("pi", {
  sandbox,
  env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY },
})

await session.start("Add GitHub OAuth integration")`, deleteFrom: 'goose', replaceWith: 'pi' },
]

function applyTransformation(code: string, deleteFrom: string, replaceWith: string): string {
  if (!deleteFrom || !replaceWith) return code
  return code.replace(deleteFrom, replaceWith)
}

function App() {
  const [displayCode, setDisplayCode] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPlay, setShowPlay] = useState(true)
  const targetCodeRef = useRef('')
  const deleteTargetRef = useRef('')

  const targetCode = steps[currentStep].code

  useEffect(() => {
    if (currentStep === 0 && displayCode === '') {
      setShowPlay(true)
      return
    }

    if (isTyping) {
      const timeout = setTimeout(() => {
        if (displayCode.length < targetCode.length) {
          setDisplayCode(targetCode.slice(0, displayCode.length + 1))
        } else {
          setIsTyping(false)
          if (currentStep < steps.length - 1) {
            setTimeout(() => setShowPlay(true), 300)
          }
        }
      }, 15)
      return () => clearTimeout(timeout)
    }

    if (isDeleting) {
      const timeout = setTimeout(() => {
        if (displayCode.length > deleteTargetRef.current.length) {
          setDisplayCode(displayCode.slice(0, -1))
        } else {
          setIsDeleting(false)
          targetCodeRef.current = steps[currentStep].code
          deleteTargetRef.current = ''
          setIsTyping(true)
          setShowPlay(false)
        }
      }, 10)
      return () => clearTimeout(timeout)
    }
  }, [displayCode, isTyping, isDeleting, currentStep, targetCode])

  const playAnimation = () => {
    if (currentStep === 0 && displayCode === '') {
      targetCodeRef.current = targetCode
      setIsTyping(true)
      setShowPlay(false)
      return
    }

    if (currentStep < steps.length - 1) {
      const nextStep = steps[currentStep + 1]
      if (nextStep.deleteFrom) {
        deleteTargetRef.current = displayCode.replace(nextStep.deleteFrom, '')
        if (nextStep.replaceWith) {
          const newCode = applyTransformation(displayCode, nextStep.deleteFrom, nextStep.replaceWith)
          targetCodeRef.current = newCode
        } else {
          targetCodeRef.current = deleteTargetRef.current
        }
        setIsDeleting(true)
        setShowPlay(false)
      } else {
        targetCodeRef.current = nextStep.code
        setIsTyping(true)
        setShowPlay(false)
      }
      setCurrentStep(currentStep + 1)
    }
  }

  return (
    <div className="editor-container">
      <pre className="code-display">
        <code>{displayCode}</code>
        {isTyping && <span className="cursor">|</span>}
      </pre>
      {showPlay && (
        <button className="play-button" onClick={playAnimation}>
          ▶
        </button>
      )}
    </div>
  )
}

export default App