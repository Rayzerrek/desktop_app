import { useState, JSX } from 'react'
import { Editor } from '@monaco-editor/react'
import { invoke } from '@tauri-apps/api/core'
import {
  SiPython,
  SiJavascript,
  SiHtml5,
  SiCss3,
  SiTypescript,
} from 'react-icons/si'
import { DiJava } from 'react-icons/di'

interface CodePlaygroundProps {
  onBack?: () => void
}

export default function CodePlayground({ onBack }: CodePlaygroundProps) {
  const [code, setCode] = useState<string>('')
  const [language, setLanguage] = useState<string>('python')
  const [output, setOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [terminalHeight, setTerminalHeight] = useState<number>(200)

  const getCourseIcon = (language: string): JSX.Element | null => {
    const courseIcons: Record<string, JSX.Element> = {
      python: <SiPython />,
      javascript: <SiJavascript />,
      html: <SiHtml5 />,
      css: <SiCss3 />,
      typescript: <SiTypescript />,
      java: <DiJava />,
    }
    return courseIcons[language] || null
  }

  const handleRun = async () => {
    setIsRunning(true)
    setOutput('> Running...\n')

    try {
      const result = await invoke<{
        success: boolean
        output: string
        error?: string
      }>('validate_code', {
        code,
        language,
        expectedOutput: '',
      })

      if (result.success) {
        setOutput(`>>> ${result.output}`)
      } else {
        setOutput(`>>> ${result.error || 'Error'}`)
      }
    } catch (error) {
      setOutput(`> Error\n${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e]">
      <div className="flex items-center justify-between bg-[#323233] px-4 py-2 border-b border-[#2d2d30]">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="text-[#cccccc] hover:text-white text-sm"
            >
              ← Back
            </button>
          )}
          <span className="text-[#cccccc] text-sm font-medium">
            Code Playground
          </span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => {
              const lang = e.target.value
              setLanguage(lang)
              if (lang === 'python') setCode('print("Hello, World!")')
              if (lang === 'javascript') setCode('console.log("Hello, World!")')
              if (lang === 'typescript')
                setCode(
                  'const msg: string = "Hello, World!";\nconsole.log(msg)'
                )
            }}
            className="bg-[#3c3c3c] text-[#cccccc] px-3 py-1 rounded text-sm border border-[#2d2d30] outline-none focus:border-[#007acc]"
          >
            <option value="python">{getCourseIcon('python')} Python</option>
            <option value="javascript">
              {getCourseIcon('javascript')} JavaScript
            </option>
            <option value="typescript">
              {getCourseIcon('typescript')} TypeScript
            </option>
          </select>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="bg-[#0e639c] hover:bg-[#1177bb] disabled:bg-[#3c3c3c] text-white px-4 py-1 rounded text-sm transition flex items-center gap-2"
          >
            <span>Run</span>
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace",
            automaticLayout: true,
            wordWrap: 'on',
            matchBrackets: 'always',
            autoClosingBrackets: 'always',
            contextmenu: true,
            scrollBeyondLastLine: false,
            tabSize: 4,
            formatOnPaste: true,
            formatOnType: true,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            scrollbar: {
              useShadows: false,
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
          }}
        />
      </div>

      <div
        className="border-t border-[#2d2d30] bg-[#1e1e1e] flex flex-col"
        style={{ height: `${terminalHeight}px` }}
      >
        <div className="flex items-center justify-between bg-[#252526] px-3 py-1 border-b border-[#2d2d30]">
          <div className="flex items-center gap-3">
            <span className="text-[#cccccc] text-xs font-medium">TERMINAL</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setTerminalHeight(Math.max(100, terminalHeight - 50))
              }
              className="text-[#cccccc] hover:text-white text-xs"
              title="Decrease height"
            >
              ▼
            </button>
            <button
              onClick={() =>
                setTerminalHeight(Math.min(500, terminalHeight + 50))
              }
              className="text-[#cccccc] hover:text-white text-xs"
              title="Increase height"
            >
              ▲
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-3 font-mono text-sm text-[#cccccc]">
          <pre className="whitespace-pre-wrap break-words">
            {output || "Press 'Run' to execute your code..."}
          </pre>
        </div>
      </div>
    </div>
  )
}
