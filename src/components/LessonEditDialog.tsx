import { useState, useEffect } from 'react'
import { Lesson } from '../types/lesson'
import { lessonService } from '../services/LessonService'

interface LessonEditDialogProps {
  isOpen: boolean
  onClose: () => void
  lessonId: string
  onSuccess: () => void
}

export default function LessonEditDialog({
  isOpen,
  onClose,
  lessonId,
  onSuccess,
}: LessonEditDialogProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'python' as
      | 'python'
      | 'javascript'
      | 'html'
      | 'css'
      | 'typescript',
    lessonType: 'exercise' as 'exercise' | 'theory' | 'quiz' | 'project',
    xpReward: 10,
    instruction: '',
    starterCode: '',
    solution: '',
    hint: '',
    expectedOutput: '',
    isLocked: false,
    estimatedMinutes: 15,
  })

  useEffect(() => {
    if (isOpen && lessonId) {
      loadLesson()
    }
  }, [isOpen, lessonId])

  const loadLesson = async () => {
    try {
      setLoading(true)
      const data = await lessonService.getLessonById(lessonId)
      if (!data) {
        throw new Error('Lesson not found')
      }
      setLesson(data)

      const content = data.content
      const isExercise = content.type === 'exercise'

      setFormData({
        title: data.title,
        description: data.description || '',
        language: data.language as any,
        lessonType: data.lessonType as any,
        xpReward: data.xp_reward,
        instruction: isExercise ? content.instruction : '',
        starterCode: isExercise ? content.starterCode : '',
        solution: isExercise ? content.solution : '',
        hint: isExercise ? content.hint || '' : '',
        expectedOutput:
          isExercise && content.testCases?.[0]
            ? content.testCases[0].expectedOutput
            : '',
        isLocked: data.isLocked || false,
        estimatedMinutes: data.estimatedMinutes || 15,
      })
    } catch (error) {
      console.error('Error loading lesson:', error)
      alert('Błąd ładowania lekcji: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const updates: any = {
        title: formData.title,
        description: formData.description,
        language: formData.language,
        lessonType: formData.lessonType,
        xpReward: formData.xpReward,
        isLocked: formData.isLocked,
        estimatedMinutes: formData.estimatedMinutes,
      }

      if (formData.lessonType === 'exercise') {
        updates.content = {
          type: 'exercise',
          instruction: formData.instruction,
          starterCode: formData.starterCode,
          solution: formData.solution,
          hint: formData.hint || undefined,
          testCases: [
            {
              expectedOutput: formData.expectedOutput,
            },
          ],
        }
      }

      await lessonService.updateLesson(lessonId, updates)
      alert('Lekcja zaktualizowana!')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating lesson:', error)
      alert('Błąd aktualizacji: ' + error)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Edytuj lekcję</h2>
              {lesson && (
                <p className="text-purple-100 text-sm mt-1">ID: {lesson.id}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-4xl mb-4 animate-spin">⏳</div>
              <p className="text-slate-600">Ładowanie...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tytuł lekcji *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="np. Twój pierwszy program"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Język programowania *
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        language: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="typescript">TypeScript</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Opis
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  placeholder="Krótki opis lekcji"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Typ lekcji *
                  </label>
                  <select
                    value={formData.lessonType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lessonType: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="exercise">Ćwiczenie</option>
                    <option value="theory">Teoria</option>
                    <option value="quiz">Quiz</option>
                    <option value="project">Projekt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nagroda XP *
                  </label>
                  <input
                    type="number"
                    value={formData.xpReward}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        xpReward: parseInt(e.target.value),
                      })
                    }
                    min="5"
                    step="5"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Czas (min)
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedMinutes: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isLocked"
                  checked={formData.isLocked}
                  onChange={(e) =>
                    setFormData({ ...formData, isLocked: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                />
                <label
                  htmlFor="isLocked"
                  className="text-sm font-medium text-slate-700"
                >
                  Lekcja zablokowana (wymaga ukończenia poprzednich)
                </label>
              </div>

              {/* Exercise-specific fields */}
              {formData.lessonType === 'exercise' && (
                <>
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                      Szczegóły ćwiczenia
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Instrukcja zadania *
                        </label>
                        <textarea
                          value={formData.instruction}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              instruction: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                          placeholder="np. Napisz kod który wyświetli 'Hello World'"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Kod startowy
                        </label>
                        <textarea
                          value={formData.starterCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              starterCode: e.target.value,
                            })
                          }
                          rows={5}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm resize-none"
                          placeholder="# Kod który użytkownik zobaczy na starcie"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Rozwiązanie *
                        </label>
                        <textarea
                          value={formData.solution}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              solution: e.target.value,
                            })
                          }
                          rows={5}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm resize-none"
                          placeholder="print('Hello World')"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Wskazówka
                          </label>
                          <input
                            type="text"
                            value={formData.hint}
                            onChange={(e) =>
                              setFormData({ ...formData, hint: e.target.value })
                            }
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="Użyj funkcji print()"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Oczekiwany wynik *
                          </label>
                          <input
                            type="text"
                            value={formData.expectedOutput}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                expectedOutput: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="Hello World"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-slate-50 p-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading || saving || !formData.title}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg"
          >
            {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="px-8 py-3 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 text-slate-700 font-semibold rounded-lg transition"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  )
}
