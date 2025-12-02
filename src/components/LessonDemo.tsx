import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import CodeEditor from './CodeEditor'
import LessonSuccessModal from './LessonSuccessModal'
import QuizLesson from './QuizLesson'
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
  const [currentCode, setCurrentCode] = useState<string>('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [htmlPreview, setHtmlPreview] = useState<string>('');
  

  useEffect(() => {
    loadLesson()
  }, [lessonId])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'Enter') {
        e.preventDefault()
        handleRunCode(currentCode)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentCode])

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600 dark:text-slate-300">Ładowanie lekcji...</p>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600 dark:text-slate-300">Lekcja nie znaleziona</p>
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
        setHtmlPreview(code)
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

  if (lesson.content.type === 'quiz') {
    return (
      <QuizLesson
        lesson={lesson}
        course={course}
        onNextLesson={handleNextLesson}
        lessonId={lessonId}
      />
    )
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
              <span className="font-medium">{course?.title || 'Kurs'}</span>
              <span className="text-slate-400 dark:text-slate-500">›</span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                Lekcja {lesson.orderIndex}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              {lesson.title}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  Instrukcja
                </h2>
                <div className="prose prose-sm dark:prose-invert">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                    {lesson.description}
                  </p>
                </div>
              </div>

              {lesson.content.type === 'exercise' &&
                lesson.content.exampleCode && (
                  <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-5 border border-slate-700">
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
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl p-6 border border-purple-100 dark:border-purple-800">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    Twoje zadanie
                  </h3>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                    {lesson.content.instruction}
                  </p>
                </div>
              )}
              {lesson.content.type === 'exercise' && lesson.content.hint && (
                <div className="bg-amber-50 dark:bg-amber-900/30 rounded-2xl p-5 border border-amber-100 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                    <strong className="font-semibold">💡 Wskazówka:</strong>{' '}
                    {lesson.content.hint}
                  </p>
                </div>
              )}

              <div
                className="flex items-center justify-between bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-5 shadow-lg"
              >
                <span className="text-white font-semibold">
                  Nagroda za ukończenie
                </span>
                <span className="text-3xl font-bold text-white">
                  +{lesson.xp_reward} XP
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
              >
                <CodeEditor
                  initialCode={starterCode}
                  language={lesson.language}
                  onChange={setCurrentCode}
                  onRun={handleRunCode}
                  height="300px"
                  theme="vs-dark"
                />
                {
                  lesson.language === 'html' && (
                    <div className="border-t border-slate-200 dark:border-slate-700">
                      <div className="bg-slate-50 dark:bg-slate-900 px-6 py-3 flex items-center gap-2">
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                          👁️ Podgląd HTML
                        </span>
                      </div>
                      <div className="p-4 bg-white dark:bg-slate-800 min-h-[200px]">
                        {htmlPreview ? (
                          <iframe
                            title="HTML Preview"
                            srcDoc={htmlPreview}
                            className="w-full h-64 border border-slate-200 dark:border-slate-700 rounded-lg"
                          ></iframe>
                        ) : (
                          <div className="text-slate-400 dark:text-slate-500 italic flex items-center gap-2">
                            <span className="font-sans text-base">
                              Uruchom kod aby zobaczyć podgląd...
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }
              </div>

              <div
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
              >
                <div className="bg-slate-50 dark:bg-slate-900 px-6 py-3 flex items-center gap-2">
                  <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                    💻 Konsola
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
                      <span className="font-sans text-base">
                        Uruchom kod aby zobaczyć wynik...
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {isCorrect === false && (
                <div
                  className="rounded-3xl p-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border border-red-200 dark:border-red-800 shadow-lg"
                >
                  <div className="mb-3">
                    <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">
                      ❌ Nie do końca...
                    </h3>
                  </div>
                  <p className="text-red-600 dark:text-red-300 leading-relaxed mb-4">
                    Wynik nie jest zgodny z oczekiwanym. Spróbuj ponownie!
                  </p>
                  <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-4 text-sm">
                    <strong className="text-red-700 dark:text-red-300 font-semibold">
                      Oczekiwany wynik:
                    </strong>{' '}
                    <code className="text-red-600 dark:text-red-400 font-mono bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded">
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
