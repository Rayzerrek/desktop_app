import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import CodeEditor from './CodeEditor'
import LessonSuccessModal from './LessonSuccessModal'
import { lessonService } from '../services/LessonService'
import { progressService } from '../services/ProgressService'
import { Lesson, Course } from '../types/lesson'
import { getNextLessonId, findCourseByLessonId } from '../utils/courseUtils'

interface CodeValidationResponse {
  success: boolean
  output: string
  error?: string
  is_correct: boolean
}

interface LessonDemoProps {
  lessonId?: string
  onNextLesson?: (nextLessonId: string) => void
  onBackToCourse?: () => void
}

export default function LessonDemo({
  lessonId = 'py-001',
  onNextLesson,
}: LessonDemoProps) {
  const [output, setOutput] = useState<string>('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLesson()
  }, [lessonId])

  const loadLesson = async () => {
    try {
      const lessonData = await lessonService.getLessonById(lessonId)
      setLesson(lessonData)

      if (lessonData) {
        const courses = await lessonService.getCourses()
        const foundCourse = findCourseByLessonId(courses, lessonId)
        setCourse(foundCourse || null)
      }
    } catch (error) {
      console.error('Error loading lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⏳</div>
          <p className="text-xl text-slate-600">Ładowanie lekcji...</p>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-slate-600">Lekcja nie znaleziona</p>
        </div>
      </div>
    )
  }

  const starterCode =
    lesson.content.type === 'exercise' ? lesson.content.starterCode : ''
  const expectedOutput =
    lesson.content.type === 'exercise' && lesson.content.testCases?.[0]
      ? lesson.content.testCases[0].expectedOutput
      : ''

  const handleRunCode = async (code: string) => {
    try {
      if (lesson.language === 'html') {
        if (code.includes(expectedOutput)) {
          setOutput(expectedOutput)
          setIsCorrect(true)
          setTimeout(() => {
            setShowSuccessModal(true)
          }, 500)
        } else {
          setOutput('Error: Expected output not found in HTML')
          setIsCorrect(false)
        }
        return
      }

      const result = await invoke<CodeValidationResponse>('validate_code', {
        code,
        language: lesson.language,
        expectedOutput: expectedOutput,
      })

      if (result.error) {
        setOutput(result.error)
        setIsCorrect(false)
      } else {
        setOutput(result.output)
        setIsCorrect(result.is_correct)

        if (result.is_correct) {
          // Mark lesson as completed
          const userId = localStorage.getItem('user_id')
          if (userId) {
            try {
              await progressService.markLessonCompleted(userId, lessonId)
              console.log('Lesson marked as completed')
            } catch (error) {
              console.error('Error saving progress:', error)
            }
          }

          setTimeout(() => {
            setShowSuccessModal(true)
          }, 500)
        }
      }
    } catch (error) {
      setOutput(`Error: ${error}`)
      setIsCorrect(false)
    }
  }

  const handleNextLesson = async () => {
    setShowSuccessModal(false)
    console.log('Moving to next lesson from:', lessonId)

    const courses = await lessonService.getCourses()
    const nextId = getNextLessonId(courses, lessonId)

    if (nextId) {
      console.log('Next lesson:', nextId)
      onNextLesson?.(nextId)
    } else {
      console.log('This is the last lesson!')
    }
  }

  return (
    <>
      <LessonSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onNextLesson={handleNextLesson}
        xpReward={lesson.xp_reward}
        lessonTitle={lesson.title}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
              <span className="font-medium">{course?.title || 'Kurs'}</span>
              <span className="text-slate-400">›</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                Lekcja {lesson.orderIndex}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              {lesson.title}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6"
              style={{
                boxShadow:
                  '0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Instrukcja
                </h2>
                <div className="prose prose-sm">
                  <p className="text-slate-700 leading-relaxed text-base">
                    {lesson.description}
                  </p>
                </div>
              </div>

              {lesson.content.type === 'exercise' &&
                lesson.content.exampleCode && (
                  <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 shadow-lg border border-slate-700">
                    {lesson.content.exampleDescription && (
                      <div className="mb-4 pb-3 border-b border-slate-700">
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {lesson.content.exampleDescription}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium ml-2">
                        Przykładowy kod
                      </span>
                    </div>
                    <pre className="text-green-400 font-mono text-sm leading-relaxed overflow-x-auto">
                      <code>{lesson.content.exampleCode}</code>
                    </pre>
                  </div>
                )}

              {lesson.content.type === 'exercise' && (
                <div className="bg-gradient-to-br from-purple-50 via-purple-50 to-pink-50 rounded-2xl p-6 shadow-md border border-purple-200">
                  <h3 className="text-xl font-bold text-purple-900 mb-3">
                    Twoje zadanie
                  </h3>
                  <p className="text-purple-900 leading-relaxed">
                    {lesson.content.instruction}
                  </p>
                </div>
              )}
              {lesson.content.type === 'exercise' && lesson.content.hint && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-200 shadow-sm">
                  <p className="text-sm text-blue-900 leading-relaxed">
                    <strong className="font-semibold">Wskazówka:</strong>{' '}
                    {lesson.content.hint}
                  </p>
                </div>
              )}

              <div
                className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50 
                                   rounded-2xl p-5 shadow-md border border-amber-200"
              >
                <span className="text-amber-900 font-semibold">
                  Nagroda za ukończenie
                </span>
                <span className="text-3xl font-bold text-amber-600">
                  +{lesson.xp_reward} XP
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div
                className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
                style={{
                  boxShadow:
                    '0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                <CodeEditor
                  initialCode={starterCode}
                  language={lesson.language}
                  onRun={handleRunCode}
                  height="300px"
                  theme="vs-dark"
                />
              </div>

              <div
                className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
                style={{
                  boxShadow:
                    '0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-3 flex items-center gap-2">
                  <span className="text-slate-300 text-sm font-medium">
                    Konsola
                  </span>
                </div>
                <div className="bg-slate-900 p-6 min-h-[120px] font-mono text-lg">
                  {output ? (
                    <div>
                      <div className="text-slate-400 text-sm mb-2 font-sans">
                        Wynik:
                      </div>
                      <div className="text-green-400">{output}</div>
                    </div>
                  ) : (
                    <div className="text-slate-500 italic flex items-center gap-2">
                      <span className="animate-pulse">▶</span>
                      <span className="font-sans text-base">
                        Uruchom kod aby zobaczyć wynik...
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {isCorrect === false && (
                <div
                  className="rounded-3xl p-6 bg-gradient-to-br from-red-50 to-pink-50 
                                      border-2 border-red-300 shadow-lg"
                  style={{
                    boxShadow: '0 8px 24px rgba(239, 68, 68, 0.15)',
                  }}
                >
                  <div className="mb-3">
                    <h3 className="text-2xl font-bold text-red-900">
                      Nie do końca...
                    </h3>
                  </div>
                  <p className="text-red-800 leading-relaxed mb-4">
                    Wynik nie jest zgodny z oczekiwanym. Spróbuj ponownie!
                  </p>
                  <div className="bg-white/60 rounded-xl p-4 text-sm">
                    <strong className="text-red-900 font-semibold">
                      Oczekiwany wynik:
                    </strong>{' '}
                    <code className="text-red-700 font-mono bg-red-100 px-2 py-1 rounded">
                      {expectedOutput}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
