import Editor from '@monaco-editor/react'
import { useState } from 'react'
import { getFileNameForLanguage } from '../utils/courseUtils'

interface CodeEditorProps {
  initialCode?: string
  language?: string
  onChange?: (value: string) => void
  onRun?: (code: string) => void
  readOnly?: boolean
  height?: string
  theme?: 'vs-dark' | 'light'
}

export default function CodeEditor({
  initialCode = '',
  language = 'python',
  onChange,
  onRun,
  readOnly = false,
  height = '400px',
  theme = 'vs-dark',
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [isRunning, setIsRunning] = useState(false)

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || ''
    setCode(newCode)
    onChange?.(newCode)
  }

  const handleRun = async () => {
    if (!onRun) return
    setIsRunning(true)
    try {
      onRun(code)
    } finally {
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    setCode(initialCode)
    onChange?.(initialCode)
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between bg-gray-800 rounded-t-lg px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm text-gray-400 font-mono ml-2">
            {getFileNameForLanguage(language)}
          </span>
        </div>

        <div className="flex gap-2">
          {!readOnly && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-blue-600 text-sm text-white hover:bg-blue-700 rounded transition"
              title="Reset code"
            >
              Reset
            </button>
          )}
          {onRun && (
            <button
              onClick={handleRun}
              disabled={isRunning || readOnly}
              className="px-4 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <span className="animate-spin">⟳</span> Running...
                </>
              ) : (
                <>Run Code</>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="border border-gray-700 border-t-0 rounded-b-lg overflow-hidden shadow-lg">
        <Editor
          height={height}
          language={language}
          value={code}
          onChange={handleEditorChange}
          theme={theme}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            roundedSelection: false,
            readOnly: readOnly,
            automaticLayout: true,
            tabCompletion: 'on',
            autoClosingBrackets: 'always',
            matchBrackets: 'always',
            tabSize: 4,
            wordWrap: 'on',
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            glyphMargin: false,
            padding: { top: 10, bottom: 10 },
            suggestOnTriggerCharacters: true,
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false,
            },
            parameterHints: {
              enabled: true,
            },
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-gray-900">
              <div className="text-white">Loading editor...</div>
            </div>
          }
        />
      </div>
    </div>
  )
}
